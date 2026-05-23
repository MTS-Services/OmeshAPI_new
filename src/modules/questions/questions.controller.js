const { asyncHandler } = require('../../middlewares/errorHandler');
const QuestionsService = require('./questions.service');

class QuestionsController {
  constructor() {
    this.services = new QuestionsService();
  }

  contactUs = asyncHandler(async (req, res) => {
    const body = req.body;
    const result = await this.services.contactUs(body);
    res.sendCreated(result, 'Your message has been sent successfully!');
  });
}

module.exports = QuestionsController;
