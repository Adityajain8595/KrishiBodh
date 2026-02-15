/**
 * Unit tests for Government Schemes eligibility logic (deterministic, rule-based).
 * Run with: node --test src/services/schemes.eligibility.test.js
 */

const { describe, it } = require('node:test');
const assert = require('node:assert');

// Inline eligibility logic for testing (no file I/O)
function normalize(s) {
  if (s == null || typeof s !== 'string') return '';
  return s.trim().toLowerCase();
}

function stateMatches(regionState, regionDistrict, userState, userDistrict) {
  const rState = normalize(regionState);
  const uState = normalize(userState);
  if (rState !== uState) return false;
  if (regionDistrict == null || regionDistrict === '') return true;
  const rDist = normalize(regionDistrict);
  const uDist = normalize(userDistrict || '');
  return rDist === '' || rDist === uDist;
}

function cropSeasonMatch(schemeCrops, userCrop, userSeason) {
  const uCrop = normalize(userCrop);
  const uSeason = normalize(userSeason);
  return schemeCrops.some((r) => {
    const c = normalize(r.crop_name);
    const s = normalize(r.season);
    if (c === 'all' && (s === 'all' || s === 'year-round' || s === uSeason)) return true;
    if (s !== 'all' && s !== 'year-round' && s !== uSeason) return false;
    return c === uCrop;
  });
}

function regionMatch(schemeRegions, userState, userDistrict) {
  return schemeRegions.some((r) =>
    stateMatches(r.state, r.district, userState, userDistrict)
  );
}

function farmerTypeMatch(schemeFarmerTypes, userFarmerType) {
  const u = normalize(userFarmerType);
  return schemeFarmerTypes.some((r) => normalize(r.farmer_type) === u);
}

describe('schemes eligibility', () => {
  it('stateMatches: same state, no district', () => {
    assert.strictEqual(stateMatches('Karnataka', null, 'Karnataka', ''), true);
    assert.strictEqual(stateMatches('Karnataka', '', 'Karnataka', ''), true);
  });

  it('stateMatches: different state', () => {
    assert.strictEqual(stateMatches('Karnataka', null, 'Maharashtra', ''), false);
  });

  it('stateMatches: state + district', () => {
    assert.strictEqual(stateMatches('Karnataka', 'Bengaluru', 'Karnataka', 'Bengaluru'), true);
    assert.strictEqual(stateMatches('Karnataka', 'Bengaluru', 'Karnataka', ''), false);
  });

  it('cropSeasonMatch: All/All matches any', () => {
    assert.strictEqual(
      cropSeasonMatch([{ crop_name: 'All', season: 'All' }], 'Wheat', 'Rabi'),
      true
    );
  });

  it('cropSeasonMatch: specific crop and season', () => {
    const crops = [{ crop_name: 'Wheat', season: 'Rabi' }];
    assert.strictEqual(cropSeasonMatch(crops, 'Wheat', 'Rabi'), true);
    assert.strictEqual(cropSeasonMatch(crops, 'Wheat', 'Kharif'), false);
    assert.strictEqual(cropSeasonMatch(crops, 'Rice', 'Rabi'), false);
  });

  it('cropSeasonMatch: Year-round season', () => {
    assert.strictEqual(
      cropSeasonMatch([{ crop_name: 'Sugarcane', season: 'Year-round' }], 'Sugarcane', 'Kharif'),
      true
    );
  });

  it('farmerTypeMatch: exact match', () => {
    const types = [{ farmer_type: 'Small' }, { farmer_type: 'Marginal' }];
    assert.strictEqual(farmerTypeMatch(types, 'Small'), true);
    assert.strictEqual(farmerTypeMatch(types, 'Marginal'), true);
    assert.strictEqual(farmerTypeMatch(types, 'Large'), false);
  });

  it('farmerTypeMatch: case insensitive', () => {
    const types = [{ farmer_type: 'Small' }];
    assert.strictEqual(farmerTypeMatch(types, 'small'), true);
  });
});
