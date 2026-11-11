(() => {
	const baseUrl = new URL(".", document.currentScript.src);
	const elementUrls = {
		vi: new URL("ES/vn.txt", baseUrl),
		en: new URL("ES/en.txt", baseUrl)
	};
	const requestOptions = window.OriciinWikiSettings?.requestOptions || { cache: "no-store" };
	let elementIndexPromise = null;
	let elementsByLanguage = { vi: new Map(), en: new Map() };

	function loadElementIndex() {
		if (!elementIndexPromise) {
			elementIndexPromise = Promise.all(Object.entries(elementUrls).map(async ([language, url]) => {
				const response = await fetch(url, requestOptions);
				if (!response.ok) throw new Error(`Could not load ${language} element data: HTTP ${response.status}`);
				const records = await response.json();
				if (!Array.isArray(records) || !records.length) {
					throw new Error(`${language} element data must be a non-empty array.`);
				}
				const index = new Map();
				for (const record of records) {
					if (!record || typeof record.id !== "string" || !record.id.trim() || index.has(record.id) ||
						typeof record.label !== "string" || !record.label.trim() ||
						typeof record.formLabel !== "string" || !record.formLabel.trim() ||
						!Array.isArray(record.aliases) || !record.aliases.length ||
						record.aliases.some(alias => typeof alias !== "string" || !alias.trim())) {
						throw new Error(`${language} element data contains an invalid record or duplicate ID.`);
					}
					index.set(record.id, record);
				}
				return [language, index];
			})).then(entries => {
				const indexes = Object.fromEntries(entries);
				const viIds = [...indexes.vi.keys()];
				if (indexes.en.size !== indexes.vi.size || viIds.some(id => !indexes.en.has(id))) {
					throw new Error("Vietnamese and English element records do not have matching IDs.");
				}
				elementsByLanguage = indexes;
				return indexes;
			}).catch(error => {
				elementIndexPromise = null;
				throw error;
			});
		}
		return elementIndexPromise;
	}

	function idElement(id, language = "vi") {
		return elementsByLanguage[language]?.get(id) || null;
	}

	window.loadElementIndex = loadElementIndex;
	window.idElement = idElement;
})();
