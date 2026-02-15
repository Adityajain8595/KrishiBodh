const express = require('express');
const marketController = require('../controllers/market.controller');

const router = express.Router();

router.get('/prices', marketController.getPrices);

module.exports = router;

