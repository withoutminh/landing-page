# Personal Landing Page

A lightweight, single-page personal profile / "bio link" site. It shows your
avatar, name, quote, location, live Discord presence (via the Lanyard API),
social links, and a built-in music player — all driven by one config file.

No build step, no framework, no dependencies. Just static HTML, CSS, and
vanilla JavaScript.

## Features

- Config-driven: edit one file (`config.js`) to customize everything.
- Live Discord status and activity through the free [Lanyard](https://github.com/Phineas/lanyard) API.
- Built-in music player with a playlist, autoplay, shuffle, and seek.
- Fully themeable colors via CSS variables.
- Responsive layout that scales up on large displays.
- Respects `prefers-reduced-motion` for accessibility.

## Project Structure

```
landing-page/
├── index.html        # Page markup (you normally don't edit this)
├── config.js         # >>> THE ONLY FILE YOU NEED TO EDIT <<<
├── script.js         # Wires config into the page (don't edit)
├── style.css         # Styling (don't edit)
└── assets/
    ├── avatar/       # Your avatar image
    ├── background/   # Background image / gif
    ├── covers/       # Album cover art for each song
    ├── icons/        # Status icons, badges, favicon
    └── music/        # Audio files (mp3, etc.)
```

## Configuration Guide

Everything is configured in `config.js`. Below is what each section does.

### `site`
Browser tab settings.

| Key       | Description                                              |
|-----------|----------------------------------------------------------|
| `title`   | Text shown in the browser tab.                           |
| `iconUrl` | Favicon. A local path (`assets/...`) or a full URL.      |

### `profile`
Your main profile info.

| Key             | Description                                          |
|-----------------|------------------------------------------------------|
| `name`          | Display name (large glowing text).                   |
| `quote`         | Subtitle / quote shown under your name.              |
| `location`      | Location text shown with a map-pin icon.             |
| `avatarUrl`     | Circular avatar image at the top.                    |
| `backgroundUrl` | Full-screen background image (image or gif).         |

### `discord`
Live Discord presence via the Lanyard API.

| Key           | Description                                                        |
|---------------|-------------------------------------------------------------------|
| `userId`      | Your Discord user ID. Leave as zeros to disable the Discord card. |
| `useUsername` | `true` shows your `@username`; `false` shows your display name.   |
| `badges`      | Array of badge images shown next to your name (see below).        |

**Setting up Discord presence:**
1. Join the Lanyard Discord server: https://discord.gg/lanyard
   (the Lanyard bot must share a server with you to read your status).
2. Enable Developer Mode in Discord, then right-click your profile and
   "Copy User ID".
3. Paste that ID into `discord.userId`.

**Badges** are images Lanyard cannot detect (like Nitro or Server Boost), so
you supply them yourself:
```js
badges: [
  { name: "Nitro", icon: "/assets/icons/nitro.png" },
  { name: "Server Boost", icon: "/assets/icons/server-boost.webp" },
]
```
Set `badges: []` to show none.

### `socials`
Array of social link buttons. Add, remove, or reorder freely. Each item:

```js
{
  name: "GitHub",                 // accessible label / tooltip
  url: "https://github.com/you",  // link target
  brand: "#ffffff",               // hover tint color
  icon: `<svg ...>...</svg>`,     // inline SVG string OR an image URL
}
```
The `icon` can be either an inline SVG string (no extra requests, always
crisp) or an image URL (`https://...`). Both work.

### `music`
Player behavior.

| Key             | Description                                                  |
|-----------------|--------------------------------------------------------------|
| `showArtist`    | `true` shows the artist name next to the title.              |
| `autoplay`      | `true` starts playing after the "click to enter" gesture.    |
| `shuffle`       | `true` plays songs in random order.                          |
| `defaultVolume` | `0.0` (muted) to `1.0` (full). Example: `0.7` = 70%.         |
| `startIndex`    | Which song loads first (`0` = the first song in the list).   |

### `playlist`
Array of songs. Each song:

```js
{
  title: "Song Name",
  artist: "Artist Name",
  cover: "assets/covers/song.jpg",
  audio: "assets/music/song.mp3",
}
```
Songs play in order (or shuffled), looping back to the first after the last.

### `theme`
Colors used across the site. Any valid CSS color works.

| Key             | Description                                       |
|-----------------|---------------------------------------------------|
| `accent`        | Glow / highlight color (name, progress bar).      |
| `cardBg`        | Profile card background (use `rgba` for glass).   |
| `playerBg`      | Music player card background.                     |
| `textPrimary`   | Main text color.                                  |
| `textSecondary` | Muted / secondary text color.                     |

## Performance Notes

The page is already optimized for fast loading:
- `preconnect` / `dns-prefetch` hints warm up connections to the Discord and
  Lanyard servers before they're needed.
- The background and avatar images are preloaded with high priority.
- Scripts use `defer` so they download in parallel and don't block rendering.
- Audio uses `preload="none"` so songs aren't fetched until you press play.
- Social and badge images load lazily.

For an even faster background, consider replacing large `.gif` files with a
`.webp` or `.mp4` — gifs are heavy and a short looping video is much smaller.

## Browser Support

Works in all modern browsers (Chrome, Edge, Firefox, Safari). The responsive
zoom relies on the CSS `zoom` property, which is supported in current versions
of all major browsers.

## License

Free to use and modify for your own personal page.
