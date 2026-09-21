# 📸 Memories Studio

**Memories Studio** is a browser-based photobooth and digital memory space. Capture photos with your webcam, apply filters and cute frames, arrange them in custom layouts, decorate them with stickers, and save everything to a personal gallery — all running client-side, no backend required.

> Capture • Create • Remember

---

## ✨ Features

### 🎬 Photobooth (`index.html`)
- **Live webcam capture** via `getUserMedia`, with start/reset/delete/download controls
- **10 photo filters** — Normal, Vintage, B&W, Warm, Cool, Sepia, Pink, Dreamy, Cinematic, Matte
- **10 decorative frames** — Flower, Gingham, Stars, Bunny, Cherry, Heart, Lips, Pink, Red Bow, and None
- **Burst mode** — capture 1, 2, 3, or 4 photos in a row
- **Countdown timer** — Off, 3s, 5s, or 10s before each shot
- **10 photo layouts** — Single, Vertical, Grid, Horizontal, Large ×3, Vertical ×3, Diamond, Polaroid, Collage, Film strip
- Recently captured photos preview strip

### 🖼️ Gallery (`gallery.html`)
- Browse every photo you've saved, with multi-select
- Bulk **delete** or **download** selected photos
- Add **stickers** (✨💖📸🕊️🎉🌸😘 and more) on top of or below your photos
- Print your favorite shots directly from the gallery

### 📖 Moments (`moment.html`)
- A scrapbook / photo-book style view of your saved memories
- Attach a personal **caption/note** to each photo
- Add stickers to individual moments
- Open, edit, or delete any saved memory in a modal viewer

### 👤 Account Pages
- `login.html` / `register.html` — front-end auth UI (email + password forms) for a personalized experience

### ℹ️ Info Pages
- `about.html` — about the studio
- `contact.html` — contact form

---

## 🗂️ Project Structure

```
photo_memories/
├── index.html          # Home page + photobooth
├── gallery.html         # Saved photos gallery
├── moment.html           # Photo-book / moments view
├── login.html            # Login page
├── register.html          # Registration page
├── about.html              # About page
├── contact.html             # Contact page
│
├── design.css               # Home page styles
├── design12.css
├── gallery.css               # Gallery page styles
├── moment.css                 # Moments page styles
├── login.txt                   # Login page styles (rename to login.css)
├── register.css                 # Register page styles
├── about.css                     # About page styles
├── contact.css                    # Contact page styles
│
├── script.js                       # Photobooth logic (camera, filters, frames, layouts)
├── gallery.js                       # Gallery logic (stickers, select, delete, download, print)
├── moment.js                         # Moments logic (captions, stickers, modal)
│
└── image/
    ├── logo.png                       # Site logo
    ├── color_panel.jfif
    ├── panel2.jfif
    ├── panel3.jfif
    └── New folder/                      # Frame & sticker source assets
        ├── Bloc note.jfif
        ├── Fotinho.jfif
        ├── frame.jfif
        ├── frame2.jfif
        └── stikers.jfif
```

---

## 🛠️ Tech Stack

- **HTML5** — page structure & semantic markup
- **CSS3** — all styling, responsive layout, custom themes per page
- **Vanilla JavaScript** — no frameworks, no build step
- **Web APIs used:**
  - [`MediaDevices.getUserMedia()`](https://developer.mozilla.org/en-US/docs/Web/API/MediaDevices/getUserMedia) for webcam access
  - `<canvas>` for capturing and compositing photos (filters, frames, layouts)
  - `localStorage` for persisting the photo gallery (`memories_gallery_photos` key) between sessions
- **Google Fonts** — Bodoni Moda & Montserrat

---

## 🚀 Getting Started

No installation, build tools, or dependencies needed.

1. **Clone the repo**
   ```bash
   git clone https://github.com/<your-username>/memories-studio.git
   cd memories-studio
   ```

2. **Rename `login.txt` to `login.css`**
   ```bash
   mv login.txt login.css
   ```
   *(This file is referenced by `login.html` but was exported with a `.txt` extension.)*

3. **Open in the browser**
   - Simply double-click `index.html`, **or**
   - Serve it locally for full camera support (recommended, since some browsers restrict `getUserMedia` on `file://` URLs):
     ```bash
     npx serve .
     # or
     python -m http.server 8000
     ```
   - Visit `http://localhost:8000` (or the port shown) and allow camera permissions when prompted.

---

## 📌 Notes

- All captured photos are stored **locally in the browser** (`localStorage`) — nothing is uploaded to a server, and clearing browser data will remove saved photos.
- Login/Register pages are front-end only in this version; wire them up to a backend/auth provider if you need real user accounts.
- Camera access requires a secure context (`https://` or `localhost`) in most modern browsers.

---

## 🤝 Contributing

Pull requests are welcome! For major changes, please open an issue first to discuss what you'd like to change.

## 📄 License

This project is available for personal and educational use. Add your preferred license (MIT, etc.) here.
