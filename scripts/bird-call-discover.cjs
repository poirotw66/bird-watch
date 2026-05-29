/**
 * Slow Commons search to build verified audio title map (one bird per batch).
 * Usage: node scripts/bird-call-discover.cjs [--only=bird-id] [--delay=6000]
 * Output: scripts/bird-call-commons-curated.json
 */

const https = require('https');
const fs = require('fs');
const path = require('path');

const USER_AGENT =
  'bird-watch-audio-fetch/1.0 (https://github.com/; local dev; mailto:dev@example.invalid)';
const API = 'https://commons.wikimedia.org/w/api.php';
const OUT_JSON = path.join(__dirname, 'bird-call-commons-curated.json');

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

const args = process.argv.slice(2);
const onlyArg = args.find((a) => a.startsWith('--only='));
const delayArg = args.find((a) => a.startsWith('--delay='));
const ONLY = onlyArg ? onlyArg.split('=')[1] : null;
const DELAY_MS = delayArg ? Number(delayArg.split('=')[1]) : 6500;

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

function httpsGet(url) {
  return new Promise((resolve, reject) => {
    https
      .get(url, { headers: { 'User-Agent': USER_AGENT } }, (res) => {
        const chunks = [];
        res.on('data', (c) => chunks.push(c));
        res.on('end', () => resolve({ statusCode: res.statusCode, body: Buffer.concat(chunks) }));
      })
      .on('error', reject);
  });
}

async function fetchJson(url) {
  for (let i = 0; i < 6; i++) {
    const { statusCode, body } = await httpsGet(url);
    if (statusCode === 429) {
      await sleep(DELAY_MS * (i + 2));
      continue;
    }
    const text = body.toString('utf8');
    if (statusCode !== 200 || text.startsWith('You are')) {
      throw new Error(`HTTP ${statusCode}: ${text.slice(0, 60)}`);
    }
    return JSON.parse(text);
  }
  throw new Error('rate limited');
}

function isLicenseAllowed(licenseShort) {
  const lic = (licenseShort || '').toLowerCase();
  if (!lic || lic.includes('nc') || lic.includes('nd')) return false;
  return lic.includes('cc by') || lic.includes('cc0') || lic.includes('public domain');
}

async function searchTitles(query) {
  const params = new URLSearchParams({
    action: 'query',
    format: 'json',
    list: 'search',
    srsearch: query,
    srnamespace: '6',
    srlimit: '40',
  });
  const json = await fetchJson(`${API}?${params}`);
  return (json.query?.search || []).map((r) => r.title);
}

async function metaForTitles(titles) {
  if (!titles.length) return [];
  const params = new URLSearchParams({
    action: 'query',
    format: 'json',
    titles: titles.slice(0, 12).join('|'),
    prop: 'imageinfo',
    iiprop: 'url|mime|extmetadata',
  });
  const json = await fetchJson(`${API}?${params}`);
  const out = [];
  for (const page of Object.values(json.query?.pages || {})) {
    const info = page.imageinfo?.[0];
    if (!info || !(info.mime || '').startsWith('audio/')) continue;
    const license = info.extmetadata?.LicenseShortName?.value || '';
    if (!isLicenseAllowed(license)) continue;
    out.push({ title: page.title, license, mime: info.mime });
  }
  return out;
}

function rankMeta(bird, metas) {
  const genus = bird.scientificName.split(' ')[0].toLowerCase();
  const species = bird.scientificName.split(' ')[1]?.toLowerCase() || '';

  function score(m) {
    const t = m.title.toLowerCase();
    let s = 0;
    if (/xc\d+/i.test(m.title)) s += 5;
    if (t.includes(species)) s += 4;
    if (t.includes(genus)) s += 2;
    if (m.mime.includes('mpeg')) s += 2;
    if (/\.wav$/i.test(m.title)) s += 1;
    return s;
  }

  return [...metas].sort((a, b) => score(b) - score(a));
}

async function resolveBird(bird) {
  const queries = [
    `${bird.scientificName} XC`,
    `${bird.scientificName} mp3`,
    `${bird.englishName} XC`,
    `${bird.englishName} call sound`,
    `${bird.scientificName} sound`,
  ];
  const seen = new Set();
  for (const q of queries) {
    const titles = (await searchTitles(q)).filter((t) => {
      if (seen.has(t)) return false;
      seen.add(t);
      return /\.(mp3|ogg|wav|flac|oga)$/i.test(t) || /XC\d+/i.test(t);
    });
    const metas = rankMeta(bird, await metaForTitles(titles));
    if (metas[0]) return metas[0];
    await sleep(DELAY_MS);
  }
  return null;
}

async function main() {
  let curated = {};
  if (fs.existsSync(OUT_JSON)) {
    curated = JSON.parse(fs.readFileSync(OUT_JSON, 'utf8'));
  }

  const birds = ONLY ? BIRDS.filter((b) => b.id === ONLY) : BIRDS;
  for (const bird of birds) {
    if (curated[bird.id]?.title && !ONLY) {
      process.stdout.write(`${bird.id}: cached\n`);
      continue;
    }
    process.stdout.write(`${bird.id}: searching… `);
    try {
      const hit = await resolveBird(bird);
      if (hit) {
        curated[bird.id] = hit;
        console.log(hit.title);
      } else {
        console.log('NOT FOUND');
      }
    } catch (e) {
      console.log(`ERR ${e.message}`);
    }
    fs.writeFileSync(OUT_JSON, JSON.stringify(curated, null, 2));
    await sleep(DELAY_MS);
  }

  const found = Object.keys(curated).length;
  console.log(`\nMapped ${found}/${BIRDS.length} → ${OUT_JSON}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
