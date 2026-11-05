# Luxury Walk — scroll perfume site
Static site (no build step). Upload everything to a GitHub repo, then Settings > Pages > Deploy from branch `main` / root.

## Before you go live (top of script.js)
- `STORE.phone`: your WhatsApp number with country code, no + or spaces (Botswana: 267xxxxxxxx)
- `STORE.address` and `STORE.hours`
- `PRODUCTS`: names, prices (Pula) and images. Prices in the file are placeholders.

## 3D
`scene3d.js` builds the 3D scenes from your photos in `images/` using three.js (loaded from cdnjs). It needs internet and WebGL, and must be served over http(s), so use GitHub Pages or a local server (double-clicking index.html will not load the 3D textures). If anything fails, the site falls back to the 2D photo version.

## Extras
- Preloader: waits for the images, then reveals the site (`viewer.js`, `#pre` in index.html).
- Tap to spray: button appears during the bottle scene; also inside the viewer. Plays a short hiss and vibrates on phones.
- 3D viewer: "3D view" on every product card and in the collection scene. Drag to rotate, pinch or scroll to zoom.
