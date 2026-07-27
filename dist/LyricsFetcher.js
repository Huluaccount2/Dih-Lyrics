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
exports.LyricsFetcher = void 0;
const fs_1 = require("fs");
class LyricsFetcher {
    constructor() {
        this.sources = [];
        this.lastFetchedFrom = "Not fetched";
        this.lastFetchedFor = "";
    }
    sanitizeForFilename(value) {
        const original = value;
        // Remove characters that commonly break filenames on Windows and in URLs.
        const sanitized = original
            .replace(/[\n\r/:*?"<>|]/g, "")
            .replace(/\s+/g, " ")
            .trim();
        return { sanitized, changed: sanitized !== original };
    }
    buildCachePaths(name, artist) {
        const legacy = `./cache/${name}-${artist}.json`;
        const nameSan = this.sanitizeForFilename(name);
        const artistSan = this.sanitizeForFilename(artist);
        const sanitizedKey = `${nameSan.sanitized}-${artistSan.sanitized}`;
        const sanitized = `./cache/${sanitizedKey}.json`;
        const changed = nameSan.changed || artistSan.changed;
        const lowered = changed ? `./cache/${sanitizedKey.toLowerCase()}.json` : null;
        return [legacy, sanitized, ...(lowered ? [lowered] : [])];
    }
    buildCacheWritePath(name, artist) {
        const nameSan = this.sanitizeForFilename(name);
        const artistSan = this.sanitizeForFilename(artist);
        const key = `${nameSan.sanitized}-${artistSan.sanitized}`;
        const changed = nameSan.changed || artistSan.changed;
        // Only force lowercase when we had to strip characters.
        const finalKey = changed ? key.toLowerCase() : key;
        return `./cache/${finalKey}.json`;
    }
    addSource(source) {
        this.sources.push(source);
    }
    fetchLyrics(name, artist) {
        return __awaiter(this, void 0, void 0, function* () {
            this.lastFetchedFrom = "Not fetched";
            const cache = this.fetchCachedLyrics(name, artist);
            let result = cache;
            for (const source of this.sources) {
                if (cache) {
                    this.lastFetchedFrom = `Cache (${cache.appName})`;
                    break;
                }
                try {
                    this.lastFetchedFor = name + artist;
                    result = yield source.getLyrics(name, artist);
                    this.lastFetchedFrom = source.getAppName();
                    this.cacheLyrics(name, artist, result, this.lastFetchedFrom);
                }
                catch (_a) { }
                if (result)
                    break;
            }
            return result;
        });
    }
    fetchCachedLyrics(name, artist) {
        const paths = this.buildCachePaths(name, artist);
        for (const path of paths) {
            try {
                return JSON.parse((0, fs_1.readFileSync)(path).toString());
            }
            catch (_a) { }
        }
        return null;
    }
    cacheLyrics(name, artist, lyrics, appName) {
        if (!(0, fs_1.existsSync)("./cache"))
            (0, fs_1.mkdirSync)("./cache");
        (0, fs_1.writeFileSync)(`./cache/${name}-${artist}.json`, JSON.stringify(Object.assign(Object.assign({}, lyrics), { appName })));
    }
}
exports.LyricsFetcher = LyricsFetcher;
