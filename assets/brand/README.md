# ACM CTF 3.0 — Brand assets

The mark is a hex shield (security) holding a flag on a pole (capture the flag),
with a green "capture point" dot at the base.

## Palette

| Token | Hex | Use |
|---|---|---|
| bg | `#060a13` | background |
| panel | `#0a1122` | surfaces |
| cyan | `#00f0ff` | primary accent, mark ring |
| blue | `#0055ff` | gradient end (flag) |
| green | `#00ff41` | status / capture dot |
| gray | `#8b9bb4` | secondary text |

Type: **Space Grotesk** (headings/wordmark), **JetBrains Mono** (labels/data).

## Files

| File | Size | Use |
|---|---|---|
| `logo.svg` / `logo.png` | 942×192 | horizontal lockup, transparent background |
| `logo-on-dark.svg` / `.png` | — | lockup on the dark grid background |
| `logo-mark.svg` / `.png` | 512² | mark only, transparent |
| `icon.svg`, `icon-512.png`, `icon-192.png` | square | app icon / profile avatar |
| `apple-touch-icon.png` | 180² | iOS home screen |
| `/favicon.ico` | 16/32/48 | browser tab |
| `og-banner.png` | 1200×630 | **link previews** — Open Graph, Twitter/X card, LinkedIn, Discord, WhatsApp, Slack |
| `social-square.png` | 1080×1080 | Instagram / WhatsApp status / LinkedIn feed post |
| `social-header.png` | 1500×500 | X profile header, LinkedIn cover |

All SVGs have text converted to outlines, so they render identically without the
fonts installed.

## Notes

- Link-preview tags live in each page's `<head>`, between the
  `<!-- social / brand meta -->` comments. `og:image` uses an absolute URL
  (`https://ctf-psu.shoug-tech.com/...`) — required by every scraper.
- If the event date, time, venue or domain changes, the banners must be
  regenerated; they have that text baked in.
- Give the mark at least half its own width as clear space. Minimum legible
  size is 24px for the mark, 120px wide for the lockup.
