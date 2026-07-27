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
exports.GeniusSource = void 0;
const BaseSource_1 = require("./BaseSource");
// Genius scraper — no API key required.
// 1. Search Genius for the track to get the song page URL.
// 2. Fetch the song page and extract plain-text lyrics from data-lyrics-container divs.
// 3. Genius lyrics aren't time-synced, so we fake timestamps by spacing lines out evenly.
//    This means Genius results will drift out of sync with playback over a long song -
//    it's a fallback source, not a replacement for a synced one.
const SEARCH_URL = "https://genius.com/api/search/song?q=";
const LINE_DURATION_MS = 4000; // approx ms per line for fake timestamps
class GeniusSource extends BaseSource_1.BaseSource {
    getLyrics(name, artist) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b, _c, _d, _e;
            var _f;
            const query = encodeURIComponent(`${name} ${artist}`);
            const searchRes = yield fetch(SEARCH_URL + query, {
                headers: { "User-Agent": "Mozilla/5.0", "Accept": "application/json" }
            });
            if (!searchRes.ok)
                throw new Error(`Genius search HTTP ${searchRes.status}`);
            const searchJson = yield searchRes.json();
            const hits = (_f = (_c = (_b = (_a = searchJson === null || searchJson === void 0 ? void 0 : searchJson.response) === null || _a === void 0 ? void 0 : _a.sections) === null || _b === void 0 ? void 0 : _b[0]) === null || _c === void 0 ? void 0 : _c.hits) !== null && _f !== void 0 ? _f : [];
            if (!hits.length)
                throw new Error("Genius: no search results");
            // Pick best match - prefer a result where the artist name actually matches.
            const artistLower = artist.toLowerCase();
            const nameLower = name.toLowerCase();
            let best = hits[0];
            for (const hit of hits) {
                const r = hit.result;
                if (!r)
                    continue;
                const ra = (r.artist_names || ((_d = r.primary_artist) === null || _d === void 0 ? void 0 : _d.name) || "").toLowerCase();
                const rt = (r.title || r.full_title || "").toLowerCase();
                if (ra.includes(artistLower) && rt.includes(nameLower)) {
                    best = hit;
                    break;
                }
            }
            const pageUrl = (_e = best === null || best === void 0 ? void 0 : best.result) === null || _e === void 0 ? void 0 : _e.url;
            if (!pageUrl)
                throw new Error("Genius: no page URL in result");
            const pageRes = yield fetch(pageUrl, {
                headers: { "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36" }
            });
            if (!pageRes.ok)
                throw new Error(`Genius page HTTP ${pageRes.status}`);
            const html = yield pageRes.text();
            const lines = this.extractLines(html);
            if (!lines.length)
                throw new Error("Genius: no lyrics extracted");
            return { lines };
        });
    }
    extractLines(html) {
        const lines = [];
        let time = 0;
        // Depth-counting to find the balanced closing </div> - avoids truncation on nested divs.
        const openRe = /data-lyrics-container="true"[^>]*>/g;
        let m;
        while ((m = openRe.exec(html)) !== null) {
            const start = m.index + m[0].length;
            let depth = 1;
            let i = start;
            while (depth > 0 && i < html.length) {
                const o = html.indexOf("<div", i);
                const c = html.indexOf("</div>", i);
                if (c === -1)
                    break;
                if (o !== -1 && o < c && /[\s>]/.test(html[o + 4] || "")) {
                    depth++;
                    i = o + 4;
                }
                else {
                    depth--;
                    i = c + 6;
                }
            }
            if (depth !== 0)
                continue;
            const inner = html.slice(start, i - 6);
            const text = inner
                .replace(/<br\s*\/?>/gi, "\n")
                .replace(/<[^>]+>/g, "")
                .replace(/&#x27;|&#39;/g, "'")
                .replace(/&amp;/g, "&")
                .replace(/&quot;/g, "\"")
                .replace(/&lt;/g, "<")
                .replace(/&gt;/g, ">")
                .replace(/&nbsp;/g, " ");
            for (const raw of text.split("\n")) {
                const line = raw.trim();
                if (!line || /^\[.*\]$/.test(line))
                    continue;
                lines.push({ time, text: line });
                time += LINE_DURATION_MS;
            }
        }
        return lines;
    }
    getAppName() {
        return "Genius";
    }
}
exports.GeniusSource = GeniusSource;
