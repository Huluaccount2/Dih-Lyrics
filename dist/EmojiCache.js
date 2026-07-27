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
exports.EmojiCache = void 0;
const fs_1 = require("fs");
const Debug_1 = require("./Debug");
const CACHE_PATH = "./cache/emojis.json";
class EmojiCache {
    static load() {
        if (this.data)
            return this.data;
        try {
            this.data = JSON.parse((0, fs_1.readFileSync)(CACHE_PATH).toString());
        }
        catch (_a) {
            this.data = null;
        }
        return this.data;
    }
    static save(data) {
        if (!(0, fs_1.existsSync)("./cache"))
            (0, fs_1.mkdirSync)("./cache");
        this.data = data;
        (0, fs_1.writeFileSync)(CACHE_PATH, JSON.stringify(data));
    }
    static refresh(token) {
        return __awaiter(this, void 0, void 0, function* () {
            const guildsResponse = yield fetch("https://discord.com/api/v9/users/@me/guilds", {
                headers: { "Authorization": token }
            });
            if (!guildsResponse.ok) {
                throw new Error(`Failed to fetch guilds: ${guildsResponse.status}`);
            }
            const guildsRaw = yield guildsResponse.json();
            const guilds = guildsRaw.map((g) => ({ id: g.id, name: g.name }));
            const emojisByGuild = {};
            for (const guild of guilds) {
                try {
                    const response = yield fetch(`https://discord.com/api/v9/guilds/${guild.id}/emojis`, {
                        headers: { "Authorization": token }
                    });
                    if (!response.ok) {
                        Debug_1.Debug.write(`EMOJI FETCH FAIL for guild ${guild.name}: ${response.status}`);
                        emojisByGuild[guild.id] = [];
                        continue;
                    }
                    const emojisRaw = yield response.json();
                    emojisByGuild[guild.id] = emojisRaw.map((e) => ({
                        id: e.id,
                        name: e.name,
                        animated: !!e.animated
                    }));
                }
                catch (e) {
                    Debug_1.Debug.write(`EMOJI FETCH CRASH for guild ${guild.name}: ${(e === null || e === void 0 ? void 0 : e.stack) || e}`);
                    emojisByGuild[guild.id] = [];
                }
                // Small delay between requests to stay well clear of rate limits when the
                // account is in many servers.
                yield new Promise((resolve) => setTimeout(resolve, 300));
            }
            const data = { guilds, emojisByGuild, fetchedAt: Date.now() };
            this.save(data);
            return data;
        });
    }
    static formatEmoji(emoji) {
        return `<${emoji.animated ? "a" : ""}:${emoji.name}:${emoji.id}>`;
    }
    static matchesFilter(emoji, filter) {
        if (filter === "both")
            return true;
        if (filter === "nitro")
            return emoji.animated;
        // nonNitro: static emojis only, since those are the only custom emojis a
        // non-Nitro account can actually apply to its own status.
        return !emoji.animated;
    }
    static getPool(rotation) {
        if (rotation.mode === "custom") {
            return (rotation.customEmojis || []).filter(Boolean);
        }
        const data = this.load();
        if (!data)
            return [];
        if (rotation.mode === "server") {
            const emojis = data.emojisByGuild[rotation.guildId] || [];
            return emojis
                .filter((e) => this.matchesFilter(e, rotation.nitroFilter))
                .map((e) => this.formatEmoji(e));
        }
        // mode === "all"
        const pool = [];
        for (const guildId of Object.keys(data.emojisByGuild)) {
            for (const emoji of data.emojisByGuild[guildId]) {
                if (this.matchesFilter(emoji, rotation.nitroFilter)) {
                    pool.push(this.formatEmoji(emoji));
                }
            }
        }
        return pool;
    }
}
exports.EmojiCache = EmojiCache;
EmojiCache.data = null;
