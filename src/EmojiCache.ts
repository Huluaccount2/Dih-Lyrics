import { existsSync, mkdirSync, writeFileSync, readFileSync } from "fs"
import { Debug } from "./Debug"

export interface DiscordGuild {
    id: string
    name: string
}

export interface DiscordEmoji {
    id: string
    name: string
    animated: boolean
}

export interface EmojiCacheData {
    guilds: DiscordGuild[]
    emojisByGuild: Record<string, DiscordEmoji[]>
    fetchedAt: number
}

export type NitroFilter = "nitro" | "nonNitro" | "both"

export type RotationOrder = "sequential" | "random" | "shuffled"

export interface EmojiRotationSettings {
    enabled: boolean
    mode: "custom" | "server" | "all"
    customEmojis: string[]
    guildId: string
    nitroFilter: NitroFilter
    order: RotationOrder
}

const CACHE_PATH = "./cache/emojis.json"

export class EmojiCache {
    private static data: EmojiCacheData | null = null

    public static load(): EmojiCacheData | null {
        if (this.data) return this.data

        try {
            this.data = JSON.parse(readFileSync(CACHE_PATH).toString()) as EmojiCacheData
        } catch {
            this.data = null
        }

        return this.data
    }

    public static save(data: EmojiCacheData): void {
        if (!existsSync("./cache")) mkdirSync("./cache")

        this.data = data
        writeFileSync(CACHE_PATH, JSON.stringify(data))
    }

    public static async refresh(token: string): Promise<EmojiCacheData> {
        const guildsResponse = await fetch("https://discord.com/api/v9/users/@me/guilds", {
            headers: { "Authorization": token }
        })

        if (!guildsResponse.ok) {
            throw new Error(`Failed to fetch guilds: ${guildsResponse.status}`)
        }

        const guildsRaw = await guildsResponse.json() as { id: string; name: string }[]
        const guilds: DiscordGuild[] = guildsRaw.map((g) => ({ id: g.id, name: g.name }))
        const emojisByGuild: Record<string, DiscordEmoji[]> = {}

        for (const guild of guilds) {
            try {
                const response = await fetch(`https://discord.com/api/v9/guilds/${guild.id}/emojis`, {
                    headers: { "Authorization": token }
                })

                if (!response.ok) {
                    Debug.write(`EMOJI FETCH FAIL for guild ${guild.name}: ${response.status}`)
                    emojisByGuild[guild.id] = []
                    continue
                }

                const emojisRaw = await response.json() as { id: string; name: string; animated?: boolean }[]

                emojisByGuild[guild.id] = emojisRaw.map((e) => ({
                    id: e.id,
                    name: e.name,
                    animated: !!e.animated
                }))
            } catch (e) {
                Debug.write(`EMOJI FETCH CRASH for guild ${guild.name}: ${(e as Error)?.stack || e}`)
                emojisByGuild[guild.id] = []
            }

            // Small delay between requests to stay well clear of rate limits when the
            // account is in many servers.
            await new Promise((resolve) => setTimeout(resolve, 300))
        }

        const data: EmojiCacheData = { guilds, emojisByGuild, fetchedAt: Date.now() }
        this.save(data)

        return data
    }

    public static formatEmoji(emoji: DiscordEmoji): string {
        return `<${emoji.animated ? "a" : ""}:${emoji.name}:${emoji.id}>`
    }

    private static matchesFilter(emoji: DiscordEmoji, filter: NitroFilter): boolean {
        if (filter === "both") return true
        if (filter === "nitro") return emoji.animated
        // nonNitro: static emojis only, since those are the only custom emojis a
        // non-Nitro account can actually apply to its own status.
        return !emoji.animated
    }

    public static getPool(rotation: EmojiRotationSettings): string[] {
        if (rotation.mode === "custom") {
            return (rotation.customEmojis || []).filter(Boolean)
        }

        const data = this.load()

        if (!data) return []

        if (rotation.mode === "server") {
            const emojis = data.emojisByGuild[rotation.guildId] || []

            return emojis
                .filter((e) => this.matchesFilter(e, rotation.nitroFilter))
                .map((e) => this.formatEmoji(e))
        }

        // mode === "all"
        const pool: string[] = []

        for (const guildId of Object.keys(data.emojisByGuild)) {
            for (const emoji of data.emojisByGuild[guildId]) {
                if (this.matchesFilter(emoji, rotation.nitroFilter)) {
                    pool.push(this.formatEmoji(emoji))
                }
            }
        }

        return pool
    }
}
