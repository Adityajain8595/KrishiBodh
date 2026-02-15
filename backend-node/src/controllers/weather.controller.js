const weatherService = require('../services/weather.service');
const { validationError } = require('../utils/errors');

async function getWeather(req, res, next) {
  try {
    const location = req.query.location;
    if (!location || typeof location !== 'string' || location.trim() === '') {
      throw validationError('location query is required (e.g. city, state)');
    }
    const data = await weatherService.getWeatherForLocation(location.trim());
    if (!data) {
      return res.status(404).json({ error: 'Weather not found for this location. Try another city or state in India.' });
    }
    res.json(data);
  } catch (e) {
    next(e);
  }
}

module.exports = { getWeather };
