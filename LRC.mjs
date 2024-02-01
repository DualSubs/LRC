export default class LRCs {
	constructor(opts) {
		this.name = "LRC v0.4.0";
		this.opts = opts;
		this.newLine = "\n";
	};

	toSpotify(txt = new String) {
		console.log(`☑️ LRC.toSpotify`, "");
		let json = txt?.split?.(this.newLine)?.filter?.(Boolean)?.map?.(line => {
			const Line = {
				"startTimeMs": 0,
				"words": "",
				"syllables": [],
				"endTimeMs": 0
			};
			switch (line?.trim?.()?.substring?.(0, 1)) {
				case "{":
					line = JSON.parse(line);
					//console.log(`🚧 调试信息, line: ${JSON.stringify(line)}`, "");
					Line.startTimeMs = (line.t < 0) ? 0 : line.t;
					Line.words = line?.c?.map?.(word => word.tx).join("");
					break;
				case "[":
					const LineRegex = /^\[(?:(?<startTimeMs>(\d\d:\d\d\.\d\d\d?|\d+,\d+))|(?<tag>\w+:.*))\](?<words>.*)?/;
					const SyllableRegex = /\((?<startTimeMs>\d+),\d+,\d+\)/g;
					line = line.match(LineRegex)?.groups;
					if (line?.startTimeMs?.includes(":")) {
						Line.startTimeMs = (line?.startTimeMs ?? "0:0").split(":");
						Line.startTimeMs = Math.round((parseInt(Line.startTimeMs[0], 10) * 60 + parseFloat(Line.startTimeMs[1], 10)) * 1000);
						if (Line.startTimeMs < 0) Line.startTimeMs = 0;
					} else if (line?.startTimeMs?.includes(",")) Line.startTimeMs = parseInt(line?.startTimeMs?.split(",")?.[0], 10);
					if (SyllableRegex.test(line?.words)) {
						let index = 0, syllablesArray = [], syllablesOriginArray = line?.words?.split(SyllableRegex);
						syllablesOriginArray.shift();
						while (index < syllablesOriginArray.length) syllablesArray.push(syllablesOriginArray.slice(index, index += 2));
						syllablesArray.forEach((syllables) => {
							Line.words += syllables[1];
							let syllable = {
								"startTimeMs": parseInt(syllables[0], 10),
								"numChars": syllables[1].length
							};
							Line.syllables.push(syllable);
						});
					} else Line.words = line?.words?.decodeHTML?.() ?? "";
					break;
			};
			return Line;
		});
		//console.log(`✅ LRC.toSpotify, json: ${JSON.stringify(json)}`, "");
		return json;
	};

	fromSpotify(json = new Array) {
		console.log(`☑️ LRC.fromSpotify`, "");
	};

	combineSpotify(array1 = new Array, array2 = new Array) {
		console.log(`☑️ LRC.combineSpotify`, "");
		let combineLyric = [];
		for (let line1 of array1) {
			let line = line1;
			for (let line2 of array2) {
				if (Math.abs(line1.startTimeMs - line2.startTimeMs) < 1000) {
					line = {
						"startTimeMs": line1.startTimeMs,
						"words": line1?.words ?? "",
						"twords": line2?.words ?? "",
						"syllables": line1?.syllables ?? [],
						"endTimeMs": 0
					};
					break;
				};
			};
			combineLyric.push(line);
		};
		//console.log(`✅ LRC.combineSpotify, combineLyric: ${JSON.stringify(combineLyric)}`, "");
		return combineLyric;
	};

	separateSpotify(array = new Array) {
		console.log(`☑️ LRC.separateSpotify`, "");
		let separateLyric = array.map(line => {
			let line1 = {
				"startTimeMs": line.startTimeMs,
				"words": line?.words ?? "",
				"syllables": line?.syllables ?? [],
				"endTimeMs": 0
			};
			let line2 = {
				"startTimeMs": line.startTimeMs + 100,
				"words": line?.twords ?? "",
				"syllables": [],
				"endTimeMs": 0
			};
			return [line1, line2];
		}).flat(Infinity);
		//console.log(`✅ LRC.separateSpotify, separateLyric: ${JSON.stringify(separateLyric)}`, "");
		return separateLyric;
	};
}
