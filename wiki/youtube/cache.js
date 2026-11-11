// Đã gán link Render thực tế của bạn
const BACKEND_URL = "https://cloud-zivd.onrender.com"; 
// Hàm cập nhật Cache Panel (Giữ lại cho đúng giao diện bạn muốn)
function updateLibraryCacheMetrics() {
    const cacheSummaryEl = document.getElementById("wiko-cache-summary");
    if (cacheSummaryEl) {
        cacheSummaryEl.textContent = "Server-side rendering. Không tải thư viện nặng về trình duyệt.";
    }
}

function parseYouTubeUrl(value) {
    try {
        const url = new URL(value);
        const hostname = url.hostname.toLowerCase().replace(/^www\./, "");
        if (url.protocol !== "https:") return null;
        if (hostname === "youtu.be") return url.pathname.length > 1 ? url : null;
        if (!["youtube.com", "m.youtube.com", "youtube-nocookie.com"].includes(hostname)) return null;
        if (url.searchParams.has("v")) return url;
        return /^\/(shorts|embed|live)\/[^/]+/.test(url.pathname) ? url : null;
    } catch { return null; }
}

function updateDownloadButton() {
    const urlInput = document.getElementById("wiko-url-input");
    const downloadBtn = document.getElementById("wiko-download-btn");
    if (downloadBtn && urlInput) {
        downloadBtn.disabled = !parseYouTubeUrl(urlInput.value.trim());
    }
}

window.addEventListener("DOMContentLoaded", () => {
    const statusEl = document.getElementById("wiko-status-text");
    const urlInput = document.getElementById("wiko-url-input");
    const downloadBtn = document.getElementById("wiko-download-btn");
    const cacheButton = document.getElementById("cacheButton");
    const cachePanel = document.getElementById("cachePanel");

    if (statusEl) statusEl.textContent = "Hệ thống sẵn sàng! Nhập link YouTube để bắt đầu.";
    if (downloadBtn) {
        downloadBtn.disabled = false;
        downloadBtn.textContent = "Tải video →";
        downloadBtn.addEventListener("click", startWikoDownload);
    }

    if (urlInput) urlInput.addEventListener("input", updateDownloadButton);
    
    if (cacheButton && cachePanel) {
        cacheButton.addEventListener("click", () => {
            const willOpen = cachePanel.hidden;
            cachePanel.hidden = !willOpen;
            cacheButton.setAttribute("aria-expanded", String(willOpen));
            if (willOpen) updateLibraryCacheMetrics();
        });
    }
});

async function startWikoDownload() {
    const urlInput = document.getElementById("wiko-url-input");
    const statusEl = document.getElementById("wiko-status-text");
    const downloadBtn = document.getElementById("wiko-download-btn");
    const rawUrl = urlInput ? urlInput.value.trim() : "";
    
    const youtubeUrl = parseYouTubeUrl(rawUrl);
    if (!youtubeUrl) return;

    try {
        downloadBtn.disabled = true;
        statusEl.textContent = "Đang yêu cầu server tải video... (Vui lòng đợi, lần đầu có thể mất 30-50s để server khởi động)";

        // Gọi đến API của Render
        const response = await fetch(`${BACKEND_URL}/api/download?url=${encodeURIComponent(youtubeUrl.href)}`);

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({ detail: `Lỗi HTTP ${response.status}` }));
            throw new Error(errorData.detail || "Lỗi không xác định từ server.");
        }

        statusEl.textContent = "Server đang gửi file về, vui lòng đợi...";

        // Nhận file và hiển thị tiến trình
        const reader = response.body.getReader();
        const contentLength = response.headers.get('Content-Length');
        const total = contentLength ? parseInt(contentLength, 10) : 0;
        let received = 0;
        const chunks = [];

        while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            chunks.push(value);
            received += value.length;
            if (total > 0) {
                const percent = ((received / total) * 100).toFixed(1);
                statusEl.textContent = `Đang tải: ${percent}% (${(received / 1024 / 1024).toFixed(2)} MB)`;
            } else {
                statusEl.textContent = `Đang tải: ${(received / 1024 / 1024).toFixed(2)} MB`;
            }
        }

        // Tạo file và kích hoạt tải xuống
        const blob = new Blob(chunks, { type: 'video/mp4' });
        const downloadUrl = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = downloadUrl;
        a.download = 'wiko_video.mp4';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(downloadUrl);

        statusEl.textContent = "✅ Tải thành công! Video đã được lưu.";
    } catch (err) {
        statusEl.textContent = "❌ Lỗi: " + err.message;
    } finally {
        downloadBtn.disabled = false;
    }
}