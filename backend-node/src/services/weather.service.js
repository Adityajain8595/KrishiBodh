/**
 * Real weather data via Open-Meteo (no API key). Geocoding + current conditions.
 * Cache: 30 minutes per location to respect rate limits.
 * Uses multiple geocoding strategies for reliable Indian city lookup.
 */

const GEOCODE_URL = 'https://geocoding-api.open-meteo.com/v1/search';
const FORECAST_URL = 'https://api.open-meteo.com/v1/forecast';

const CACHE_TTL_MS = 30 * 60 * 1000;
const cache = new Map();

/** Indian state/territory name -> capital city (Open-Meteo prefers city names) */
const STATE_CAPITALS = {
  'andhra pradesh': 'Visakhapatnam',
  'arunachal pradesh': 'Itanagar',
  'assam': 'Guwahati',
  'bihar': 'Patna',
  'chhattisgarh': 'Raipur',
  'goa': 'Panaji',
  'gujarat': 'Ahmedabad',
  'haryana': 'Gurgaon',
  'himachal pradesh': 'Shimla',
  'jharkhand': 'Ranchi',
  'karnataka': 'Bangalore',
  'kerala': 'Thiruvananthapuram',
  'madhya pradesh': 'Bhopal',
  'maharashtra': 'Mumbai',
  'manipur': 'Imphal',
  'meghalaya': 'Shillong',
  'mizoram': 'Aizawl',
  'nagaland': 'Kohima',
  'odisha': 'Bhubaneswar',
  'punjab': 'Chandigarh',
  'rajasthan': 'Jaipur',
  'sikkim': 'Gangtok',
  'tamil nadu': 'Chennai',
  'telangana': 'Hyderabad',
  'tripura': 'Agartala',
  'uttar pradesh': 'Lucknow',
  'uttarakhand': 'Dehradun',
  'west bengal': 'Kolkata',
  'delhi': 'New Delhi',
  'chandigarh': 'Chandigarh',
};

function cacheKey(location) {
  return (location || '').trim().toLowerCase();
}

function parseLocation(location) {
  const s = (location || '').trim();
  const parts = s.split(',').map((p) => p.trim()).filter(Boolean);
  const city = parts[0] || '';
  const state = parts[1] || '';
  const query = state ? `${city}, ${state}, India` : `${city}, India`;
  return { city, state, query };
}

async function geocodeWithQuery(nameQuery) {
  if (!nameQuery || nameQuery.length < 2) return null;
  const params = new URLSearchParams({
    name: nameQuery,
    count: '5',
    language: 'en',
    countryCode: 'IN',
  });
  const res = await fetch(`${GEOCODE_URL}?${params}`);
  if (!res.ok) return null;
  const data = await res.json();
  const results = data.results;
  if (!results || results.length === 0) return null;
  const first = results[0];
  return { lat: first.latitude, lon: first.longitude, name: first.name, admin1: first.admin1 || '' };
}

async function geocode(location) {
  const { city, state } = parseLocation(location);
  if (!city && !state) return null;

  // Strategy 1: "City, State" format - try full query first
  if (city && state) {
    const full = await geocodeWithQuery(`${city}, ${state}`);
    if (full) return full;
    // Strategy 2: City only (Open-Meteo works better with simpler queries)
    const cityOnly = await geocodeWithQuery(city);
    if (cityOnly) return cityOnly;
  }

  // Strategy 3: City only (e.g. "Mumbai" or "Kolkata")
  if (city) {
    const cityOnly = await geocodeWithQuery(city);
    if (cityOnly) return cityOnly;
  }

  // Strategy 4: State only - use state capital fallback (e.g. "West Bengal" -> Kolkata)
  const stateKey = (state || city || location || '').trim().toLowerCase();
  const capital = STATE_CAPITALS[stateKey];
  if (capital) {
    const capitalResult = await geocodeWithQuery(capital);
    if (capitalResult) return capitalResult;
  }

  // Strategy 5: Try raw location as-is (handles "Mumbai" etc.)
  const raw = (location || '').trim();
  if (raw.length >= 2) {
    return await geocodeWithQuery(raw);
  }

  return null;
}

async function fetchForecast(lat, lon) {
  const params = new URLSearchParams({
    latitude: lat,
    longitude: lon,
    current: 'temperature_2m,relative_humidity_2m,precipitation',
    timezone: 'auto',
  });
  const res = await fetch(`${FORECAST_URL}?${params}`);
  if (!res.ok) return null;
  const data = await res.json();
  const cur = data.current;
  if (!cur) return null;
  return {
    temperatureC: cur.temperature_2m,
    humidity: cur.relative_humidity_2m,
    precipitationMm: cur.precipitation ?? 0,
  };
}

async function getWeatherForLocation(location) {
  const key = cacheKey(location);
  const cached = cache.get(key);
  if (cached && Date.now() < cached.expiry) return cached.data;

  const coords = await geocode(location);
  if (!coords) return null;

  const weather = await fetchForecast(coords.lat, coords.lon);
  if (!weather) return null;

  const data = {
    city: coords.name,
    state: coords.admin1 || '',
    temperatureC: weather.temperatureC,
    humidity: weather.humidity,
    precipitationMm: weather.precipitationMm,
  };

  cache.set(key, { data, expiry: Date.now() + CACHE_TTL_MS });
  return data;
}

module.exports = {
  getWeatherForLocation,
  parseLocation,
};
