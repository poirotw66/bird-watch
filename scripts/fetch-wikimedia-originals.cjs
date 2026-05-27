/**
 * Download bird originals from Wikimedia Commons (CC BY / CC BY-SA).
 * Usage: node scripts/fetch-wikimedia-originals.cjs
 */

const https = require('https');
const fs = require('fs');
const path = require('path');

const USER_AGENT =
  'bird-watch-image-fetch/1.0 (https://github.com/; local dev; mailto:dev@example.invalid)';
const API = 'https://commons.wikimedia.org/w/api.php';
const OUT_DIR = path.join('public', 'images', 'birds', 'original');
const MIN_WIDTH = 512;
const MIN_HEIGHT = 512;
const DELAY_MS = 2500;
const MAX_RETRIES = 5;

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

const BIRDS = [
  { id: 'mullers-barbet', scientificName: 'Psilopogon nuchalis' },
  { id: 'taiwan-blue-magpie', scientificName: 'Urocissa caerulea' },
  { id: 'black-naped-monarch', scientificName: 'Hypothymis azurea' },
  { id: 'black-bulbul', scientificName: 'Hypsipetes leucocephalus' },
  { id: 'chinese-bulbul', scientificName: 'Pycnonotus sinensis' },
  { id: 'japanese-white-eye', scientificName: 'Zosterops japonicus' },
  { id: 'taiwan-scimitar-babbler', scientificName: 'Pomatorhinus musicus' },
  { id: 'black-necklaced-scimitar-babbler', scientificName: 'Erythrogenys erythrocnemis' },
  { id: 'rufous-capped-babbler', scientificName: 'Cyanoderma ruficeps' },
  { id: 'taiwan-yuhina', scientificName: 'Yuhina brunneiceps' },
  { id: 'white-eared-sibia', scientificName: 'Heterophasia auricularis' },
  { id: 'black-throated-tit', scientificName: 'Aegithalos concinnus' },
  { id: 'green-backed-tit', scientificName: 'Parus monticolus' },
  { id: 'rufous-faced-warbler', scientificName: 'Abroscopus albogularis' },
  { id: 'yellow-tit', scientificName: 'Machlolophus holsti' },
  { id: 'flamecrest', scientificName: 'Regulus goodfellowi' },
  { id: 'taiwan-hwamei', scientificName: 'Garrulax taewanus' },
  { id: 'grey-capped-pygmy-woodpecker', scientificName: 'Yungipicus canicapillus' },
  { id: 'crested-serpent-eagle', scientificName: 'Spilornis cheela' },
  { id: 'collared-bush-robin', scientificName: 'Tarsiger johnstoniae' },
];

const SKIP_TITLE = /distribution|range map|icon|logo|egg|skull|skeleton|illustration|drawing|stamp|postage|audio|video|\.svg/i;

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
    const { statusCode, headers, body } = await httpsGet(url);
    if (statusCode === 429) {
      const wait = DELAY_MS * (attempt + 2);
      await sleep(wait);
      continue;
    }
    const text = body.toString('utf8');
    if (statusCode !== 200 || text.startsWith('You are')) {
      throw new Error(`API HTTP ${statusCode}: ${text.slice(0, 80)}`);
    }
    return JSON.parse(text);
  }
  throw new Error('API rate limited after retries');
}

async function downloadFile(url, filepath) {
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

function pickCandidate(pages) {
  const entries = Object.values(pages || {}).sort((a, b) => (a.index || 0) - (b.index || 0));
  for (const page of entries) {
    if (SKIP_TITLE.test(page.title || '')) continue;
    const info = page.imageinfo?.[0];
    if (!info) continue;
    const mime = info.mime || '';
    if (!/^image\/(jpeg|png|webp)$/i.test(mime)) continue;
    const w = info.width || 0;
    const h = info.height || 0;
    if (w < MIN_WIDTH || h < MIN_HEIGHT) continue;
    const url = info.thumburl || info.url;
    if (!url) continue;
    const ext = mime.includes('png') ? '.png' : '.jpg';
    return {
      url,
      title: page.title,
      descriptionUrl: info.descriptionurl,
      width: w,
      height: h,
      ext,
    };
  }
  return null;
}

async function findImage(scientificName) {
  const params = new URLSearchParams({
    action: 'query',
    format: 'json',
    generator: 'search',
    gsrsearch: scientificName,
    gsrnamespace: '6',
    gsrlimit: '12',
    prop: 'imageinfo',
    iiprop: 'url|size|mime',
    iiurlwidth: '1280',
  });
  const json = await fetchJson(`${API}?${params}`);
  return pickCandidate(json.query?.pages);
}

async function main() {
  fs.mkdirSync(OUT_DIR, { recursive: true });
  const credits = {};
  const failed = [];

  for (const bird of BIRDS) {
    process.stdout.write(`\n${bird.id}: searching… `);
    try {
      const hit = await findImage(bird.scientificName);
      if (!hit) {
        console.log('no suitable file');
        failed.push(bird.id);
        continue;
      }
      const outPath = path.join(OUT_DIR, `${bird.id}${hit.ext}`);
      await downloadFile(hit.url, outPath);
      credits[bird.id] = {
        source: 'Wikimedia Commons',
        file: hit.title,
        pageUrl: hit.descriptionUrl,
        license: 'See file page (typically CC BY or CC BY-SA)',
      };
      console.log(`OK → ${path.basename(outPath)} (${hit.width}x${hit.height})`);
      await sleep(DELAY_MS);
    } catch (err) {
      console.log(`error: ${err.message}`);
      failed.push(bird.id);
    }
  }

  const creditsPath = path.join('src', 'data', 'birdImageCredits.ts');
  fs.mkdirSync(path.dirname(creditsPath), { recursive: true });
  const content = `/**
 * Bird image attribution (Wikimedia Commons).
 * Generated ${new Date().toISOString()}
 */

export const BIRD_IMAGE_CREDITS = ${JSON.stringify(credits, null, 2)} as const;
`;
  fs.writeFileSync(creditsPath, content);

  console.log('\n---');
  console.log(`Downloaded: ${Object.keys(credits).length}/${BIRDS.length}`);
  if (failed.length) console.log(`Failed: ${failed.join(', ')}`);
  console.log(`Credits: ${creditsPath}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
