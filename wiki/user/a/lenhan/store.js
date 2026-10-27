
(() => {
	const wikiBasePath = new URL(".", document.currentScript.src);
	const requestOptions = window.OriciinWikiSettings?.requestOptions || { cache: "no-store" };
	const wikiNavigation = document.querySelector(".wiki-nav-scroll");
	if (wikiNavigation) {
		wikiNavigation.addEventListener("wheel", event => {
			const maxScroll = wikiNavigation.scrollWidth - wikiNavigation.clientWidth;
			const canScroll = event.deltaY > 0
				? wikiNavigation.scrollLeft < maxScroll
				: event.deltaY < 0 && wikiNavigation.scrollLeft > 0;
			if (maxScroll > 0 && canScroll && Math.abs(event.deltaY) > Math.abs(event.deltaX)) {
				wikiNavigation.scrollLeft += event.deltaY;
				event.preventDefault();
			}
		}, { passive: false });
	}
	let pageLanguage = "vi";
	pageLanguage = new URL(window.location.href).searchParams.get("lang") === "en" ? "en" : "vi";
	window.LENHAN_LANGUAGE = pageLanguage;
	document.documentElement.lang = pageLanguage;

	function initializeCatalog(systemTermOverrides = []) {
	const creatures = Array.isArray(window.LENHAN_CREATURES) ? window.LENHAN_CREATURES : [];
	const creaturesById = new Map(creatures.map(creature => [creature.id, creature]));
	const unknownProfileValue = pageLanguage === "en" ? "no recorded data" : "không có dữ liệu được ghi nhận";
	const archiveAvailable = creatures.length > 0;
	const initialPageSize = 30;
	const pageIncrement = 10;
	const datasheetCreatures = () => creatures.filter(creature => creature.categoryId !== "group-02" || Boolean(creature.details));
	const groups = [...new Map(creatures.map(item => [item.categoryId, { id: item.categoryId, title: item.category }])).values()];
	const elements = [
		{ id: "fire", label: "Lửa", formLabel: "Hệ Lửa (Fire)", aliases: ["lua", "fire"] },
		{ id: "water", label: "Nước", formLabel: "Hệ Nước (Water)", aliases: ["nuoc", "water"] },
		{ id: "earth", label: "Đất / Mộc", formLabel: "Hệ Đất/Mộc (Earth/Nature)", aliases: ["dat", "moc", "earth", "nature"] },
		{ id: "lightning", label: "Lôi", formLabel: "Hệ Lôi/Sấm sét (Thunder/Lightning)", aliases: ["sam set", "lightning", "thunder", "loi"] },
		{ id: "wind", label: "Phong", formLabel: "Hệ Phong/Gió (Wind)", aliases: ["gio", "wind", "phong"] },
		{ id: "ice", label: "Băng", formLabel: "Hệ Băng (Ice/Frost)", aliases: ["frost", "ice", "bang"] },
		{ id: "light", label: "Quang", formLabel: "Hệ Quang/Ánh sáng (Light/Holy)", aliases: ["anh sang", "holy", "light", "quang", "uv"] },
		{ id: "dark", label: "Ám", formLabel: "Hệ Ám/Bóng tối (Dark/Unification)", aliases: ["bong toi", "shadow", "dark", "am"] },
		{ id: "poison", label: "Độc", formLabel: "Hệ Độc tố (Poison/Acid)", aliases: ["poison", "acid", "axit", "doc"] }
	];
	let items = buildItemCatalog();
	let itemsById = new Map();
	let itemLinkCandidates = [];
	let itemLinkPattern = null;
	let itemsByEscapedName = new Map();
	function setItemCatalog(catalog) {
		items = catalog;
		itemsById = new Map(items.map(item => [item.id, item]));
		itemLinkCandidates = items
			.flatMap(item => [item.rawName, item.name].map(name => ({ item, escapedName: escapeHtml(name) })))
			.sort((a, b) => b.escapedName.length - a.escapedName.length);
		itemLinkPattern = itemLinkCandidates.length
			? new RegExp(itemLinkCandidates.map(candidate => candidate.escapedName.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("|"), "gi")
			: null;
		itemsByEscapedName = new Map(itemLinkCandidates.map(candidate => [candidate.escapedName.toLocaleLowerCase("vi"), candidate.item]));
		window.LENHAN_ITEMS = items;
	}
	setItemCatalog(items);
	const state = { group: null, groupsCollapsed: false, query: "", selectedId: null, selectedItemId: null, itemIdQuery: "", itemNameQuery: "", itemRank: "", view: "center", elementId: "fire", minPercent: -500, maxPercent: 100, includeUnknown: true, elementQuery: "", simulationCreatureId: "", simulationElementIds: [], simulationValues: {}, simulationApplied: false, catalogQuery: "", catalogGroup: "", catalogSpecies: "", catalogTags: [], glossaryQuery: "", glossaryCreatureId: "", glossaryTerm: "", glossaryType: "", pageLimits: {} };
	let activeTab = state.view;
	const navigationHistory = [];
	const profileSections = pageLanguage === "en" ? [
		{ roman: "I", title: "IDENTIFICATION INFORMATION" },
		{ roman: "II", title: "BIOLOGY & APPEARANCE" },
		{ roman: "III", title: "ATTRIBUTES AND STATS" },
		{ roman: "IV", title: "RESISTANCE AND WEAKNESSES" },
		{ roman: "V", title: "SKILLS & ABILITIES" },
		{ roman: "VI", title: "ECOLOGY AND BEHAVIOR" },
		{ roman: "VII", title: "REWARDS FOR DEFEAT" },
		{ roman: "VIII", title: "HISTORY / LEGEND" }
	] : [
		{ roman: "I", title: "THÔNG TIN ĐỊNH DANH" },
		{ roman: "II", title: "ĐẶC ĐIỂM SINH HỌC & NGOẠI HÌNH" },
		{ roman: "III", title: "THUỘC TÍNH VÀ CHỈ SỐ" },
		{ roman: "IV", title: "BẢNG KHÁNG VÀ ĐIỂM YẾU" },
		{ roman: "V", title: "HỆ THỐNG KỸ NĂNG & NĂNG LỰC" },
		{ roman: "VI", title: "SINH THÁI HỌC VÀ HÀNH VI" },
		{ roman: "VII", title: "PHẦN THƯỞNG KHI TIÊU DIỆT" },
		{ roman: "VIII", title: "LỊCH SỬ / GIAI THOẠI TRUYỀN THUYẾT" }
	];
	const emptyProfileSections = [
		{
			roman: "I", title: "THÔNG TIN ĐỊNH DANH", fields: [
				"Tên loài/Sinh vật (Name)", "Danh pháp khoa học/Cổ ngữ (Scientific/Ancient Name)", "Biệt danh/Danh hiệu (Titles/Aliases)",
				"Phân hệ/Chủng tộc đại cương (Type/Race)", "Phân loại nhánh nhỏ (Sub-type)", "Cấp độ nguy hiểm / Xếp hạng (Rank/Danger Level)",
				"Cấp độ khuyến nghị cho Thợ săn (Recommended Level)"
			]
		},
		{
			roman: "II", title: "ĐẶC ĐIỂM SINH HỌC & NGOẠI HÌNH", fields: [
				"Kích thước đại cương (Size Category)", "Chiều cao/Chiều dài", "Sải cánh", "Cân nặng", "Cấu tạo da/Bề ngoài",
				"Đặc điểm nhận dạng đặc trưng", "Tuổi thọ trung bình", "Cơ chế sinh sản/Phát triển"
			]
		},
		{
			roman: "III", title: "THUỘC TÍNH VÀ CHỈ SỐ", fields: [
				"HP (Sinh lực / Máu), giới hạn tối đa và tốc độ tự hồi phục mỗi giây", "MP (Ma lực / Năng lượng), giới hạn tối đa và tốc độ tự hồi phục mỗi giây",
				"SP/Stamina (Thể lực / Thể năng) và tốc độ tiêu hao khi chạy",
				"Giáp vật lý và tỷ lệ sát thương vật lý được giảm", "Giáp phép thuật (Magic Barrier/Shield) và lượng sát thương phép hấp thụ tối đa",
				"STR (Strength - Sức mạnh cơ bắp, lực đánh và sức nâng)", "VIT / CON (Vitality/Constitution - Sức bền, kháng bệnh và độc tố)",
				"AGI (Agility - Sự nhanh nhẹn, tốc độ và phản xạ)", "DEX (Dexterity - Sự khéo léo, chính xác và nhào lộn)",
				"INT (Intelligence - Trí tuệ, sức mạnh phép thuật và khả năng học hỏi)", "WIS (Wisdom - Khôn ngoan, nhận thức và trực giác)",
				"MND / MEN (Mind/Mentality - Ý chí và khả năng chống thao túng tinh thần)",
				"CHA (Charisma - Thần thái, uy nghiêm và khả năng lãnh đạo)", "LUK (Luck - May mắn, chí mạng và né tránh)",
				"Tốc độ đi bộ (mét/giây)", "Tốc độ chạy nước rút (mét/giây)", "Tốc độ bay (mét/giây)",
				"Tốc độ bơi/Đào đất (mét/giây)"
			]
		},
		{
			roman: "IV", title: "BẢNG KHÁNG VÀ ĐIỂM YẾU", fields: [
				"Kháng hiệu ứng Choáng (Stun)", "Kháng hiệu ứng Đóng băng (Freeze)", "Kháng hiệu ứng Hóa đá (Petrify)",
				"Kháng hiệu ứng Câm lặng (Silence)", "Kháng hiệu ứng Thao túng tâm trí (Charm/Fear/Mind Control)",
				"Điểm yếu vật lý", "Điểm yếu tâm lý/Khác"
			]
		},
		{
			roman: "V", title: "HỆ THỐNG KỸ NĂNG & NĂNG LỰC", fields: [
				"Kỹ năng Nội tại (Passive Skills - Luôn luôn kích hoạt) và mô tả",
				"Kỹ năng Chủ động thứ nhất: tên kỹ năng", "Kỹ năng Chủ động thứ nhất: tiêu hao ma lực/thể lực",
				"Kỹ năng Chủ động thứ nhất: thời gian hồi chiêu", "Kỹ năng Chủ động thứ nhất: tầm thi triển",
				"Kỹ năng Chủ động thứ nhất: mô tả hiệu ứng và sát thương",
				"Kỹ năng Chủ động thứ hai: tên kỹ năng", "Kỹ năng Chủ động thứ hai: tiêu hao và thời gian hồi chiêu",
				"Kỹ năng Chủ động thứ hai: mô tả hiệu ứng",
				"Tuyệt chiêu / Kỹ năng Tối thượng (Ultimate / Boss Mechanics): tên",
				"Tuyệt chiêu: điều kiện kích hoạt", "Tuyệt chiêu: phạm vi ảnh hưởng", "Tuyệt chiêu: mô tả hiệu ứng"
			]
		},
		{
			roman: "VI", title: "SINH THÁI HỌC VÀ HÀNH VI", fields: [
				"Môi trường sống chủ yếu (Habitat)", "Tập tính xã hội", "Chế độ ăn uống (Diet)",
				"Trí khôn & Ngôn ngữ (Intelligence & Speech)", "Mức độ chủ động tấn công"
			]
		},
		{
			roman: "VII", title: "PHẦN THƯỞNG KHI TIÊU DIỆT", fields: [
				"Lượng Kinh nghiệm nhận được (EXP)", "Lượng tiền/Vàng rơi ra",
				"Vật phẩm rơi ra thông thường (Common Drops) và tỷ lệ rơi",
				"Vật phẩm hiếm (Rare Drops) và tỷ lệ rơi",
				"Cực phẩm / Trang bị Sử thi (Epic/Legendary Drops) và tỷ lệ rơi"
			]
		},
		{
			roman: "VIII", title: "LỊCH SỬ / GIAI THOẠI TRUYỀN THUYẾT", fields: [
				"Nguồn gốc xuất xứ", "Ghi chép từ Hội thợ săn/Học viện ma thuật"
			]
		}
	];
	const element = id => document.getElementById(id);

	function scrollToPageTop() {
		element("mainContent")?.scrollTo({ top: 0, behavior: "smooth" });
		window.scrollTo({ top: 0, behavior: "smooth" });
	}

	function updateMiniBackButton() {
		const button = element("miniBackButton");
		if (button) button.disabled = !navigationHistory.some(snapshot => snapshot.tab === activeTab);
	}

	function rememberNavigation(tab = activeTab) {
		navigationHistory.push({
			tab,
			hash: window.location.hash,
			state: JSON.parse(JSON.stringify(state)),
			scrollTop: element("mainContent")?.scrollTop || 0,
			windowScrollY: window.scrollY
		});
		if (navigationHistory.length > 50) navigationHistory.shift();
		updateMiniBackButton();
	}

	function restoreNavigation() {
		let index = navigationHistory.length - 1;
		while (index >= 0 && navigationHistory[index].tab !== activeTab) index--;
		if (index < 0) return;
		const snapshot = navigationHistory[index];
		navigationHistory.splice(index);
		Object.assign(state, snapshot.state);
		activeTab = snapshot.tab;
		if (window.location.hash !== snapshot.hash) window.history.replaceState(null, "", snapshot.hash || window.location.pathname + window.location.search);
		if (state.view === "card" && state.selectedId) {
			const creature = creaturesById.get(state.selectedId);
			if (creature) {
				renderCard(creature);
				setActiveTab("");
			} else {
				renderRoute();
			}
		} else if (state.view === "item" && state.selectedItemId) {
			const item = itemsById.get(state.selectedItemId);
			if (item) {
				renderItemCard(item);
				setActiveTab("items");
			} else renderRoute();
		} else {
			setActiveTab(state.view);
			if (state.view === "elements") renderElements();
			else if (state.view === "catalog") renderCatalog();
			else if (state.view === "glossary") renderGlossary();
			else if (state.view === "items") renderItems();
			else if (state.view === "map") renderMap();
			else renderCenter();
		}
		requestAnimationFrame(() => {
			const main = element("mainContent");
			if (main) main.scrollTop = snapshot.scrollTop;
			window.scrollTo(0, snapshot.windowScrollY || 0);
		});
		updateMiniBackButton();
	}

	function setupMiniActions() {
		const container = element("miniActions");
		const toggle = element("miniActionsToggle");
		const list = element("miniActionsList");
		if (!container || !toggle || !list) return;
		const closeMenu = () => {
			container.classList.remove("is-open");
			toggle.setAttribute("aria-expanded", "false");
			toggle.setAttribute("aria-label", "Mở thao tác nhanh");
			list.inert = true;
		};
		toggle.addEventListener("click", () => {
			const open = container.classList.toggle("is-open");
			toggle.setAttribute("aria-expanded", String(open));
			toggle.setAttribute("aria-label", open ? "Đóng thao tác nhanh" : "Mở thao tác nhanh");
			list.inert = !open;
		});
		element("miniBackButton").addEventListener("click", () => {
			restoreNavigation();
			closeMenu();
		});
		element("miniTopButton").addEventListener("click", () => {
			scrollToPageTop();
			closeMenu();
		});
		document.addEventListener("keydown", event => {
			if (event.key === "Escape" && container.classList.contains("is-open")) closeMenu();
		});
		updateMiniBackButton();
	}

	function escapeHtml(value) {
		return String(value ?? "").replace(/[&<>"']/g, character => ({
			"&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
		}[character]));
	}

	function inlineMarkdown(value) {
		return itemLinks(value)
			.replace(/`([^`]+)`/g, "<code>$1</code>")
			.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
			.replace(/\*([^*]+)\*/g, "<em>$1</em>")
			.replace(/\bnone-data\b/gi, '<span class="none-data-box">none-data</span>');
	}

	function dataStatus(value) {
		const text = String(value ?? "").trim();
		if (!text) return { label: "Không có thông tin", className: "missing", value: "" };
		if (/\b(không rõ|chưa rõ|chưa xác định|không xác định|không biết|unknown|undetermined|n\/a|tbd)\b/i.test(text)) {
			return { label: "Không rõ", className: "unknown", value: text };
		}
		return { label: "", className: "", value: text };
	}

	function renderDataRow(label, value) {
		const status = dataStatus(value);
		const statusMarkup = status.label ? `<span class="data-status ${status.className}">${status.label}</span>` : "";
		const valueMarkup = status.value && status.value.toLocaleLowerCase("vi") !== status.label.toLocaleLowerCase("vi")
			? `<span>${inlineMarkdown(status.value)}</span>`
			: "";
		return `<div class="field-row"><div class="field-label">${inlineMarkdown(label)}</div><div class="field-value">${statusMarkup}${valueMarkup}</div></div>`;
	}

	function profileHeadings(markdown) {
		return [...String(markdown || "").matchAll(/^####\s+(.+)$/gm)].map((match, index) => ({
			id: `profile-section-${index + 1}`,
			title: match[1].trim()
		}));
	}

	function parseProfileSections(markdown) {
		const text = String(markdown || "");
		const headings = [...text.matchAll(/^####\s+(.+)$/gm)];
		const sections = new Map();
		headings.forEach((heading, index) => {
			const end = headings[index + 1]?.index ?? text.length;
			let body = text.slice(heading.index + heading[0].length, end).trim();
			if (heading[1].startsWith("VIII.")) body = body.replace(/\n*📌\s*\*{0,2}BẢNG TỔNG HỢP NHANH[\s\S]*$/i, "").trim();
			const roman = heading[1].match(/^([IVX]+)\./)?.[1];
			if (roman) sections.set(roman, body);
			const secondary = heading[1].match(/&\s*(VII)\./)?.[1];
			if (secondary && !sections.has(secondary)) sections.set(secondary, body);
		});
		return sections;
	}

	function quickReferenceValues(markdown) {
		const row = String(markdown || "").match(/^\|\s*\*\*HP\s*\/\s*MP\*\*\s*\|([^|]*)\|([^|]*)\|([^|]*)\|([^|]*)\|\s*$/m);
		return row ? row.slice(1).map(value => value.trim()) : [];
	}

	function renderElementLinks(creature) {
		const related = Object.keys(parseAffinities(creature));
		if (!related.length) return "";
		return `<div class="element-links"><strong>So sánh nguyên tố:</strong>${related.map(id => {
			const item = elements.find(candidate => candidate.id === id);
			return `<a class="element-link" href="#elements/${item.id}">${escapeHtml(item.label)}</a>`;
		}).join("")}</div>`;
	}

	function normalizeText(value) {
		return String(value || "").toLocaleLowerCase("vi").normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/đ/g, "d");
	}

	function extractCreatureField(creature, labelPattern) {
		const line = String(creature.details || "").split(/\r?\n/).find(entry => {
			const match = entry.match(/^\s*[*-]\s*\*\*(?<label>[^*]+):\*\*\s*(?<value>.*)$/);
			return match && labelPattern.test(normalizeText(match.groups.label));
		});
		return line?.match(/^\s*[*-]\s*\*\*[^*]+:\*\*\s*(.*)$/)?.[1]?.trim() || "";
	}

	function inferItemProfile(item) {
		const name = normalizeText(item.rawName || item.name);
		const inferredForms = [
			{ pattern: /\b(loi|hat nhan|core|nucleus)\b/, type: "Lõi / hạt nhân sinh vật", appearance: "Lõi hoặc hạt nhân cô đặc; hình khối cụ thể và màu sắc chưa được ghi rõ." },
			{ pattern: /\b(mang vay|vay|scale)\b/, type: "Mảnh vảy / màng sinh học", appearance: "Mảnh vảy hoặc màng sinh học mỏng; màu sắc và kích thước chưa được ghi rõ." },
			{ pattern: /\b(mong|vuot|claw)\b/, type: "Bộ phận sinh vật", appearance: "Móng hoặc vuốt cứng, thuôn nhọn; chất liệu và màu sắc chưa được ghi rõ." },
			{ pattern: /\b(rang|nanh|fang|tooth)\b/, type: "Bộ phận sinh vật", appearance: "Răng hoặc nanh thuôn nhọn; kích thước và màu sắc chưa được ghi rõ." },
			{ pattern: /\b(sung|horn)\b/, type: "Bộ phận sinh vật", appearance: "Mảnh sừng cứng, thường có dạng cong hoặc nhọn; hình dáng chính xác chưa được ghi rõ." },
			{ pattern: /\b(xuong|tuy|bone|marrow)\b/, type: "Bộ phận sinh vật", appearance: "Mảnh xương hoặc vật chất tủy cô đặc; hình dạng và màu sắc chưa được ghi rõ." },
			{ pattern: /\b(mau|huyet|blood)\b/, type: "Dịch / nguyên liệu sinh học", appearance: "Chất lỏng hoặc dịch sinh học; màu sắc và trạng thái cụ thể chưa được ghi rõ." },
			{ pattern: /\b(long|feather|fur)\b/, type: "Bộ phận sinh vật", appearance: "Sợi lông hoặc lông vũ tách rời; màu sắc và kích thước chưa được ghi rõ." },
			{ pattern: /\b(da|hide|leather)\b/, type: "Bộ phận sinh vật", appearance: "Mảnh da sinh vật đã tách khỏi cơ thể; độ dày và màu sắc chưa được ghi rõ." },
			{ pattern: /\b(khoi|khi|suong|gas|mist)\b/, type: "Vật chất dạng khí", appearance: "Dạng khí, khói hoặc sương cô đọng; vật chứa và mật độ chưa được ghi rõ." },
			{ pattern: /\b(mat xich|xieng|xich|chain)\b/, type: "Bộ phận / vật liệu cấu tạo", appearance: "Đoạn xích hoặc mắt xích rắn, có dạng vòng nối; vật liệu và kích thước chính xác chưa được ghi rõ." },
			{ pattern: /\b(tinh the|thach anh|ngoc|crystal|quartz)\b/, type: "Khoáng vật / tinh thể", appearance: "Mảnh tinh thể hoặc khoáng vật kết tinh; màu sắc và kích thước chưa được ghi rõ." },
			{ pattern: /\b(nam|moc nhi|mushroom)\b/, type: "Thực phẩm / nguyên liệu sinh học", appearance: "Mẫu nấm hoặc phần thể quả; màu sắc và kích thước chưa được ghi rõ." },
			{ pattern: /\b(thit|meat)\b/, type: "Thực phẩm / nguyên liệu sinh học", appearance: "Phần thịt sinh vật có thể thu hoạch; cách sơ chế và hình thức cụ thể chưa được ghi rõ." }
		];
		const match = inferredForms.find(form => form.pattern.test(name));
		const nameWords = name.split(/\s+/);
		const colors = { den: "đen", do: "đỏ", xanh: "xanh", lam: "lam", tim: "tím", trang: "trắng", bac: "bạc", vang: "vàng" };
		const colorKey = Object.keys(colors).find(value => nameWords.includes(value));
		const materials = { "thach anh": "thạch anh", "tinh the": "tinh thể", "ma luc": "ma lực", "nang luong": "năng lượng", axit: "axit" };
		const materialKey = Object.keys(materials).find(value => name.includes(value));
		return {
			type: match?.type || "Nguyên liệu chưa phân loại",
			appearance: match
				? `Hình thái: ${match.appearance}${materialKey ? ` Chất liệu hoặc thành phần: ${materials[materialKey]}.` : ""}${colorKey ? ` Màu sắc: ${colors[colorKey]}.` : ""}`
				: `Hồ sơ nguồn chưa mô tả hình dạng cụ thể của ${item.name}.`
		};
	}

	function completeItemProfile(item) {
		const source = creaturesById.get(item.sources[0]?.id);
		const inferred = inferItemProfile(item);
		const sourceSummary = source?.summary || "";
		const sourceAppearance = extractCreatureField(source, /cau tao da|dac diem nhan dang|dac diem hinh thai|ngoai hinh/i);
		const habitat = extractCreatureField(source, /moi truong song(?: chu yeu)?|habitat/i);
		const diet = extractCreatureField(source, /che do an uong|thuc an|diet/i);
		const weakness = extractCreatureField(source, /diem yeu vat ly|diem yeu tam ly/i);
		const sourceContext = [sourceAppearance, sourceSummary].filter(Boolean).join(" ");
		const attributes = source && parseAffinities(source);
		const strongestAttribute = attributes && Object.entries(attributes)
			.sort(([, first], [, second]) => second - first)[0];
		const weakestAttribute = attributes && Object.entries(attributes)
			.sort(([, first], [, second]) => first - second)[0];
		const attributeLabels = {
			fire: "Lửa", water: "Nước", earth: "Đất/Mộc", lightning: "Lôi",
			wind: "Phong", ice: "Băng", light: "Quang", dark: "Ám", poison: "Độc"
		};
		const sourceName = source?.name || "sinh vật chưa xác định";
		const materialType = item.type || inferred.type;
		const generatedStats = [
			["Tấn công vật lý", "Không áp dụng khi vật phẩm ở dạng nguyên liệu."],
			["Sát thương phép thuật", strongestAttribute ? `Mang dư tính hệ ${attributeLabels[strongestAttribute[0]]} từ sinh vật nguồn.` : unknownProfileValue],
			["Phòng thủ / Giáp", "Không có chỉ số giáp độc lập; độ bền phụ thuộc cách chế tác."],
			["Kháng phép", weakestAttribute ? `Kháng hệ ${attributeLabels[weakestAttribute[0]]}, yếu tố có mức kháng thấp nhất của sinh vật nguồn.` : unknownProfileValue],
			["Độ bền / Độ chịu lực", "Độ bền vật liệu phụ thuộc phương thức bảo quản."],
			["Thuộc tính đòn đánh", strongestAttribute ? `Dư tính hệ ${attributeLabels[strongestAttribute[0]]} được lưu giữ sau khi tinh luyện.` : unknownProfileValue],
			["Thuộc tính phòng ngự", weakness ? `Vật liệu có tác dụng đối phó điểm yếu của sinh vật nguồn: ${weakness}` : unknownProfileValue]
		];
		const stats = item.stats?.length
			? item.stats.map(([label, value]) => [label, /^none-data$/i.test(String(value || "").trim())
				? generatedStats.find(([statLabel]) => statLabel === label)?.[1] || unknownProfileValue
				: value])
			: generatedStats;
		const inferredEffect = strongestAttribute
			? `Sau khi tinh luyện, ${item.rawName} lưu giữ dư tính hệ ${attributeLabels[strongestAttribute[0]]} của ${sourceName}.`
			: `${item.rawName} được dùng làm nguyên liệu nghiên cứu đặc tính của ${sourceName}.`;
		const defaultDescription = [
			inferred.appearance,
			sourceContext ? `Hồ sơ ${sourceName} mô tả: ${sourceContext}` : "",
			habitat ? `Nguồn sinh vật sống tại ${habitat}` : ""
		].filter(Boolean).join(" ");
		const rank = extractCreatureField(source, /cap do nguy hiem|xep hang|rank|danger level/i);
		const itemUse = /loi|hat nhan|tinh the|tinh tuy|ma luc|nang luong|doc|tuyen|dich|mau|huyet/i.test(normalizeText(item.rawName))
			? "Dùng để tinh luyện hoặc phối chế thành dược liệu, chất xúc tác."
			: "Dùng làm nguyên liệu chế tác, nghiên cứu hoặc vật phẩm trao đổi.";
		return {
			...item,
			ancientName: item.ancientName || item.name,
			type: item.type || materialType,
			description: item.description || escapeHtml(defaultDescription),
			note: item.note || `Thông tin vật phẩm liên hệ với hồ sơ nguồn${sourceSummary ? `: ${sourceSummary}` : ` (${sourceName})`}`,
			usableLevel: item.usableLevel || "Không áp dụng khi vật phẩm ở dạng nguyên liệu.",
			classes: item.classes || "Thợ săn, thợ rèn, giả kim thuật sư và nhà nghiên cứu.",
			obtain: {
				quest: item.obtain?.quest || `Thu thập ${item.rawName} từ ${sourceName} để nghiên cứu đặc tính.`,
				crafting: item.obtain?.crafting || `Làm sạch và tinh luyện ${item.rawName}.`,
				location: item.obtain?.location || (habitat ? `Khu vực sinh sống của ${sourceName}: ${habitat}` : unknownProfileValue),
				conditions: item.obtain?.conditions || item.dropChance || `${unknownProfileValue}${rank ? `; hồ sơ nguồn xếp ${sourceName}: ${rank}` : ""}.`
			},
			stats,
			effects: item.effects?.length ? item.effects : [inferredEffect, itemUse],
			upgrade: item.upgrade || unknownProfileValue,
			commerce: item.commerce || unknownProfileValue,
			lore: item.lore || `${item.rawName} gắn với đặc tính của ${sourceName}.${diet ? ` Tập tính ăn uống được ghi nhận: ${diet}` : ""}`
		};
	}

	function inferRarityFromText(value) {
		const text = normalizeText(value);
		if (/\b(artifact|co vat|doc ban)\b/.test(text)) return "artifact";
		if (/\b(mythic|than thoai)\b/.test(text)) return "mythic";
		if (/\b(legendary|huyen thoai)\b/.test(text)) return "legendary";
		if (/\b(epic|anh hung|su thi)\b/.test(text)) return "epic";
		if (/\b(rare|hiem)\b/.test(text)) return "rare";
		if (/\b(common|thong thuong)\b/.test(text)) return "common";
		return "";
	}

	function buildItemCatalog() {
		const found = new Map();
		const rarityPriority = { unknown: 0, common: 1, rare: 2, epic: 3, legendary: 4, mythic: 5, artifact: 6 };
		const itemMotifs = [
			["mang vay", "Squama"],
			["vien da", "Lapis"],
			["da quy", "Gemma"],
			["skin", "Cutis"],
			["lop da", "Cutis"],
			["tam da", "Cutis"],
			["heart", "Cor"],
			["eye", "Oculus"],
			["scale", "Squama"],
			["marrow", "Medulla"],
			["bone", "Os"],
			["blood", "Sanguis"],
			["core", "Nucleus"],
			["crystal", "Crystallum"],
			["chain", "Catena"],
			["tentacle", "Tentaculum"],
			["feather", "Pluma"],
			["claw", "Unguis"],
			["horn", "Cornu"],
			["tooth", "Dens"],
			["mist", "Nebula"],
			["dust", "Pulvis"],
			["shard", "Fragmentum"],
			["essence", "Essentia"],
			["the khi", "Vapor"],
			["tinh the", "Crystallum"],
			["mat xich", "Catena"],
			["xich", "Catena"],
			["xuc tu", "Tentaculum"],
			["mang", "Membrana"],
			["mat", "Oculus"],
			["tim", "Cor"],
			["vay", "Squama"],
			["long", "Pilus"],
			["canh", "Ala"],
			["xuong", "Os"],
			["tuy", "Medulla"],
			["mong", "Unguis"],
			["rang", "Dens"],
			["sung", "Cornu"],
			["duoi", "Cauda"],
			["thit", "Caro"],
			["gan", "Tendo"],
			["re", "Radix"],
			["fungus", "Fungus"],
			["reu", "Muscus"],
			["hat", "Granum"],
			["vo", "Cortex"],
			["trung", "Ovum"],
			["soi", "Filum"],
			["mau", "Sanguis"],
			["huyet", "Sanguis"],
			["loi", "Nucleus"],
			["ma luc", "Arcanum"],
			["nang luong", "Energia"],
			["hoi", "Vapor"],
			["khoi", "Fumus"],
			["khi", "Fumus"],
			["hon", "Anima"],
			["spore", "Spora"],
			["bao tu", "Spora"],
			["tuyen", "Glandula"],
			["dich", "Ichor"],
			["doc", "Venenum"],
			["ngoc", "Gemma"],
			["kiem", "Gladius"],
			["dao", "Cultrum"],
			["nhan", "Anulus"],
			["vong", "Anulus"],
			["chia khoa", "Clavis"],
			["thuoc", "Elixir"],
			["binh", "Ampulla"],
			["bui", "Pulvis"],
			["manh", "Fragmentum"],
			["tinh tuy", "Essentia"],
			["vat lieu", "Materia"]
		];
		const itemModifiers = [
			["umbral", "Noctis"], ["shadow", "Umbrae"], ["bong toi", "Umbrae"], ["dem", "Noctis"],
			["huyet", "Sanguinea"], ["blood", "Sanguinea"], ["mau", "Sanguinea"],
			["bang", "Glacialis"], ["ice", "Glacialis"], ["frost", "Glacialis"],
			["doc", "Venenata"], ["venom", "Venenata"], ["poison", "Venenata"],
			["nguyen", "Maledicta"], ["curse", "Maledicta"], ["oan", "Maledicta"],
			["den", "Nigra"], ["black", "Nigra"], ["do", "Rubra"], ["red", "Rubra"],
			["ma", "Arcana"], ["arcane", "Arcana"], ["nang luong", "Energetica"],
			["thach anh", "Quartzina"], ["tinh the", "Crystallina"], ["crystal", "Crystallina"],
			["co dong", "Condensata"], ["co dac", "Condensata"], ["ancient", "Priscilla"]
		];
		const creatureEpithet = creature => {
			const parentheticalName = creature.name.match(/\(([^)]+)\)/)?.[1]?.trim() || "";
			const englishName = /^[A-Za-z][A-Za-z0-9 -]+$/.test(parentheticalName) ? parentheticalName : "";
			const scientificName = extractCreatureField(creature, /danh phap khoa hoc|scientific/).replace(/\*+/g, "").trim();
			const validScientificName = /^[A-Za-z][A-Za-z -]+$/.test(scientificName) && scientificName.trim().split(/\s+/).length > 1;
			const sourceName = englishName || (validScientificName ? scientificName : creature.name.split("(")[0].trim());
			const words = sourceName.split(/\s+/).filter(Boolean);
			return words.slice(englishName || validScientificName ? -2 : -3).join(" ");
		};
		const stylizedItemName = (rawName, creature) => {
			const normalized = normalizeText(rawName);
			const foundMotif = itemMotifs.find(([term]) => containsTerm(normalized, term))?.[1];
			const motif = foundMotif || (/(?:^|\s)da(?:\s|$)/i.test(rawName) ? "Cutis" :
				/(?:^|\s)đá(?:\s|$)/i.test(rawName) ? "Lapis" :
					/(?:^|\s)nấm(?:\s|$)/i.test(rawName) ? "Fungus" : "Relictum");
			let modifier = itemModifiers.find(([term]) => containsTerm(normalized, term))?.[1];
			if ((motif === "Sanguis" && modifier === "Sanguinea") ||
				(motif === "Crystallum" && modifier === "Crystallina") ||
				(motif === "Venenum" && modifier === "Venenata")) modifier = "";
			const epithet = creatureEpithet(creature);
			return `${modifier ? `${modifier} ` : ""}${motif} ${epithet}`;
		};
		const addItem = (rawName, creature, rarity, dropChance, note) => {
			const name = String(rawName || "").trim().replace(/[.;,]+$/, "").trim();
			if (!name || /^(?:none-data|mẫu vật phù hợp với mô tả|mẫu vật có đặc tính)/i.test(name)) return;
			const normalizedName = normalizeText(name);
			const itemKey = `${creature.id}:${normalizedName}`;
			let item = found.get(itemKey);
			if (!item) {
				item = {
					id: `item-${String(found.size + 1).padStart(4, "0")}`,
					rawName: name,
					name: "",
					normalizedName,
					rarity: "unknown",
					dropChance: "",
					note: "",
					sources: []
				};
				found.set(itemKey, item);
			}
			const source = { id: creature.id, name: creature.name };
			if (!item.sources.some(entry => entry.id === source.id)) item.sources.push(source);
			if ((rarityPriority[rarity] || 0) > (rarityPriority[item.rarity] || 0)) item.rarity = rarity;
			if (dropChance && !item.dropChance) item.dropChance = dropChance;
			if (note && !item.note) item.note = note;
		};
		const extractEntry = (entry, creature, rarity) => {
			let value = entry.trim().replace(/^[•*-]\s*/, "").replace(/[.;]+$/, "").trim();
			if (!value || /^none-data$/i.test(value)) return;
			let chance = "";
			let note = "";
			let entryRarity = rarity;
			const detail = value.match(/\s*\(([^()]*)\)\s*$/);
			if (detail && (/%|common|rare|epic|legendary|mythic|artifact|thường|hiếm|huyền thoại|thần thoại|cổ vật|dùng|làm |chế |thu hoạch|giàu |chứa |hỗ trợ |phục hồi|chữa trị|tăng cường/i.test(detail[1]))) {
				value = value.slice(0, detail.index).trim();
				const percent = detail[1].match(/\b\d+(?:[.,]\d+)?\s*%/);
				if (percent) chance = percent[0].replace(/\s/g, "");
				note = detail[1].replace(/\b\d+(?:[.,]\d+)?\s*%\s*[-–:]?\s*/g, "").trim();
				entryRarity = inferRarityFromText(detail[1]) || entryRarity;
			}
			if (/^(?:none-data|mẫu vật phù hợp với mô tả|mẫu vật có đặc tính)/i.test(value)) return;
			addItem(value, creature, entryRarity, chance, note);
		};
		creatures.forEach(creature => {
			String(creature.details || "").split(/\r?\n/).forEach(line => {
				const field = line.match(/^\s*[*-]\s*\*\*(Vật phẩm[^*]*?|Cực phẩm[^*]*?|Loot)\s*:\*\*\s*(.+)$/i);
				if (field) {
					const label = normalizeText(field[1]);
					const rarity = /artifact|co vat|doc ban/i.test(label) ? "artifact"
						: /mythic|than thoai/i.test(label) ? "mythic"
									: /legendary|huyen thoai/i.test(label) ? "legendary"
										: /epic|anh hung|su thi/i.test(label) ? "epic"
									: /hiem|rare/i.test(label) ? "rare"
										: /thong thuong|common|vat pham thuong/i.test(label) ? "common" : "unknown";
					let entry = "";
					let depth = 0;
					for (const character of field[2]) {
						if (character === "(") depth++;
						if (character === ")") depth = Math.max(0, depth - 1);
						if ((character === "," || character === ";") && depth === 0) {
							extractEntry(entry, creature, rarity);
							entry = "";
						} else entry += character;
					}
					extractEntry(entry, creature, rarity);
				}
			});
		});
		creatures.forEach(creature => {
			String(creature.details || "").split(/\r?\n/).forEach(line => {
				const harvest = line.match(/^\s*[*-]\s*\*\*Thu hoạch nhân đạo\s*:\*\*\s*(.+)$/i);
				if (!harvest) return;
				const value = harvest[1].trim().replace(/[.;]+$/, "").trim();
				const detail = value.match(/^(.+?)\s*\(([^()]*)\)$/);
				if (detail) addItem(detail[1], creature, "unknown", "", `Thu hoạch nhân đạo: ${detail[2]}`);
				else extractEntry(value, creature, "unknown");
			});
		});
		creatures.forEach(creature => {
			const condensedGas = String(creature.details || "").match(/\(\s*(Thể khí cô đọng)\s*\)/i);
			if (condensedGas) addItem(condensedGas[1], creature, "unknown", "", "Dạng tồn tại được ghi nhận trong hồ sơ sinh vật.");
		});
			const silentAshDetails = {
				name: "Màng Vảy Tinh Tụ RTC (Silent Ash Membrane)",
				ancientName: "Membrana Cineris Silentis",
				type: "Vật liệu Y học Dưỡng thai / Cốt lõi Dược liệu Sạch (Medical Bio-Material)",
				rarity: "epic",
				dropChance: "5% săn bắt cưỡng chế · 100% thu hoạch nhân đạo",
				description: "Một mảng màng mỏng lấp lánh như bụi sao hoặc tro tàn dạ quang, mềm mại như lụa. Trong bóng tối, màng tự phát ánh huỳnh quang lam nhạt và tỏa hương rêu đá cùng hơi sương ngầm.",
				obtain: {
					quest: "Nhiệm vụ Công Hội Rank D–E: “Thu hoạch tinh túy Thánh Địa”, “Cung ứng dược liệu cho Mái Vòm Sinh Thái”.",
					crafting: "Không thể chế tạo nhân tạo; cấu trúc liên kết RNA và vitamin tự nhiên chỉ hình thành qua bộ lọc sinh học của Dạ Linh.",
					location: "Hang thạch anh ngầm bỏ hoang; Thánh Địa Tĩnh Lượng (Silent Bio-Haven).",
					conditions: "Săn bắt cưỡng chế: tỷ lệ 5%, màng có thể vỡ và giảm 80% dược tính do nhiễm tử khí. Thu hoạch nhân đạo: tỷ lệ 100% khi Dạ Linh tự rụng màng hằng tuần trong môi trường an toàn."
				},
				usableLevel: "Không yêu cầu cấp độ; được mô tả là an toàn cho mọi sinh linh và thai nhi.",
				classes: "Tất cả lớp nhân vật khi dùng làm thuốc/vật liệu; Y sĩ Mái Vòm; Thầy thuốc Khu Tự Vệ.",
				stats: [
					["Tấn công vật lý", "0"], ["Sát thương phép thuật", "0"],
					["Phòng thủ / Giáp", "+10 Phòng thủ Tinh thần (kháng huyễn hoặc)"],
					["Kháng phép", "+15% Kháng Ma lực tiêu cực (Mental Poison Resistance)"],
					["Độ bền / Độ chịu lực", "50 / 50 (kết cấu như màng lụa tinh thể mỏng)"],
					["Cộng chỉ số cốt lõi", "+0 STR · +0 AGI · +5 INT · +10 VIT"],
					["Cộng sinh tồn", "+200 HP tối đa · +500 MP tối đa"],
					["Tốc độ", "+0% tốc độ đánh · +2% tốc độ hồi phục thể lực"],
					["Chí mạng", "+0% tỷ lệ bạo kích · +0% sát thương bạo kích"],
					["Chính xác & Né tránh", "+5% khả năng nhận biết nguy hiểm vi mô"],
					["Thuộc tính đòn đánh", "none-data"],
					["Thuộc tính phòng ngự", "Làm dịu 30% sát thương từ kỹ năng hệ Bóng Tối hoặc Oán Thù."]
				],
				effects: [
					"[Làm Dịu Ma Năng]: Hấp thụ và trung hòa bức xạ ma lực tiêu cực xung quanh; được mô tả là làm biến mất cơn nghén ma năng.",
					"[Siêu Tích Tụ Vitamin]: Cung cấp vitamin A, D, E, B12 tự nhiên; hỗ trợ hồi phục mô và tăng lượng bạch cầu bẩm sinh.",
					"[Chiết Xuất Canh Huyết Khang] — Kích hoạt: nghiền một màng vảy và nấu cùng Nấm Mộc Tinh. Cooldown: none-data. Mô tả nguồn: thuốc bổ hỗ trợ ổn định liên kết gen XY cho phôi thai nam và ngăn nguy cơ biến tính do ma năng.",
					"[Cộng Hưởng Dương Quang] — Nội tại ẩn, kích hoạt trong năng lượng dương nguyên thủy từ Lửa Xanh RTC của sinh vật 001; hồ sơ mô tả khả năng tăng tốc hồi phục miễn dịch ở trẻ sơ sinh nam."
				],
				upgrade: "Không thể cường hóa vật lý; không có ô khảm ngọc. Khi hòa tan vào hệ thống lọc nước Mái Vòm Sinh Thái, tiến hóa thành “Kết Tinh Tĩnh Lượng Đại Địa”, tạo màng kháng độc bảo vệ trẻ nhỏ.",
				commerce: "Trọng lượng: 0.01 kg · Giá mua: 1.200 Vàng · Giá bán: 800 Vàng · Khóa khi nhận nhiệm vụ; giao dịch tự do nếu thu hoạch nhân đạo tại Thánh Địa.",
				lore: "Lớp màng sinh học kết tinh từ phần nhân tính và lòng thiện lương cuối cùng của những linh hồn không mang oán hận. Món quà y học âm thầm che chở và nuôi dưỡng tương lai nhân loại."
			};
			const names = new Map();
			return [...found.values()].map(item => {
				const enriched = item.rawName === "Vảy Tro Dinh Dưỡng RTC" &&
					item.sources.some(source => source.id === "creature-004")
					? silentAshDetails
					: null;
				const baseName = stylizedItemName(item.rawName, creaturesById.get(item.sources[0]?.id) || { name: "" });
				const occurrence = (names.get(baseName) || 0) + 1;
				names.set(baseName, occurrence);
				return completeItemProfile({
					...item,
					...enriched,
					name: enriched?.name || (occurrence > 1 ? `${baseName} ${["II", "III", "IV", "V"][occurrence - 2] || occurrence}` : baseName)
				});
			});
	}

	function itemLinks(value) {
		const escaped = escapeHtml(value);
		if (!itemLinkPattern) return escaped;
		return escaped.replace(itemLinkPattern, match => {
			const item = itemsByEscapedName.get(match.toLocaleLowerCase("vi"));
			return `<a class="item-reference" href="#${item.id}" title="Xem vật phẩm ${escapeHtml(item.name)}">${escapeHtml(item.name)}</a>`;
		});
	}

	function containsTerm(text, term) {
		return new RegExp(`(?:^|[^a-z0-9])${term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}(?:$|[^a-z0-9])`).test(text);
	}

	function mentionedElements(text) {
		const normalized = normalizeText(text);
		return elements.filter(item => item.aliases.some(alias => containsTerm(normalized, alias))).map(item => item.id);
	}

	function parseAffinities(creature) {
		const details = String(creature.details || "");
		const section = details.match(/####\s*IV\.\s*BẢNG KHÁNG VÀ ĐIỂM YẾU([\s\S]*?)(?=####\s*V\.|$)/i)?.[1] || "";
		const affinities = {};
		section.split(/\r?\n/).forEach(line => {
			line.split("|").forEach(fragment => {
				const separator = fragment.lastIndexOf(":");
				if (separator < 0) return;
				const label = fragment.slice(0, separator);
				if (!/🔥|💧|🌿|⚡|🌪|❄|☀|🔮|🧪|Hệ\s/i.test(label)) return;
				const match = fragment.slice(separator + 1).match(/(-?\d+(?:[.,]\d+)?)\s*%/);
				if (!match) return;
				const percent = Number(match[1].replace(",", "."));
				mentionedElements(label).forEach(id => { affinities[id] = percent; });
			});
		});
		return affinities;
	}

	function renderElementalAffinities(creature) {
		const affinities = parseAffinities(creature);
		return `<div class="element-affinity-list">${elements.map(item => {
			const value = affinities[item.id];
			const displayValue = value === undefined ? unknownProfileValue : `${value}%`;
			return `<div class="element-affinity-row"><strong>${escapeHtml(item.formLabel)}</strong><span>${displayValue === unknownProfileValue ? `<span class="none-data-box">${unknownProfileValue}</span>` : escapeHtml(displayValue)}</span></div>`;
		}).join("")}</div>`;
	}

	function extractFieldValue(markdown, label) {
		const escapedLabel = label.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
		const match = String(markdown || "").match(new RegExp(`\\*\\*\\s*${escapedLabel}\\s*:\\*\\*\\s*([^\\r\\n]+)`, "i"));
		return match?.[1]?.replace(/\*+/g, "").trim() || unknownProfileValue;
	}

	function renderCrowdControlAndWeaknesses(section) {
		const controlEffects = [
			{ label: "Choáng (Stun)", aliases: ["choang", "stun"] },
			{ label: "Đóng băng (Freeze)", aliases: ["dong bang", "freeze"] },
			{ label: "Hóa đá (Petrify)", aliases: ["hoa da", "petrify"] },
			{ label: "Câm lặng (Silence)", aliases: ["cam lang", "silence"] },
			{ label: "Thao túng tâm trí (Charm/Fear/Mind Control)", aliases: ["thao tung", "charm", "fear", "mind control"] }
		];
		const controlRows = controlEffects.map(effect => {
			const line = String(section || "").split(/\r?\n|\|/).find(candidate => {
				const normalized = normalizeText(candidate);
				return effect.aliases.some(alias => containsTerm(normalized, alias));
			});
			let value = unknownProfileValue;
			if (line && /mi[eễ]n nhi[eễ]m/i.test(normalizeText(line))) value = line.slice(line.lastIndexOf(":") + 1).replace(/\*+/g, "").trim();
			else if (line && /c[oó] th[eể] b[iị]/i.test(normalizeText(line))) value = line.slice(line.lastIndexOf(":") + 1).replace(/\*+/g, "").trim();
			return { label: effect.label, value };
		});
		const weaknessRows = [
			{ label: "Điểm yếu vật lý", value: extractFieldValue(section, "Điểm yếu vật lý") },
			{ label: "Điểm yếu tâm lý/Khác", value: extractFieldValue(section, "Điểm yếu tâm lý/Khác") }
		];
		const renderRows = rows => `<div class="pi-data-list">${rows.map(row => `<div class="field-row"><div class="field-label">${escapeHtml(row.label)}</div><div class="field-value">${normalizeText(row.value) === unknownProfileValue ? `<span class="none-data-box">${unknownProfileValue}</span>` : escapeHtml(row.value)}</div></div>`).join("")}</div>`;
		return `<h3>2. Kháng Hiệu ứng Khống chế (Crowd Control Immunity)</h3>${renderRows(controlRows)}<h3>3. Điểm yếu chí mạng (Fatal Weakness/Achilles' Heel)</h3>${renderRows(weaknessRows)}`;
	}

	function removeElementalAffinityLines(markdown) {
		return String(markdown || "").split(/\r?\n/).map(line => {
			if (/Kháng Nguyên tố/i.test(line)) return "";
			const remaining = line.split("|").filter(fragment => {
				const separator = fragment.lastIndexOf(":");
				return separator < 0 || !/-?\d+(?:[.,]\d+)?\s*%/.test(fragment.slice(separator + 1)) || !mentionedElements(fragment.slice(0, separator)).length;
			});
			return remaining.join(" | ");
		}).filter(line => line.trim()).join("\n");
	}

	function renderEmptyDatasheet(creature) {
		const sections = emptyProfileSections.map(section => {
			const renderFieldRows = fields => fields.map(field => {
				const value = field === "Tên loài/Sinh vật (Name)" ? creature.name : unknownProfileValue;
				return `<div class="field-row"><div class="field-label">${escapeHtml(field)}</div><div class="field-value">${value === unknownProfileValue ? `<span class="none-data-box">${unknownProfileValue}</span>` : escapeHtml(value)}</div></div>`;
			}).join("");
			if (section.roman === "IV") {
				return `<section class="section" id="profile-IV"><h2>IV. ${escapeHtml(section.title)}</h2><h3>1. Kháng Nguyên tố (Elemental Affinity)</h3>${renderElementalAffinities(creature)}<h3>2. Kháng Hiệu ứng Khống chế (Crowd Control Immunity)</h3><div class="pi-data-list">${renderFieldRows(section.fields.slice(0, 5))}</div><h3>3. Điểm yếu chí mạng (Fatal Weakness/Achilles' Heel)</h3><div class="pi-data-list">${renderFieldRows(section.fields.slice(5))}</div></section>`;
			}
			return `<section class="section" id="profile-${section.roman}"><h2>${section.roman}. ${escapeHtml(section.title)}</h2><div class="pi-data-list">${renderFieldRows(section.fields)}</div></section>`;
		}).join("");
		const toc = profileSections.map(section => `<li><a href="#profile-${section.roman}">${section.roman}. ${escapeHtml(section.title)}</a></li>`).join("");
		const quickReference = `<section class="section quick-reference" id="profile-quick-reference"><h2>BẢNG TỔNG HỢP NHANH</h2><div class="table-scroll"><table class="record-table"><thead><tr><th>Thuộc tính chính</th><th>Giá trị</th><th>Điểm mạnh lớn nhất</th><th>Điểm yếu chí mạng</th><th>Vị trí xuất hiện</th></tr></thead><tbody><tr><td>HP (Sinh lực / Máu) / MP (Ma lực / Năng lượng)</td><td>${escapeHtml(unknownProfileValue)}</td><td>${escapeHtml(unknownProfileValue)}</td><td>${escapeHtml(unknownProfileValue)}</td><td>${escapeHtml(unknownProfileValue)}</td></tr></tbody></table></div></section>`;
		element("viewRoot").innerHTML = `<article class="wiki" id="${escapeHtml(creature.id)}"><h1 class="title">${escapeHtml(creature.name)}</h1><div class="byline">${escapeHtml(creature.category)} · Hồ sơ #${creature.number}</div><div class="lead"><nav class="toc"><div class="tocTitle">Mục lục</div><ol>${toc}<li><a href="#profile-quick-reference">Bảng tổng hợp nhanh</a></li></ol></nav><div><p class="summary">${escapeHtml(creature.summary)}</p>${renderElementLinks(creature)}</div></div>${sections}${quickReference}<footer class="footer">Nguồn dữ liệu: data.txt · Mã hồ sơ: ${escapeHtml(creature.id)}</footer></article>`;
	}

	function renderMissingProfileFields(section, markdown) {
		const schema = emptyProfileSections.find(item => item.roman === section.roman);
		if (!schema || section.roman === "IV") return "";
		const source = normalizeText(markdown);
		const missing = schema.fields.filter(field => {
			const normalizedField = normalizeText(field);
			const prefix = normalizedField.split(/\s*\(|:|,/)[0].trim();
			const aliases = {
				"sp/stamina": ["sp", "stamina"],
				"giap vat ly va ty le sat thuong vat ly duoc giam": ["giap vat ly"],
				"giap phep thuat": ["giap phep", "magic barrier", "magic shield"],
				"ky nang chu dong thu nhat": ["ky nang chu dong", "active skill"],
				"ky nang chu dong thu hai": ["ky nang chu dong", "active skill"],
				"tuyet chieu / ky nang toi thuong": ["tuyet chieu", "ultimate"],
				"tuyet chieu": ["tuyet chieu", "ultimate"]
			}[prefix] || [prefix];
			return !aliases.some(alias => {
				const normalizedAlias = normalizeText(alias);
				return /^[a-z0-9]+$/.test(normalizedAlias)
					? containsTerm(source, normalizedAlias)
					: source.includes(normalizedAlias);
			});
		});
		if (!missing.length) return "";
		return `<div class="profile-missing-fields" aria-label="Các trường còn thiếu">${missing.map(field => `<div class="none-data-box"><strong>${escapeHtml(field)}:</strong> ${unknownProfileValue}</div>`).join("")}</div>`;
	}

	function simulationCreature() {
		const selected = creaturesById.get(state.simulationCreatureId);
		if (selected && (selected.categoryId !== "group-02" || selected.details)) return selected;
		const current = creaturesById.get(state.selectedId);
		return current && (current.categoryId !== "group-02" || current.details) ? current : datasheetCreatures()[0] || null;
	}

	function resistanceEffect(value) {
		if (value >= 100) return "Miễn nhiễm";
		if (value > 0) return `Giảm ${value}% sát thương nhận vào`;
		if (value < 0) return `Nhận thêm ${Math.abs(value)}% sát thương`;
		return "Không đổi";
	}

	function initializeSimulationValue(elementId, creature = simulationCreature()) {
		if (Object.hasOwn(state.simulationValues, elementId)) return;
		const sourceValue = creature ? parseAffinities(creature)[elementId] : undefined;
		state.simulationValues[elementId] = sourceValue ?? 0;
	}

	function renderSimulationOutput() {
		const output = element("simulationOutput");
		if (!output) return;
		const creature = simulationCreature();
		if (!state.simulationApplied || !creature || !state.simulationElementIds.length) {
			output.innerHTML = `<p class="simulation-empty">${state.simulationApplied ? "Chọn ít nhất một nguyên tố để chạy mô phỏng." : "Các chỉnh sửa đang là bản nháp; chọn loài và bấm Áp dụng để xem so sánh."}</p>`;
			return;
		}
		const baseValues = parseAffinities(creature);
		output.innerHTML = `<div class="simulation-summary">Mô phỏng cho <strong>${escapeHtml(creature.name)}</strong> · dữ liệu gốc không bị thay đổi.</div><div class="table-scroll element-table-scroll"><table class="record-table"><thead><tr><th>Nguyên tố</th><th>Kháng gốc</th><th>Kháng mô phỏng</th><th>Hiệu ứng ước tính</th></tr></thead><tbody>${state.simulationElementIds.map(id => {
			const elemental = elements.find(item => item.id === id);
			const base = baseValues[id];
			const simulated = state.simulationValues[id] ?? 0;
			return `<tr><td data-label="Nguyên tố">${escapeHtml(elemental.label)}</td><td data-label="Kháng gốc">${base === undefined ? '<span class="unknown-value">Không rõ</span>' : `${base}%`}</td><td data-label="Kháng mô phỏng">${simulated}%</td><td data-label="Hiệu ứng ước tính">${escapeHtml(resistanceEffect(simulated))}</td></tr>`;
		}).join("")}</tbody></table></div>`;
	}

	function renderSimulationControls() {
		const selectedCreature = simulationCreature();
		const selectedTags = state.simulationElementIds.map(id => {
			const elemental = elements.find(item => item.id === id);
			initializeSimulationValue(id, selectedCreature);
			const baseValue = selectedCreature ? parseAffinities(selectedCreature)[id] : undefined;
			return `<div class="simulation-chip"><div class="simulation-chip-label"><strong>${escapeHtml(elemental.label)}</strong><span>Gốc: ${baseValue === undefined ? "Không rõ" : `${baseValue}%`}</span></div><div class="simulation-stepper"><button type="button" data-sim-step="${id}" data-step="-10" aria-label="Giảm 10 phần trăm cho ${escapeHtml(elemental.label)}">−</button><input type="number" min="-500" max="100" step="10" value="${state.simulationValues[id]}" data-sim-value="${id}" aria-label="Phần trăm ${escapeHtml(elemental.label)}"><button type="button" data-sim-step="${id}" data-step="10" aria-label="Tăng 10 phần trăm cho ${escapeHtml(elemental.label)}">+</button></div><button class="simulation-remove" type="button" data-sim-remove="${id}" aria-label="Bỏ ${escapeHtml(elemental.label)}">×</button></div>`;
		}).join("");
		const available = elements.filter(item => !state.simulationElementIds.includes(item.id));
		return `<section class="simulation-box"><div class="simulation-heading"><div><h2>Mô phỏng kháng nguyên tố</h2><p>Chọn loài, thêm các nguyên tố rồi chỉnh % để so sánh kịch bản.</p></div><label class="view-control simulation-creature">Loài<select id="simulationCreature">${datasheetCreatures().map(creature => `<option value="${creature.id}"${selectedCreature?.id === creature.id ? " selected" : ""}>${escapeHtml(creature.name)}</option>`).join("")}</select></label></div><div class="simulation-tags" aria-label="Chọn nhiều nguyên tố">${elements.map(item => `<button type="button" class="simulation-tag${state.simulationElementIds.includes(item.id) ? " selected" : ""}" data-sim-toggle="${item.id}" aria-pressed="${state.simulationElementIds.includes(item.id)}">${escapeHtml(item.label)}</button>`).join("")}</div><div class="simulation-selected">${selectedTags || '<span class="tag-empty">Chưa thêm nguyên tố vào mô phỏng</span>'}</div><div class="simulation-actions"><label class="view-control simulation-add">Thêm nguyên tố<select id="simulationAddElement"><option value="">Chọn nguyên tố...</option>${available.map(item => `<option value="${item.id}">${escapeHtml(item.label)}</option>`).join("")}</select></label><div class="simulation-buttons"><button class="simulation-apply" type="button" id="applySimulation"${state.simulationElementIds.length && !state.simulationApplied ? "" : " disabled"}>Áp dụng</button><button class="simulation-reset" type="button" id="resetSimulation"${state.simulationApplied ? "" : " disabled"}>Bỏ áp dụng</button></div></div><div id="simulationOutput"></div></section>`;
	}

	function creatureSpecies(creature) {
		const details = String(creature.details || "");
		const match = details.match(/\*\s*\*\*(?:Phân hệ\/Chủng tộc đại cương|Phân hệ):\*\*\s*(.+)/i);
		return match ? match[1].replace(/\*+/g, "").trim() : "Chưa phân loại";
	}

	function creatureTags(creature) {
		const tags = new Set([creature.category.replace(/^[IVX]+\.\s*/, ""), creatureSpecies(creature)]);
		mentionedElements(`${creature.name} ${creature.summary} ${creature.details || ""}`).forEach(id => {
			tags.add(elements.find(item => item.id === id).label);
		});
		return [...tags].filter(tag => tag && tag !== "Chưa phân loại");
	}

	function dangerInfo(creature) {
		const text = String(creature.details || "");
		if (/cấp tối cao|highest level/i.test(text)) return { label: "Cấp Tối Cao", className: "danger-error", order: 11 };
		const rank = text.match(/\b(?:rank|hạng)\s*(EX|SSS\+?|SS\+?|S\+?|A\+?|B|C|D|E|ERROR)(?!\s*(?:đến|to|[-–—])\s*(?:rank\s*)?(?:EX|SSS\+?|SS\+?|S\+?|A\+?|B|C|D|E))(?=\s*(?:\([^)]*\)|\/\s*Phase\s*\d+)?(?:\s|$))/i)?.[1]?.toUpperCase();
		if (!rank) return null;
		if (rank === "ERROR") return null;
		if (rank === "EX") return { label: "Rank EX", className: "danger-error", order: 10 };
		if (rank === "SSS+") return { label: `Rank ${rank}`, className: "danger-error", order: 9 };
		if (rank === "SS+" || rank === "SSS" || rank === "SS") return { label: `Rank ${rank}`, className: "danger-violet", order: 8 };
		if (rank === "S+") return { label: `Rank ${rank}`, className: "danger-indigo", order: 7 };
		if (rank === "S") return { label: `Rank ${rank}`, className: "danger-indigo", order: 6 };
		if (rank.startsWith("A")) return { label: `Rank ${rank}`, className: "danger-blue", order: 5 };
		if (rank === "B") return { label: `Rank ${rank}`, className: "danger-green", order: 4 };
		if (rank === "C") return { label: `Rank ${rank}`, className: "danger-yellow", order: 3 };
		if (rank === "D") return { label: `Rank ${rank}`, className: "danger-orange", order: 2 };
		return { label: `Rank ${rank}`, className: "danger-red", order: 1 };
	}

	function glossaryDefinition(term, value) {
		const key = normalizeText(term);
		const definitions = [
			[/^hp\b/, "Sinh lực hoặc máu của sinh vật."],
			[/^mp\b/, "Ma lực hoặc năng lượng dùng cho kỹ năng."],
			[/^sp\b|stamina/, "Thể lực dùng cho vận động và kỹ năng thể chất."],
			[/^str\b/, "Sức mạnh cơ bắp, lực đánh và khả năng nâng vác."],
			[/^vit\b|^con\b/, "Sức bền và khả năng chống chịu."],
			[/^agi\b/, "Nhanh nhẹn, tốc độ di chuyển và phản xạ."],
			[/^dex\b/, "Khéo léo, chính xác và khả năng điều khiển vận động."],
			[/^int\b/, "Trí tuệ và khả năng học hỏi hoặc sử dụng phép thuật."],
			[/^wis\b/, "Khôn ngoan, nhận thức và trực giác."],
			[/^mnd\b|^men\b/, "Ý chí và sức chống chịu ảnh hưởng tinh thần."],
			[/^cha\b/, "Thần thái, sức ảnh hưởng hoặc uy nghiêm."],
			[/^luk\b/, "May mắn và khả năng xảy ra tình huống thuận lợi."],
			[/kháng/, "Tỷ lệ kháng nguyên tố hoặc hiệu ứng được ghi trong hồ sơ."],
			[/điểm yếu/, "Yếu tố có thể làm giảm khả năng chiến đấu hoặc gây thêm sát thương."],
			[/cooldown|thời gian hồi/, "Khoảng thời gian phải chờ trước khi dùng lại kỹ năng."],
			[/tiêu hao/, "Lượng tài nguyên cần dùng để kích hoạt kỹ năng."]
		];
		const known = definitions.find(([pattern]) => pattern.test(key));
		if (known) return known[1];
		const parenthetical = term.match(/\(([^)]+)\)/);
		if (parenthetical) return parenthetical[1].replace(/\s*[-/]\s*/g, ", ");
		return String(value || "Không có thông tin").replace(/\*+/g, "").trim();
	}

	function glossaryEntries() {
		const entries = [];
		creatures.forEach(creature => {
			const details = String(creature.details || "");
			if (!details) {
				entries.push({ id: creature.id, creatureId: creature.id, type: "creature", name: creature.name, category: creature.category, term: "Mô tả tóm tắt", definition: creature.summary || "Không có thông tin", value: creature.summary || "Không có thông tin" });
				return;
			}
			details.split(/\r?\n/).forEach(line => {
				const pattern = /\*\*([^*]+?):\*\*\s*([\s\S]*?)(?=\s*\|\s*\*\*[^*]+?:\*\*|$)/g;
				let match;
				while ((match = pattern.exec(line))) {
					const term = match[1].trim();
					const value = match[2].replace(/\*+/g, "").trim() || "Không có thông tin";
					entries.push({ id: creature.id, creatureId: creature.id, type: "creature", name: creature.name, category: creature.category, term, definition: glossaryDefinition(term, value), value });
				}
			});
		});
		const inlineSystemTerms = (pageLanguage === "en" ? [
			["HP (Health Points)", "Health or life force. Maximum HP and regeneration rate are recorded separately when available."],
			["MP (Mana Points)", "Mana or energy available for skills. A profile may record its maximum and regeneration rate."],
			["SP / Stamina", "Physical stamina used for movement or physical skills; it may be finite or unlimited as stated in the profile."],
			["EXP / XP", "Experience points awarded for defeating a creature, when recorded."],
			["Coins / Gold", "Currency or monetary reward recorded for defeating a creature."],
			["STR (Strength)", "Physical strength, striking force, and lifting ability."],
			["VIT / CON (Vitality / Constitution)", "Endurance and physical resilience, including resistance to illness or toxins when specified."],
			["AGI (Agility)", "Agility, movement speed, and reflexes."],
			["DEX (Dexterity)", "Coordination, precision, and fine motor control."],
			["INT (Intelligence)", "Reasoning, learning, and the ability to use or shape magic."],
			["WIS (Wisdom)", "Awareness, judgment, and intuition."],
			["MND / MEN (Mind / Mentality)", "Willpower and resistance to mental influence."],
			["CHA (Charisma)", "Presence, influence, or authority."],
			["LUK (Luck)", "A luck attribute; its exact effects depend on the source system."],
			["Physical armor", "A defensive value against physical damage. Any reduction or immunity should follow the individual profile."],
			["Magical armor / barrier", "A defensive value or barrier against magical damage; absorption limits may be listed separately."],
			["Resistance", "A percentage describing resistance to an element or effect. Interpret the value using the profile's own notes."],
			["Weakness", "An element, body part, or condition that can impair the creature or increase damage against it."],
			["Element / affinity", "An elemental association used to describe attacks, defenses, or magical effects."],
			["Rank", "A classification whose meaning depends on context: hunter guild rank and creature danger rank are separate systems."],
			["Hunter rank", "A guild or operational grade for a hunter. It does not directly state a creature's danger rank."],
			["Creature danger rank", "A danger classification for a creature, based on the source record; it is not automatically equivalent to combat strength."],
			["Creature level", "A level assigned to an individual creature in its status record. It is distinct from a hunter's recommended level."],
			["Recommended hunter level", "A suggested hunter level for an encounter, not the creature's own level."],
			["Cooldown", "The waiting time before a skill can be used again."],
			["Skill cost", "The amount of mana, stamina, or another resource required to use a skill."],
			["Range", "The recorded effective distance or area of a skill."],
			["m/s (meters per second)", "A unit of speed. It describes distance traveled per second."],
			["Mach", "The ratio of an object's speed to the local speed of sound; the exact speed varies by medium and conditions."],
			["Mach 1+", "A speed at or above the local speed of sound."],
			["Phase", "A named stage or form in a source record. It is not automatically interchangeable with a rank."],
			["Rank SS+", "A high creature danger rank used for certain individuals; it is not a minimum rank for every Titan."],
			["Rank EX / Phase 5", "The Termination-class designation recorded for the King of Abyssal Curses in Phase 5; distinct from Rank ERROR."],
			["Supreme-class", "A distinct title used for 001, described as humanity's protector; it is not Rank ERROR or an ordinary danger threshold."]
		] : [
			["HP (Sinh lực / Máu)", "Sinh lực của cá thể. Hồ sơ có thể ghi riêng HP tối đa và tốc độ hồi phục."],
			["MP (Ma lực)", "Ma lực hoặc năng lượng dùng cho kỹ năng; hồ sơ có thể ghi giới hạn tối đa và tốc độ hồi phục."],
			["SP / Stamina (Thể lực)", "Thể lực dùng cho vận động hoặc kỹ năng thể chất; giá trị hữu hạn hay vô hạn tùy hồ sơ."],
			["EXP / XP (Điểm kinh nghiệm)", "Điểm kinh nghiệm nhận được khi tiêu diệt sinh vật, nếu được ghi nhận."],
			["Coins / Gold (Tiền / Vàng)", "Đơn vị tiền tệ hoặc phần thưởng tài chính ghi trong hồ sơ."],
			["STR (Strength - Sức mạnh)", "Sức mạnh cơ bắp, lực đánh và khả năng nâng vác."],
			["VIT / CON (Vitality / Constitution - Sức bền)", "Sức bền và khả năng chống chịu thể chất; có thể bao gồm kháng bệnh hoặc độc tố nếu hồ sơ nêu rõ."],
			["AGI (Agility - Nhanh nhẹn)", "Độ nhanh nhẹn, tốc độ di chuyển và phản xạ."],
			["DEX (Dexterity - Khéo léo)", "Sự phối hợp vận động, độ chính xác và khả năng điều khiển cử động nhỏ."],
			["INT (Intelligence - Trí tuệ)", "Khả năng suy luận, học hỏi và sử dụng hoặc điều khiển phép thuật."],
			["WIS (Wisdom - Khôn ngoan)", "Khả năng nhận thức, phán đoán và trực giác."],
			["MND / MEN (Mind / Mentality - Tinh thần)", "Ý chí và khả năng chống lại ảnh hưởng tinh thần."],
			["CHA (Charisma - Thần thái)", "Sức ảnh hưởng, uy nghiêm hoặc khả năng tạo thiện cảm."],
			["LUK (Luck - May mắn)", "Thuộc tính may mắn; tác dụng cụ thể phụ thuộc hệ thống được ghi trong truyện."],
			["Giáp vật lý", "Giá trị phòng thủ trước sát thương vật lý. Mức giảm sát thương hay miễn nhiễm cần theo ghi chú của từng hồ sơ."],
			["Giáp phép / Khiên phép", "Giá trị phòng thủ hoặc lớp khiên trước sát thương phép; giới hạn hấp thụ có thể được ghi riêng."],
			["Kháng", "Tỷ lệ kháng một nguyên tố hoặc hiệu ứng. Cần diễn giải theo ghi chú riêng của hồ sơ."],
			["Điểm yếu", "Nguyên tố, bộ phận hoặc điều kiện có thể làm suy yếu sinh vật hay khiến nó chịu thêm sát thương."],
			["Nguyên tố / Thuộc tính hệ", "Mối liên hệ nguyên tố dùng để mô tả đòn đánh, phòng thủ hoặc hiệu ứng ma thuật."],
			["Rank (Hạng)", "Tên gọi có ý nghĩa tùy ngữ cảnh; hạng thợ săn và hạng nguy hiểm sinh vật là hai hệ riêng."],
			["Rank thợ săn", "Hạng hội viên hoặc nghiệp vụ của thợ săn; không trực tiếp cho biết hạng nguy hiểm của sinh vật."],
			["Hạng nguy hiểm sinh vật", "Phân loại mức nguy hiểm dựa trên tư liệu nguồn; không mặc nhiên đồng nghĩa với sức mạnh chiến đấu."],
			["Level cá thể", "Cấp độ của sinh vật trong bảng trạng thái; khác với cấp độ khuyến nghị cho thợ săn."],
			["Cấp độ khuyến nghị", "Mốc cấp độ gợi ý cho thợ săn khi đối đầu; không phải cấp độ của chính sinh vật."],
			["Cooldown (Hồi chiêu)", "Khoảng thời gian cần chờ trước khi có thể dùng lại kỹ năng."],
			["Tiêu hao kỹ năng", "Lượng ma lực, thể lực hoặc tài nguyên khác cần dùng để kích hoạt kỹ năng."],
			["Tầm / Phạm vi", "Khoảng cách hiệu quả hoặc vùng ảnh hưởng được ghi cho kỹ năng."],
			["m/s (mét mỗi giây)", "Đơn vị đo tốc độ, biểu thị quãng đường di chuyển trong một giây."],
			["Mach", "Tỷ số giữa tốc độ vật thể và tốc độ âm thanh tại môi trường đang xét; tốc độ cụ thể thay đổi theo môi trường và điều kiện."],
			["Mach 1+", "Tốc độ bằng hoặc vượt tốc độ âm thanh tại môi trường đang xét."],
			["Phase (Giai đoạn)", "Tên một giai đoạn hoặc dạng biến đổi trong tư liệu; không mặc nhiên đồng nhất với Rank."],
			["Rank SS+", "Hạng nguy hiểm cao được dùng cho một số cá thể; không phải ngưỡng bắt buộc cho mọi Titan."],
			["Rank EX / Phase 5", "Cấp Tận Diệt được ghi cho Vua Lời Nguyền Biển Sâu ở Phase 5; không đồng nhất với Rank ERROR."],
			["Cấp Tối Cao", "Danh hiệu riêng cho 001, được mô tả là kẻ bảo vệ nhân loại; không phải Rank ERROR hay mốc nguy hiểm thông thường."]
		]).map(([term, definition], index) => ({ id: `system-term-${String(index + 1).padStart(2, "0")}`, type: "system", name: pageLanguage === "en" ? "System" : "Hệ thống", category: pageLanguage === "en" ? "System" : "Hệ thống", term, definition, value: definition }));
		const systemTerms = systemTermOverrides.length ? systemTermOverrides : inlineSystemTerms;
		const creatureTerms = [
			["Sinh vật Titan", "Phân loại chủng loài, không tự quyết định hạng nguy hiểm; ví dụ trong truyện có KAJU Warden hạng SS và BloodShinGodzilla hạng SSS+."],
			["Sinh vật phi vật lý", "Thực thể không có cơ thể vật chất ổn định; có thể tồn tại dưới dạng năng lượng, trường lực hoặc khái niệm."],
			["Sinh vật siêu thanh", "Sinh vật có khả năng di chuyển đạt Mach 1 trở lên."],
			["Sinh vật khổng lồ", "Sinh vật có chiều cao hoặc chiều dài cơ thể từ 20 m trở lên."],
			["Thực thể cấp hành tinh", "Sinh vật hoặc thực thể có tầm ảnh hưởng đe dọa ở quy mô hành tinh."],
			["Sinh vật đại thảm họa", "Sinh vật có thể khởi phát hoặc duy trì một thảm họa trên diện rộng."],
			["Kích thước Titan", "Hồ sơ Titan ghi rõ kích thước; nhóm khổng lồ đạt tối thiểu 20 m."]
		].map(([term, definition], index) => ({ id: `creature-term-${String(index + 1).padStart(2, "0")}`, type: "creature", name: "Sinh vật", category: "Sinh vật", term, definition, value: definition }));
		return [...entries, ...systemTerms, ...creatureTerms];
	}

	function renderGlossaryResults() {
		const query = normalizeText(state.glossaryQuery.trim());
		const rows = glossaryEntries().filter(entry =>
			(!state.glossaryType || entry.type === state.glossaryType) &&
			(!state.glossaryCreatureId || entry.id === state.glossaryCreatureId) &&
			(!state.glossaryTerm || entry.term === state.glossaryTerm) &&
			(!query || normalizeText(`${entry.term} ${entry.definition} ${entry.value} ${entry.name} ${entry.id} ${entry.category}`).includes(query))
		);
		const shown = Math.min(pageLimit("glossary"), rows.length);
		element("glossaryCount").textContent = `${shown} / ${rows.length} thuật ngữ / dữ liệu`;
		element("glossaryResults").innerHTML = rows.length ? `<div class="table-scroll"><table class="record-table"><thead><tr><th>Loại</th><th>Thuật ngữ</th><th>Giải nghĩa</th><th>Thông tin trong hồ sơ</th><th>Thực thể liên quan</th></tr></thead><tbody>${rows.slice(0, shown).map(entry => `<tr><td>${entry.type === "system" ? "Hệ thống" : "Sinh vật"}</td><td class="glossary-term">${escapeHtml(entry.term)}</td><td class="glossary-definition">${escapeHtml(entry.definition)}</td><td>${escapeHtml(entry.value)}</td><td>${entry.creatureId ? `<a class="glossary-creature" href="#${entry.creatureId}">${escapeHtml(entry.name)}</a>` : escapeHtml(entry.name)}<div class="itemMeta">${escapeHtml(entry.id)} · ${escapeHtml(entry.category)}</div></td></tr>`).join("")}</tbody></table></div>${loadMoreButton("glossary", shown, rows.length)}` : '<div class="glossary-empty">Không tìm thấy thuật ngữ hoặc hồ sơ phù hợp.</div>';
	}

	function renderGlossary() {
		const entries = glossaryEntries();
		const terms = [...new Set(entries.map(entry => entry.term))].sort((a, b) => a.localeCompare(b, "vi"));
		element("viewRoot").innerHTML = `<section><h1 class="view-title">Thuật ngữ hồ sơ</h1><p class="view-lead">Tra cứu thuật ngữ, ý nghĩa và hồ sơ sinh vật liên quan.</p><div class="glossary-toolbar"><label class="view-control">Tìm thuật ngữ hoặc hồ sơ<input id="glossarySearch" type="search" value="${escapeHtml(state.glossaryQuery)}" placeholder="Ví dụ: STR, Rank EX, creature-001"></label><label class="view-control">Loại thuật ngữ<select id="glossaryType"><option value="">Tất cả loại</option><option value="system"${state.glossaryType === "system" ? " selected" : ""}>Hệ thống</option><option value="creature"${state.glossaryType === "creature" ? " selected" : ""}>Sinh vật</option></select></label><label class="view-control">Sinh vật<select id="glossaryCreature"><option value="">Tất cả sinh vật</option>${creatures.map(creature => `<option value="${creature.id}"${state.glossaryCreatureId === creature.id ? " selected" : ""}>${escapeHtml(creature.name)}</option>`).join("")}</select></label><label class="view-control">Thuật ngữ<select id="glossaryTerm"><option value="">Tất cả thuật ngữ</option>${terms.map(term => `<option value="${escapeHtml(term)}"${state.glossaryTerm === term ? " selected" : ""}>${escapeHtml(term)}</option>`).join("")}</select></label></div><div class="result-count" id="glossaryCount"></div><div id="glossaryResults"></div></section>`;
		renderGlossaryResults();
	}

	function itemField(label, value, isMarkup = false) {
		const display = value ? (isMarkup ? value : itemLinks(value)) : '<span class="none-data-box">none-data</span>';
		return `<div class="field-row"><div class="field-label">${escapeHtml(label)}</div><div class="field-value">${display}</div></div>`;
	}

	function renderItems() {
		const focusedId = ["itemIdSearch", "itemNameSearch"].includes(document.activeElement?.id)
			? document.activeElement.id
			: "";
		const selection = focusedId
			? { start: document.activeElement.selectionStart, end: document.activeElement.selectionEnd }
			: null;
		const idQuery = state.itemIdQuery.trim().replace(/^#/, "").toLocaleLowerCase("vi");
		const nameQuery = normalizeText(state.itemNameQuery.trim());
		const idSearch = Boolean(idQuery);
		const exactItem = idSearch ? itemsById.get(idQuery) : null;
		const filtered = idSearch
			? (exactItem ? [exactItem] : [])
			: items.filter(item =>
				(!nameQuery || normalizeText(`${item.name} ${item.ancientName || ""}`).includes(nameQuery)) &&
				(!state.itemRank || item.rarity === state.itemRank)
			);
		const shown = Math.min(pageLimit("items"), filtered.length);
		const cards = filtered.slice(0, shown).map(item =>
			`<a class="item-card" href="#${item.id}">${renderItemImage(item, "item-card-image")}<span class="item-card-info"><strong>${escapeHtml(item.name)}</strong><span>${escapeHtml(item.id)} · ${escapeHtml(item.rarity === "unknown" ? "Phẩm cấp chưa rõ" : item.rarity)}</span><span>${escapeHtml(item.sources[0]?.name || "Nguồn chưa rõ")}</span></span></a>`
		).join("");
		const emptyMessage = idSearch
			? "Không tìm thấy vật phẩm có ID này"
			: "Không tìm thấy vật phẩm phù hợp.";
		const rankOptions = [
			["common", "⚪ Thường (Common)"],
			["rare", "🟢 Hiếm (Rare)"],
			["epic", "🔵 Anh hùng (Epic)"],
			["legendary", "🟣 Huyền thoại (Legendary)"],
			["mythic", "🔴 Thần thoại (Mythic)"],
			["artifact", "🟡 Cổ vật / Độc bản (Artifact)"]
		];
		const idStatus = idSearch && !exactItem ? `<p class="item-search-error" role="status">${emptyMessage}</p>` : "";
		element("viewRoot").innerHTML = `<section><h1 class="view-title">Danh mục vật phẩm</h1><p class="view-lead">${items.length} vật phẩm được nhận diện từ thông tin rơi ra và thu hoạch trong hồ sơ sinh vật.</p><div class="item-search-controls"><label class="view-control">Tìm chính xác theo ID<input id="itemIdSearch" type="search" value="${escapeHtml(state.itemIdQuery)}" placeholder="Ví dụ: item-0001 hoặc #item-0001" autocomplete="off"></label><label class="view-control">Tìm theo tên vật phẩm / cổ ngữ<input id="itemNameSearch" type="search" value="${escapeHtml(state.itemNameQuery)}" placeholder="Nhập một phần tên vật phẩm hoặc cổ ngữ" autocomplete="off"></label><label class="view-control">Phẩm cấp / Rank<select id="itemRank"><option value="">Tất cả phẩm cấp</option>${rankOptions.map(([value, label]) => `<option value="${value}"${state.itemRank === value ? " selected" : ""}>${label}</option>`).join("")}</select></label></div>${idStatus}<div class="result-count" id="itemCount">${shown} / ${filtered.length} vật phẩm</div><div class="item-grid">${cards || `<div class="empty-results">${emptyMessage}</div>`}</div>${!idSearch ? loadMoreButton("items", shown, filtered.length) : ""}</section>`;
		setupImageLoading();
		if (focusedId) {
			const input = element(focusedId);
			input.focus();
			if (selection && Number.isInteger(selection.start) && Number.isInteger(selection.end)) input.setSelectionRange(selection.start, selection.end);
		}
	}

	function renderItemImage(item, className) {
		const imagePath = window.ITEM_IMAGE_BY_ID && window.ITEM_IMAGE_BY_ID[item.id];
		const label = imagePath ? `Ảnh của ${item.name}` : "Chưa có hình ảnh vật phẩm";
		const image = imagePath
			? `<img src="${escapeHtml(`${wikiBasePath}${imagePath}`)}" alt="${escapeHtml(label)}" loading="lazy"><span class="item-image-placeholder" aria-hidden="true">X</span>`
			: '<span class="item-image-placeholder">X</span>';
		return `<span class="${className}${imagePath ? " image-loading" : ""}"${imagePath ? " data-image-loader" : ""} role="img" aria-label="${escapeHtml(label)}">${image}</span>`;
	}

	function setupImageLoading(root = element("viewRoot")) {
		root.querySelectorAll("[data-image-loader] img").forEach(image => {
			const container = image.parentElement;
			const markLoaded = () => container.classList.add("is-loaded");
			const markFailed = () => container.classList.add("is-error");
			image.addEventListener("load", markLoaded, { once: true });
			image.addEventListener("error", markFailed, { once: true });
			if (image.complete) {
				if (image.naturalWidth > 0) markLoaded();
				else markFailed();
			}
		});
	}

	function renderItemCard(item) {
		const sources = item.sources.map(source => `<a class="record-link" href="#${source.id}">${escapeHtml(source.name)} (${escapeHtml(source.id)})</a>`).join("<br>");
		const rarity = item.rarity === "unknown" ? "" : item.rarity;
		const rarityLabel = rarity ? `${rarity}${item.dropChance ? ` · ${item.dropChance}` : ""}` : "";
		const detailRows = rows => (rows || []).map(([label, value]) => itemField(label, value)).join("");
		const inferred = inferItemProfile(item);
		const itemDescription = item.description || escapeHtml(inferred.appearance);
		const itemType = item.type || escapeHtml(inferred.type);
		const sourceHabitats = item.sources.map(source => {
			const creature = creaturesById.get(source.id);
			const habitat = creature && extractCreatureField(creature, /moi truong song(?: chu yeu)?|habitat/i);
			return habitat ? `<span><a class="record-link" href="#${escapeHtml(source.id)}">${escapeHtml(source.name)}</a>: ${escapeHtml(habitat)}</span>` : "";
		}).filter(Boolean).join("<br>");
		const effectsMarkup = item.effects?.length
			? `<ul>${item.effects.map(effect => `<li>${escapeHtml(effect)}</li>`).join("")}</ul>`
			: "";
		const quickSummary = item.effects?.[0] || item.note;
		element("viewRoot").innerHTML = `<article class="wiki item-profile" id="${escapeHtml(item.id)}"><h1 class="title">${escapeHtml(item.name)}</h1><div class="byline">Vật phẩm · ${escapeHtml(item.id)}</div><div class="lead"><div><nav class="toc"><div class="tocTitle">Thông tin vật phẩm</div><ol><li><a href="#item-identification">Định danh</a></li><li><a href="#item-obtain">Phương thức sở hữu</a></li><li><a href="#item-stats">Chỉ số và sát thương</a></li><li><a href="#item-effects">Hiệu ứng</a></li></ol></nav><div class="chips"><a class="tag" href="#items">Danh mục vật phẩm</a>${rarityLabel ? `<span class="tag">${escapeHtml(rarityLabel)}</span>` : ""}</div></div><aside class="infobox"><h2 class="pi-title">${escapeHtml(item.name)}</h2>${renderItemImage(item, "item-profile-image")}<div class="pi-data-list">${itemField("Mã vật phẩm", item.id)}${itemField("Phẩm cấp / Độ hiếm", rarityLabel)}${itemField("Nguồn rơi ra", sources, true)}</div></aside></div><section class="section" id="item-identification"><h2>I. THÔNG TIN ĐỊNH DANH</h2>${itemField("Tên vật phẩm", item.name)}${itemField("Cổ ngữ / Tên gốc", item.ancientName)}${itemField("Phân loại vật phẩm", item.type || itemType, Boolean(item.type || itemType))}${itemField("Phẩm cấp / Độ hiếm", rarityLabel)}${itemField("Cấp độ yêu cầu sử dụng", item.usableLevel)}${itemField("Lớp nhân vật có thể sử dụng", item.classes)}</section><section class="section" id="item-obtain"><h2>II. PHƯƠNG THỨC SỞ HỮU</h2>${itemField("Nguồn rơi ra từ sinh vật", sources, true)}${itemField("Nhiệm vụ liên quan", item.obtain?.quest)}${itemField("Công thức chế tạo / Rèn đúc", item.obtain?.crafting)}${itemField("Ghi chú từ hồ sơ sinh vật", item.note)}${itemField("Môi trường sống của sinh vật nguồn", sourceHabitats, true)}${itemField("Vị trí thu thập / Tọa độ thế giới", item.obtain?.location)}${itemField("Điều kiện / Tỷ lệ xuất hiện", item.obtain?.conditions || item.dropChance)}</section><section class="section" id="item-stats"><h2>III. CHỈ SỐ CƠ BẢN VÀ SÁT THƯƠNG</h2>${item.stats?.length ? detailRows(item.stats) : `${itemField("Tấn công vật lý", "")}${itemField("Sát thương phép thuật", "")}${itemField("Phòng thủ / Giáp", "")}${itemField("Kháng phép", "")}${itemField("Độ bền / Độ chịu lực", "")}${itemField("Thuộc tính đòn đánh", "")}${itemField("Thuộc tính phòng ngự", "")}`}</section><section class="section" id="item-effects"><h2>IV. HIỆU ỨNG VÀ MÔ TẢ</h2>${itemField("Hiệu ứng / Công dụng được ghi nhận", item.note)}${effectsMarkup ? `<div class="field-row"><div class="field-label">Hiệu ứng nội tại, kỹ năng và cơ chế ẩn</div><div class="field-value">${effectsMarkup}</div></div>` : ""}${itemField("Mô tả ngoại hình", item.description || itemDescription, Boolean(item.description || itemDescription))}${itemField("Nâng cấp / Khảm nạm / Tiến hóa", item.upgrade)}${itemField("Thương mại / Trọng lượng / Giao dịch", item.commerce)}${itemField("Cốt truyện / Gia thoại", item.lore)}</section><section class="section quick-reference"><h2>📌 TỔNG HỢP NHANH</h2>${itemField("Tên vật phẩm", item.name)}${itemField("Phẩm cấp", rarityLabel)}${itemField("Cách lấy nhanh", sources, true)}${itemField("Kỹ năng / Hiệu ứng", quickSummary)}</section><footer class="footer"><a class="record-link" href="#items">Quay lại danh mục vật phẩm</a> · ID: ${escapeHtml(item.id)}</footer></article>`;
		setupImageLoading();
	}

	function renderMarkdown(markdown) {
		const lines = String(markdown || "").replace(/\r/g, "").split("\n");
		let html = "", paragraph = [], listType = null, table = [], sectionIndex = 0;
		const flushParagraph = () => {
			if (!paragraph.length) return;
			html += "<p>" + inlineMarkdown(paragraph.join(" ")) + "</p>";
			paragraph = [];
		};
		const flushList = () => {
			if (!listType) return;
			html += `</${listType}>`;
			listType = null;
		};
		const flushTable = () => {
			if (!table.length) return;
			const rows = table
				.filter(line => !/^\s*\|?\s*:?-{3,}/.test(line))
				.map(line => line.trim().replace(/^\||\|$/g, "").split("|").map(cell => cell.trim()));
			if (rows.length) {
				html += "<table><thead><tr>" + rows[0].map(cell => `<th>${inlineMarkdown(cell)}</th>`).join("") +
					"</tr></thead><tbody>" + rows.slice(1).map(row => "<tr>" + row.map(cell => `<td>${inlineMarkdown(cell)}</td>`).join("") + "</tr>").join("") +
					"</tbody></table>";
			}
			table = [];
		};

		for (const line of lines) {
			if (/^\s*\|.*\|\s*$/.test(line)) {
				flushParagraph();
				flushList();
				table.push(line);
				continue;
			}
			flushTable();
			const heading = line.match(/^(#{1,6})\s+(.+)$/);
			if (heading) {
				flushParagraph();
				flushList();
				const sourceLevel = heading[1].length;
				const level = sourceLevel === 4 ? 2 : sourceLevel >= 5 ? 3 : 2;
				const id = sourceLevel === 4 ? ` id="profile-section-${++sectionIndex}"` : "";
				html += `<h${level}${id}>${inlineMarkdown(heading[2])}</h${level}>`;
				continue;
			}
			if (/^\s*---+\s*$/.test(line)) {
				flushParagraph();
				flushList();
				html += "<hr>";
				continue;
			}
			const quote = line.match(/^\s*>\s?(.*)$/);
			if (quote) {
				flushParagraph();
				flushList();
				html += `<blockquote>${inlineMarkdown(quote[1])}</blockquote>`;
				continue;
			}
			const bullet = line.match(/^\s*[-*+]\s+(.+)$/);
			const numbered = line.match(/^\s*\d+[.)]\s+(.+)$/);
			const nextType = bullet ? "ul" : numbered ? "ol" : null;
			if (nextType) {
				flushParagraph();
				const listItem = (bullet || numbered)[1];
				const field = listItem.match(/^\*\*(.+?):\*\*\s*(.*)$/) || listItem.match(/^([^*].+?):\s*(.*)$/);
				if (field) {
					flushList();
					html += `<div class="field-list-item">${renderDataRow(field[1], field[2])}</div>`;
					continue;
				}
				if (listType !== nextType) {
					flushList();
					html += `<${nextType}>`;
					listType = nextType;
				}
				html += `<li>${inlineMarkdown(listItem)}</li>`;
				continue;
			}
			if (!line.trim()) {
				flushParagraph();
				flushList();
				continue;
			}
			flushList();
			paragraph.push(line.trim());
		}
		flushTable();
		flushParagraph();
		flushList();
		return html;
	}

	function renderGroups() {
		const groupList = element("groups");
		groupList.classList.toggle("is-collapsed", state.groupsCollapsed);
		groupList.innerHTML = groups.map((group, index) => {
			const count = creatures.filter(item => item.categoryId === group.id).length;
			return `<button class="group${state.group === index ? " active" : ""}" data-group="${index}">${escapeHtml(group.title)}<span>${count} ${pageLanguage === "en" ? "records" : "hồ sơ"}</span></button>`;
		}).join("");
		element("groupTitleText").textContent = state.group === null
			? (pageLanguage === "en" ? "Browse records" : "Phân loại hồ sơ")
			: groups[state.group]?.title.replace(/^[IVX]+\.\s*/, "") || (pageLanguage === "en" ? "Browse records" : "Phân loại hồ sơ");
		const toggle = element("browseToggle");
		toggle.textContent = state.groupsCollapsed ? "<" : ">";
		toggle.setAttribute("aria-expanded", String(!state.groupsCollapsed));
		const toggleLabel = pageLanguage === "en"
			? (state.groupsCollapsed ? "Show creature groups" : "Hide creature groups")
			: (state.groupsCollapsed ? "Hiện các nhóm hồ sơ" : "Ẩn các nhóm hồ sơ");
		toggle.setAttribute("aria-label", toggleLabel);
		toggle.title = toggleLabel;
	}

	function pageLimit(key) {
		return state.pageLimits[key] || initialPageSize;
	}

	function loadMoreButton(key, shown, total) {
		if (shown >= total) return "";
		const remaining = Math.min(pageIncrement, total - shown);
		return `<button class="load-more" type="button" data-load-more="${escapeHtml(key)}">${pageLanguage === "en" ? `Load ${remaining} more (${shown}/${total})` : `Tải thêm ${remaining} mục (${shown}/${total})`}</button>`;
	}

	function renderList() {
		const query = state.query.toLocaleLowerCase("vi");
		const filtered = creatures.filter(item =>
			(state.group === null || item.categoryId === groups[state.group]?.id) &&
			(!query || `${item.name} ${item.summary} ${item.category} ${extractCreatureField(item, /moi truong song(?: chu yeu)?|habitat/i)}`.toLocaleLowerCase("vi").includes(query))
		);
		const shown = Math.min(pageLimit("list"), filtered.length);
		element("list").innerHTML = filtered.slice(0, shown).map(item => {
			const danger = dangerInfo(item);
			const detailLabel = pageLanguage === "en"
				? (item.details ? "Detailed profile" : "Summary")
				: (item.details ? "Hồ sơ chi tiết" : "Tóm tắt");
			return `<a class="item${item.id === state.selectedId ? " active" : ""}" data-entry="${item.id}" href="#${item.id}"><span class="itemName">${escapeHtml(item.name)}</span><span class="itemMeta">#${item.number} · ${detailLabel}${danger ? ` · <span class="danger-badge ${danger.className}">${danger.label}</span>` : ""}</span></a>`;
		}).join("") + loadMoreButton("list", shown, filtered.length);
		element("count").textContent = pageLanguage === "en"
			? `${shown} / ${filtered.length} results · ${creatures.length} records`
			: `${shown} / ${filtered.length} kết quả · ${creatures.length} hồ sơ`;
	}

	function renderCenter() {
		const worldHistory = pageLanguage === "en" ? [
			{
				title: "1. Black Atlantis and the KAJU Wardens",
				text: "A frozen beam from the Pacific Trench reveals Black Atlantis and its Ice Mana Cores. Blind KAJU Wardens hunt by following a sequence of six seismic pulses."
			},
			{
				title: "2. Praefectus Awakens and Is Sealed",
				text: "Removing the five-seal sword from a red-quartz skeleton revives Praefectus. After several battle phases and the Water Prison Barrier, the sword is restored to seal the entity."
			},
			{
				title: "3. Atmospheric Change and the Rise of the Titans",
				text: "Cyanobacteria-K purifies the atmosphere and oceans; a Eurasian catastrophe gives rise to BloodShinGodzilla. Zero-Mana zones also form in deep caves and ravines."
			},
			{
				title: "4. The Galactic Curse",
				text: "The Deep-Sea Curse King absorbs a meteorite's mana core, transforms the Abyssal Sovereign Blade, and gains power over matter, gravity, and cosmic radiation."
			},
			{
				title: "5. Ecosystems and the Creature Catalog",
				text: "The records describe man-hunting and neutral species, edible creatures, ecological supporters, deep-sea monsters, and Titans. Current records are maintained separately in the creature catalog."
			},
			{
				title: "6. The Current Environmental State",
				text: "The atmosphere and continents are recovering, but the Black Coordinates remain. Lakes and rivers are relatively clean, while the Pacific Trench is still affected by the Galactic Curse."
			}
		] : [
			{
				title: "1. Atlantis Đen và KAJU Warden",
				text: "Cột sáng băng giá từ rãnh Thái Bình Dương để lộ Atlantis Đen và các Viên Ma Năng Băng. KAJU Warden mù săn theo một chuỗi sáu nhịp rung chấn."
			},
			{
				title: "2. Praefectus thức tỉnh và bị phong ấn",
				text: "Thanh kiếm năm ấn được rút khỏi bộ xương thạch anh đỏ, làm Praefectus tái sinh. Sau các phase chiến đấu và Thủy Ngục Kết Giới, thanh kiếm được cắm lại để phong ấn thực thể."
			},
			{
				title: "3. Khí quyển biến đổi và các Titan xuất hiện",
				text: "Cyanobacteria-K làm sạch khí quyển và đại dương; thảm họa Eurasia dẫn đến BloodShinGodzilla. Các vùng Zero-Mana cũng hình thành trong hang sâu và hẻm núi."
			},
			{
				title: "4. Lời Nguyền Tinh Hà",
				text: "Vua Lời Nguyền Biển Sâu hấp thụ lõi ma năng thiên thạch, biến đổi Abyssal Sovereign Blade và khai mở năng lực thao túng vật chất, trọng lực, bức xạ vũ trụ."
			},
			{
				title: "5. Hệ sinh thái và danh mục sinh vật",
				text: "Tư liệu mô tả sinh vật săn người, loài trung tính, loài ăn được, nhóm hỗ trợ sinh thái, thủy quái và Titan. Danh mục hiện tại được quản lý riêng trong hồ sơ sinh vật."
			},
			{
				title: "6. Cục diện môi trường hiện tại",
				text: "Khí quyển và lục địa đang hồi phục, nhưng Tọa Độ Đen vẫn tồn tại. Sông hồ tương đối sạch; rãnh sâu Thái Bình Dương còn chịu ảnh hưởng của Lời Nguyền Tinh Hà."
			}
		];
		const fullHistory = pageLanguage === "en" ? [
			{
				title: "1. The First Era and the Black Atlantis Hotspot",
				paragraphs: [
					"A pillar of freezing light erupts from a trench 30 km beneath the Pacific Ocean, tearing through the sea surface and releasing a wave of negative thermal energy.",
					"Under pressure recorded in the source as 300,000 m, the ruins of Black Atlantis (Abyssal Necropolis), built from Black Quartz and Eternal Ice, are revealed. They contain Absolute Ice Cores that radiate negative heat, freezing cellular decay and suppressing thermal overload.",
					"The KAJU Wardens are ancient biomechanical organisms about 30 m tall, made of quartz alloy. Blind, they track ground vibrations through the Six-Beat Seismic Protocol: during beats 1–3, the rock absorbs compression and glows with blue veins; beat 4 brings an Abyssal Screech; beat 5 is absolute silence; on beat 6, the KAJU emerge and attack anything causing vibrations."
				]
			},
			{
				title: "2. Praefectus Awakens and Enters Its Battle Phases",
				paragraphs: [
					"Praefectus fundi maris profundi (Governor of the Deep Sea) is unsealed when the five-marked sword is pulled from the chest of a red-quartz skeleton at an altar. The KAJU Wardens immediately stop moving. A burst of cold restores flesh and veins to the skeleton, forming a young figure with a feminine face clad in Red Moss Bio-Armor. The KAJU forces then go berserk and begin destroying their surroundings.",
					"During Phases 1 and 2, Praefectus teleports and is protected by a Six-Layer Shield; the shield disappears for 10 seconds after each teleport. Ice-Radiation Ultraviolet Beams cause cellular decay. Phase 3 opens the Water Prison Barrier, a 5 km-radius sphere that compresses its interior under extreme pressure.",
					"In Phase 5, a vacuum frenzy triggers implosions in the 30 km-deep trench, stripping local air molecules and crushing objects in 1/1000 of a second. The ancient sword is driven back into Praefectus's chest, locking the five seals and forcing the entity into emergency stasis."
				]
			},
			{
				title: "3. Atmospheric Mutation and Surface Ecosystems",
				paragraphs: [
					"About one trillion modified Cyanobacteria-K spread through the atmosphere and oceans. They absorb toxins, negative mana, and heavy metals while releasing oxygen at a rate the source describes as 500 times that of ordinary vegetation.",
					"A geothermal-nuclear catastrophe in Eurasia produces temperatures of millions of degrees and gamma rays. A creature absorbs this energy and becomes Cherenkov Decay Fire, a form capable of breaking down cells. An ancient entity beneath the mantle later devours it, and it evolves into BloodShinGodzilla, the Ancient Titan King. Its radioactive acid blood is described as having a pH approaching a negative value, melting concrete and forming boiling acid lakes.",
					"Deep ravines and cave systems create Zero-Mana Blind Spots, where mana levels approach zero and negative magic has no effect."
				]
			},
			{
				title: "4. The Cosmic Meteorite and the Deep-Sea Curse King",
				paragraphs: [
					"The Deep-Sea Curse King takes control of Praefectus's ancient energy. He wields the Abyssal Sovereign Blade, carrying the Binding Curse and Deep-Sea Blessing, which make every drop of water on Earth loyal to him.",
					"A meteorite containing an ultra-dense cosmic crystal tears through the atmosphere and falls into a 30 km-deep Pacific trench. The Curse King absorbs its Cosmic Mana Core, transforming the sword and awakening the Galactic Curse. His control expands to the molecular density of air, gravity, and cosmic radiation."
				]
			},
			{
				title: "5. Natural Ecosystem Classification",
				paragraphs: [
					"The source describes several groups: 24 man-hunting species born from resentful mana in the Black Coordinates; 40 neutral, edible species that thrive in clean environments; 60 aggressive species that must be hunted or sensitive species that may flee but can be eaten; 15 inedible neutral species that support and defend the ecosystem; as well as deep-sea monsters and ancient Titans.",
					"The original chapter title states 124 new species, while groups I–IV total 139 (24 + 40 + 60 + 15), not including deep-sea monsters and Titans. The source's total therefore needs verification; the current classifications and records are maintained in the creature catalog rather than duplicated here."
				]
			},
			{
				title: "6. Current Environmental and Geological Conditions",
				paragraphs: [
					"The atmosphere is recovering through Cyanobacteria-K populations and the neutralization of negative mana by positive-energy waves. Black Coordinates containing resentful mana remain on the continents, along with bands of vibration-sensitive fungi around quartz-mining areas.",
					"Continental rivers and lakes are described as toxin-free and home to neutral aquatic species. In contrast, the Pacific Ocean—especially its 30 km-deep trench—remains under the Galactic Curse and is recorded as having a pressure of 3,000 atmospheres."
				]
			}
		] : [
			{
				title: "1. Kỷ nguyên khởi đầu và điểm nóng Atlantis Đen",
				paragraphs: [
					"Một cột sáng mang hơi thở băng bộc phát từ rãnh sâu 30 km dưới lòng Thái Bình Dương, xé tan mặt biển và tỏa ra chấn động nhiệt âm.",
					"Dưới áp suất được tư liệu ghi là 300.000 m, phế tích thành phố cổ Atlantis Đen (Abyssal Necropolis), được xây bằng Thạch Anh Đen và Băng Tinh Vĩnh Cửu, được hé lộ. Nơi đây chứa các Viên Ma Năng Băng (Absolute Ice Core), tỏa nhiệt lượng âm giúp đóng băng sự hoại tử tế bào và dập tắt tình trạng quá tải nhiệt.",
					"KAJU Warden là hệ thống sinh vật cơ khí sinh học cổ đại cao khoảng 30 m, cấu tạo bằng hợp kim thạch anh. Chúng bị mù và săn theo chấn động mặt đất qua Quy trình 6 Nhịp Chấn: nhịp 1–3, lớp đá hấp thụ lực nén và phát gân sáng xanh; nhịp 4, tiếng Abyssal Screech vang lên; nhịp 5, im lặng tuyệt đối; nhịp 6, KAJU trồi lên tấn công mọi thứ gây rung chấn."
				]
			},
			{
				title: "2. Sự thức tỉnh và các phase của Praefectus",
				paragraphs: [
					"Praefectus fundi maris profundi (Thống Đốc Biển Sâu) được giải phong ấn khi thanh kiếm khắc năm ấn trên lồng ngực bộ xương thạch anh đỏ tại đài hiến tế bị rút ra. KAJU Warden lập tức ngừng chuyển động; hàn khí bộc phát, cơ và mạch máu mọc lại trên bộ xương, tạo thành một thanh niên mang khuôn mặt nữ, khoác Giáp Sinh Học Rêu Đỏ. Lực lượng KAJU đồng loạt phát điên và đập phá xung quanh.",
					"Ở Phase 1 và 2, Praefectus dịch chuyển tọa độ, được bảo vệ bởi Khiên Sáu Tầng; lớp khiên tạm biến mất 10 giây sau mỗi lần dịch chuyển. Các đòn Tia Tử Ngoại Bức Xạ Băng gây hoại tử tế bào. Phase 3 mở Thủy Ngục Kết Giới, một vòm cầu nén áp suất cực đại bán kính 5 km.",
					"Trong Phase 5, cơn cuồng nộ chân không tạo các vụ Implosion tại rãnh biển sâu 30 km, rút sạch phân tử không khí cục bộ và nghiền nát vật thể trong 1/1000 giây. Trạng thái này được chặn tạm thời khi thanh kiếm cổ đại được đâm ngược vào lồng ngực Praefectus, khóa năm Dấu Ấn và đưa thực thể vào ngủ đông khẩn cấp (Stasis)."
				]
			},
			{
				title: "3. Đột biến khí quyển và hệ sinh thái bề mặt",
				paragraphs: [
					"Quần thể khoảng 1.000 tỷ vi khuẩn lam sinh học biến tính (Cyanobacteria-K) phủ khắp khí quyển và đại dương. Chúng hấp thụ khí độc, ma lực tiêu cực và kim loại nặng, đồng thời giải phóng oxy với tốc độ được tư liệu mô tả gấp 500 lần thảm thực vật thông thường.",
					"Một thảm họa địa nhiệt – hạt nhân ở Eurasia tạo luồng nhiệt độ hàng triệu độ C và tia Gamma. Một sinh vật hấp thụ nguồn năng lượng này, biến đổi thành hình thái Lửa Xanh Tím (Cherenkov Decay Fire) có khả năng phân rã tế bào. Sau đó, sinh vật bị thực thể cổ đại dưới tầng manti nuốt chửng và tiến hóa thành BloodShinGodzilla, Vua Titan Cổ Đại. Máu Axit Phóng Xạ của nó có pH được mô tả là tiệm cận âm, làm nóng chảy bê tông và tạo các hồ axit sôi.",
					"Các hẻm núi sâu và hệ thống hang động đặc biệt hình thành những vùng Zero-Mana Blind Spots, nơi nồng độ ma năng tiệm cận bằng không và ma thuật tiêu cực không thể tác động."
				]
			},
			{
				title: "4. Thiên thạch vũ trụ và Vua Lời Nguyền Biển Sâu",
				paragraphs: [
					"Nguồn năng lượng cổ đại của Praefectus bị Vua Lời Nguyền Biển Sâu kiểm soát. Hắn sở hữu Thanh Kiếm Biển Sâu (Abyssal Sovereign Blade), mang Lời Nguyền Ràng Buộc và Chúc Phúc Biển Sâu, khiến mọi giọt nước trên Trái Đất trung thành với hắn.",
					"Một thiên thạch chứa Tinh Thể Vũ Trụ Siêu Mật Độ xé rách khí quyển và rơi xuống rãnh sâu 30 km ở Thái Bình Dương. Vua Lời Nguyền hấp thụ Lõi Ma Năng Vũ Trụ, khiến thanh kiếm biến đổi và khai mở Lời Nguyền Tinh Hà. Năng lực thao túng của hắn mở rộng sang mật độ phân tử không khí, trọng lực và bức xạ vũ trụ."
				]
			},
			{
				title: "5. Phân loại hệ sinh thái tự nhiên",
				paragraphs: [
					"Tư liệu gốc chia sinh vật thành các nhóm: 24 loài săn người sinh ra từ ma lực oán hận tại Tọa Độ Đen; 40 loài trung tính ăn được phát triển trong môi trường sạch; 60 loài hung dữ cần săn bắt hoặc nhạy cảm thường bỏ chạy nhưng có thể làm thực phẩm; 15 loài trung tính không ăn được, hỗ trợ sinh thái và phòng thủ; cùng các thủy quái biển sâu và Titan cổ đại.",
					"Tiêu đề chương gốc ghi 124 loài mới, trong khi tổng các nhóm I–IV là 139 (24 + 40 + 60 + 15), chưa tính thủy quái và Titan. Vì vậy con số tổng trong nguồn cần được đối chiếu; phân loại và hồ sơ cập nhật được tra cứu trong danh mục sinh vật hiện tại, không sao chép lại tại đây."
				]
			},
			{
				title: "6. Cục diện môi trường và địa chất hiện tại",
				paragraphs: [
					"Khí quyển được phục hồi nhờ quần thể vi khuẩn lam và việc trung hòa ma lực tiêu cực bằng sóng năng lượng dương. Trên lục địa vẫn còn các Tọa Độ Đen chứa ma lực oán hận và dải Nấm Cảm Âm Cảm Chấn quanh các vùng mỏ thạch anh.",
					"Sông hồ lục địa được mô tả là sạch độc tố, chứa các loài thủy sinh trung tính. Trái lại, đại dương Thái Bình Dương, đặc biệt là rãnh sâu 30 km, chìm trong Lời Nguyền Tinh Hà và chịu áp suất được tư liệu ghi là 3.000 atmosphere."
				]
			}
		];
		const initialCatalogCount = creatures.filter(creature => ["group-01", "group-02", "group-03"].includes(creature.categoryId)).length;
		const existingAdditionalCount = creatures.filter(creature => ["group-04", "group-05", "group-06"].includes(creature.categoryId)).length;
		const generatedAdditionCount = creatures.filter(creature => creature.generatedFromStory).length;
		const fullHistoryMarkup = fullHistory.map((chapter, index) => `<article class="world-full-history-chapter"><h3>${escapeHtml(chapter.title)}</h3>${chapter.paragraphs.map(paragraph => `<p>${escapeHtml(paragraph)}</p>`).join("")}</article>`).join("");
		const overview = pageLanguage === "en"
			? `<section class="world-overview" aria-labelledby="world-overview-title"><header class="world-overview-header"><span class="world-overview-kicker">WORLD OVERVIEW</span><h2 id="world-overview-title">OCEN</h2><p>A post-catastrophe fantasy world: Black Atlantis and the KAJU rise from the Pacific Trench; Praefectus is sealed; the atmosphere changes, Titans emerge, and the Galactic Curse spreads across the ocean. The continents are recovering, but the Black Coordinates and deep-sea regions remain dangerous.</p></header><div class="world-history">${worldHistory.map((entry, index) => `<article class="world-history-item"><span class="world-history-number">${String(index + 1).padStart(2, "0")}</span><div><h3>${escapeHtml(entry.title)}</h3><p>${escapeHtml(entry.text)}</p></div></article>`).join("")}</div><details class="world-full-history"><summary>Read the full historical account</summary><div class="world-full-history-content">${fullHistoryMarkup}</div></details><div class="world-overview-note"><strong>Current catalog:</strong> ${creatures.length} creature records across ${groups.length} groups. The full history is kept separate to avoid duplicating creature profiles.</div></section>`
			: `<section class="world-overview" aria-labelledby="world-overview-title"><header class="world-overview-header"><span class="world-overview-kicker">TỔNG QUAN THẾ GIỚI</span><h2 id="world-overview-title">OCEN</h2><p>Thế giới giả tưởng hậu thảm họa: Atlantis Đen và KAJU trỗi dậy từ rãnh Thái Bình Dương; Praefectus bị phong ấn; khí quyển biến đổi, các Titan xuất hiện và Lời Nguyền Tinh Hà bao phủ đại dương. Lục địa đang hồi phục, nhưng Tọa Độ Đen và vùng biển sâu vẫn nguy hiểm.</p></header><div class="world-history">${worldHistory.map((entry, index) => `<article class="world-history-item"><span class="world-history-number">${String(index + 1).padStart(2, "0")}</span><div><h3>${escapeHtml(entry.title)}</h3><p>${escapeHtml(entry.text)}</p></div></article>`).join("")}</div><details class="world-full-history"><summary>Đọc mục mô tả lịch sử đầy đủ</summary><div class="world-full-history-content">${fullHistoryMarkup}</div></details><div class="world-overview-note"><strong>Danh mục hiện tại:</strong> ${creatures.length} hồ sơ sinh vật trong ${groups.length} nhóm; lịch sử đầy đủ được giữ riêng ở trên để không trùng lặp với các hồ sơ sinh vật.</div></section>`;
		const content = groups.map(group => {
			const members = creatures.filter(item => item.categoryId === group.id);
			const key = `center:${group.id}`;
			const shown = Math.min(pageLimit(key), members.length);
			return `<section class="center-group"><h3>${escapeHtml(group.title)}</h3><p>${shown} / ${members.length} ${pageLanguage === "en" ? "creatures" : "sinh vật"}</p><div class="center-members">${members.slice(0, shown).map(item => `<a class="center-member" href="#${item.id}">${escapeHtml(item.name)}</a>`).join("")}</div>${loadMoreButton(key, shown, members.length)}</section>`;
		}).join("");
		element("viewRoot").innerHTML = `<section><h1 class="view-title">${pageLanguage === "en" ? "Creature Bestiary Home" : "Trung tâm dị thể"}</h1>${overview}<div class="center-groups">${content}</div></section>`;
	}

	function renderMap() {
		element("viewRoot").innerHTML = `<section class="center-map-section" aria-label="Bản đồ thế giới OCEN"><iframe class="center-map-frame" src="${wikiBasePath}word.html?embed=map#map" title="Bản đồ thế giới OCEN tương tác" loading="lazy"></iframe></section>`;
	}

	function matchingElementCreatures() {
		const query = normalizeText(state.elementQuery.trim());
		return datasheetCreatures().filter(creature => {
			const affinities = parseAffinities(creature);
			if (query && !normalizeText(`${creature.name} ${creature.summary} ${creature.category}`).includes(query)) return false;
			const value = affinities[state.elementId];
			if (value === undefined) return state.includeUnknown;
			return value >= state.minPercent && value <= state.maxPercent;
		});
	}

	function renderElementResults() {
		const rows = matchingElementCreatures();
		const datasheets = datasheetCreatures();
		const knownCount = datasheets.filter(creature => Object.hasOwn(parseAffinities(creature), state.elementId)).length;
		const shown = Math.min(pageLimit("elements"), rows.length);
		element("elementCount").textContent = `${shown} / ${rows.length} sinh vật · ${knownCount} đã có tỷ lệ · ${datasheets.length - knownCount} chưa có tỷ lệ trong nguồn`;
		element("elementResults").innerHTML = rows.length ? `<div class="table-scroll element-table-scroll"><table class="record-table"><thead><tr><th>Sinh vật</th><th>Nhóm</th><th>Kháng nguyên tố</th><th>Mô tả</th></tr></thead><tbody>${rows.slice(0, shown).map(creature => {
			const value = parseAffinities(creature)[state.elementId];
			return `<tr><td data-label="Sinh vật"><a class="record-link" href="#${creature.id}">${escapeHtml(creature.name)}</a><span class="itemMeta">${escapeHtml(creature.id)}</span></td><td data-label="Nhóm">${escapeHtml(creature.category.replace(/^[IVX]+\.\s*/, ""))}</td><td data-label="Kháng nguyên tố">${value === undefined ? `<span class="unknown-value">${escapeHtml(unknownProfileValue)}</span>` : `${value}%`}</td><td data-label="Mô tả" class="record-summary">${escapeHtml(creature.summary)}</td></tr>`;
		}).join("")}</tbody></table></div>${loadMoreButton("elements", shown, rows.length)}` : '<div class="empty-results">Không có sinh vật khớp bộ lọc.</div>';
	}

	function renderElements() {
		const selected = elements.find(item => item.id === state.elementId) || elements[0];
		element("viewRoot").innerHTML = `<section><h1 class="view-title">Trang nguyên tố</h1>${renderSimulationControls()}<section class="element-browser"><h2 class="element-browser-title">Tra cứu kháng nguyên tố</h2><div class="view-toolbar"><label class="view-control">Nguyên tố<select id="elementSelect">${elements.map(item => `<option value="${item.id}"${item.id === selected.id ? " selected" : ""}>${escapeHtml(item.label)}</option>`).join("")}</select></label><label class="view-control">Tìm sinh vật<input id="elementSearch" type="search" value="${escapeHtml(state.elementQuery)}" placeholder="Tên, mô tả hoặc nhóm"></label><div class="view-control range-control"><label for="elementMin">Khoảng kháng (%)</label><output id="rangeOutput">${state.minPercent}% đến ${state.maxPercent}%</output><input id="elementMin" type="range" min="-500" max="100" step="10" value="${state.minPercent}" aria-label="Kháng tối thiểu"><input id="elementMax" type="range" min="-500" max="100" step="10" value="${state.maxPercent}" aria-label="Kháng tối đa"></div><label class="view-control"><span>Bao gồm mức chưa rõ</span><input id="includeUnknown" type="checkbox"${state.includeUnknown ? " checked" : ""}></label></div><div class="result-count" id="elementCount"></div><div id="elementResults"></div></section></section>`;
		renderSimulationOutput();
		renderElementResults();
	}

	function catalogMatches() {
		const query = normalizeText(state.catalogQuery.trim());
		return creatures.filter(creature => {
			const species = creatureSpecies(creature);
			const tags = creatureTags(creature);
			const habitat = extractCreatureField(creature, /moi truong song(?: chu yeu)?|habitat/i);
			return (!query || normalizeText(`${creature.id} ${creature.name} ${creature.summary} ${creature.category} ${species} ${habitat} ${tags.join(" ")}`).includes(query)) &&
				(!state.catalogGroup || creature.categoryId === state.catalogGroup) &&
				(!state.catalogSpecies || species === state.catalogSpecies) &&
				state.catalogTags.every(tag => tags.includes(tag));
		});
	}

	function renderCatalogResults() {
		const rows = catalogMatches();
		const shown = Math.min(pageLimit("catalog"), rows.length);
		element("catalogCount").textContent = `${shown} / ${rows.length} sinh vật`;
		element("catalogResults").innerHTML = rows.length ? `<div class="table-scroll"><table class="record-table"><thead><tr><th>ID</th><th>Tên</th><th>Nhóm</th><th>Loài / phân hệ</th><th>Tag</th><th>Mô tả</th></tr></thead><tbody>${rows.slice(0, shown).map(creature => `<tr><td>${escapeHtml(creature.id)}</td><td><a class="record-link" href="#${creature.id}">${escapeHtml(creature.name)}</a></td><td>${escapeHtml(creature.category.replace(/^[IVX]+\.\s*/, ""))}</td><td>${escapeHtml(creatureSpecies(creature))}</td><td><div class="catalog-tags">${creatureTags(creature).map(tag => `<button class="catalog-tag" type="button" data-tag-filter="${escapeHtml(tag)}">${escapeHtml(tag)}</button>`).join("")}</div></td><td class="record-summary">${escapeHtml(creature.summary)}</td></tr>`).join("")}</tbody></table></div>${loadMoreButton("catalog", shown, rows.length)}` : '<div class="empty-results">Không có sinh vật khớp bộ lọc.</div>';
	}

	function renderCatalog() {
		const speciesOptions = [...new Set(creatures.map(creatureSpecies))].sort((a, b) => a.localeCompare(b, "vi"));
		const tagOptions = [...new Set(creatures.flatMap(creatureTags))].sort((a, b) => a.localeCompare(b, "vi"));
		const selectedTags = state.catalogTags.map(tag => `<span class="selected-tag">${escapeHtml(tag)}<button type="button" data-remove-tag="${escapeHtml(tag)}" aria-label="Bỏ tag ${escapeHtml(tag)}">×</button></span>`).join("");
		const availableTags = tagOptions.filter(tag => !state.catalogTags.includes(tag));
		element("viewRoot").innerHTML = `<section><h1 class="view-title">Mục lục sinh vật</h1><div class="view-toolbar"><label class="view-control">Tìm kiếm<input id="catalogSearch" type="search" value="${escapeHtml(state.catalogQuery)}" placeholder="Tên, ID, mô tả, tag hoặc môi trường sống"></label><label class="view-control">Nhóm<select id="catalogGroup"><option value="">Tất cả nhóm</option>${groups.map(group => `<option value="${group.id}"${state.catalogGroup === group.id ? " selected" : ""}>${escapeHtml(group.title)}</option>`).join("")}</select></label><label class="view-control">Loài / phân hệ<select id="catalogSpecies"><option value="">Tất cả loài</option>${speciesOptions.map(species => `<option value="${escapeHtml(species)}"${state.catalogSpecies === species ? " selected" : ""}>${escapeHtml(species)}</option>`).join("")}</select></label></div><div class="tag-filter-box"><div class="tag-filter-heading"><strong>Tag lọc</strong><button class="tag-clear-all" id="clearCatalogTags" type="button"${state.catalogTags.length ? "" : " disabled"}>Xóa tất cả</button></div><div class="selected-tags">${selectedTags || '<span class="tag-empty">Chưa chọn tag</span>'}</div><label class="view-control tag-add-control">Thêm tag<select id="catalogTagAdd"><option value="">Chọn tag để thêm...</option>${availableTags.map(tag => `<option value="${escapeHtml(tag)}">${escapeHtml(tag)}</option>`).join("")}</select></label></div><div class="result-count" id="catalogCount"></div><div id="catalogResults"></div></section>`;
		renderCatalogResults();
	}

	function expandProfileAbbreviations(markdown) {
		const labels = [
			["HP", "HP (Sinh lực / Máu)"],
			["MP", "MP (Ma lực / Năng lượng)"],
			["SP", "SP/Stamina (Thể lực / Thể năng)"],
			["STR", "STR (Strength - Sức mạnh cơ bắp)"],
			["VIT", "VIT / CON (Vitality/Constitution - Sức bền)"],
			["VIT / CON", "VIT / CON (Vitality/Constitution - Sức bền)"],
			["AGI", "AGI (Agility - Sự nhanh nhẹn)"],
			["DEX", "DEX (Dexterity - Sự khéo léo)"],
			["INT", "INT (Intelligence - Trí tuệ)"],
			["WIS", "WIS (Wisdom - Khôn ngoan/Nhận thức)"],
			["MND", "MND / MEN (Mind/Mentality - Ý chí tinh thần)"],
			["MND / MEN", "MND / MEN (Mind/Mentality - Ý chí tinh thần)"],
			["CHA", "CHA (Charisma - Thần thái / Uy nghiêm)"],
			["LUK", "LUK (Luck - May mắn)"]
		];
		return labels.reduce((text, [shortLabel, fullLabel]) => text.replace(new RegExp(`\\*\\*${shortLabel.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}:\\*\\*`, "g"), `**${fullLabel}:**`), String(markdown || ""));
	}

	function renderCard(item) {
		const group = item.category.replace(/^[IVX]+\.\s*/, "");
		if (!item.details) {
			if (item.categoryId === "group-02") {
				element("viewRoot").innerHTML = `<article class="wiki" id="${escapeHtml(item.id)}"><h1 class="title">${escapeHtml(item.name)}</h1><div class="byline">${escapeHtml(item.category)} · Hồ sơ #${item.number}</div><p class="summary">${escapeHtml(item.summary)}</p><footer class="footer">Nguồn dữ liệu: data.txt · Mã hồ sơ: ${escapeHtml(item.id)}</footer></article>`;
				setActiveTab("");
			} else renderEmptyDatasheet(item);
			return;
		}
		const detailed = Boolean(item.details);
		const danger = dangerInfo(item);
		const sections = parseProfileSections(item.details);
		const sectionContent = profileSections.map(section => {
			let content = sections.get(section.roman) || "";
			if (section.roman === "IV") {
				const remaining = removeElementalAffinityLines(content);
				return `<section class="section" id="profile-${section.roman}"><h2>${section.roman}. ${escapeHtml(section.title)}</h2><h3>1. Kháng Nguyên tố (Elemental Affinity)</h3>${renderElementalAffinities(item)}${renderCrowdControlAndWeaknesses(content)}${remaining ? `<details class="profile-source-note"><summary>Ghi chú bổ sung từ hồ sơ nguồn</summary>${renderMarkdown(expandProfileAbbreviations(remaining))}</details>` : ""}</section>`;
			}
			if (section.roman === "I" && !content) {
				content = `* **Tên loài/Sinh vật:** ${item.name}\n* **Phân hệ/Chủng tộc đại cương:** ${item.category}\n* **Mô tả:** ${item.summary}`;
			}
			const renderedContent = content
				? `${renderMarkdown(expandProfileAbbreviations(content))}${renderMissingProfileFields(section, content)}`
				: `<p class="no-information">${escapeHtml(unknownProfileValue)}</p>`;
			return `<section class="section" id="profile-${section.roman}"><h2>${section.roman}. ${escapeHtml(section.title)}</h2>${renderedContent}</section>`;
		}).join("");
		const toc = profileSections.map(section => `<li><a href="#profile-${section.roman}">${section.roman}. ${escapeHtml(section.title)}</a></li>`).join("");
		const quick = quickReferenceValues(item.details);
		const quickValues = quick.length === 4 ? quick : [unknownProfileValue, unknownProfileValue, unknownProfileValue, unknownProfileValue];
		const quickReference = `<section class="section quick-reference" id="profile-quick-reference"><h2>📌 BẢNG TỔNG HỢP NHANH</h2><div class="table-scroll"><table class="record-table"><thead><tr><th>Thuộc tính chính</th><th>Giá trị</th><th>Điểm mạnh lớn nhất</th><th>Điểm yếu chí mạng</th><th>Vị trí xuất hiện</th></tr></thead><tbody><tr><td>HP (Sinh lực / Máu) / MP (Ma lực / Năng lượng)</td>${quickValues.map(value => value.replaceAll("Không có thông tin", unknownProfileValue) === unknownProfileValue ? `<td><span class="none-data-box">${unknownProfileValue}</span></td>` : `<td>${inlineMarkdown(value.replaceAll("Không có thông tin", unknownProfileValue))}</td>`).join("")}</tr></tbody></table></div></section>`;
		const relatedItems = items.filter(relatedItem => relatedItem.sources.some(source => source.id === item.id));
		const relatedItemsSection = relatedItems.length
			? `<section class="section" id="profile-related-items"><h2>VẬT PHẨM LIÊN QUAN</h2><div class="item-grid">${relatedItems.map(relatedItem => `<a class="item-card" href="#${escapeHtml(relatedItem.id)}">${renderItemImage(relatedItem, "item-card-image")}<span class="item-card-info"><strong>${escapeHtml(relatedItem.name)}</strong><span>${escapeHtml(relatedItem.id)} · ${escapeHtml(relatedItem.rarity === "unknown" ? "Phẩm cấp chưa rõ" : relatedItem.rarity)}</span>${relatedItem.dropChance ? `<span>Tỷ lệ rơi: ${escapeHtml(relatedItem.dropChance)}</span>` : ""}</span></a>`).join("")}</div></section>`
			: "";
		const elementLinks = renderElementLinks(item);
		const sourceCode = item.generatedFromStory
			? ` · Mã nguồn truyện #${item.sourceNumber}`
			: item.supplementedDetails ? " · Hồ sơ đã được bổ sung dữ liệu" : "";
		const sourceLabel = "data.txt · dữ liệu chính thức trong thế giới Ocen";
		const detailStatus = item.generatedFromStory || item.supplementedDetails
			? "Thông tin chính thức trong thế giới Ocen"
			: "Thông tin gốc trong hồ sơ";
		const originalDetails = item.originalDetails
			? `<details class="profile-source-note"><summary>Hồ sơ gốc trước khi hợp nhất</summary>${renderMarkdown(expandProfileAbbreviations(item.originalDetails))}</details>`
			: "";
		const imagePath = window.CREATURE_IMAGE_BY_ID && window.CREATURE_IMAGE_BY_ID[item.id];
		const profileImage = imagePath
			? `<div class="pi-image creature-image image-loading" data-image-loader><img src="${escapeHtml(`${wikiBasePath}${imagePath}`)}" alt="Ảnh của ${escapeHtml(item.name)}" loading="lazy"><span class="item-image-placeholder" aria-hidden="true">X</span></div>`
			: `<div class="pi-image">Bách khoa sinh vật · Lenhan</div>`;
		element("viewRoot").innerHTML = `<article class="wiki" id="${escapeHtml(item.id)}"><h1 class="title">${escapeHtml(item.name)}${danger ? ` <span class="danger-badge ${danger.className}">${danger.label}</span>` : ""}</h1><div class="byline">${escapeHtml(item.category)} · Hồ sơ #${item.number}${sourceCode}${detailed ? " · Hồ sơ chi tiết" : ""}</div><div class="lead"><div><nav class="toc"><div class="tocTitle">Mục lục</div><ol>${toc}${relatedItemsSection ? '<li><a href="#profile-related-items">Vật phẩm liên quan</a></li>' : ""}<li><a href="#profile-quick-reference">Bảng tổng hợp nhanh</a></li></ol></nav><div class="chips"><span class="tag">${escapeHtml(group)}</span><span class="tag">Biểu mẫu chuẩn hóa</span></div>${elementLinks}</div><aside class="infobox"><h2 class="pi-title">${escapeHtml(item.name)}</h2>${profileImage}<div class="pi-data-list">${renderDataRow("Mã hồ sơ", item.id)}${item.generatedFromStory ? renderDataRow("Mã nguồn truyện", `#${item.sourceNumber}`) : ""}${renderDataRow("Phân loại", item.category)}${renderDataRow("Danh mục", group)}${renderDataRow("Mô tả", item.summary)}${renderDataRow("Hồ sơ chi tiết", detailStatus)}</div></aside></div>${sectionContent}${relatedItemsSection}${quickReference}${originalDetails}<footer class="footer">Nguồn dữ liệu: ${sourceLabel} · Đường dẫn hồ sơ: index.html#${escapeHtml(item.id)}</footer></article>`;
		setupImageLoading();
		setActiveTab("");
	}

	function setActiveTab(view) {
		document.querySelectorAll(".wiki-tab").forEach(tab => tab.classList.toggle("active", tab.dataset.view === view));
	}

	function setSidebarOpen(open) {
		const sidebar = document.querySelector(".sidebar");
		if (!sidebar) return;
		sidebar.classList.toggle("is-open", open);
		element("sidebarBackdrop").classList.toggle("is-visible", open);
		element("sidebarOpenButton").hidden = open;
		element("sidebarOpenButton").setAttribute("aria-expanded", String(open));
		element("sidebarOpenButton").setAttribute("aria-label", open ? "Danh mục đang mở" : "Mở danh mục");
		document.body.style.overflow = open ? "hidden" : "";
	}

	function setupSidebarSwipe() {
		let gesture = null;
		const interactiveSelector = "input, textarea, select, button, a, [contenteditable='true']";
		document.addEventListener("pointerdown", event => {
			if (!event.isPrimary || event.button !== 0 || !(event.target instanceof Element)) return;
			const sidebar = document.querySelector(".sidebar");
			const sidebarOpen = sidebar.classList.contains("is-open");
			if (sidebarOpen) {
				if (!sidebar.contains(event.target) || event.target.closest(interactiveSelector)) return;
			} else if (event.clientX > 24) return;
			gesture = { pointerId: event.pointerId, x: event.clientX, y: event.clientY, sidebarOpen };
		}, { passive: true });
		document.addEventListener("pointerup", event => {
			if (!gesture || gesture.pointerId !== event.pointerId) return;
			const start = gesture;
			gesture = null;
			const deltaX = event.clientX - start.x;
			const deltaY = event.clientY - start.y;
			if (Math.abs(deltaX) < 64 || Math.abs(deltaX) <= Math.abs(deltaY) * 1.25) return;
			if ((!start.sidebarOpen && deltaX > 0) || (start.sidebarOpen && deltaX < 0)) {
				setSidebarOpen(!start.sidebarOpen);
			}
		}, { passive: true });
		document.addEventListener("pointercancel", event => {
			if (gesture?.pointerId === event.pointerId) gesture = null;
		}, { passive: true });
	}

	function renderRoute() {
		const route = decodeURIComponent(window.location.hash.slice(1));
		const creature = creaturesById.get(route);
		if (creature) {
			selectCard(creature.id);
			return;
		}
		const item = itemsById.get(route);
		if (item) {
			state.selectedItemId = item.id;
			state.view = "item";
			activeTab = "items";
			renderItemCard(item);
			setActiveTab("items");
			scrollToPageTop();
			updateMiniBackButton();
			return;
		}
		if (route && element("viewRoot").querySelector(`#${CSS.escape(route)}`)) return;
		const [view, elementId] = route.split("/");
		state.view = ["center", "elements", "catalog", "glossary", "items", "map"].includes(view) ? view : "center";
		activeTab = state.view;
		if (state.view === "elements" && elements.some(item => item.id === elementId)) state.elementId = elementId;
		setActiveTab(state.view);
		if (state.view === "elements") renderElements();
		else if (state.view === "catalog") renderCatalog();
		else if (state.view === "glossary") renderGlossary();
		else if (state.view === "items") renderItems();
		else if (state.view === "map") renderMap();
		else renderCenter();
		scrollToPageTop();
		updateMiniBackButton();
	}

	function selectCard(id) {
		const item = creaturesById.get(id);
		if (!item) return false;
		setSidebarOpen(false);
		state.selectedId = item.id;
		state.view = "card";
		state.group = null;
		state.groupsCollapsed = false;
		state.query = "";
		state.pageLimits.list = initialPageSize;
		element("search").value = "";
		renderGroups();
		renderList();
		renderCard(item);
		scrollToPageTop();
		return true;
	}

	window.LENHAN_OPEN_CARD = id => {
		if (!creaturesById.has(id)) return false;
		rememberNavigation();
		if (!selectCard(id)) return false;
		if (window.location.hash !== `#${id}`) window.history.pushState(null, "", `#${id}`);
		return true;
	};

	function loadSearchIndex() {
		if (!archiveAvailable) {
			window.LENHAN_SEARCH_INDEX = [];
			window.LENHAN_SEARCH_INDEX_ERROR = "";
			window.dispatchEvent(new CustomEvent("lenhan:search-index-ready", { detail: [] }));
			return;
		}
		const loadingTask = window.WikiOriLoader?.start("Đang tải dữ liệu tìm kiếm…");
		fetch(`${wikiBasePath}search.txt`, requestOptions)
			.then(response => {
				if (!response.ok) throw new Error(`HTTP ${response.status}`);
				return response.text();
			})
			.then(text => {
				const entries = text.split(/\r?\n/).filter(line => line && !line.startsWith("#")).map(line => {
					const [id, path, title, tag, desc] = line.split("|", 5);
					return { id, url: path, title, tag, desc };
				}).filter(item => item.id && item.url && item.title);
				items.forEach(item => entries.push({
					id: item.id,
					url: `${wikiBasePath}index.html#${item.id}`,
					title: item.name,
					tag: `Vật phẩm · ${item.rarity === "unknown" ? "Chưa rõ phẩm cấp" : item.rarity}`,
					desc: item.note || `Vật phẩm thu được từ ${item.sources[0]?.name || "nguồn chưa rõ"}`
				}));
				glossaryEntries().filter(entry => entry.type === "system").forEach(entry => entries.push({
					id: entry.id,
					url: `${wikiBasePath}home.html#glossary`,
					title: entry.term,
					tag: pageLanguage === "en" ? "System term" : "Thuật ngữ hệ thống",
					desc: entry.definition
				}));
				window.LENHAN_SEARCH_INDEX = entries;
				window.LENHAN_SEARCH_INDEX_ERROR = "";
				window.dispatchEvent(new CustomEvent("lenhan:search-index-ready", { detail: entries }));
			})
			.catch(error => {
				window.LENHAN_SEARCH_INDEX = [];
				window.LENHAN_SEARCH_INDEX_ERROR = error.message;
				element("status").textContent = `Không nạp được search.txt: ${error.message}`;
				window.dispatchEvent(new CustomEvent("lenhan:search-index-ready", { detail: [] }));
			})
			.finally(() => {
				if (loadingTask !== undefined) window.WikiOriLoader?.finish(loadingTask);
			});
	}

	document.addEventListener("click", event => {
		const button = event.target.closest("[data-load-more]");
		if (!button) return;
		const key = button.dataset.loadMore;
		state.pageLimits[key] = pageLimit(key) + pageIncrement;
		if (key === "list") renderList();
		else if (key.startsWith("center:")) renderCenter();
		else if (key === "elements") renderElementResults();
		else if (key === "catalog") renderCatalogResults();
		else if (key === "glossary") renderGlossaryResults();
		else if (key === "items") renderItems();
	});

	element("search").addEventListener("input", event => {
		state.query = event.target.value;
		state.pageLimits.list = initialPageSize;
		renderList();
	});
	element("viewRoot").addEventListener("input", event => {
		if (event.target.id === "elementSearch") {
			state.elementQuery = event.target.value;
			state.pageLimits.elements = initialPageSize;
			renderElementResults();
		} else if (event.target.id === "elementMin" || event.target.id === "elementMax") {
			state.minPercent = Number(element("elementMin").value);
			state.maxPercent = Number(element("elementMax").value);
			if (state.minPercent > state.maxPercent) {
				if (event.target.id === "elementMin") state.maxPercent = state.minPercent;
				else state.minPercent = state.maxPercent;
				element("elementMin").value = state.minPercent;
				element("elementMax").value = state.maxPercent;
			}
			element("rangeOutput").textContent = `${state.minPercent}% đến ${state.maxPercent}%`;
			state.pageLimits.elements = initialPageSize;
			renderElementResults();
		} else if (event.target.id === "catalogSearch") {
			state.catalogQuery = event.target.value;
			state.pageLimits.catalog = initialPageSize;
			renderCatalogResults();
		} else if (event.target.id === "glossarySearch") {
			state.glossaryQuery = event.target.value;
			state.pageLimits.glossary = initialPageSize;
			renderGlossaryResults();
		} else if (event.target.id === "itemIdSearch") {
			state.itemIdQuery = event.target.value;
			state.pageLimits.items = initialPageSize;
			renderItems();
		} else if (event.target.id === "itemNameSearch") {
			state.itemNameQuery = event.target.value;
			state.pageLimits.items = initialPageSize;
			renderItems();
		} else if (event.target.matches("[data-sim-value]")) {
			const value = Number(event.target.value);
			if (Number.isFinite(value)) {
				state.simulationValues[event.target.dataset.simValue] = Math.max(-500, Math.min(100, value));
				state.simulationApplied = false;
				element("applySimulation").disabled = state.simulationElementIds.length === 0;
				element("resetSimulation").disabled = true;
				renderSimulationOutput();
			}
		}
	});
	element("viewRoot").addEventListener("change", event => {
		if (event.target.id === "itemRank") {
			state.itemRank = event.target.value;
			state.pageLimits.items = initialPageSize;
			renderItems();
		} else if (event.target.id === "elementSelect") {
			state.elementId = event.target.value;
			state.pageLimits.elements = initialPageSize;
			renderElementResults();
		} else if (event.target.id === "includeUnknown") {
			state.includeUnknown = event.target.checked;
			state.pageLimits.elements = initialPageSize;
			renderElementResults();
		} else if (event.target.id === "catalogGroup") {
			rememberNavigation();
			state.catalogGroup = event.target.value;
			state.pageLimits.catalog = initialPageSize;
			renderCatalogResults();
		} else if (event.target.id === "catalogSpecies") {
			rememberNavigation();
			state.catalogSpecies = event.target.value;
			state.pageLimits.catalog = initialPageSize;
			renderCatalogResults();
		} else if (event.target.id === "glossaryCreature") {
			state.glossaryCreatureId = event.target.value;
			state.pageLimits.glossary = initialPageSize;
			renderGlossaryResults();
		} else if (event.target.id === "glossaryType") {
			state.glossaryType = event.target.value;
			state.pageLimits.glossary = initialPageSize;
			renderGlossaryResults();
		} else if (event.target.id === "glossaryTerm") {
			state.glossaryTerm = event.target.value;
			state.pageLimits.glossary = initialPageSize;
			renderGlossaryResults();
		} else if (event.target.id === "catalogTagAdd" && event.target.value) {
			rememberNavigation();
			if (!state.catalogTags.includes(event.target.value)) state.catalogTags.push(event.target.value);
			renderCatalog();
		} else if (event.target.id === "simulationCreature") {
			state.simulationCreatureId = event.target.value;
			state.simulationApplied = false;
			const creature = simulationCreature();
			const base = creature ? parseAffinities(creature) : {};
			state.simulationElementIds.forEach(id => { state.simulationValues[id] = base[id] ?? 0; });
			renderElements();
		} else if (event.target.id === "simulationAddElement" && event.target.value) {
			const id = event.target.value;
			state.simulationApplied = false;
			if (!state.simulationElementIds.includes(id)) {
				state.simulationElementIds.push(id);
				initializeSimulationValue(id);
			}
			renderElements();
		} else if (event.target.matches("[data-sim-value]")) {
			const id = event.target.dataset.simValue;
			state.simulationValues[id] = Math.round(Math.max(-500, Math.min(100, Number(event.target.value) || 0)) / 10) * 10;
			state.simulationApplied = false;
			renderElements();
		}
	});
	element("viewRoot").addEventListener("click", event => {
		const routeLink = event.target.closest('a[href^="#"]');
		if (routeLink) {
			const destination = routeLink.getAttribute("href").slice(1);
			if (itemsById.has(destination) || destination === "items") rememberNavigation("items");
			else if (creaturesById.has(destination)) rememberNavigation();
		}
		const toggleElement = event.target.closest("[data-sim-toggle]");
		if (toggleElement) {
			const id = toggleElement.dataset.simToggle;
			state.simulationApplied = false;
			if (state.simulationElementIds.includes(id)) state.simulationElementIds = state.simulationElementIds.filter(selected => selected !== id);
			else {
				state.simulationElementIds.push(id);
				initializeSimulationValue(id);
			}
			renderElements();
			return;
		}
		const stepButton = event.target.closest("[data-sim-step]");
		if (stepButton) {
			const id = stepButton.dataset.simStep;
			state.simulationValues[id] = Math.max(-500, Math.min(100, (state.simulationValues[id] || 0) + Number(stepButton.dataset.step)));
			state.simulationApplied = false;
			renderElements();
			return;
		}
		const removeElement = event.target.closest("[data-sim-remove]");
		if (removeElement) {
			const id = removeElement.dataset.simRemove;
			state.simulationApplied = false;
			state.simulationElementIds = state.simulationElementIds.filter(selected => selected !== id);
			delete state.simulationValues[id];
			renderElements();
			return;
		}
		if (event.target.id === "applySimulation") {
			state.simulationApplied = true;
			renderSimulationOutput();
			element("applySimulation").disabled = true;
			element("resetSimulation").disabled = false;
			return;
		}
		if (event.target.id === "resetSimulation") {
			state.simulationApplied = false;
			const creature = simulationCreature();
			const base = creature ? parseAffinities(creature) : {};
			state.simulationElementIds.forEach(id => { state.simulationValues[id] = base[id] ?? 0; });
			renderElements();
			return;
		}
		if (event.target.id === "clearCatalogTags") {
			rememberNavigation();
			state.catalogTags = [];
			state.pageLimits.catalog = initialPageSize;
			renderCatalog();
			return;
		}
		const removeTag = event.target.closest("[data-remove-tag]");
		if (removeTag) {
			rememberNavigation();
			state.catalogTags = state.catalogTags.filter(tag => tag !== removeTag.dataset.removeTag);
			state.pageLimits.catalog = initialPageSize;
			renderCatalog();
			return;
		}
		const tagButton = event.target.closest("[data-tag-filter]");
		if (!tagButton) return;
		rememberNavigation();
		if (!state.catalogTags.includes(tagButton.dataset.tagFilter)) state.catalogTags.push(tagButton.dataset.tagFilter);
		state.pageLimits.catalog = initialPageSize;
		renderCatalog();
	});
	element("sidebarOpenButton").addEventListener("click", () => setSidebarOpen(true));
	setupSidebarSwipe();
	element("browseToggle").addEventListener("click", () => {
		state.groupsCollapsed = !state.groupsCollapsed;
		renderGroups();
	});
	element("sidebarBackdrop").addEventListener("click", () => setSidebarOpen(false));
	document.addEventListener("keydown", event => {
		if (event.key === "Escape" && document.querySelector(".sidebar").classList.contains("is-open")) setSidebarOpen(false);
	});
	element("groups").addEventListener("click", event => {
		const button = event.target.closest("[data-group]");
		if (!button) return;
		rememberNavigation();
		const index = Number(button.dataset.group);
		state.pageLimits.list = initialPageSize;
		if (state.group === index) {
			state.group = null;
			state.groupsCollapsed = false;
		} else {
			state.group = index;
			state.groupsCollapsed = true;
		}
		renderGroups();
		renderList();
	});
	element("list").addEventListener("click", event => {
		if (event.target.closest("[data-entry]")) {
			const link = event.target.closest("[data-entry]");
			rememberNavigation();
			state.selectedId = link.dataset.entry;
		}
	});
	window.addEventListener("hashchange", renderRoute);

	setupMiniActions();
	renderGroups();
	renderList();
	if (!archiveAvailable) {
		element("status").textContent = "Không tìm thấy dữ liệu lưu trữ.";
		element("viewRoot").innerHTML = '<div class="empty"><h2>Không nạp được kho sinh vật</h2><p>Hãy kiểm tra tệp data.txt trong cùng thư mục với trang này.</p></div>';
	} else {
		element("status").textContent = pageLanguage === "en"
			? `${creatures.length} cards · ${creatures.filter(item => item.details).length} detailed profiles.`
			: `${creatures.length} card · ${creatures.filter(item => item.details).length} hồ sơ chi tiết.`;
		renderRoute();
	}
	loadSearchIndex();
	}

	const dataFile = `${wikiBasePath}${pageLanguage === "en" ? "data_en.txt" : "data.txt"}`;
	const languageSelect = document.getElementById("languageSelect");
	if (languageSelect) {
		languageSelect.value = pageLanguage;
		languageSelect.addEventListener("change", () => {
			const url = new URL(window.location.href);
			if (languageSelect.value === "en") url.searchParams.set("lang", "en");
			else url.searchParams.delete("lang");
			window.location.assign(url);
		});
	}
	applyStaticLanguage();

	function validateCatalog(catalog, file) {
		if (!Array.isArray(catalog)) throw new Error(`${file} must contain an array of creature records.`);
		const ids = new Set();
		for (const creature of catalog) {
			if (!creature || typeof creature.id !== "string" || ids.has(creature.id)) {
				throw new Error(`${file} contains an invalid record or duplicate ID.`);
			}
			ids.add(creature.id);
		}
		return catalog;
	}

	function loadSystemTerms() {
		const termsUrl = new URL(`GY/${pageLanguage}.txt`, wikiBasePath);
		return fetch(termsUrl, requestOptions)
			.then(response => {
				if (!response.ok) throw new Error(`HTTP ${response.status}`);
				return response.text();
			})
			.then(text => {
				const entries = text.split(/\r?\n/)
					.filter(line => line.trim() && !line.startsWith("#"))
					.map((line, index) => {
						const fields = line.split("\t");
						if (fields.length !== 3 || fields.some(field => !field.trim())) {
							throw new Error(`Invalid terminology row ${index + 1} in ${termsUrl.href}`);
						}
						const [id, term, definition] = fields.map(field => field.trim());
						return { id, term, definition };
					});
				const ids = new Set(entries.map(entry => entry.id));
				if (!entries.length || ids.size !== entries.length) {
					throw new Error(`Empty or duplicate terminology IDs in ${termsUrl.href}`);
				}
				return entries.map(({ id, term, definition }) => ({
					id,
					type: "system",
					name: pageLanguage === "en" ? "System" : "Hệ thống",
					category: pageLanguage === "en" ? "System" : "Hệ thống",
					term,
					definition,
					value: definition
				}));
			});
	}

	function loadItemCatalog() {
		const itemsUrl = new URL(`item/${pageLanguage}.txt`, wikiBasePath);
		return fetch(itemsUrl, requestOptions)
			.then(response => {
				if (!response.ok) throw new Error(`HTTP ${response.status}`);
				return response.json();
			})
			.then(catalog => {
				if (!Array.isArray(catalog) || catalog.length !== items.length) {
					throw new Error(`Expected ${items.length} item records in ${itemsUrl.href}`);
				}
				const ids = new Set();
				for (const item of catalog) {
					if (!item || typeof item.id !== "string" || ids.has(item.id) ||
						typeof item.rawName !== "string" || typeof item.name !== "string" ||
						!Array.isArray(item.sources) || !item.sources.length) {
						throw new Error(`Invalid item record or duplicate ID in ${itemsUrl.href}`);
					}
					ids.add(item.id);
				}
				if (catalog.some((item, index) => item.id !== items[index].id)) {
					throw new Error(`Item IDs or ordering do not match the creature catalog in ${itemsUrl.href}`);
				}
				return catalog;
			});
	}

	function initializeCatalogWithTerms(catalog) {
		const terms = loadSystemTerms().catch(error => {
				const termsUrl = new URL(`GY/${pageLanguage}.txt`, wikiBasePath);
				console.error(`Could not load system terminology from ${termsUrl.href}:`, error);
				const status = document.getElementById("status");
				if (status) status.textContent = pageLanguage === "en"
					? `Could not load terminology from ${termsUrl.pathname}; using built-in terms. ${error.message}`
					: `Không tải được thuật ngữ từ ${termsUrl.pathname}; đang dùng thuật ngữ dự phòng. ${error.message}`;
				return null;
			});
		const savedItems = loadItemCatalog().catch(error => {
			const itemsUrl = new URL(`item/${pageLanguage}.txt`, wikiBasePath);
			console.error(`Could not load item catalog from ${itemsUrl.href}:`, error);
			const status = document.getElementById("status");
			if (status) status.textContent = pageLanguage === "en"
				? `Could not load items from ${itemsUrl.pathname}; using generated items. ${error.message}`
				: `Không tải được vật phẩm từ ${itemsUrl.pathname}; đang dùng danh mục tạo từ hồ sơ. ${error.message}`;
			return null;
		});
		Promise.all([terms, savedItems]).then(([systemTerms, itemCatalog]) => {
			if (itemCatalog) setItemCatalog(itemCatalog);
			initializeCatalog(systemTerms || []);
		});
	}

	function showCatalogError(file, error) {
		console.error(`Không thể tải danh mục sinh vật từ ${file}:`, error);
		const status = document.getElementById("status");
		const viewRoot = document.getElementById("viewRoot");
		if (status) status.textContent = pageLanguage === "en"
			? `Could not load ${file}: ${error.message}`
			: `Không tải được ${file}: ${error.message}`;
		if (viewRoot) viewRoot.innerHTML = pageLanguage === "en"
			? `<div class="empty"><h2>Could not load the bestiary</h2><p>Check that ${file} is in the same folder as this page.</p></div>`
			: `<div class="empty"><h2>Không nạp được kho sinh vật</h2><p>Hãy kiểm tra tệp ${file.split("/").pop()} trong thư mục của trang này.</p></div>`;
	}

	fetch(dataFile, requestOptions)
		.then(response => {
			if (!response.ok) throw new Error(`HTTP ${response.status}`);
			return response.json();
		})
		.then(catalog => validateCatalog(catalog, dataFile))
		.then(catalog => {
			window.LENHAN_CREATURES = catalog;
			initializeCatalogWithTerms(catalog);
		})
		.catch(error => {
			if (pageLanguage !== "en") {
				showCatalogError(dataFile, error);
				return;
			}
			console.error(`English catalog unavailable; falling back to Vietnamese data: ${dataFile}`, error);
			const fallbackFile = `${wikiBasePath}data.txt`;
			fetch(fallbackFile, requestOptions)
				.then(response => {
					if (!response.ok) throw new Error(`HTTP ${response.status}`);
					return response.json();
				})
				.then(catalog => validateCatalog(catalog, fallbackFile))
				.then(catalog => {
					window.LENHAN_CREATURES = catalog;
					initializeCatalogWithTerms(catalog);
				})
				.catch(fallbackError => showCatalogError(fallbackFile, fallbackError));
		});

	function applyStaticLanguage() {
		const labels = pageLanguage === "en" ? {
			title: "Creature Bestiary | Lenhan",
			brand: "CREATURE BESTIARY",
			brandDescription: "Creature profiles · Lenhan",
			filter: "Filter creatures by name, description, or habitat...",
			filterLabel: "Filter creature list",
			searchLabel: "Search creature profiles",
			loading: "Loading data...",
			groupTitle: "Browse records",
			collapseGroups: "Hide creature groups",
			openCatalog: "Open creature catalog",
			closeCatalog: "Close creature catalog",
			navigation: "Bestiary navigation",
			tabs: { center: "Home", elements: "Elements", catalog: "Catalog", glossary: "Glossary", items: "Items", map: "Map" },
			searchDialog: "Search creatures",
			searchPlaceholder: "Search creatures in search.txt...",
			closeSearch: "Close search",
			themeTitle: "Choose a theme",
			themeSearch: "Search themes by name...",
			closeTheme: "Close theme picker",
			themeShortcut: "Shortcut: Ctrl + Alt + L"
		} : {
			title: "Bách khoa Dị thể | Lenhan",
			brand: "BÁCH KHOA DỊ THỂ",
			brandDescription: "Hồ sơ sinh vật · Lenhan",
			filter: "Lọc theo tên, mô tả hoặc môi trường sống...",
			filterLabel: "Lọc danh sách sinh vật",
			searchLabel: "Tìm kiếm hồ sơ sinh vật",
			loading: "Đang nạp dữ liệu...",
			groupTitle: "Phân loại hồ sơ",
			collapseGroups: "Ẩn các nhóm hồ sơ",
			openCatalog: "Mở danh mục",
			closeCatalog: "Đóng danh mục",
			navigation: "Điều hướng bách khoa",
			tabs: { center: "Trung tâm", elements: "Trang nguyên tố", catalog: "Mục lục", glossary: "Thuật ngữ", items: "Vật phẩm", map: "Bản đồ" },
			searchDialog: "Tìm sinh vật",
			searchPlaceholder: "Tìm sinh vật trong search.txt...",
			closeSearch: "Đóng tìm kiếm",
			themeTitle: "Chọn chủ đề",
			themeSearch: "Tìm chủ đề theo tên…",
			closeTheme: "Đóng chọn chủ đề",
			themeShortcut: "Phím tắt: Ctrl + Alt + L"
		};
		document.title = labels.title;
		const setText = (selector, value) => {
			const target = document.querySelector(selector);
			if (target) target.textContent = value;
		};
		const setAttribute = (selector, attribute, value) => {
			const target = document.querySelector(selector);
			if (target) target.setAttribute(attribute, value);
		};
		setText(".brand h1", labels.brand);
		setText(".brand p", labels.brandDescription);
		setText("#status", labels.loading);
		setText("#groupTitleText", labels.groupTitle);
		setText("#themePickerTitle", labels.themeTitle);
		setText(".theme-picker-shortcut", labels.themeShortcut);
		const filter = document.getElementById("search");
		if (filter) filter.placeholder = labels.filter;
		setAttribute("#search", "aria-label", labels.filterLabel);
		setAttribute("#searchBtn", "aria-label", labels.searchLabel);
		setAttribute("#browseToggle", "aria-label", labels.collapseGroups);
		setAttribute("#browseToggle", "title", labels.collapseGroups);
		setAttribute("#sidebarOpenButton", "aria-label", labels.openCatalog);
		setAttribute("#sidebarOpenButton", "title", labels.openCatalog);
		setAttribute("#sidebarBackdrop", "aria-label", labels.closeCatalog);
		setAttribute(".wiki-nav", "aria-label", labels.navigation);
		setAttribute("#searchOverlay", "aria-label", labels.searchDialog);
		setAttribute("#searchClose", "aria-label", labels.closeSearch);
		setAttribute("#themePickerClose", "aria-label", labels.closeTheme);
		const searchInput = document.getElementById("searchInput");
		if (searchInput) searchInput.placeholder = labels.searchPlaceholder;
		const themeSearch = document.getElementById("themePickerSearch");
		if (themeSearch) themeSearch.placeholder = labels.themeSearch;
		document.querySelectorAll(".wiki-tab[data-view]").forEach(tab => {
			const label = labels.tabs[tab.dataset.view];
			const labelElement = tab.querySelector(".wiki-tab-label");
			if (label && labelElement) labelElement.textContent = label;
		});
		const themeButton = document.getElementById("themeToggle");
		const theme = window.LenhanThemes?.current();
		if (themeButton && theme) themeButton.textContent = `${pageLanguage === "en" ? "Theme" : "Chủ đề"}: ${theme.name}`;
		window.dispatchEvent(new CustomEvent("lenhan:language-change", { detail: pageLanguage }));
	}
})();
