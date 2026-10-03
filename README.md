# JeevanSetu

JeevanSetu is a Vite + React web application. ESP32 firmware and its PlatformIO
configuration are in `hardware/`; firmware dependencies are declared in
`hardware/platformio.ini`.

## Run locally

```sh
npm ci
npm run dev
```

## Deploy to Vercel

Import the web-app repository and set Vercel's **Root Directory** to the folder
containing `package.json` and `vercel.json` (`.` when this directory is the
repository root). The Vercel configuration installs dependencies with `npm ci`,
runs `npm run build`, and serves the generated `dist/` directory. Client-side
routes are rewritten to `index.html`.

Set the `VITE_FIREBASE_*` environment variables in the Vercel project settings
using the public client configuration for the Firebase project. The optional
`VITE_GOOGLE_MAPS_API_KEY` and `VITE_GEMINI_API_KEY` variables are needed only
when using those integrations. These `VITE_` values are included in the browser
bundle and must not contain server-side secrets.

## Build ESP32 firmware

Install PlatformIO Core, then run:

```sh
pio run -d hardware
```

PlatformIO downloads the libraries declared in `hardware/platformio.ini` during
the build.
