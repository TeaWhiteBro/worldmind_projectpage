# WorldMind — project page

Static project page for **WorldMind: Decoupled Game World Model for State-Aware NPC Behavior**.

Self-contained: no build step, no external requests. Serve the folder as-is.

```
index.html      page markup
styles.css      all styling (no framework)
script.js       judge-table switching, nav highlighting, copy-to-clipboard
.nojekyll       tell GitHub Pages to serve files verbatim
assets/         fonts (Inter, IBM Plex Mono), figures, hero video, paper PDF
```

Local preview:

```bash
python3 -m http.server 8000
```

## Notes

- One of the three titles is referred to as **Game A** and its frames are blurred.
- Fonts are bundled with their SIL Open Font License texts (`INTER-LICENSE.txt`,
  `IBM-PLEX-MONO-LICENSE.txt`).
- `assets/marquee-wall.mp4` is ~19 MB and autoplays in the hero.
