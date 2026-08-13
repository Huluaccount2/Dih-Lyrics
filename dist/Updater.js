"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Updater = void 0;
const path_1 = require("path");
const fs_1 = require("fs");
const stream_1 = require("stream");
const zip = require("node-stream-zip");
const RELEASE_API_URL = "https://api.github.com/repos/Huluaccount2/Dih-Lyrics/releases/latest";
const RELEASE_MARKER_FILE = ".dihlyrics-release";
class Updater {
    static async tryUpdate() {
        console.log("Checking GitHub Releases for updates...");
        const release = await Updater.getAvailableUpdate();
        if (!release)
            return;
        console.log(`Found update ${release.tag_name}. Installing the complete release package...`);
        await Updater.forceUpdate(release);
        console.log("Update installed. Restart dihlyrics once more to load the new version.");
        process.exit(0);
    }
    static async forceUpdate(release) {
        const targetRelease = release || await Updater.fetchLatestRelease();
        const projectRoot = (0, path_1.join)(__dirname, "../");
        const downloadPath = (0, path_1.join)(projectRoot, "temp");
        const exclude = ["settings.json", "cache", ".git", "temp", "log.txt", "node_modules", "package-lock.json"];
        if ((0, fs_1.existsSync)(downloadPath))
            (0, fs_1.rmSync)(downloadPath, { recursive: true, force: true });
        (0, fs_1.mkdirSync)(downloadPath, { recursive: true });
        const extractedPath = await Updater.downloadRelease(targetRelease, downloadPath);
        Updater.replaceFiles(Updater.findExtractedRepoRoot(extractedPath), projectRoot, exclude);
        (0, fs_1.writeFileSync)((0, path_1.join)(projectRoot, RELEASE_MARKER_FILE), Updater.normalizeVersion(targetRelease.tag_name));
    }
    static async checkUpdate() {
        return (await Updater.getAvailableUpdate()) !== null;
    }
    static async getAvailableUpdate() {
        const release = await Updater.fetchLatestRelease();
        return Updater.getCurrentVersion() === Updater.normalizeVersion(release.tag_name) ? null : release;
    }
    static async fetchLatestRelease() {
        const response = await fetch(RELEASE_API_URL, {
            headers: { "Accept": "application/vnd.github+json", "User-Agent": "dihlyrics-legacy-updater-bridge" }
        });
        if (!response.ok)
            throw new Error(`GitHub latest release check failed: ${response.status} ${response.statusText}`);
        const release = await response.json();
        if (!release.tag_name || (!release.zipball_url && !(release.assets && release.assets.length)))
            throw new Error("GitHub did not return a downloadable release package.");
        return release;
    }
    static getCurrentVersion() {
        const projectRoot = (0, path_1.join)(__dirname, "../");
        const markerPath = (0, path_1.join)(projectRoot, RELEASE_MARKER_FILE);
        if ((0, fs_1.existsSync)(markerPath))
            return Updater.normalizeVersion((0, fs_1.readFileSync)(markerPath, "utf8"));
        return Updater.normalizeVersion((0, fs_1.readFileSync)((0, path_1.join)(projectRoot, "VERSION"), "utf8"));
    }
    static normalizeVersion(version) {
        return String(version || "").trim().replace(/^v/i, "");
    }
    static getReleaseDownload(release) {
        const assets = (release.assets || []).filter(asset => asset.name && asset.browser_download_url);
        const platformPattern = process.platform === "win32"
            ? /(?:^|[-_.])(windows?|win32|win64)(?:$|[-_.])/i
            : process.platform === "darwin"
                ? /(?:^|[-_.])(mac|macos|osx|darwin)(?:$|[-_.])/i
                : null;
        const platformAsset = platformPattern ? assets.find(asset => platformPattern.test(asset.name)) : undefined;
        if (platformAsset)
            return { name: platformAsset.name, url: platformAsset.browser_download_url };
        if (platformPattern && assets.length)
            throw new Error(`Release ${release.tag_name} does not include a package for ${process.platform}.`);
        if (!release.zipball_url)
            throw new Error(`Release ${release.tag_name} does not include a source archive.`);
        return { name: `${Updater.normalizeVersion(release.tag_name)}-source.zip`, url: release.zipball_url };
    }
    static async downloadRelease(release, outputDir) {
        const extractedPath = (0, path_1.join)((0, path_1.resolve)(outputDir), "extracted");
        const archivePath = (0, path_1.join)((0, path_1.resolve)(outputDir), `${Updater.normalizeVersion(release.tag_name)}.zip`);
        const download = Updater.getReleaseDownload(release);
        (0, fs_1.mkdirSync)(extractedPath, { recursive: true });
        console.log(`Downloading ${download.name}...`);
        const response = await fetch(download.url, { headers: { "User-Agent": "dihlyrics-legacy-updater-bridge" } });
        if (!response.ok || !response.body)
            throw new Error(`GitHub release download failed: ${response.status} ${response.statusText}`);
        const downloadStream = (0, fs_1.createWriteStream)(archivePath);
        await new Promise((res, rej) => {
            stream_1.Readable.fromWeb(response.body).pipe(downloadStream).on("finish", res).on("error", rej);
        });
        const archive = new zip.async({ file: archivePath });
        try {
            await archive.extract(null, extractedPath);
        }
        finally {
            await archive.close();
        }
        return extractedPath;
    }
    static findExtractedRepoRoot(outputDir) {
        if ((0, fs_1.existsSync)((0, path_1.join)(outputDir, "package.json")))
            return outputDir;
        const repoRoot = (0, fs_1.readdirSync)(outputDir).map(name => (0, path_1.join)(outputDir, name)).find(path => (0, fs_1.statSync)(path).isDirectory() && (0, fs_1.existsSync)((0, path_1.join)(path, "package.json")));
        if (!repoRoot)
            throw new Error("Could not find the extracted release folder.");
        return repoRoot;
    }
    static replaceFiles(srcPath, dstPath, exclude) {
        const sourceRoot = (0, path_1.resolve)(srcPath);
        const destinationRoot = (0, path_1.resolve)(dstPath);
        const excludedPaths = exclude.map(path => (0, path_1.resolve)(destinationRoot, path));
        const isExcluded = path => {
            const resolvedPath = (0, path_1.resolve)(path);
            return excludedPaths.some(excludedPath => resolvedPath === excludedPath || resolvedPath.startsWith(`${excludedPath}${path_1.sep}`));
        };
        const syncDirectory = (sourceDir, destinationDir) => {
            if (!(0, fs_1.existsSync)(destinationDir))
                (0, fs_1.mkdirSync)(destinationDir, { recursive: true });
            const sourceEntries = (0, fs_1.readdirSync)(sourceDir, { withFileTypes: true });
            const sourceNames = new Set(sourceEntries.map(entry => entry.name));
            for (const sourceEntry of sourceEntries) {
                const sourceEntryPath = (0, path_1.join)(sourceDir, sourceEntry.name);
                const destinationEntryPath = (0, path_1.join)(destinationDir, sourceEntry.name);
                if (isExcluded(destinationEntryPath))
                    continue;
                if (sourceEntry.isDirectory()) {
                    if ((0, fs_1.existsSync)(destinationEntryPath) && !(0, fs_1.statSync)(destinationEntryPath).isDirectory())
                        (0, fs_1.rmSync)(destinationEntryPath, { recursive: true, force: true });
                    syncDirectory(sourceEntryPath, destinationEntryPath);
                }
                else {
                    if ((0, fs_1.existsSync)(destinationEntryPath) && (0, fs_1.statSync)(destinationEntryPath).isDirectory())
                        (0, fs_1.rmSync)(destinationEntryPath, { recursive: true, force: true });
                    (0, fs_1.copyFileSync)(sourceEntryPath, destinationEntryPath);
                }
            }
            for (const destinationEntry of (0, fs_1.readdirSync)(destinationDir, { withFileTypes: true })) {
                const destinationEntryPath = (0, path_1.join)(destinationDir, destinationEntry.name);
                if (isExcluded(destinationEntryPath) || sourceNames.has(destinationEntry.name))
                    continue;
                (0, fs_1.rmSync)(destinationEntryPath, { recursive: true, force: true });
            }
        };
        syncDirectory(sourceRoot, destinationRoot);
    }
}
exports.Updater = Updater;
