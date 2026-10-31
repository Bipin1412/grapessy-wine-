# KLIMT Wines – scroll experience (Next.js)

    npm install
    npm run dev      # http://localhost:3000

Everything is driven by one scroll timeline in `components/Experience.tsx` (units = viewport heights; see `TOTAL`).

## Swap in real assets
- Photos: put files in `public/images/` and set paths in `components/Photos.tsx` (`PHOTO_SRC`).
- Bottles: replace `components/Bottle.tsx` with `<img>` cut-outs (keep the 3 crossfading layers).
- Fonts: Cormorant Garamond + Inter Tight (Google Fonts) stand in for the original's licensed serif/grotesk; change `--serif` / `--sans` in `app/globals.css`.
