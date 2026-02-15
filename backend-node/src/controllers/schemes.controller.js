const schemesService = require('../services/schemes.service');
const { validationError, notFoundError } = require('../utils/errors');

async function getEligible(req, res, next) {
  try {
    const state = (req.query.state || '').trim();
    const district = (req.query.district || '').trim() || null;
    const crop = (req.query.crop || '').trim() || null;
    const season = (req.query.season || '').trim() || null;
    const farmer_type = (req.query.farmer_type || '').trim() || null;

    if (!state) throw validationError('state is required');
    // crop, season, farmer_type are optional — used only to refine state-based results

    const validSeasons = ['Kharif', 'Rabi', 'Zaid'];
    const seasonNorm = season ? (validSeasons.find((s) => s.toLowerCase() === season.toLowerCase()) || season) : null;
    const validTypes = ['Small', 'Marginal', 'Large'];
    const typeNorm = farmer_type ? (validTypes.find((t) => t.toLowerCase() === farmer_type.toLowerCase()) || farmer_type) : null;

    const results = schemesService.getEligibleSchemes({
      state,
      district,
      crop: crop || undefined,
      season: seasonNorm || undefined,
      farmer_type: typeNorm || undefined,
    });

    res.json({ schemes: results });
  } catch (e) {
    next(e);
  }
}

async function list(req, res, next) {
  try {
    const all = req.query.all === 'true' || req.query.all === '1';
    const list = schemesService.listSchemes(!all);
    res.json({ schemes: list });
  } catch (e) {
    next(e);
  }
}

async function getById(req, res, next) {
  try {
    const id = req.params.id;
    const scheme = schemesService.getSchemeById(id);
    if (!scheme) throw notFoundError('Scheme not found');
    const relations = schemesService.getSchemeRelations(id);
    res.json({ scheme: { ...scheme, ...relations } });
  } catch (e) {
    next(e);
  }
}

async function create(req, res, next) {
  try {
    const scheme = schemesService.createScheme(req.body);
    res.status(201).json({ scheme });
  } catch (e) {
    next(e);
  }
}

async function update(req, res, next) {
  try {
    const id = req.params.id;
    const scheme = schemesService.updateScheme(id, req.body);
    if (!scheme) throw notFoundError('Scheme not found');
    res.json({ scheme });
  } catch (e) {
    next(e);
  }
}

async function deactivate(req, res, next) {
  try {
    const id = req.params.id;
    const scheme = schemesService.deactivateScheme(id);
    if (!scheme) throw notFoundError('Scheme not found');
    res.json({ scheme });
  } catch (e) {
    next(e);
  }
}

module.exports = {
  getEligible,
  list,
  getById,
  create,
  update,
  deactivate,
};
