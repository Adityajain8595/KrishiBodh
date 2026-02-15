const pestService = require('../services/pest.service');
const { validationError } = require('../utils/errors');
const { validatePestBody } = require('../utils/validation');

async function analyze(req, res, next) {
  try {
    const err = validatePestBody(req.body);
    if (err) throw validationError(err);
    const result = await pestService.analyzePest(req.body);
    res.json(result);
  } catch (e) {
    next(e);
  }
}

module.exports = { analyze };
