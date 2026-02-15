const cropsService = require('../services/crops.service');
const { validationError } = require('../utils/errors');
const { validateCropsBody } = require('../utils/validation');

async function recommend(req, res, next) {
  try {
    const err = validateCropsBody(req.body);
    if (err) throw validationError(err);
    const result = await cropsService.recommendCrops(req.body);
    res.json(result);
  } catch (e) {
    next(e);
  }
}

/** Returns all crop names for schemes filter and admin (single source of truth). */
async function list(req, res, next) {
  try {
    const crops = cropsService.getCropList();
    res.json({ crops });
  } catch (e) {
    next(e);
  }
}

module.exports = { recommend, list };
