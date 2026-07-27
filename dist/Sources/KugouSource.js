"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.KugouSource = void 0;
const BaseSource_1 = require("./BaseSource");
const KG_RE = /\[(\d\d):((\d\d)\.(\d\d?\d?))]/;
const JUNK_RE = /^\s*(作词|作曲|编曲|制作人|录音|混音|母带|出品|发行|OP|SP|制作)\s*[：:]|^\s*\[(verse|chorus|bridge|intro|outro|hook|pre-chorus|refrain|interlude|drop|build|break|skit|spoken|rap|instrumental|ad.?lib)\s*\d*\]\s*$/iu;
const HEADERS = { "User-Agent": "Mozilla/5.0" };
class KugouSource extends BaseSource_1.BaseSource {
    searchCandidates(name, artist) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            const r = yield fetch(`http://mobilecdn.kugou.com/api/v3/search/song?format=json&keyword=${encodeURIComponent(`${artist} ${name}`)}&page=1&pagesize=5`, { headers: HEADERS });
            const j = yield r.json();
            const info = (_a = j === null || j === void 0 ? void 0 : j.data) === null || _a === void 0 ? void 0 : _a.info;
            if (!(info === null || info === void 0 ? void 0 : info.length))
                throw new Error("Kugou: song not found");
            return info;
        });
    }
    pickHash(name, artist) {
        return __awaiter(this, void 0, void 0, function* () {
            const info = yield this.searchCandidates(name, artist);
            return info[0].hash;
        });
    }
    getLyrics(name, artist) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            const hash = yield this.pickHash(name, artist);
            const sr = yield fetch(`https://krcs.kugou.com/search?ver=1&man=yes&client=mobi&hash=${hash}`, { headers: HEADERS });
            const sj = yield sr.json();
            const cand = (_a = sj === null || sj === void 0 ? void 0 : sj.candidates) === null || _a === void 0 ? void 0 : _a[0];
            if (!cand)
                throw new Error("Kugou: no lyric candidate");
            const dr = yield fetch(`https://lyrics.kugou.com/download?ver=1&client=pc&id=${cand.id}&accesskey=${cand.accesskey}&fmt=lrc&charset=utf8`, { headers: HEADERS });
            const dj = yield dr.json();
            if (!(dj === null || dj === void 0 ? void 0 : dj.content))
                throw new Error("Kugou: empty lyric content");
            let text = dj.content;
            // content is usually base64; decode only if it looks like base64 (not already plain LRC)
            if (!/^\s*\[/.test(text)) {
                try {
                    text = Buffer.from(text, "base64").toString("utf8");
                }
                catch (_b) { }
            }
            if (!/^\s*\[/.test(text))
                throw new Error("Kugou: unrecognized lyric format");
            return this.parseLyrics(text);
        });
    }
    parseLyrics(lyrics) {
        const lines = [];
        for (let line of lyrics.split("\n")) {
            if (!line || JUNK_RE.test(line))
                continue;
            const times = [];
            for (let m = line.match(KG_RE); m; m = line.match(KG_RE)) {
                times.push((60 * +m[1] + +m[3]) * 1000 + (m[4] ? parseInt(String(m[4]).padEnd(3, "0")) : 0));
                line = line.replace(KG_RE, "");
            }
            if (!times.length)
                continue;
            const text = line.trim();
            if (text)
                for (const time of times)
                    lines.push({ time, text });
        }
        return { lines: lines.sort((a, b) => a.time - b.time) };
    }
    getAppName() {
        return "Kugou";
    }
}
exports.KugouSource = KugouSource;
