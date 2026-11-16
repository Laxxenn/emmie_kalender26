# Christmas calendar

A free, static calendar site. Door N unlocks on December N and shows a message, an optional image and a QR code.

## Put it online (GitHub Pages, free)

1. Create a GitHub account and a new **public** repository (free Pages sites need a public repo).
2. Upload everything in this folder to the repository (Add file > Upload files).
3. Open Settings > Pages. Under "Build and deployment" choose "Deploy from a branch", branch `main`, folder `/ (root)`, then Save.
4. After a minute your site is live at `https://YOUR-USERNAME.github.io/REPO-NAME/`.

Only you can change it, because it lives in your repository.

## Customize

Open `days.js`. Each door has:

- `title` and `message`: the text shown when the door opens.
- `image`: a photo for that day, e.g. `days/05/photo.jpg`.
- `qr`: a QR code image you made yourself, e.g. `days/05/qr.png`.
- `link`: a YouTube link, an image in this site (`days/05/photo.jpg`) or any page. If `qr` is empty, the QR code is generated for you.

Put each day's files in its folder, `days/01` to `days/24`. Also change `title`, `subtitle` and `year` at the top of `days.js`.

## Preview before December

Open `index.html?preview` to unlock every door. Without `?preview`, doors follow the real date.

To test on your computer, run `python3 -m http.server` in this folder and open `http://localhost:8000/index.html?preview`.

## Good to know

- Locks are checked in the visitor's browser, so changing the device clock opens doors early.
- The repository is public, so anyone who browses it can see files for days that haven't opened yet. For videos, use unlisted YouTube links instead of uploading the files.
- A QR code generated from a relative link like `days/05/photo.jpg` points at whatever address you are viewing the site on, so check generated QR codes on the live site, not on localhost.
