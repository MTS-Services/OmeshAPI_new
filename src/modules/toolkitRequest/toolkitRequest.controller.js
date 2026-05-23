const { asyncHandler } = require('../../middlewares/errorHandler');
const {
  CreateToolkitRequestDTO,
  ReviewToolkitDTO,
  filterToolkitDTO,
} = require('./toolkitRequest.dto');
const ToolkitServices = require('./toolkitRequest.services');

const services = new ToolkitServices();

class ToolkitController {
  submitRequest = asyncHandler(async (req, res) => {
    const userId = req.user ? req.user.id : null;
    const dto = new CreateToolkitRequestDTO(req.body, userId);
    const result = await services.create(dto);
    res.sendCreated(result, 'Toolkit request submitted successfully');
  });

  // Admin Only
  getAllRequests = asyncHandler(async (req, res) => {
    const filterDTO = new filterToolkitDTO(req.query);
    const result = await services.getAll(filterDTO);
    res.sendSuccess(
      result.data,
      'Requests fetched successfully',
      result.pagination,
    );
  });

  getRequestById = asyncHandler(async (req, res) => {
    const id = req.params.id;
    const result = await services.getById(id);
    res.sendSuccess(result, 'Requests fetched successfully');
  });

  // Admin Only
  reviewRequest = asyncHandler(async (req, res) => {
    const dto = new ReviewToolkitDTO(req.body, req.user.id);
    const result = await services.update(req.params.id, dto);
    res.sendSuccess(result, 'Request reviewed and updated');
  });

  deleteRequestById = asyncHandler(async (req, res) => {
    const id = req.params.id;
    const result = await services.deleteById(id);
    res.sendSuccess(result, 'Requests delete successfully');
  });
}

module.exports = ToolkitController;
