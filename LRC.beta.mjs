export default class LRCs {
	static name = "LRC";
	static version = "0.5.4";
	static about = () => console.log(`\n🟧 ${this.name} v${this.version}\n`);

	static toSpotify(lrc = "", options = { lineBreak: "\n" }) {
		console.log(`☑️ LRC.toSpotify`, "");
		let lyric = lrc?.split?.(options.lineBreak)?.filter?.(Boolean)?.map?.(line => {
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
		//console.log(`✅ LRC.toSpotify, lyric: ${JSON.stringify(lyric)}`, "");
		return lyric;
	};

	static fromSpotify(lyric = []) {
		console.log(`☑️ LRC.fromSpotify`, "");
	};

	static combineSpotify(lyric1 = [], lyric2 = [], options = { tolerance: 1000 }) {
		console.log(`☑️ LRC.combineSpotify`, "");
		let index1 = 0, index2 = 0;
		const length1 = lyric1.length, length2 = lyric2.length;
		while (index1 < length1 && index2 < length2) {
			console.log(`🚧 调试信息, index1/length1: ${index1}/${length1}, index2/length2: ${index2}/${length2}`, "");
			const timeStamp1 = lyric1[index1].startTimeMs, timeStamp2 = lyric2[index2].startTimeMs;
			console.log(`🚧 调试信息, timeStamp1: ${timeStamp1}, timeStamp2: ${timeStamp2}`, "");
			if (timeStamp1 === timeStamp2) lyric1[index1].twords = lyric2[index2]?.words ?? "";
			else if (Math.abs(timeStamp1 - timeStamp2) <= options.tolerance) lyric1[index1].twords = lyric2[index2]?.words ?? "";
			if (timeStamp2 > timeStamp1) index1++
			else if (timeStamp2 < timeStamp1) index2++
			else { index1++; index2++ };
		};
		console.log(`✅ LRC.combineSpotify, combineLyric: ${JSON.stringify(lyric1)}`, "");
		return lyric1;
	};

	static separateSpotify(lyric = []) {
		console.log(`☑️ LRC.separateSpotify`, "");
		let separateLyric = lyric.map(line => {
			let line1 = {
				"startTimeMs": line.startTimeMs.toString(),
				"words": line?.words ?? "",
				"syllables": line?.syllables ?? [],
				"endTimeMs": "0"
			};
			let line2 = {
				"startTimeMs": line.startTimeMs.toString(),
				"words": line?.twords ?? "",
				"syllables": [],
				"endTimeMs": "0"
			};
			return [line1, line2];
		}).flat(Infinity);
		//console.log(`✅ LRC.separateSpotify, separateLyric: ${JSON.stringify(separateLyric)}`, "");
		return separateLyric;
	};
}
