const marketService = require('../services/market.service');

async function getPrices(req, res, next) {
  try {
    const crop = req.query.crop || '';
    const state = req.query.state || '';
    const mandi = req.query.mandi || req.query.market || '';
    const result = await marketService.getMarketPrices(crop, state, mandi);
    res.json(result);
  } catch (e) {
    next(e);
  }
}

module.exports = { getPrices };

