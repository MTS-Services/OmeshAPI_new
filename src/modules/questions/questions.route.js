const express = require('express');
const QuestionsController = require('./questions.controller');
const router = express.Router();

const controller = new QuestionsController();
router.post('/', controller.contactUs);

module.exports = router;
