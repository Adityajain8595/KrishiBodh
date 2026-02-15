const chatService = require('../services/chat.service');
const { validationError } = require('../utils/errors');
const { validateChatBody } = require('../utils/validation');

async function ask(req, res, next) {
  try {
    const err = validateChatBody(req.body);
    if (err) throw validationError(err);
    const result = await chatService.ask(req.body);
    res.json(result);
  } catch (e) {
    next(e);
  }
}

module.exports = { ask };
