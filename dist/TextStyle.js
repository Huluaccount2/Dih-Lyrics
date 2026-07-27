"use strict";
// Discord's custom status is plain text - there's no real font selection possible. What
// "changing the font" actually means here is remapping normal ASCII letters/digits onto a
// different Unicode block that *looks* like a different typeface (bold, italic, script,
// monospace, etc.) - the same trick "fancy text" generators use. It only affects how the
// text is drawn by whatever renders it; it's still plain text underneath.
Object.defineProperty(exports, "__esModule", { value: true });
exports.FONT_STYLES = void 0;
exports.applyFontStyle = applyFontStyle;
// Codepoint offsets into the Unicode "Mathematical Alphanumeric Symbols" block, plus a
// handful of legacy single-codepoint exceptions where the "obvious" math codepoint was
// never assigned (e.g. italic h is the pre-existing Planck-constant symbol instead).
const STYLES = {
    bold: { loOffset: 0x1D41A - 0x61, hiOffset: 0x1D400 - 0x41, exceptions: null, digitOffset: 0x1D7CE - 0x30 },
    italic: { loOffset: 0x1D44E - 0x61, hiOffset: 0x1D434 - 0x41, exceptions: { 0x68: "\u210E" }, digitOffset: null },
    bold_italic: { loOffset: 0x1D482 - 0x61, hiOffset: 0x1D468 - 0x41, exceptions: null, digitOffset: null },
    sans: { loOffset: 0x1D5BA - 0x61, hiOffset: 0x1D5A0 - 0x41, exceptions: null, digitOffset: 0x1D7E2 - 0x30 },
    sans_bold: { loOffset: 0x1D5EE - 0x61, hiOffset: 0x1D5D4 - 0x41, exceptions: null, digitOffset: 0x1D7EC - 0x30 },
    sans_italic: { loOffset: 0x1D622 - 0x61, hiOffset: 0x1D608 - 0x41, exceptions: null, digitOffset: null },
    sans_bold_italic: { loOffset: 0x1D656 - 0x61, hiOffset: 0x1D63C - 0x41, exceptions: null, digitOffset: null },
    double_struck: { loOffset: 0x1D552 - 0x61, hiOffset: 0x1D538 - 0x41, exceptions: { 0x43: "\u2102", 0x48: "\u210D", 0x4E: "\u2115", 0x50: "\u2119", 0x51: "\u211A", 0x52: "\u211D", 0x5A: "\u2124" }, digitOffset: 0x1D7D8 - 0x30 },
    fraktur: { loOffset: 0x1D51E - 0x61, hiOffset: 0x1D504 - 0x41, exceptions: { 0x43: "\u212D", 0x48: "\u210C", 0x49: "\u2111", 0x52: "\u211C", 0x5A: "\u2128" }, digitOffset: null },
    fraktur_bold: { loOffset: 0x1D586 - 0x61, hiOffset: 0x1D56C - 0x41, exceptions: null, digitOffset: null },
    script: { loOffset: 0x1D4B6 - 0x61, hiOffset: 0x1D49C - 0x41, exceptions: { 0x65: "\u212F", 0x67: "\u210A", 0x6F: "\u2134", 0x42: "\u212C", 0x45: "\u2130", 0x46: "\u2131", 0x48: "\u210B", 0x49: "\u2110", 0x4C: "\u2112", 0x4D: "\u2133", 0x52: "\u211B" }, digitOffset: null },
    script_bold: { loOffset: 0x1D4EA - 0x61, hiOffset: 0x1D4D0 - 0x41, exceptions: null, digitOffset: null },
    monospace: { loOffset: 0x1D68A - 0x61, hiOffset: 0x1D670 - 0x41, exceptions: null, digitOffset: 0x1D7F6 - 0x30 }
};
exports.FONT_STYLES = ["none", ...Object.keys(STYLES), "underline", "strikethrough"];
function shift(text, entry) {
    return [...text].map((ch) => {
        const cp = ch.codePointAt(0);
        if (cp === undefined)
            return ch;
        if (entry.exceptions && cp in entry.exceptions)
            return entry.exceptions[cp];
        if (cp >= 0x61 && cp <= 0x7A)
            return String.fromCodePoint(cp + entry.loOffset); // a-z
        if (cp >= 0x41 && cp <= 0x5A)
            return String.fromCodePoint(cp + entry.hiOffset); // A-Z
        if (entry.digitOffset != null && cp >= 0x30 && cp <= 0x39)
            return String.fromCodePoint(cp + entry.digitOffset); // 0-9
        return ch;
    }).join("");
}
function underline(text) {
    return [...text].map((ch) => (/\s/.test(ch) ? ch : ch + "\u0332")).join("");
}
function strikethrough(text) {
    return [...text].map((ch) => (/\s/.test(ch) ? ch : ch + "\u0336")).join("");
}
function applyFontStyle(text, style) {
    if (!text || !style || style === "none")
        return text;
    if (style === "underline")
        return underline(text);
    if (style === "strikethrough")
        return strikethrough(text);
    const entry = STYLES[style];
    if (!entry)
        return text;
    return shift(text, entry);
}
