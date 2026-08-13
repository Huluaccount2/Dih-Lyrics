import { join, resolve, sep } from "path"
import { copyFileSync, createWriteStream, existsSync, mkdirSync, readFileSync, readdirSync, rmSync, statSync, writeFileSync } from "fs"
import { Readable } from "stream"
import zip from "node-stream-zip"

interface GithubReleaseAsset {
    name: string
    browser_download_url: string
}

interface GithubRelease {
    tag_name: string
    zipball_url?: string
    assets?: GithubReleaseAsset[]
}

const RELEASE_API_URL = "https://api.github.com/repos/Huluaccount2/Dih-Lyrics/releases/latest"
const RELEASE_MARKER_FILE = ".dihlyrics-release"

export class Updater {
    public static async tryUpdate(): Promise<void> {
        console.log("Checking GitHub Releases for updates...")
        const release = await Updater.getAvailableUpdate()

        if (!release) return

        console.log(`Found update ${release.tag_name}. Installing the complete release package...`)
        await Updater.forceUpdate(release)
        console.log("Update installed. Restart dihlyrics once more to load the new version.")
        process.exit(0)
    }

    public static async forceUpdate(release?: GithubRelease): Promise<void> {
        const targetRelease = release || await Updater.fetchLatestRelease()
        const projectRoot = join(__dirname, "../")
        const downloadPath = join(projectRoot, "temp")
        const exclude = [
            "settings.json",
            "cache",
            ".git",
            "temp",
            "log.txt",
            "node_modules",
            "package-lock.json"
        ]

        if (existsSync(downloadPath)) rmSync(downloadPath, { recursive: true, force: true })
        mkdirSync(downloadPath, { recursive: true })

        const extractedPath = await Updater.downloadRelease(targetRelease, downloadPath)
        Updater.replaceFiles(Updater.findExtractedRepoRoot(extractedPath), projectRoot, exclude)
        writeFileSync(join(projectRoot, RELEASE_MARKER_FILE), Updater.normalizeVersion(targetRelease.tag_name))
    }

    public static async checkUpdate(): Promise<boolean> {
        return (await Updater.getAvailableUpdate()) !== null
    }

    private static async getAvailableUpdate(): Promise<GithubRelease | null> {
        const release = await Updater.fetchLatestRelease()

        return Updater.getCurrentVersion() === Updater.normalizeVersion(release.tag_name)
            ? null
            : release
    }

    private static async fetchLatestRelease(): Promise<GithubRelease> {
        const response = await fetch(RELEASE_API_URL, {
            headers: {
                "Accept": "application/vnd.github+json",
                "User-Agent": "dihlyrics-legacy-updater-bridge"
            }
        })

        if (!response.ok) {
            throw new Error(`GitHub latest release check failed: ${response.status} ${response.statusText}`)
        }

        const release = await response.json() as GithubRelease

        if (!release.tag_name || (!release.zipball_url && !release.assets?.length)) {
            throw new Error("GitHub did not return a downloadable release package.")
        }

        return release
    }

    private static getCurrentVersion(): string {
        const projectRoot = join(__dirname, "../")
        const markerPath = join(projectRoot, RELEASE_MARKER_FILE)

        if (existsSync(markerPath)) {
            return Updater.normalizeVersion(readFileSync(markerPath, "utf8"))
        }

        return Updater.normalizeVersion(readFileSync(join(projectRoot, "VERSION"), "utf8"))
    }

    private static normalizeVersion(version: string): string {
        return String(version || "").trim().replace(/^v/i, "")
    }

    private static getReleaseDownload(release: GithubRelease): { name: string, url: string } {
        const assets = (release.assets || []).filter((asset) => asset.name && asset.browser_download_url)
        const platformPattern = process.platform === "win32"
            ? /(?:^|[-_.])(windows?|win32|win64)(?:$|[-_.])/i
            : process.platform === "darwin"
                ? /(?:^|[-_.])(mac|macos|osx|darwin)(?:$|[-_.])/i
                : null
        const platformAsset = platformPattern
            ? assets.find((asset) => platformPattern.test(asset.name))
            : undefined

        if (platformAsset) {
            return { name: platformAsset.name, url: platformAsset.browser_download_url }
        }

        if (platformPattern && assets.length) {
            throw new Error(`Release ${release.tag_name} does not include a package for ${process.platform}.`)
        }

        if (!release.zipball_url) {
            throw new Error(`Release ${release.tag_name} does not include a source archive.`)
        }

        return {
            name: `${Updater.normalizeVersion(release.tag_name)}-source.zip`,
            url: release.zipball_url
        }
    }

    public static async downloadRelease(release: GithubRelease, outputDir: string): Promise<string> {
        const extractedPath = join(resolve(outputDir), "extracted")
        const archivePath = join(resolve(outputDir), `${Updater.normalizeVersion(release.tag_name)}.zip`)
        const download = Updater.getReleaseDownload(release)

        mkdirSync(extractedPath, { recursive: true })
        console.log(`Downloading ${download.name}...`)

        const response = await fetch(download.url, {
            headers: { "User-Agent": "dihlyrics-legacy-updater-bridge" }
        })

        if (!response.ok || !response.body) {
            throw new Error(`GitHub release download failed: ${response.status} ${response.statusText}`)
        }

        const downloadStream = createWriteStream(archivePath)

        await new Promise<void>((res, rej) => {
            Readable.fromWeb(response.body!)
                .pipe(downloadStream)
                .on("finish", res)
                .on("error", rej)
        })

        const archive = new zip.async({ file: archivePath })

        try {
            await archive.extract(null, extractedPath)
        } finally {
            await archive.close()
        }

        return extractedPath
    }

    private static findExtractedRepoRoot(outputDir: string): string {
        if (existsSync(join(outputDir, "package.json"))) return outputDir

        const repoRoot = readdirSync(outputDir)
            .map((name) => join(outputDir, name))
            .find((path) => statSync(path).isDirectory() && existsSync(join(path, "package.json")))

        if (!repoRoot) throw new Error("Could not find the extracted release folder.")

        return repoRoot
    }

    public static replaceFiles(srcPath: string, dstPath: string, exclude: string[]): void {
        const sourceRoot = resolve(srcPath)
        const destinationRoot = resolve(dstPath)
        const excludedPaths = exclude.map((path) => resolve(destinationRoot, path))
        const isExcluded = (path: string): boolean => {
            const resolvedPath = resolve(path)

            return excludedPaths.some((excludedPath) => {
                return resolvedPath === excludedPath || resolvedPath.startsWith(`${excludedPath}${sep}`)
            })
        }
        const syncDirectory = (sourceDir: string, destinationDir: string): void => {
            if (!existsSync(destinationDir)) mkdirSync(destinationDir, { recursive: true })

            const sourceEntries = readdirSync(sourceDir, { withFileTypes: true })
            const sourceNames = new Set(sourceEntries.map((entry) => entry.name))

            for (const sourceEntry of sourceEntries) {
                const sourceEntryPath = join(sourceDir, sourceEntry.name)
                const destinationEntryPath = join(destinationDir, sourceEntry.name)

                if (isExcluded(destinationEntryPath)) continue

                if (sourceEntry.isDirectory()) {
                    if (existsSync(destinationEntryPath) && !statSync(destinationEntryPath).isDirectory()) {
                        rmSync(destinationEntryPath, { recursive: true, force: true })
                    }

                    syncDirectory(sourceEntryPath, destinationEntryPath)
                } else {
                    if (existsSync(destinationEntryPath) && statSync(destinationEntryPath).isDirectory()) {
                        rmSync(destinationEntryPath, { recursive: true, force: true })
                    }

                    copyFileSync(sourceEntryPath, destinationEntryPath)
                }
            }

            for (const destinationEntry of readdirSync(destinationDir, { withFileTypes: true })) {
                const destinationEntryPath = join(destinationDir, destinationEntry.name)

                if (isExcluded(destinationEntryPath) || sourceNames.has(destinationEntry.name)) continue

                rmSync(destinationEntryPath, { recursive: true, force: true })
            }
        }

        syncDirectory(sourceRoot, destinationRoot)
    }
}
