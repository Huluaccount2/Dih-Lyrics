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
exports.MusixmatchSource = void 0;
const BaseSource_1 = require("./BaseSource");
const Settings_1 = require("../Settings");
const Debug_1 = require("../Debug");
// @ts-ignore - no bundled types for this package
const synclyrics_1 = require("@stef-0012/synclyrics");
// Musixmatch requires a "usertoken" to use its lyrics API. There's no official way to get
// one without the app - the SyncLyrics library reverse-engineers Musixmatch's own token
// endpoint and mints one automatically the first time it's needed. We just give it a place
// to read/write that token from so it doesn't have to re-fetch one on every request (and to
// avoid hammering their token endpoint, which will start rejecting requests if you do).
class MusixmatchSource extends BaseSource_1.BaseSource {
    constructor() {
        super();
        this.manager = new synclyrics_1.SyncLyrics({
            logLevel: "none",
            sources: ["musixmatch"],
            saveMusixmatchToken: (token) => {
                try {
                    Settings_1.Settings.credentials.musixmatchToken = JSON.stringify(token);
                    Settings_1.Settings.save();
                    Debug_1.Debug.write("[MusixmatchSource] Token saved.");
                }
                catch (e) {
                    Debug_1.Debug.write("[MusixmatchSource] Token save failed: " + e);
                }
            },
            getMusixmatchToken: () => {
                const raw = Settings_1.Settings.credentials.musixmatchToken;
                if (!(raw === null || raw === void 0 ? void 0 : raw.trim()))
                    return null;
                try {
                    const parsed = JSON.parse(raw);
                    return (parsed === null || parsed === void 0 ? void 0 : parsed.usertoken) ? parsed : null;
                }
                catch (_a) {
                    return null;
                }
            }
        });
    }
    getLyrics(name, artist) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b;
            const result = yield this.manager.getLyrics({ track: name, artist });
            if (!result)
                throw new Error("Musixmatch: no result");
            const parsed = (_b = (_a = result.lyrics) === null || _a === void 0 ? void 0 : _a.lineSynced) === null || _b === void 0 ? void 0 : _b.parse();
            if (!(parsed === null || parsed === void 0 ? void 0 : parsed.length))
                throw new Error("Musixmatch: no synced lyrics");
            Debug_1.Debug.write(`[MusixmatchSource] Got ${parsed.length} lines for "${name}"`);
            return { lines: parsed.map((l) => ({ time: Math.round(l.time * 1000), text: l.text })) };
        });
    }
    getAppName() {
        return "Musixmatch";
    }
}
exports.MusixmatchSource = MusixmatchSource;
