const express = require('express');
const yieldController = require('../controllers/yield.controller');

const router = express.Router();

router.post('/predict', yieldController.predict);

module.exports = router;
