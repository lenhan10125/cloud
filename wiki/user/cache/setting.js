(() => {
	const themeKeys = new Set(["oriciin:lenhan:theme", "wiki-ori-loader-theme"]);
	try {
		window.localStorage.removeItem("oriciin:lenhan:language");
	} catch (error) {
		console.error("Không thể xóa tùy chọn ngôn ngữ cũ:", error);
	}

	function assertThemeKey(key) {
		if (!themeKeys.has(key)) {
			throw new TypeError("Chỉ được lưu tùy chọn chủ đề trong bộ nhớ trình duyệt.");
		}
	}

	window.OriciinWikiSettings = Object.freeze({
		requestOptions: Object.freeze({ cache: "no-store" }),
		getTheme(key) {
			assertThemeKey(key);
			try {
				return window.localStorage.getItem(key);
			} catch (error) {
				console.error("Không thể đọc chủ đề đã lưu:", error);
				return null;
			}
		},
		setTheme(key, value) {
			assertThemeKey(key);
			if (typeof value !== "string" || !value) {
				throw new TypeError("Mã chủ đề không hợp lệ.");
			}
			window.localStorage.setItem(key, value);
		}
	});
})();