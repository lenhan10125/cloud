(() => {
	const baseUrl = new URL(".", document.currentScript.src);
	const habitatUrls = {
		vi: new URL("habitat/vn.txt", baseUrl),
		en: new URL("habitat/en.txt", baseUrl)
	};
	const requestOptions = window.OriciinWikiSettings?.requestOptions || { cache: "no-store" };
	let habitatIndexPromise = null;
	let habitatsByLanguage = { vi: new Map(), en: new Map() };

	function loadHabitatIndex() {
		if (!habitatIndexPromise) {
			habitatIndexPromise = Promise.all(Object.entries(habitatUrls).map(async ([language, url]) => {
				const response = await fetch(url, requestOptions);
				if (!response.ok) throw new Error(`Could not load ${language} habitat data: HTTP ${response.status}`);
				const records = await response.json();
				if (!Array.isArray(records) || !records.length) {
					throw new Error(`${language} habitat data must be a non-empty array.`);
				}
				const index = new Map();
				for (const record of records) {
					if (!record || typeof record.id !== "string" || index.has(record.id) ||
						typeof record.habitat !== "string" || !record.habitat.trim()) {
						throw new Error(`${language} habitat data contains an invalid record or duplicate ID.`);
					}
					index.set(record.id, record.habitat);
				}
				return [language, index];
			})).then(entries => {
				const indexes = Object.fromEntries(entries);
				const viIds = [...indexes.vi.keys()];
				if (indexes.en.size !== indexes.vi.size ||
					viIds.some(id => !indexes.en.has(id))) {
					throw new Error("Vietnamese and English habitat records do not have matching IDs.");
				}
				habitatsByLanguage = indexes;
				return indexes;
			}).catch(error => {
				habitatIndexPromise = null;
				throw error;
			});
		}
		return habitatIndexPromise;
	}

	function idHabitat(id, language = "vi") {
		return habitatsByLanguage[language]?.get(id) || "";
	}

	window.loadHabitatIndex = loadHabitatIndex;
	window.idHabitat = idHabitat;
})();
