const { asyncHandler } = require('../../middlewares/errorHandler');
const {
  CreateSponsorRequestDTO,
  FilterSponsorRequestDTO,
} = require('./sponsorRequest.dto');
const SponsorRequestServices = require('./sponsorRequest.services');

const services = new SponsorRequestServices();

class SponsorRequestController {
  submitRequest = asyncHandler(async (req, res) => {
    const dto = new CreateSponsorRequestDTO(req.body);
    const result = await services.create(dto);
    res.sendCreated(result, 'Sponsor request created. Redirecting to payment.');
  });

  wipayConfirm = asyncHandler(async (req, res) => {
    const body = { ...req.query, ...req.body };
    const result = await services.confirmWiPayPayment({
      orderId: body.order_id || body.orderId,
      transactionId: body.transaction_id || body.transactionId,
      status: body.status,
      hash: body.hash,
      message: body.message,
    });
    res.sendSuccess(result, 'Payment confirmed successfully');
  });

  // Admin only
  getAllRequests = asyncHandler(async (req, res) => {
    const filterDTO = new FilterSponsorRequestDTO(req.query);
    const result = await services.getAll(filterDTO);
    res.sendSuccess(
      result.data,
      'Sponsor requests fetched successfully',
      result.pagination,
    );
  });

  deleteRequest = asyncHandler(async (req, res) => {
    await services.deleteById(req.params.id);
    res.sendSuccess(null, 'Sponsor request deleted successfully');
  });
}

module.exports = SponsorRequestController;
