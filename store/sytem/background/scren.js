(() => {
	const storageKey = "oriciin:lenhan:theme";
	function hueColor(hue, saturation, lightness) {
		return `hsl(${hue} ${saturation}% ${lightness}%)`;
	}

	function colorHsl(color) {
		const hsl = color.match(/^hsl\(\s*([\d.]+)\s+([\d.]+)%\s+([\d.]+)%\s*\)$/i);
		if (hsl) return { hue: Number(hsl[1]), saturation: Number(hsl[2]), lightness: Number(hsl[3]) };
		const hex = color.match(/^#([0-9a-f]{3}|[0-9a-f]{6})$/i);
		if (!hex) return null;
		const value = hex[1].length === 3 ? [...hex[1]].map(part => parseInt(part + part, 16)) : hex[1].match(/../g).map(part => parseInt(part, 16));
		const [red, green, blue] = value.map(channel => channel / 255);
		const maximum = Math.max(red, green, blue);
		const minimum = Math.min(red, green, blue);
		const delta = maximum - minimum;
		let hue = 0;
		if (delta) {
			if (maximum === red) hue = 60 * (((green - blue) / delta) % 6);
			else if (maximum === green) hue = 60 * ((blue - red) / delta + 2);
			else hue = 60 * ((red - green) / delta + 4);
		}
		const lightness = (maximum + minimum) / 2;
		const saturation = delta ? delta / (1 - Math.abs(2 * lightness - 1)) : 0;
		return { hue: (hue + 360) % 360, saturation: saturation * 100, lightness: lightness * 100 };
	}

	function relativeLuminance(color) {
		const { hue, saturation, lightness } = colorHsl(color);
		const h = hue / 360;
		const s = saturation / 100;
		const l = lightness / 100;
		const channel = offset => {
			const k = (offset + h * 12) % 12;
			const a = s * Math.min(l, 1 - l);
			const value = l - a * Math.max(-1, Math.min(k - 3, 9 - k, 1));
			return value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4;
		};
		return 0.2126 * channel(0) + 0.7152 * channel(8) + 0.0722 * channel(4);
	}

	function contrastRatio(first, second) {
		const a = relativeLuminance(first);
		const b = relativeLuminance(second);
		return (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);
	}

	function accessibleColor(color, background, isLight, minimumContrast = 4.5) {
		const parsed = colorHsl(color);
		if (!parsed || contrastRatio(color, background) >= minimumContrast) return color;
		const direction = isLight ? -1 : 1;
		for (let lightness = parsed.lightness + direction; lightness >= 0 && lightness <= 100; lightness += direction) {
			const candidate = hueColor(parsed.hue, parsed.saturation, lightness);
			if (contrastRatio(candidate, background) >= minimumContrast) return candidate;
		}
		return isLight ? "#000000" : "#ffffff";
	}

	function contrastingText(background) {
		return contrastRatio("#000000", background) >= contrastRatio("#ffffff", background) ? "#000000" : "#ffffff";
	}

	function generatedTheme(id, name, hue, colorScheme) {
		const isLight = colorScheme === "light";
		const foreground = isLight ? hueColor(hue, 18, 13) : hueColor(hue, 12, 95);
		const muted = isLight ? hueColor(hue, 14, 37) : hueColor(hue, 10, 75);
		const mainBackground = isLight ? hueColor(hue, 20, 89) : hueColor(hue, 17, 10);
		const accent = accessibleColor(isLight ? hueColor(hue, 78, 30) : hueColor(hue, 82, 76), mainBackground, isLight);
		const paper = isLight ? hueColor(hue, 26, 99) : hueColor(hue, 16, 16);
		const link = accessibleColor(isLight ? hueColor((hue + 195) % 360, 75, 31) : hueColor((hue + 195) % 360, 76, 80), paper, isLight);
		const surface = isLight ? hueColor(hue, 26, 99) : hueColor(hue, 16, 16);
		const raised = isLight ? hueColor(hue, 20, 94) : hueColor(hue, 17, 22);
		const inset = isLight ? hueColor(hue, 18, 90) : hueColor(hue, 16, 11);
		const border = accessibleColor(
			isLight ? hueColor(hue, 16, 67) : hueColor(hue, 14, 37),
			isLight ? surface : raised,
			isLight,
			3.5
		);
		const soft = isLight ? hueColor(hue, 22, 91) : hueColor(hue, 16, 25);
		const blood = isLight ? hueColor((hue + 345) % 360, 72, 34) : hueColor((hue + 345) % 360, 72, 70);
		return {
			id,
			name,
			colorScheme,
			colors: {
				chrome: isLight ? hueColor(hue, 18, 92) : hueColor(hue, 16, 9),
				chrome2: isLight ? hueColor(hue, 21, 96) : hueColor(hue, 16, 14),
				chromeLine: border,
				gold: accent,
				blood,
				accentText: isLight ? "#ffffff" : "#17120b",
				bloodText: isLight ? "#ffffff" : "#17120b",
				paper: surface,
				ink: foreground,
				muted,
				line: border,
				link,
				soft,
				mainBg: mainBackground,
				bodyText: foreground,
				sidebarMuted: muted,
				controlBg: surface,
				controlText: foreground,
				tableBg: surface,
				tableHeader: raised,
				searchSurface: surface,
				boxBg: raised,
				boxBgAlt: inset,
				boxText: foreground,
				boxMuted: muted,
				highlightBg: isLight ? hueColor(45, 90, 84) : hueColor(45, 60, 28),
				highlightText: isLight ? hueColor(35, 80, 18) : hueColor(45, 90, 92),
				statusPresentBg: isLight ? "#d8f0df" : "#153d2b",
				statusPresentText: isLight ? "#174b2b" : "#b7f0c8",
				statusUnknownBg: isLight ? "#fff0c2" : "#493914",
				statusUnknownText: isLight ? "#553b00" : "#ffe08a",
				statusMissingBg: isLight ? "#e5e7eb" : "#383838",
				statusMissingText: isLight ? "#343943" : "#e0e0e0"
			}
		};
	}

	const themes = [
		{
			id: "obsidian",
			name: "Hắc thạch",
			colorScheme: "dark",
			colors: { chrome: "#141414", chrome2: "#202020", chromeLine: "#383838", gold: "#e2bd61", blood: "#a93443", paper: "#242424", ink: "#f1f1f1", muted: "#b5b5b5", line: "#4b4b4b", link: "#6ca9ff", soft: "#333333", mainBg: "#241b19", bodyText: "#eeeeee", sidebarMuted: "#a99c88", controlBg: "#171717", controlText: "#f1ece4", tableBg: "#1b1b1b", tableHeader: "#303030", searchSurface: "#242424" }
		},
		{
			id: "parchment",
			name: "Cổ thư",
			colorScheme: "light",
			colors: { chrome: "#e9e3d6", chrome2: "#f4efe5", chromeLine: "#c8bdab", gold: "#8a641b", blood: "#8f2635", paper: "#fffdf7", ink: "#28231d", muted: "#6c6257", line: "#d5cbbb", link: "#245f91", soft: "#eee7d9", mainBg: "#ddd5c7", bodyText: "#302a24", sidebarMuted: "#716656", controlBg: "#fffdf7", controlText: "#28231d", tableBg: "#fffdf7", tableHeader: "#ebe3d4", searchSurface: "#fffdf7" }
		},
		{
			id: "tidepool",
			name: "Thủy triều",
			colorScheme: "dark",
			colors: { chrome: "#102125", chrome2: "#183037", chromeLine: "#31515a", gold: "#65d3c5", blood: "#d26a55", paper: "#1c3035", ink: "#e5f4f2", muted: "#9cb9b8", line: "#3c5c60", link: "#80c9f0", soft: "#284148", mainBg: "#13262a", bodyText: "#e6f2f0", sidebarMuted: "#9ab8b5", controlBg: "#102125", controlText: "#e5f4f2", tableBg: "#182d32", tableHeader: "#29434a", searchSurface: "#1c3035" }
		},
		{
			id: "verdant",
			name: "Lục địa",
			colorScheme: "dark",
			colors: { chrome: "#17231c", chrome2: "#202e25", chromeLine: "#425846", gold: "#c6d875", blood: "#bd604c", paper: "#26342a", ink: "#edf2df", muted: "#b2c0a6", line: "#50624c", link: "#83c9a3", soft: "#344532", mainBg: "#1d2a20", bodyText: "#edf2e8", sidebarMuted: "#aebba2", controlBg: "#17231c", controlText: "#edf2df", tableBg: "#202e25", tableHeader: "#354632", searchSurface: "#26342a" }
		},
		{
			id: "garnet",
			name: "Hồng ngọc",
			colorScheme: "dark",
			colors: { chrome: "#25181b", chrome2: "#332126", chromeLine: "#57363d", gold: "#e3ad67", blood: "#c24d5d", paper: "#38252a", ink: "#f6e9e9", muted: "#c5aeb0", line: "#63434a", link: "#e3a3ad", soft: "#493239", mainBg: "#2b1d21", bodyText: "#f4e9e8", sidebarMuted: "#c4aeb0", controlBg: "#25181b", controlText: "#f6e9e9", tableBg: "#332126", tableHeader: "#4a3036", searchSurface: "#38252a" }
		},
		{
			id: "amethyst",
			name: "Tử tinh",
			colorScheme: "dark",
			colors: { chrome: "#201b2b", chrome2: "#2b2439", chromeLine: "#49405f", gold: "#d0a7f4", blood: "#a94370", paper: "#30283e", ink: "#f0eafa", muted: "#b9afc9", line: "#564b6d", link: "#a9c9ff", soft: "#40364f", mainBg: "#241e31", bodyText: "#f0eafa", sidebarMuted: "#b9afc9", controlBg: "#201b2b", controlText: "#f0eafa", tableBg: "#2b2439", tableHeader: "#40364f", searchSurface: "#30283e" }
		},
		...[
			["hoa-dao", "Hoa đào", 348, "dark"],
			["san-ho", "San hô", 8, "light"],
			["hoang-hon", "Hoàng hôn", 20, "dark"],
			["gach-nung", "Gạch nung", 28, "light"],
			["ho-phach", "Hổ phách", 38, "dark"],
			["mat-ong", "Mật ong", 45, "light"],
			["hoang-kim", "Hoàng kim", 52, "dark"],
			["chanh-vang", "Chanh vàng", 60, "light"],
			["reu-non", "Rêu non", 76, "dark"],
			["la-ma", "Lá mạ", 88, "light"],
			["truc-xanh", "Trúc xanh", 104, "dark"],
			["rung-sau", "Rừng sâu", 120, "light"],
			["ngoc-luc-bao", "Ngọc lục bảo", 138, "dark"],
			["la-bac-ha", "Lá bạc hà", 150, "light"],
			["ngoc-bich", "Ngọc bích", 165, "dark"],
			["bac-ha", "Bạc hà", 174, "light"],
			["thuy-tinh", "Thủy tinh", 188, "dark"],
			["ho-bang", "Hồ băng", 198, "light"],
			["dai-duong", "Đại dương", 210, "dark"],
			["thien-thanh", "Thiên thanh", 220, "light"],
			["lam-ngoc", "Lam ngọc", 232, "dark"],
			["suong-xanh", "Sương xanh", 240, "light"],
			["cham", "Chàm", 252, "dark"],
			["oai-huong", "Oải hương", 260, "light"],
			["tu-tinh", "Tử tinh", 272, "dark"],
			["hoa-ca", "Hoa cà", 280, "light"],
			["man-tim", "Mận tím", 292, "dark"],
			["lan-tim", "Lan tím", 300, "light"],
			["cam-tu-cau", "Cẩm tú cầu", 312, "dark"],
			["hong-phan", "Hồng phấn", 320, "light"],
			["do-anh-dao", "Đỏ anh đào", 332, "dark"],
			["hong-suong", "Hồng sương", 340, "light"],
			["cat-sa-mac", "Cát sa mạc", 32, "dark"],
			["nga-voi", "Ngà voi", 48, "light"],
			["bao-dem", "Bão đêm", 205, "dark"],
			["may-bac", "Mây bạc", 215, "light"],
			["reu-da", "Rêu đá", 90, "dark"],
			["ngoc-trai", "Ngọc trai", 165, "light"],
			["than-lam", "Than lam", 235, "dark"],
			["tu-dang", "Hoa tử đằng", 285, "light"]
		].map(([id, name, hue, colorScheme]) => generatedTheme(id, name, hue, colorScheme))
	];
	const root = document.documentElement;
	const themeButton = document.getElementById("themeToggle");
	let currentId = "obsidian";

	function readSavedTheme() {
		try {
			return localStorage.getItem(storageKey);
		} catch {
			return null;
		}
	}

	function saveTheme(id) {
		try {
			localStorage.setItem(storageKey, id);
		} catch {
			return;
		}
	}

	function applyTheme(id, persist = true) {
		const theme = themes.find(item => item.id === id) || themes[0];
		currentId = theme.id;
		const isLight = theme.colorScheme === "light";
		const gold = accessibleColor(theme.colors.gold, theme.colors.mainBg, isLight);
		const blood = accessibleColor(theme.colors.blood, theme.colors.paper, isLight);
		const borderBackground = theme.colors.boxBg || theme.colors.chrome2;
		const border = accessibleColor(theme.colors.line, borderBackground, isLight, 3.5);
		const colors = {
			...theme.colors,
			gold,
			blood,
			line: border,
			chromeLine: accessibleColor(theme.colors.chromeLine, borderBackground, isLight, 3.5),
			accentText: contrastingText(gold),
			bloodText: contrastingText(blood),
			boxBg: theme.colors.boxBg || (isLight ? theme.colors.paper : theme.colors.chrome2),
			boxBgAlt: theme.colors.boxBgAlt || (isLight ? theme.colors.chrome2 : theme.colors.tableBg),
			boxText: theme.colors.boxText || theme.colors.ink,
			boxMuted: theme.colors.boxMuted || theme.colors.muted,
			highlightBg: theme.colors.highlightBg || (isLight ? "#f4dda2" : "#493914"),
			highlightText: theme.colors.highlightText || (isLight ? "#382e19" : "#ffe08a"),
			statusPresentBg: theme.colors.statusPresentBg || (isLight ? "#d8f0df" : "#153d2b"),
			statusPresentText: theme.colors.statusPresentText || (isLight ? "#174b2b" : "#9be2b7"),
			statusUnknownBg: theme.colors.statusUnknownBg || (isLight ? "#fff0c2" : "#493914"),
			statusUnknownText: theme.colors.statusUnknownText || (isLight ? "#553b00" : "#f0cf78"),
			statusMissingBg: theme.colors.statusMissingBg || (isLight ? "#e5e7eb" : "#383838"),
			statusMissingText: theme.colors.statusMissingText || (isLight ? "#343943" : "#c1c1c1")
		};
		Object.entries(colors).forEach(([name, value]) => root.style.setProperty(`--${name}`, value));
		root.style.colorScheme = theme.colorScheme;
		root.dataset.wikiTheme = theme.id;
		if (persist) saveTheme(theme.id);
		if (themeButton) {
			const isEnglish = document.documentElement.lang === "en";
			themeButton.textContent = `${isEnglish ? "Theme" : "Chủ đề"}: ${theme.name}`;
			themeButton.setAttribute("aria-label", isEnglish
				? `Current theme: ${theme.name}. Click to choose a theme.`
				: `Chủ đề hiện tại: ${theme.name}. Bấm để chọn chủ đề.`);
			themeButton.title = isEnglish
				? `Current theme: ${theme.name} · Click to choose a theme`
				: `Chủ đề hiện tại: ${theme.name} · Bấm để chọn chủ đề`;
		}
		window.dispatchEvent(new CustomEvent("lenhan:theme-change", { detail: theme }));
		return theme;
	}

	function nextTheme() {
		const index = themes.findIndex(theme => theme.id === currentId);
		return applyTheme(themes[(index + 1) % themes.length].id);
	}

	const savedId = readSavedTheme();
	applyTheme(themes.some(theme => theme.id === savedId) ? savedId : "obsidian", false);
	const themePicker = document.getElementById("themePickerOverlay");
	const themePickerSearch = document.getElementById("themePickerSearch");
	const themePickerOptions = document.getElementById("themePickerOptions");
	const themePickerClose = document.getElementById("themePickerClose");

	function normalizeThemeName(value) {
		return value.toLocaleLowerCase("vi").normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/đ/g, "d");
	}

	function renderThemeOptions(query = "") {
		const normalizedQuery = normalizeThemeName(query.trim());
		const matches = themes.filter(theme => normalizeThemeName(theme.name).includes(normalizedQuery));
		themePickerOptions.replaceChildren();
		if (!matches.length) {
			const empty = document.createElement("p");
			empty.className = "theme-picker-empty";
			empty.textContent = document.documentElement.lang === "en"
				? "No matching themes found."
				: "Không tìm thấy chủ đề phù hợp.";
			themePickerOptions.appendChild(empty);
			return;
		}
		matches.forEach(theme => {
			const option = document.createElement("button");
			option.type = "button";
			option.className = "theme-choice";
			option.setAttribute("role", "radio");
			option.setAttribute("aria-checked", String(theme.id === currentId));
			option.style.setProperty("--preview-bg", theme.colors.paper);
			option.style.setProperty("--preview-accent", theme.colors.gold);
			option.textContent = theme.name;
			option.addEventListener("click", () => {
				applyTheme(theme.id);
				closeThemePicker();
			});
			themePickerOptions.appendChild(option);
		});
	}

	function openThemePicker() {
		const searchOverlay = document.getElementById("searchOverlay");
		searchOverlay.hidden = true;
		document.getElementById("searchBtn").setAttribute("aria-expanded", "false");
		document.body.style.overflow = "hidden";
		themePicker.hidden = false;
		themeButton.setAttribute("aria-expanded", "true");
		themePickerSearch.value = "";
		renderThemeOptions();
		themePickerSearch.focus();
	}

	function closeThemePicker() {
		themePicker.hidden = true;
		themeButton.setAttribute("aria-expanded", "false");
		document.body.style.overflow = "";
		themeButton.focus();
	}

	themeButton?.addEventListener("click", openThemePicker);
	themePickerSearch.addEventListener("input", () => renderThemeOptions(themePickerSearch.value));
	themePickerSearch.addEventListener("keydown", event => {
		if (event.key !== "Enter") return;
		const firstOption = themePickerOptions.querySelector(".theme-choice");
		if (firstOption) {
			event.preventDefault();
			firstOption.click();
		}
	});
	themePickerClose.addEventListener("click", closeThemePicker);
	themePicker.querySelectorAll("[data-theme-picker-close]").forEach(button => {
		button.addEventListener("click", closeThemePicker);
	});
	document.addEventListener("keydown", event => {
		if (event.ctrlKey && event.altKey && event.key.toLowerCase() === "l" && !event.isComposing) {
			event.preventDefault();
			if (themePicker.hidden) openThemePicker();
			else closeThemePicker();
			return;
		}
		if (!themePicker.hidden && event.key === "Escape") closeThemePicker();
	}, true);

	window.addEventListener("storage", event => {
		if (event.key === storageKey && themes.some(theme => theme.id === event.newValue)) {
			applyTheme(event.newValue, false);
			if (!themePicker.hidden) renderThemeOptions(themePickerSearch.value);
		}
	});

	window.addEventListener("lenhan:language-change", () => {
		const isEnglish = document.documentElement.lang === "en";
		document.getElementById("themePickerTitle").textContent = isEnglish ? "Choose a theme" : "Chọn chủ đề";
		themePickerSearch.placeholder = isEnglish ? "Search themes by name..." : "Tìm chủ đề theo tên…";
		if (!themePicker.hidden) renderThemeOptions(themePickerSearch.value);
		applyTheme(currentId, false);
	});

	window.LenhanThemes = Object.freeze({
		list: () => themes.map(({ id, name }) => ({ id, name })),
		current: () => themes.find(theme => theme.id === currentId),
		set: id => applyTheme(id),
		next: nextTheme,
		openPicker: openThemePicker
	});
})();
