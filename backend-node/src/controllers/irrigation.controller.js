const irrigationService = require('../services/irrigation.service');
const { validationError } = require('../utils/errors');
const { validateIrrigationBody } = require('../utils/validation');

async function predict(req, res, next) {
  try {
    const err = validateIrrigationBody(req.body);
    if (err) throw validationError(err);
    const result = await irrigationService.predictIrrigation(req.body);
    res.json(result);
  } catch (e) {
    next(e);
  }
}

module.exports = { predict };
