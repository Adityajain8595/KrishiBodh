/**
 * Government Schemes – eligibility and CRUD.
 * Deterministic rule-based matching only. No AI, no external APIs.
 */

const db = require('../data/schemes-db');

const SEASONS = ['Kharif', 'Rabi', 'Zaid', 'All', 'Year-round'];
const FARMER_TYPES = ['Small', 'Marginal', 'Large'];

function normalize(s) {
  if (s == null || typeof s !== 'string') return '';
  return s.trim().toLowerCase();
}

/** Central schemes use state "All India" in scheme_regions; they match any user state. */
function stateMatches(regionState, regionDistrict, userState, userDistrict) {
  const rState = normalize(regionState);
  const uState = normalize(userState);
  if (rState === 'all india') return true;
  if (rState !== uState) return false;
  if (regionDistrict == null || regionDistrict === '') return true;
  const rDist = normalize(regionDistrict);
  const uDist = normalize(userDistrict || '');
  return rDist === '' || rDist === uDist;
}

/**
 * Rule-based eligibility (centralized):
 * - Base: state match → scheme is eligible for that state.
 * - Optional refinement: if crop provided → scheme must support that crop (and season if provided).
 * - Optional refinement: if season provided → scheme must match season.
 * - Optional refinement: if farmer_type provided → scheme must support that farmer type.
 * Never return empty solely because crop/season/farmer_type are not selected.
 */
function getEligibleSchemes(params) {
  const { state, district, crop, season, farmer_type } = params;
  const data = db.load();
  const { schemes, scheme_crops, scheme_regions, scheme_farmer_types } = data;

  const hasCrop = crop != null && String(crop).trim() !== '';
  const hasSeason = season != null && String(season).trim() !== '';
  const hasFarmerType = farmer_type != null && String(farmer_type).trim() !== '';

  const uCrop = normalize(crop);
  const uSeason = normalize(season);
  const uFarmerType = normalize(farmer_type);

  const results = [];

  for (const scheme of schemes) {
    if (!scheme.is_active) continue;
    if (scheme.end_date && new Date(scheme.end_date) < new Date()) continue;

    const schemeId = String(scheme.id);

    // Base eligibility: region (state) match only
    const regionRows = scheme_regions.filter((r) => String(r.scheme_id) === schemeId);
    const regionMatch = regionRows.some((r) =>
      stateMatches(r.state, r.district, state, district)
    );
    if (!regionMatch) continue;

    // Optional refinement: crop and/or season. scheme_crops supports any crop name from crops table;
    // crop_name "All" means scheme is crop-agnostic (shown for every crop filter).
    if (hasCrop || hasSeason) {
      const cropRows = scheme_crops.filter((r) => String(r.scheme_id) === schemeId);
      const cropMatch = cropRows.some((r) => {
        const c = normalize(r.crop_name);
        const s = normalize(r.season);
        const cropOk = !hasCrop || c === 'all' || c === uCrop;
        const seasonOk = !hasSeason || s === 'all' || s === 'year-round' || s === uSeason;
        return cropOk && seasonOk;
      });
      if (!cropMatch) continue;
    }

    // Optional refinement: farmer type
    if (hasFarmerType) {
      const farmerRows = scheme_farmer_types.filter((r) => String(r.scheme_id) === schemeId);
      const farmerMatch = farmerRows.some((r) => normalize(r.farmer_type) === uFarmerType);
      if (!farmerMatch) continue;
    }

    const reasons = [];
    reasons.push(`Region (state: ${state}${district ? `, district: ${district}` : ''}) is covered.`);
    if (hasCrop) reasons.push(`Crop "${crop}" matches scheme crops.`);
    if (hasSeason) reasons.push(`Season "${season}" matches.`);
    if (hasFarmerType) reasons.push(`Farmer type "${farmer_type}" is eligible.`);

    const applicationModes = (scheme.application_mode || '')
      .split(',')
      .map((m) => m.trim())
      .filter(Boolean);

    results.push({
      scheme: {
        id: scheme.id,
        name: scheme.name,
        name_hi: scheme.name_hi,
        description: scheme.description,
        description_hi: scheme.description_hi,
        benefits: scheme.benefits,
        benefits_hi: scheme.benefits_hi,
        eligibility_text: scheme.eligibility_text,
        eligibility_text_hi: scheme.eligibility_text_hi,
        application_process: scheme.application_process,
        application_process_hi: scheme.application_process_hi,
        application_mode: scheme.application_mode,
        start_date: scheme.start_date,
        end_date: scheme.end_date,
        deadline: scheme.deadline,
        source_url: scheme.source_url,
        external_link: scheme.external_link || scheme.source_url || null,
        last_verified_date: scheme.last_verified_date,
        scheme_level: scheme.scheme_level || 'State',
        benefit_tags: scheme.benefit_tags || '',
        needs_admin_review: Boolean(scheme.needs_admin_review),
      },
      eligibility_reason: reasons.join(' '),
      eligibility_reason_hi: `क्षेत्र कवर।${hasCrop ? ' फसल मेल।' : ''}${hasFarmerType ? ' किसान प्रकार पात्र।' : ''}`,
      application_mode: applicationModes,
    });
  }

  // Sort: active, then by id (deterministic order; no hardcoded limit)
  results.sort((a, b) => String(a.scheme.id).localeCompare(String(b.scheme.id)));
  return results;
}

/** List schemes: activeOnly=true returns only active (user-facing); false returns all (admin). No hardcoded limit. */
function listSchemes(activeOnly = true) {
  const data = db.load();
  const list = activeOnly ? data.schemes.filter((s) => s.is_active) : data.schemes;
  return list.sort((a, b) => String(a.id).localeCompare(String(b.id)));
}

function getSchemeById(id) {
  const data = db.load();
  return data.schemes.find((s) => String(s.id) === String(id)) || null;
}

function getSchemeRelations(id) {
  const data = db.load();
  const sid = String(id);
  return {
    crops: data.scheme_crops.filter((r) => String(r.scheme_id) === sid),
    regions: data.scheme_regions.filter((r) => String(r.scheme_id) === sid),
    farmer_types: data.scheme_farmer_types.filter((r) => String(r.scheme_id) === sid),
  };
}

function createScheme(body) {
  const data = db.load();
  const id = db.getNextId('schemes');
  const scheme = {
    id,
    name: body.name || '',
    name_hi: body.name_hi || '',
    description: body.description || '',
    description_hi: body.description_hi || '',
    benefits: body.benefits || '',
    benefits_hi: body.benefits_hi || '',
    eligibility_text: body.eligibility_text || '',
    eligibility_text_hi: body.eligibility_text_hi || '',
    application_process: body.application_process || '',
    application_process_hi: body.application_process_hi || '',
    application_mode: body.application_mode || '',
    start_date: body.start_date || null,
    end_date: body.end_date || null,
    is_active: body.is_active !== false,
    source_url: body.source_url || '',
    external_link: body.external_link || null,
    last_verified_date: body.last_verified_date || null,
    deadline: body.deadline || null,
    scheme_level: body.scheme_level || 'State',
    benefit_tags: body.benefit_tags || '',
    needs_admin_review: Boolean(body.needs_admin_review),
  };
  data.schemes.push(scheme);
  if (Array.isArray(body.crops)) {
    body.crops.forEach((c) => {
      data.scheme_crops.push({
        scheme_id: id,
        crop_name: c.crop_name || c,
        season: c.season || 'All',
      });
    });
  }
  if (Array.isArray(body.regions)) {
    body.regions.forEach((r) => {
      data.scheme_regions.push({
        scheme_id: id,
        state: r.state || r,
        district: r.district ?? null,
      });
    });
  }
  if (Array.isArray(body.farmer_types)) {
    body.farmer_types.forEach((f) => {
      data.scheme_farmer_types.push({
        scheme_id: id,
        farmer_type: typeof f === 'string' ? f : f.farmer_type,
      });
    });
  }
  db.save(data);
  return scheme;
}

function updateScheme(id, body) {
  const data = db.load();
  const index = data.schemes.findIndex((s) => String(s.id) === String(id));
  if (index === -1) return null;
  const scheme = data.schemes[index];
  const allowed = [
    'name', 'name_hi', 'description', 'description_hi', 'benefits', 'benefits_hi',
    'eligibility_text', 'eligibility_text_hi', 'application_process', 'application_process_hi',
    'application_mode', 'start_date', 'end_date', 'is_active', 'source_url', 'external_link',
    'last_verified_date', 'deadline', 'scheme_level', 'benefit_tags', 'needs_admin_review',
  ];
  allowed.forEach((key) => {
    if (body[key] !== undefined) scheme[key] = body[key];
  });
  if (Array.isArray(body.crops)) {
    data.scheme_crops = data.scheme_crops.filter((r) => String(r.scheme_id) !== String(id));
    body.crops.forEach((c) => {
      data.scheme_crops.push({
        scheme_id: String(id),
        crop_name: c.crop_name || c,
        season: c.season || 'All',
      });
    });
  }
  if (Array.isArray(body.regions)) {
    data.scheme_regions = data.scheme_regions.filter((r) => String(r.scheme_id) !== String(id));
    body.regions.forEach((r) => {
      data.scheme_regions.push({
        scheme_id: String(id),
        state: r.state || r,
        district: r.district ?? null,
      });
    });
  }
  if (Array.isArray(body.farmer_types)) {
    data.scheme_farmer_types = data.scheme_farmer_types.filter((r) => String(r.scheme_id) !== String(id));
    body.farmer_types.forEach((f) => {
      data.scheme_farmer_types.push({
        scheme_id: String(id),
        farmer_type: typeof f === 'string' ? f : f.farmer_type,
      });
    });
  }
  db.save(data);
  return scheme;
}

function deactivateScheme(id) {
  return updateScheme(id, { is_active: false });
}

module.exports = {
  getEligibleSchemes,
  listSchemes,
  getSchemeById,
  getSchemeRelations,
  createScheme,
  updateScheme,
  deactivateScheme,
  SEASONS,
  FARMER_TYPES,
};
