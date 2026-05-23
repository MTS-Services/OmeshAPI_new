const { asyncHandler } = require('../../middlewares/errorHandler');
const {
  CreateEnrollmentDTO,
  UpdateEnrollmentStatusDTO,
  filterPlanEnrollmentDTO,
} = require('./trainingEnrollment.dto');
const EnrollmentServices = require('./trainingEnrollment.services');

class EnrollmentController {
  constructor() {
    this.services = new EnrollmentServices();
  }

  enroll = asyncHandler(async (req, res) => {
    const dto = new CreateEnrollmentDTO(req.body, req.user.id);
    const result = await this.services.enroll(dto);
    res.sendCreated(result, 'Enrolled in training plan successfully');
  });

  getMyEnrollments = asyncHandler(async (req, res) => {
    const filterDTO = new filterPlanEnrollmentDTO(req.query);
    const result = await this.services.getMyEnrollments(req.user.id, filterDTO);
    res.sendSuccess(result, 'Enrollments retrieved successfully');
  });

  exportEnrollments = asyncHandler(async (req, res) => {
    await this.services.exportEnrollments(req, res);
  });

  getAllEnrollments = asyncHandler(async (req, res) => {
    const filterDTO = new filterPlanEnrollmentDTO(req.query);
    const result = await this.services.getAllEnrollments(filterDTO);
    res.sendSuccess(
      result.data,
      'Enrollments retrieved successfully',
      result.pagination,
    );
  });

  updateStatus = asyncHandler(async (req, res) => {
    const dto = new UpdateEnrollmentStatusDTO(req.body);
    const result = await this.services.updateStatus(req.params.id, dto);
    res.sendSuccess(result, `Status updated to ${dto.status}`);
  });
}

module.exports = EnrollmentController;
