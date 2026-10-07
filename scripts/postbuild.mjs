// Turns the Expo web export into an installable, mobile-friendly web app (PWA meta, safe areas, dynamic viewport).
import { readFileSync, writeFileSync } from "node:fs";

const file = "dist/index.html";
let html = readFileSync(file, "utf8");
const base = (html.match(/href="([^"]*)\/favicon\.ico"/) ?? [, ""])[1]; // "/nuvo-app" on GitHub Pages, "" at the root

html = html
  .replace('<html lang="en">', '<html lang="pt-BR">')
  .replace(/<meta name="viewport"[^>]*>/, '<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />')
  .replace(/height: 100%;\n      \}\n      \/\* These styles disable/, "height: 100%;\n      }\n      /* These styles disable")
  .replace("</head>", `
    <meta name="theme-color" content="#050505" />
    <meta name="mobile-web-app-capable" content="yes" />
    <meta name="apple-mobile-web-app-capable" content="yes" />
    <meta name="apple-mobile-web-app-title" content="Nuvo" />
    <meta name="apple-mobile-web-app-status-bar-style" content="default" />
    <meta name="description" content="Nuvo: suas finanças num só lugar. Protótipo navegável." />
    <link rel="apple-touch-icon" href="${base}/apple-touch-icon.png" />
    <link rel="manifest" href="${base}/manifest.webmanifest" />
    <style id="nuvo-app-shell">
      html, body { height: 100%; height: 100dvh; background: #050505; }
      body { overscroll-behavior: none; -webkit-text-size-adjust: 100%; -webkit-tap-highlight-color: transparent; touch-action: manipulation; -webkit-user-select: none; user-select: none; -webkit-touch-callout: none; }
      input, textarea { -webkit-user-select: text; user-select: text; }
      #root { height: 100dvh; }
      @media (prefers-reduced-motion: reduce) { * { scroll-behavior: auto !important; } }
    </style>
  </head>`);
writeFileSync(file, html);

writeFileSync("dist/manifest.webmanifest", JSON.stringify({
  name: "Nuvo", short_name: "Nuvo", description: "Gestão financeira pessoal", lang: "pt-BR",
  start_url: `${base}/`, scope: `${base}/`, display: "standalone", orientation: "portrait",
  background_color: "#050505", theme_color: "#050505",
  icons: [
    { src: `${base}/icon-192.png`, sizes: "192x192", type: "image/png", purpose: "any" },
    { src: `${base}/icon-512.png`, sizes: "512x512", type: "image/png", purpose: "any maskable" },
  ],
}, null, 2));
console.log("postbuild ok, base =", JSON.stringify(base));
