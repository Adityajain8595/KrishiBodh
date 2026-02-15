const yieldService = require('../services/yield.service');
const { validationError } = require('../utils/errors');
const { validateYieldBody } = require('../utils/validation');

async function predict(req, res, next) {
  try {
    const err = validateYieldBody(req.body);
    if (err) throw validationError(err);
    const result = await yieldService.predictYield(req.body);
    res.json(result);
  } catch (e) {
    next(e);
  }
}

module.exports = { predict };
