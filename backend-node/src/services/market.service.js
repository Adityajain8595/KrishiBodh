/**
 * Market price data from India Open Government Data (data.gov.in).
 * Requires DATA_GOV_IN_API_KEY in environment. Free registration at https://data.gov.in.
 * Returns min, max, modal prices and date; no random or estimated data.
 */

const DATA_GOV_BASE = 'https://api.data.gov.in/resource';
const RESOURCE_ID = '9ef84268-d588-465a-a308-a864a43d0070';

const CACHE_TTL_MS = 60 * 60 * 1000;
const cache = new Map();

function cacheKey(crop, state, mandi) {
  return [crop || '', state || '', mandi || ''].map((s) => String(s).trim().toLowerCase()).join('|');
}

function norm(s) {
  return String(s || '')
    .toLowerCase()
    .trim()
    .replace(/[()[\]{}.,/\\-]/g, ' ')
    .replace(/\s+/g, ' ');
}

function normalizeIndianStateName(input) {
  const states = [
    'Andhra Pradesh',
    'Arunachal Pradesh',
    'Assam',
    'Bihar',
    'Chhattisgarh',
    'Goa',
    'Gujarat',
    'Haryana',
    'Himachal Pradesh',
    'Jharkhand',
    'Karnataka',
    'Kerala',
    'Madhya Pradesh',
    'Maharashtra',
    'Manipur',
    'Meghalaya',
    'Mizoram',
    'Nagaland',
    'Odisha',
    'Punjab',
    'Rajasthan',
    'Sikkim',
    'Tamil Nadu',
    'Telangana',
    'Tripura',
    'Uttar Pradesh',
    'Uttarakhand',
    'West Bengal',
    'Andaman and Nicobar Islands',
    'Chandigarh',
    'Dadra and Nagar Haveli and Daman and Diu',
    'Delhi',
    'Jammu and Kashmir',
    'Ladakh',
    'Lakshadweep',
    'Puducherry',
  ];
  const key = norm(input);
  if (!key) return '';
  const match = states.find((s) => norm(s) === key);
  return match || '';
}

function cropTokens(crop) {
  const c = norm(crop);
  const synonyms = {
    rice: ['rice', 'paddy', 'dhan'],
    wheat: ['wheat', 'gehun'],
    maize: ['maize', 'corn', 'makka'],
    cotton: ['cotton', 'kapas'],
    sugarcane: ['sugarcane'],
    chickpea: ['chickpea', 'gram', 'bengal gram', 'chana'],
    lentil: ['lentil', 'masur'],
    mustard: ['mustard', 'sarson'],
    groundnut: ['groundnut', 'peanut'],
    potato: ['potato'],
    onion: ['onion'],
    tomato: ['tomato'],
    soybean: ['soybean', 'soyabean'],
    barley: ['barley', 'jau'],
    'pearl millet': ['pearl millet', 'bajra'],
    'pigeon pea': ['pigeon pea', 'arhar', 'tur'],
  };
  return synonyms[c] || (c ? [c] : []);
}

function getField(r, ...names) {
  for (const n of names) {
    if (r && r[n] != null) return r[n];
  }
  return null;
}

function parsePrice(v) {
  if (v == null) return null;
  if (typeof v === 'number') return v;
  const x = parseFloat(String(v).replace(/,/g, ''));
  return Number.isFinite(x) ? x : null;
}

async function fetchPage(apiKey, offset, limit, stateFilterForApi) {
  const params = new URLSearchParams({
    'api-key': apiKey,
    format: 'json',
    limit: String(limit),
    offset: String(offset),
  });
  // data.gov.in supports server-side filtering for state with exact match.
  if (stateFilterForApi && String(stateFilterForApi).trim()) {
    params.set('filters[state]', String(stateFilterForApi).trim());
  }
  const url = `${DATA_GOV_BASE}/${RESOURCE_ID}?${params}`;
  for (let attempt = 0; attempt < 2; attempt += 1) {
    try {
      const res = await fetch(url);
      if (!res.ok) return null;
      return res.json();
    } catch (_) {
      // transient network errors are common on this endpoint
      if (attempt === 0) {
        await new Promise((r) => setTimeout(r, 300));
        continue;
      }
      return null;
    }
  }
  return null;
}

/**
 * Fetch prices from data.gov.in. Returns { prices: [], dataNotAvailable?, source }.
 */
async function getMarketPrices(crop, state, mandi) {
  const apiKey = (process.env.DATA_GOV_IN_API_KEY || '').trim();
  if (!apiKey) {
    return { prices: [], dataNotAvailable: true, source: 'data.gov.in (API key not configured)' };
  }

  const key = cacheKey(crop, state, mandi);
  const cached = cache.get(key);
  if (cached && Date.now() < cached.expiry) return cached.data;

  const cropTerms = cropTokens(crop);
  const stateRawInput = String(state || '').trim();
  const stateCanonical = normalizeIndianStateName(stateRawInput);
  const stateRaw = stateCanonical || stateRawInput;
  const stateTerm = norm(stateRaw);
  const mandiTerm = norm(mandi);

  const LIMIT = 100;
  const MAX_PAGES = cropTerms.length || stateTerm || mandiTerm ? 10 : 2; // up to 1000 records when filtering

  const matches = [];
  let fetchedAny = false;

  for (let page = 0; page < MAX_PAGES; page += 1) {
    const json = await fetchPage(apiKey, page * LIMIT, LIMIT, stateCanonical);
    if (!json) continue;
    fetchedAny = true;

    const records = json.records || [];
    if (!Array.isArray(records) || records.length === 0) break;

    for (const r of records) {
      const commodity = norm(getField(r, 'commodity', 'Commodity'));
      const st = norm(getField(r, 'state', 'State'));
      const market = norm(getField(r, 'market', 'Market'));
      const district = String(getField(r, 'district', 'District') || '').trim();

      if (cropTerms.length) {
        const ok = cropTerms.some((t) => commodity.includes(norm(t)));
        if (!ok) continue;
      }
      if (stateTerm && !st.includes(stateTerm)) continue;
      if (mandiTerm && !market.includes(mandiTerm)) continue;

      matches.push({
        commodity: String(getField(r, 'commodity', 'Commodity') || '').trim(),
        state: String(getField(r, 'state', 'State') || '').trim(),
        district,
        market: String(getField(r, 'market', 'Market') || '').trim(),
        minPrice: parsePrice(getField(r, 'min_price', 'minPrice', 'Min_Price')),
        maxPrice: parsePrice(getField(r, 'max_price', 'maxPrice', 'Max_Price')),
        modalPrice: parsePrice(getField(r, 'modal_price', 'modalPrice', 'Modal_Price')),
        date: String(getField(r, 'arrival_date', 'date', 'Date') || '').trim(),
      });

      if (matches.length >= 50) break;
    }

    if (matches.length >= 50) break;
  }

  const data = fetchedAny
    ? { prices: matches, source: 'data.gov.in (AGMARKNET)' }
    : { prices: [], dataNotAvailable: true, source: 'data.gov.in' };

  cache.set(key, { data, expiry: Date.now() + CACHE_TTL_MS });
  return data;
}

module.exports = {
  getMarketPrices,
};

