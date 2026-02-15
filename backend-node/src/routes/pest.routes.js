const express = require('express');
const pestController = require('../controllers/pest.controller');

const router = express.Router();

router.post('/analyze', pestController.analyze);

module.exports = router;
