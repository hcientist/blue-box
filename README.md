# Blue Box

A minimal web app that streams your microphone directly to your speaker output in real time. Designed to turn your phone + a Bluetooth speaker into a portable audio amplification system.

## Usage

1. Open the app (hosted on [GitHub Pages](https://hcientist.github.io/blue-box/) or run locally)
2. Tap **Start** to begin streaming
3. Adjust the **Volume** slider (0x – 3x)
4. Tap **Stop** to end

Works best on a phone connected to a Bluetooth speaker. Avoid using on a laptop without headphones — you'll get audio feedback.

## Development

```bash
npm install
npm run dev
```

## Deploy

Pushes to `main` automatically deploy to GitHub Pages via GitHub Actions. Make sure **Settings → Pages → Source** is set to **GitHub Actions** in your repo.
