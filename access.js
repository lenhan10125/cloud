(() => {
    const tokenKey = "oriciin.access-token";
    const tokenPattern = /^[a-f0-9]{64}$/;
    const requiresToken = document.currentScript?.dataset.requireToken === "true";

    if (requiresToken) {
        document.documentElement.style.visibility = "hidden";

        try {
            const token = window.sessionStorage.getItem(tokenKey);
            if (!token || !tokenPattern.test(token)) {
                window.location.replace("/");
                return;
            }
            document.documentElement.style.visibility = "";
        } catch (error) {
            console.error("Không thể kiểm tra token truy cập.", error);
            window.location.replace("/");
            return;
        }
    }

    window.siteAccess = Object.freeze({
        issueToken() {
            const bytes = new Uint8Array(32);
            window.crypto.getRandomValues(bytes);
            const token = Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0")).join("");
            window.sessionStorage.setItem(tokenKey, token);
            return token;
        }
    });
})();
