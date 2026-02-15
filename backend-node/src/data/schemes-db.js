/**
 * Government Schemes – internal file-based store (normalized).
 * No external APIs. Data is curated and editable via admin.
 */

const fs = require('fs');
const path = require('path');

const STORE_PATH = path.join(__dirname, 'schemes-store.json');

function load() {
  try {
    const raw = fs.readFileSync(STORE_PATH, 'utf8');
    return JSON.parse(raw);
  } catch (err) {
    if (err.code === 'ENOENT') {
      return { schemes: [], scheme_crops: [], scheme_regions: [], scheme_farmer_types: [] };
    }
    throw err;
  }
}

function save(data) {
  fs.writeFileSync(STORE_PATH, JSON.stringify(data, null, 2), 'utf8');
}

function getNextId(table, key = 'id') {
  const data = load();
  const rows = data[table] || [];
  const ids = rows.map((r) => parseInt(r[key], 10)).filter((n) => !Number.isNaN(n));
  return String((ids.length ? Math.max(...ids) : 0) + 1);
}

module.exports = {
  load,
  save,
  getNextId,
  STORE_PATH,
};
