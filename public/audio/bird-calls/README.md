# Bird call audio (open license)

All 20 roster species can be fetched automatically:

```bash
npm run fetch:bird-calls
```

Sources (in order):

1. **Wikimedia Commons** curated map (`scripts/bird-call-commons-curated.json`)
2. **iNaturalist** CC BY / CC BY-SA / CC0 sound observations
3. Optional Commons search fallback

Optional: refresh Commons title map (slow, rate-limited):

```bash
npm run discover:bird-calls
```

Outputs:

- `public/audio/bird-calls/*.{mp3,wav}`
- `manifest.json` (game loader)
- `src/data/birdCallCredits.ts` (attribution)

Licenses exclude NC/ND. See credits file for artist and observation links.
