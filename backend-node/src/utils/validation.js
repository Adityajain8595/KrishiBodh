/**
 * Request validation helpers. Returns first error message or null.
 */

function required(value, fieldName) {
  if (value === undefined || value === null) return `${fieldName} is required`;
  if (typeof value === 'string' && value.trim() === '') return `${fieldName} cannot be empty`;
  return null;
}

function numberInRange(value, fieldName, min, max) {
  const n = Number(value);
  if (Number.isNaN(n)) return `${fieldName} must be a number`;
  if (min != null && n < min) return `${fieldName} must be at least ${min}`;
  if (max != null && n > max) return `${fieldName} must be at most ${max}`;
  return null;
}

function oneOf(value, allowed, fieldName) {
  if (!allowed.includes(value)) return `${fieldName} must be one of: ${allowed.join(', ')}`;
  return null;
}

function validateIrrigationBody(body) {
  const { location, farmSize, cropType, growthStage, soilType, irrigationType } = body;
  const errors = [];
  let msg = required(location, 'location'); if (msg) errors.push(msg);
  msg = required(farmSize, 'farmSize'); if (msg) errors.push(msg);
  msg = numberInRange(farmSize, 'farmSize', 0.1, 10000); if (msg) errors.push(msg);
  msg = required(cropType, 'cropType'); if (msg) errors.push(msg);
  msg = required(growthStage, 'growthStage'); if (msg) errors.push(msg);
  msg = required(soilType, 'soilType'); if (msg) errors.push(msg);
  msg = required(irrigationType, 'irrigationType'); if (msg) errors.push(msg);
  return errors.length ? errors[0] : null;
}

function validateCropsBody(body) {
  const { location, soilType, season, farmSize } = body;
  const errors = [];
  let msg = required(location, 'location'); if (msg) errors.push(msg);
  msg = required(soilType, 'soilType'); if (msg) errors.push(msg);
  msg = required(season, 'season'); if (msg) errors.push(msg);
  msg = required(farmSize, 'farmSize'); if (msg) errors.push(msg);
  msg = numberInRange(farmSize, 'farmSize', 0.1, 10000); if (msg) errors.push(msg);
  return errors.length ? errors[0] : null;
}

function validateYieldBody(body) {
  const { cropType, variety, farmSize, growthStage, soilType, irrigationType } = body;
  const errors = [];
  let msg = required(cropType, 'cropType'); if (msg) errors.push(msg);
  msg = required(variety, 'variety'); if (msg) errors.push(msg);
  msg = required(farmSize, 'farmSize'); if (msg) errors.push(msg);
  msg = numberInRange(farmSize, 'farmSize', 0.1, 10000); if (msg) errors.push(msg);
  msg = required(growthStage, 'growthStage'); if (msg) errors.push(msg);
  msg = required(soilType, 'soilType'); if (msg) errors.push(msg);
  msg = required(irrigationType, 'irrigationType'); if (msg) errors.push(msg);
  return errors.length ? errors[0] : null;
}

function validatePestBody(body) {
  const { cropType, growthStage, location } = body;
  const errors = [];
  let msg = required(cropType, 'cropType'); if (msg) errors.push(msg);
  msg = required(growthStage, 'growthStage'); if (msg) errors.push(msg);
  msg = required(location, 'location'); if (msg) errors.push(msg);
  return errors.length ? errors[0] : null;
}

function validateChatBody(body) {
  const { module: mod, question } = body;
  const errors = [];
  let msg = required(mod, 'module'); if (msg) errors.push(msg);
  msg = oneOf(mod, ['AquaFarm', 'AgriSmart', 'CropGuard'], 'module'); if (msg) errors.push(msg);
  msg = required(question, 'question'); if (msg) errors.push(msg);
  else if (typeof question === 'string' && question.trim().length < 2) errors.push('question must be at least 2 characters');
  return errors.length ? errors[0] : null;
}

module.exports = {
  required,
  numberInRange,
  oneOf,
  validateIrrigationBody,
  validateCropsBody,
  validateYieldBody,
  validatePestBody,
  validateChatBody,
};
