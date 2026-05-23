const { asyncHandler } = require('../../middlewares/errorHandler');
const {
  CreateTrainingPlanDTO,
  UpdateTrainingPlanDTO,
  filterTrainingDTO,
} = require('./trainingPlan.dto');
const TrainingPlanServices = require('./trainingPlan.service');

class TrainingPlanController {
  constructor() {
    this.trainingPlanServices = new TrainingPlanServices();
  }

  // POST /training-plans
  createTrainingPlan = asyncHandler(async (req, res) => {
    const body = new CreateTrainingPlanDTO(req.body);
    const result = await this.trainingPlanServices.create(body);
    res.sendCreated(result, 'Training plan created successfully');
  });

  // GET /training-plans
  getAllTrainingPlans = asyncHandler(async (req, res) => {
    // Assuming FilterTrainingPlanDTO handles pagination defaults (page, limit)
    const filter = new filterTrainingDTO(req.query);
    const result = await this.trainingPlanServices.getAll(filter);

    res.sendSuccess(
      result.data,
      'Training plans retrieved successfully',
      result.pagination,
    );
  });

  // GET /training-plans/:id
  getTrainingPlanById = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const result = await this.trainingPlanServices.getById(id);

    if (!result) {
      return res.sendNotFound('Training plan not found');
    }

    res.sendSuccess(result, 'Training plan retrieved successfully');
  });

  // PUT or PATCH /training-plans/:id
  updateTrainingPlan = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const updateData = new UpdateTrainingPlanDTO(req.body);
    const result = await this.trainingPlanServices.updateById(id, updateData);

    res.sendSuccess(result, 'Training plan updated successfully');
  });

  // DELETE /training-plans/:id
  deleteTrainingPlan = asyncHandler(async (req, res) => {
    const { id } = req.params;
    await this.trainingPlanServices.deleteData(id);

    res.sendSuccess(null, 'Training plan deleted successfully');
  });
}

module.exports = TrainingPlanController;
