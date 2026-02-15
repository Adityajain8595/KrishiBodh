const express = require('express');
const chatController = require('../controllers/chat.controller');

const router = express.Router();

router.post('/ask', chatController.ask);

module.exports = router;
