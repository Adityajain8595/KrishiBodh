const express = require('express');
const cropsController = require('../controllers/crops.controller');

const router = express.Router();

router.get('/list', cropsController.list);
router.post('/recommend', cropsController.recommend);

module.exports = router;
