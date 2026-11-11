import base64
import binascii
import hashlib
import hmac
import json
import os
import secrets
from pathlib import Path

from twisted.internet import reactor
from twisted.web import http, proxy, resource, server, static


BIND_IP = "127.0.0.1"
SETTINGS_FILE = Path(__file__).with_name("setting.json")
PASSWORD_HASH_ROUNDS = 310_000
MAX_REQUEST_BODY = 16_384

CONFIG = {}
proxy_listener = None


def hash_password(password, salt=None):
    if salt is None:
        salt = secrets.token_bytes(16)
    digest = hashlib.pbkdf2_hmac(
        "sha256", password.encode("utf-8"), salt, PASSWORD_HASH_ROUNDS
    )
    return salt.hex(), digest.hex()


def save_settings(settings):
    temporary_path = SETTINGS_FILE.with_name(SETTINGS_FILE.name + ".tmp")
    try:
        temporary_path.write_text(
            json.dumps(settings, indent=2) + "\n", encoding="utf-8"
        )
        os.replace(temporary_path, SETTINGS_FILE)
    except OSError:
        if temporary_path.exists():
            temporary_path.unlink()
        raise


def load_settings():
    if not SETTINGS_FILE.exists() or SETTINGS_FILE.stat().st_size == 0:
        username = secrets.token_urlsafe(8)
        password = secrets.token_urlsafe(24)
        salt, password_hash = hash_password(password)
        settings = {
            "bind_ip": BIND_IP,
            "proxy_port": 8888,
            "management_port": 8765,
            "username": username,
            "password_salt": salt,
            "password_hash": password_hash,
            "proxy_enabled": True,
        }
        save_settings(settings)
        return settings, password

    try:
        settings = json.loads(SETTINGS_FILE.read_text(encoding="utf-8"))
    except (OSError, json.JSONDecodeError) as error:
        raise RuntimeError(f"Không đọc được {SETTINGS_FILE}: {error}") from error

    required = {
        "bind_ip",
        "proxy_port",
        "management_port",
        "username",
        "password_salt",
        "password_hash",
        "proxy_enabled",
    }
    if not isinstance(settings, dict) or not required.issubset(settings):
        raise RuntimeError(f"{SETTINGS_FILE} thiếu cấu hình bắt buộc.")
    if settings["bind_ip"] != BIND_IP:
        raise RuntimeError("Proxy chỉ hỗ trợ bind_ip=127.0.0.1.")
    for key in ("proxy_port", "management_port"):
        value = settings[key]
        if isinstance(value, bool) or not isinstance(value, int) or not 1 <= value <= 65535:
            raise RuntimeError(f"{key} trong {SETTINGS_FILE} không hợp lệ.")
    if settings["proxy_port"] == settings["management_port"]:
        raise RuntimeError("Cổng proxy và cổng quản lý phải khác nhau.")
    if not isinstance(settings["username"], str) or not settings["username"]:
        raise RuntimeError(f"username trong {SETTINGS_FILE} không hợp lệ.")
    if not isinstance(settings["proxy_enabled"], bool):
        raise RuntimeError(f"proxy_enabled trong {SETTINGS_FILE} không hợp lệ.")
    try:
        salt = bytes.fromhex(settings["password_salt"])
        bytes.fromhex(settings["password_hash"])
    except (TypeError, ValueError) as error:
        raise RuntimeError(f"Thông tin mật khẩu trong {SETTINGS_FILE} không hợp lệ.") from error
    if not salt:
        raise RuntimeError(f"password_salt trong {SETTINGS_FILE} không hợp lệ.")
    return settings, None


def credentials_match(username, password):
    if not hmac.compare_digest(
        username.encode("utf-8"), CONFIG["username"].encode("utf-8")
    ):
        return False
    try:
        salt = bytes.fromhex(CONFIG["password_salt"])
    except ValueError:
        return False
    candidate = hashlib.pbkdf2_hmac(
        "sha256", password.encode("utf-8"), salt, PASSWORD_HASH_ROUNDS
    ).hex()
    return hmac.compare_digest(candidate, CONFIG["password_hash"])


class AuthProxyRequest(proxy.ProxyRequest):
    def process(self):
        auth_header = self.getHeader(b"proxy-authorization")
        if not auth_header:
            self.requestAuth()
            return

        try:
            auth_type, auth_data = auth_header.split(b" ", 1)
            if auth_type.lower() != b"basic":
                self.requestAuth()
                return
            decoded_auth = base64.b64decode(auth_data, validate=True).decode("utf-8")
            username, password = decoded_auth.split(":", 1)
        except (ValueError, UnicodeDecodeError, binascii.Error):
            self.requestAuth()
            return

        if credentials_match(username, password):
            proxy.ProxyRequest.process(self)
        else:
            self.requestAuth()

    def requestAuth(self):
        self.setResponseCode(407, b"Proxy Authentication Required")
        self.setHeader(b"Proxy-Authenticate", b'Basic realm="Local Proxy"')
        self.write(b"Can tai khoan proxy de tiep tuc.")
        self.finish()


class CustomProxy(proxy.Proxy):
    requestFactory = AuthProxyRequest


class ProxyFactory(http.HTTPFactory):
    protocol = CustomProxy

    def log(self, request):
        return


def start_proxy():
    global proxy_listener
    if proxy_listener is None:
        proxy_listener = reactor.listenTCP(
            CONFIG["proxy_port"], ProxyFactory(), interface=BIND_IP
        )


def stop_proxy():
    global proxy_listener
    if proxy_listener is not None:
        listener = proxy_listener
        proxy_listener = None
        listener.stopListening()


def json_response(request, status, payload):
    request.setResponseCode(status)
    request.setHeader(b"content-type", b"application/json; charset=utf-8")
    request.setHeader(b"cache-control", b"no-store")
    return json.dumps(payload).encode("utf-8")


def request_is_local(request):
    host = request.getHeader(b"host")
    if isinstance(host, bytes):
        host = host.decode("latin-1")
    allowed_hosts = {
        f"127.0.0.1:{CONFIG['management_port']}",
        f"localhost:{CONFIG['management_port']}",
    }
    if host not in allowed_hosts:
        return False

    origin = request.getHeader(b"origin")
    if origin is None:
        return True
    if isinstance(origin, bytes):
        origin = origin.decode("latin-1")
    return origin in {
        f"http://127.0.0.1:{CONFIG['management_port']}",
        f"http://localhost:{CONFIG['management_port']}",
    }


def read_json_body(request):
    body = request.content.read(MAX_REQUEST_BODY + 1)
    if len(body) > MAX_REQUEST_BODY:
        raise ValueError("Dữ liệu gửi lên quá lớn.")
    payload = json.loads(body.decode("utf-8"))
    if not isinstance(payload, dict):
        raise ValueError("Dữ liệu gửi lên phải là JSON object.")
    return payload


class SettingsResource(resource.Resource):
    isLeaf = True

    def render_GET(self, request):
        if not request_is_local(request):
            return json_response(request, 403, {"error": "Chỉ cho phép truy cập local."})
        return json_response(
            request,
            200,
            {
                "bind_ip": BIND_IP,
                "proxy_port": CONFIG["proxy_port"],
                "management_port": CONFIG["management_port"],
                "username": CONFIG["username"],
                "proxy_running": proxy_listener is not None,
            },
        )

    def render_POST(self, request):
        global proxy_listener
        if not request_is_local(request):
            return json_response(request, 403, {"error": "Chỉ cho phép truy cập local."})
        try:
            payload = read_json_body(request)
            port = payload.get("proxy_port")
            username = payload.get("username")
            password = payload.get("password", "")
            if isinstance(port, bool) or not isinstance(port, int) or not 1 <= port <= 65535:
                raise ValueError("Cổng proxy phải là số từ 1 đến 65535.")
            if port == CONFIG["management_port"]:
                raise ValueError("Cổng proxy phải khác cổng trang quản lý.")
            if not isinstance(username, str) or not username or ":" in username:
                raise ValueError("Tên tài khoản không hợp lệ.")
            if not isinstance(password, str):
                raise ValueError("Mật khẩu không hợp lệ.")
            if password and len(password) < 12:
                raise ValueError("Mật khẩu mới phải có ít nhất 12 ký tự.")
        except (UnicodeDecodeError, json.JSONDecodeError, ValueError) as error:
            return json_response(request, 400, {"error": str(error)})

        updated = CONFIG.copy()
        updated["proxy_port"] = port
        updated["username"] = username
        if password:
            salt, password_hash = hash_password(password)
            updated["password_salt"] = salt
            updated["password_hash"] = password_hash

        new_listener = None
        if proxy_listener is not None and port != CONFIG["proxy_port"]:
            try:
                new_listener = reactor.listenTCP(
                    port, ProxyFactory(), interface=BIND_IP
                )
            except Exception as error:
                return json_response(
                    request, 409, {"error": f"Không mở được cổng {port}: {error}"}
                )

        try:
            save_settings(updated)
        except OSError as error:
            if new_listener is not None:
                new_listener.stopListening()
            return json_response(
                request, 500, {"error": f"Không lưu được setting.json: {error}"}
            )

        old_listener = proxy_listener
        CONFIG.clear()
        CONFIG.update(updated)
        if new_listener is not None:
            proxy_listener = new_listener
            old_listener.stopListening()
        return json_response(request, 200, {"ok": True})


class ProxyActionResource(resource.Resource):
    isLeaf = True

    def __init__(self, should_start):
        super().__init__()
        self.should_start = should_start

    def render_POST(self, request):
        if not request_is_local(request):
            return json_response(request, 403, {"error": "Chỉ cho phép truy cập local."})

        updated = CONFIG.copy()
        updated["proxy_enabled"] = self.should_start
        try:
            save_settings(updated)
            if self.should_start:
                start_proxy()
            else:
                stop_proxy()
        except Exception as error:
            updated["proxy_enabled"] = proxy_listener is not None
            CONFIG.clear()
            CONFIG.update(updated)
            try:
                save_settings(updated)
            except OSError as save_error:
                return json_response(
                    request,
                    500,
                    {"error": f"{error}; không lưu được trạng thái: {save_error}"},
                )
            return json_response(request, 409, {"error": str(error)})

        CONFIG.clear()
        CONFIG.update(updated)
        return json_response(request, 200, {"ok": True})


def build_management_site():
    root = resource.Resource()
    root.putChild(b"", static.File(str(Path(__file__).with_name("index.html"))))
    api = resource.Resource()
    api.putChild(b"settings", SettingsResource())
    proxy_api = resource.Resource()
    proxy_api.putChild(b"start", ProxyActionResource(True))
    proxy_api.putChild(b"stop", ProxyActionResource(False))
    api.putChild(b"proxy", proxy_api)
    root.putChild(b"api", api)
    return server.Site(root)


if __name__ == "__main__":
    try:
        loaded_settings, initial_password = load_settings()
    except RuntimeError as error:
        raise SystemExit(f"[Lỗi] {error}") from error
    CONFIG.update(loaded_settings)

    print("==============================================")
    print("        LOCAL PROXY - TRANG QUẢN LÝ")
    print("==============================================")
    print(f"Trang quản lý: http://127.0.0.1:{CONFIG['management_port']}")
    print(f"File cấu hình: {SETTINGS_FILE}")
    if initial_password is not None:
        print(f"Tài khoản proxy lần đầu: {CONFIG['username']}")
        print(f"Mật khẩu proxy lần đầu: {initial_password}")
        print("Hãy lưu mật khẩu này; setting.json chỉ lưu hash.")

    try:
        reactor.listenTCP(
            CONFIG["management_port"],
            build_management_site(),
            interface=BIND_IP,
        )
        if CONFIG["proxy_enabled"]:
            try:
                start_proxy()
            except Exception as error:
                CONFIG["proxy_enabled"] = False
                save_settings(CONFIG)
                print(f"[Lỗi] Không khởi động được proxy: {error}")
        print("Chỉ lắng nghe trên máy local. Nhấn Ctrl+C để dừng.")
        reactor.run()
    except KeyboardInterrupt:
        stop_proxy()
        print("\nĐã dừng proxy và trang quản lý.")
    except Exception as error:
        print(f"\n[Lỗi] Không thể khởi động dịch vụ: {error}")
