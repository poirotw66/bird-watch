/**
 * Download bird call audio from Wikimedia Commons (CC BY / CC BY-SA / CC0 / PD).
 * Many files are Xeno-canto uploads mirrored on Commons with clear licenses.
 *
 * Usage: node scripts/fetch-wikimedia-bird-calls.cjs
 */

const https = require('https');
const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

const USER_AGENT =
  'bird-watch-audio-fetch/1.0 (https://github.com/; local dev; mailto:dev@example.invalid)';
const API = 'https://commons.wikimedia.org/w/api.php';
const INAT_API = 'https://api.inaturalist.org/v1/observations';
const OUT_DIR = path.join('public', 'audio', 'bird-calls');
const CURATED_JSON = path.join(__dirname, 'bird-call-commons-curated.json');
const DELAY_MS = 4500;
const BIRD_DELAY_MS = 5500;
const MAX_RETRIES = 5;

/** Seed entries (verified manually). Merged with bird-call-commons-curated.json */
const CURATED_SEED = {
  'chinese-bulbul': 'File:Pycnonotus sinensis - Light-vented Bulbul XC258975.mp3',
  'black-naped-monarch':
    'File:Black-naped monarch call recorded in February 2011 at Agumbe, Karnataka.wav',
  'crested-serpent-eagle': 'File:Crested Serpent eagle.wav',
};

function loadCuratedTitles() {
  const merged = { ...CURATED_SEED };
  if (fs.existsSync(CURATED_JSON)) {
    const parsed = JSON.parse(fs.readFileSync(CURATED_JSON, 'utf8'));
    for (const [id, entry] of Object.entries(parsed)) {
      if (entry?.title) merged[id] = entry.title;
    }
  }
  return merged;
}

const BIRDS = [
  { id: 'mullers-barbet', scientificName: 'Psilopogon nuchalis', englishName: 'Taiwan barbet' },
  { id: 'taiwan-blue-magpie', scientificName: 'Urocissa caerulea', englishName: 'Taiwan blue magpie' },
  { id: 'black-naped-monarch', scientificName: 'Hypothymis azurea', englishName: 'Black-naped monarch' },
  { id: 'black-bulbul', scientificName: 'Hypsipetes leucocephalus', englishName: 'Black bulbul' },
  { id: 'chinese-bulbul', scientificName: 'Pycnonotus sinensis', englishName: 'Light-vented bulbul' },
  { id: 'japanese-white-eye', scientificName: 'Zosterops japonicus', englishName: 'Japanese white-eye' },
  { id: 'taiwan-scimitar-babbler', scientificName: 'Pomatorhinus musicus', englishName: 'Taiwan scimitar babbler' },
  { id: 'black-necklaced-scimitar-babbler', scientificName: 'Erythrogenys erythrocnemis', englishName: 'Black-necklaced scimitar babbler' },
  { id: 'rufous-capped-babbler', scientificName: 'Cyanoderma ruficeps', englishName: 'Rufous-capped babbler' },
  { id: 'taiwan-yuhina', scientificName: 'Yuhina brunneiceps', englishName: 'Taiwan yuhina' },
  { id: 'white-eared-sibia', scientificName: 'Heterophasia auricularis', englishName: 'White-eared sibia' },
  { id: 'black-throated-tit', scientificName: 'Aegithalos concinnus', englishName: 'Black-throated tit' },
  { id: 'green-backed-tit', scientificName: 'Parus monticolus', englishName: 'Green-backed tit' },
  { id: 'rufous-faced-warbler', scientificName: 'Abroscopus albogularis', englishName: 'Rufous-faced warbler' },
  { id: 'yellow-tit', scientificName: 'Machlolophus holsti', englishName: 'Yellow tit' },
  { id: 'flamecrest', scientificName: 'Regulus goodfellowi', englishName: 'Flamecrest' },
  { id: 'taiwan-hwamei', scientificName: 'Garrulax taewanus', englishName: 'Taiwan hwamei' },
  { id: 'grey-capped-pygmy-woodpecker', scientificName: 'Yungipicus canicapillus', englishName: 'Grey-capped pygmy woodpecker' },
  { id: 'crested-serpent-eagle', scientificName: 'Spilornis cheela', englishName: 'Crested serpent eagle' },
  { id: 'collared-bush-robin', scientificName: 'Tarsiger johnstoniae', englishName: 'Collared bush robin' },
];

const SKIP_TITLE = /pdf|video|\.webm|distribution|range map|illustration|drawing/i;

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function httpsGet(url) {
  return new Promise((resolve, reject) => {
    https
      .get(url, { headers: { 'User-Agent': USER_AGENT } }, (res) => {
        const chunks = [];
        res.on('data', (chunk) => chunks.push(chunk));
        res.on('end', () => {
          resolve({ statusCode: res.statusCode, headers: res.headers, body: Buffer.concat(chunks) });
        });
      })
      .on('error', reject);
  });
}

async function fetchJson(url) {
  for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
    const { statusCode, body } = await httpsGet(url);
    if (statusCode === 429) {
      await sleep(DELAY_MS * (attempt + 2));
      continue;
    }
    const text = body.toString('utf8');
    if (statusCode !== 200) {
      throw new Error(`API HTTP ${statusCode}: ${text.slice(0, 80)}`);
    }
    return JSON.parse(text);
  }
  throw new Error('API rate limited after retries');
}

async function downloadFile(url, filepath) {
  if (url.includes('inaturalist.org')) {
    execFileSync('curl', ['-fsSL', '-A', USER_AGENT, '--max-time', '180', '-o', filepath, url], {
      stdio: 'pipe',
    });
    return;
  }
  for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
    const { statusCode, headers, body } = await httpsGet(url);
    if (statusCode === 429) {
      await sleep(DELAY_MS * (attempt + 2));
      continue;
    }
    if (statusCode >= 300 && statusCode < 400 && headers.location) {
      return downloadFile(headers.location, filepath);
    }
    if (statusCode !== 200) {
      throw new Error(`HTTP ${statusCode} for ${url}`);
    }
    fs.writeFileSync(filepath, body);
    return;
  }
  throw new Error(`Download rate limited: ${url}`);
}

function isLicenseAllowed(licenseShort) {
  const lic = (licenseShort || '').toLowerCase();
  if (!lic) return false;
  if (lic.includes('nc') || lic.includes('nd')) return false;
  if (lic.includes('cc0') || lic.includes('public domain') || lic.includes('pd')) return true;
  if (lic.includes('cc by')) return true;
  return false;
}

function extFromMime(mime, url) {
  if (url && /\.mp3(\?|$)/i.test(url)) return '.mp3';
  if (url && /\.wav(\?|$)/i.test(url)) return '.wav';
  if (url && /\.ogg(\?|$)/i.test(url)) return '.ogg';
  if (!mime) return '.mp3';
  if (mime.includes('mpeg') || mime.includes('mp3')) return '.mp3';
  if (mime.includes('ogg')) return '.ogg';
  if (mime.includes('wav')) return '.wav';
  if (mime.includes('flac')) return '.flac';
  return '.mp3';
}

const AUDIO_TITLE = /\.(mp3|ogg|wav|flac|oga)$/i;

async function searchTitles(query) {
  const params = new URLSearchParams({
    action: 'query',
    format: 'json',
    list: 'search',
    srsearch: query,
    srnamespace: '6',
    srlimit: '30',
  });
  const json = await fetchJson(`${API}?${params}`);
  return (json.query?.search || [])
    .map((row) => row.title)
    .filter((t) => !SKIP_TITLE.test(t))
    .filter((t) => AUDIO_TITLE.test(t) || /XC\d+/i.test(t));
}

async function fetchAudioMetaBatch(titles) {
  if (!titles.length) return [];
  const params = new URLSearchParams({
    action: 'query',
    format: 'json',
    titles: titles.join('|'),
    prop: 'imageinfo',
    iiprop: 'url|mime|extmetadata',
  });
  const json = await fetchJson(`${API}?${params}`);
  const pages = json.query?.pages || {};
  const out = [];
  for (const page of Object.values(pages)) {
    const info = page?.imageinfo?.[0];
    if (!info) continue;
    const mime = info.mime || '';
    if (!mime.startsWith('audio/')) continue;
    const licenseShort = info.extmetadata?.LicenseShortName?.value || '';
    if (!isLicenseAllowed(licenseShort)) continue;
    out.push({
      source: 'Wikimedia Commons',
      title: page.title,
      url: info.url,
      mime,
      license: licenseShort,
      pageUrl: info.descriptionurl,
      artist: info.extmetadata?.Artist?.value?.replace(/<[^>]+>/g, '').trim() || '',
    });
  }
  return out;
}

async function fetchAudioMeta(title) {
  const params = new URLSearchParams({
    action: 'query',
    format: 'json',
    titles: title,
    prop: 'imageinfo',
    iiprop: 'url|mime|extmetadata',
  });
  const json = await fetchJson(`${API}?${params}`);
  const pages = json.query?.pages || {};
  const page = Object.values(pages)[0];
  const info = page?.imageinfo?.[0];
  if (!info) return null;
  const mime = info.mime || '';
  if (!mime.startsWith('audio/')) return null;
  const licenseShort = info.extmetadata?.LicenseShortName?.value || '';
  if (!isLicenseAllowed(licenseShort)) return null;
  return {
    source: 'Wikimedia Commons',
    title: page.title,
    url: info.url,
    mime,
    license: licenseShort,
    pageUrl: info.descriptionurl,
    artist: info.extmetadata?.Artist?.value?.replace(/<[^>]+>/g, '').trim() || '',
  };
}

function titleMatchesBird(title, bird) {
  const t = title.toLowerCase();
  const [genus, species] = bird.scientificName.toLowerCase().split(' ');
  return t.includes(genus) && (t.includes(species) || t.includes(bird.englishName.toLowerCase()));
}

function isInatLicenseAllowed(code) {
  const lic = (code || '').toLowerCase();
  if (!lic) return false;
  if (lic.includes('nc') || lic.includes('nd')) return false;
  return lic === 'cc-by' || lic === 'cc0' || lic === 'cc-by-sa';
}

async function findInaturalistSound(bird) {
  const params = new URLSearchParams({
    sounds: 'true',
    taxon_name: bird.scientificName,
    per_page: '100',
    order_by: 'faves',
    order: 'desc',
  });
  const jsonText = execFileSync(
    'curl',
    ['-fsSL', '-A', USER_AGENT, `${INAT_API}?${params.toString()}`],
    { encoding: 'utf8', maxBuffer: 15 * 1024 * 1024 },
  );
  const json = JSON.parse(jsonText);
  for (const obs of json.results || []) {
    for (const sound of obs.sounds || []) {
      if (!isInatLicenseAllowed(sound.license_code)) continue;
      if (!sound.file_url) continue;
      return {
        source: 'iNaturalist',
        url: sound.file_url,
        license: sound.license_code.toUpperCase().replace('CC-', 'CC '),
        pageUrl: `https://www.inaturalist.org/observations/${obs.id}`,
        artist: sound.attribution?.replace(/<[^>]+>/g, '') || obs.user?.login || 'iNaturalist contributor',
        title: `iNaturalist sound ${sound.id} (${bird.scientificName})`,
        mime: sound.file_content_type?.includes('mpeg') ? 'audio/mpeg' : 'audio/wav',
      };
    }
  }
  return null;
}

async function findAudio(bird, curatedTitles) {
  const curated = curatedTitles[bird.id];
  if (curated) {
    const meta = await fetchAudioMeta(curated);
    if (meta && titleMatchesBird(meta.title, bird)) return meta;
  }

  const inat = await findInaturalistSound(bird);
  if (inat) return inat;

  const queries = [`${bird.scientificName} XC`, `${bird.englishName} XC`];
  const seen = new Set();
  for (const query of queries) {
    const titles = await searchTitles(query);
    const batch = titles.filter((t) => {
      if (seen.has(t)) return false;
      seen.add(t);
      return true;
    });
    const metas = await fetchAudioMetaBatch(batch.slice(0, 10));
    if (metas.length > 0) {
      const filtered = metas.filter((m) => titleMatchesBird(m.title, bird));
      const pool = filtered.length > 0 ? filtered : metas;
      pool.sort((a, b) => {
        const score = (m) =>
          (m.title.includes('XC') ? 4 : 0) +
          (m.mime.includes('mpeg') ? 2 : 0) +
          (m.title.toLowerCase().includes(bird.scientificName.split(' ')[0].toLowerCase()) ? 1 : 0);
        return score(b) - score(a);
      });
      return pool[0];
    }
    await sleep(DELAY_MS);
  }
  return null;
}

async function main() {
  fs.mkdirSync(OUT_DIR, { recursive: true });
  const curatedTitles = loadCuratedTitles();
  const credits = {};
  const manifest = { generatedAt: new Date().toISOString(), calls: [] };
  const failed = [];

  for (const bird of BIRDS) {
    process.stdout.write(`\n${bird.id}: `);
    try {
      const globExt = ['.mp3', '.wav', '.ogg', '.flac'].find((ext) =>
        fs.existsSync(path.join(OUT_DIR, `${bird.id}${ext}`)),
      );
      if (globExt) {
        const relPath = `/audio/bird-calls/${bird.id}${globExt}`;
        manifest.calls.push({ id: bird.id, path: relPath, ext: globExt.slice(1) });
        const title = curatedTitles[bird.id];
        if (title) {
          const meta = await fetchAudioMeta(title);
          if (meta) {
            credits[bird.id] = {
              source: 'Wikimedia Commons',
              file: meta.title,
              pageUrl: meta.pageUrl,
              license: meta.license,
              artist: meta.artist,
              xenoCantoNote: meta.title.includes('XC') ? 'Mirrored from Xeno-canto on Commons' : undefined,
            };
          }
        }
        console.log(`skip (already on disk) → ${bird.id}${globExt}`);
        await sleep(BIRD_DELAY_MS);
        continue;
      }

      const hit = await findAudio(bird, curatedTitles);
      if (!hit) {
        console.log('no CC audio found on Commons');
        failed.push(bird.id);
        continue;
      }
      const ext = extFromMime(hit.mime, hit.url);
      const relPath = `/audio/bird-calls/${bird.id}${ext}`;
      const outPath = path.join(OUT_DIR, `${bird.id}${ext}`);
      await downloadFile(hit.url, outPath);
      credits[bird.id] = {
        source: hit.source || 'Wikimedia Commons',
        file: hit.title,
        pageUrl: hit.pageUrl,
        license: hit.license,
        artist: hit.artist,
        xenoCantoNote:
          hit.source === 'iNaturalist'
            ? 'Community sound observation on iNaturalist'
            : hit.title.includes('XC')
              ? 'Mirrored from Xeno-canto on Commons'
              : undefined,
      };
      manifest.calls.push({ id: bird.id, path: relPath, ext: ext.slice(1) });
      console.log(`OK → ${bird.id}${ext} (${hit.license})`);
      await sleep(BIRD_DELAY_MS);
    } catch (err) {
      const msg = err?.message || String(err);
      console.log(`error: ${msg}`);
      failed.push(bird.id);
    }
  }

  fs.writeFileSync(path.join(OUT_DIR, 'manifest.json'), JSON.stringify(manifest, null, 2));

  const creditsPath = path.join('src', 'data', 'birdCallCredits.ts');
  const content = `/**
 * Bird call attribution (Wikimedia Commons / Xeno-canto mirrors).
 * Generated ${new Date().toISOString()}
 */

export const BIRD_CALL_CREDITS = ${JSON.stringify(credits, null, 2)} as const;
`;
  fs.writeFileSync(creditsPath, content);

  console.log('\n---');
  console.log(`Downloaded: ${manifest.calls.length}/${BIRDS.length}`);
  if (failed.length) console.log(`Missing (fallback to synthetic in-game): ${failed.join(', ')}`);
  console.log(`Manifest: ${path.join(OUT_DIR, 'manifest.json')}`);
  console.log(`Credits: ${creditsPath}`);
  if (failed.length) {
    console.log('\nRun discovery batch first, then fetch again:');
    console.log('  npm run discover:bird-calls');
    console.log('  npm run fetch:bird-calls');
    process.exitCode = 1;
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
