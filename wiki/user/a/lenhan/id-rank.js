(() => {
	const rankUrl = new URL("RK/rank.txt", document.currentScript.src);
	const requestOptions = window.OriciinWikiSettings?.requestOptions || { cache: "no-store" };
	let rankIndexPromise = null;
	let ranksById = new Map();
	let rankBands = [];

	function loadRankIndex() {
		if (!rankIndexPromise) {
			rankIndexPromise = fetch(rankUrl, requestOptions)
				.then(response => {
					if (!response.ok) throw new Error(`Could not load rank data: HTTP ${response.status}`);
					return response.json();
				})
				.then(payload => {
					const records = Array.isArray(payload) ? payload : payload?.creatures;
					const bands = Array.isArray(payload?.rankBands) ? payload.rankBands : [];
					if (!Array.isArray(records) || !records.length) {
						throw new Error("Rank data must be a non-empty array.");
					}
					if (bands.some(band => !band || typeof band.rank !== "string" ||
						!Number.isInteger(band.levelMin) ||
						(band.levelMax !== null && !Number.isInteger(band.levelMax)) ||
						typeof band.worldTier !== "string")) {
						throw new Error("Rank data contains an invalid rank-level band.");
					}
					const index = new Map();
					for (const record of records) {
						if (!record || typeof record.id !== "string" || index.has(record.id) ||
							["rank", "rankEn", "recommendedLevel", "recommendedLevelEn"]
								.some(field => typeof record[field] !== "string")) {
							throw new Error("Rank data contains an invalid record or duplicate ID.");
						}
						index.set(record.id, record);
					}
					ranksById = index;
					rankBands = bands;
					return index;
				})
				.catch(error => {
					rankIndexPromise = null;
					throw error;
				});
		}
		return rankIndexPromise;
	}

	async function loadRankBands() {
		await loadRankIndex();
		return rankBands;
	}

	function idRank(id) {
		return ranksById.get(id) || null;
	}

	window.loadRankIndex = loadRankIndex;
	window.loadRankBands = loadRankBands;
	window.idRank = idRank;
})();
