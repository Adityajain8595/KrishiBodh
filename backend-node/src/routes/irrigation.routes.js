const express = require('express');
const irrigationController = require('../controllers/irrigation.controller');

const router = express.Router();

router.post('/predict', irrigationController.predict);

module.exports = router;
