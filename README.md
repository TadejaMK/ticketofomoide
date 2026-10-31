# Ticket of Omoide

Every memory deserves a stub. Drop in a photo, add the details, and craft a keepsake ticket that's stored in your browser.

**Live site:** https://ticketofomoide.netlify.app/

## Features

- **Photo upload:** click or drag and drop an image onto the ticket
- **Customizable details:** title, location, date, an optional note, and an optional seat or tag
- **Live preview:** see the ticket update as you type
- **Download as PNG** to keep or share
- **Vault:** save tickets in your browser, then reload them into the editor, download them again, or delete them
- **Light and dark mode** toggle

## Usage

1. Add a photo and fill in the ticket details.
2. Check the live preview.
3. Click **Save to Vault** to keep it, or **Download PNG** to export it.
4. Find saved tickets in the Vault Collection. From there you can load them back into the editor, download them, or delete them.

## Run locally

If the project is plain HTML, CSS, and JavaScript with no build step, serve the folder with any static server:

```bash
python3 -m http.server 8000
# or
npx serve .
```

Then open http://localhost:8000.

## Deploy

The site is hosted on Netlify and deploys automatically from the `main` branch.

## Data

Photos and tickets are stored locally in your browser. Nothing is uploaded to a server. Clearing your browser data will remove your vault, so download any tickets you want to keep.
