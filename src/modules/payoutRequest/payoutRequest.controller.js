const { asyncHandler } = require('../../middlewares/errorHandler');
const {
  CreatePayoutDTO,
  UpdatePayoutStatusDTO,
  filterPayRequestDTO,
} = require('./payoutRequest.dto');
const PayoutServices = require('./payoutRequest.services');

class PayoutController {
  constructor() {
    this.services = new PayoutServices();
  }

  requestPayout = asyncHandler(async (req, res) => {
    const dto = new CreatePayoutDTO(req.body, req.user.id);
    const result = await this.services.create(dto);
    res.sendCreated(result, 'Payout requested successfully');
  });

  // Admin: Saare requests dekhne ke liye
  getAdminPayouts = asyncHandler(async (req, res) => {
    const filterDTO = new filterPayRequestDTO(req.query);
    const result = await this.services.getAll(filterDTO);
    res.sendSuccess(
      result.data,
      'Payouts fetched successfully',
      result.pagination,
    );
  });

  getOrganizerPayouts = asyncHandler(async (req, res) => {
    const filterDTO = new filterPayRequestDTO({
      ...req.query,
      organizerId: req.user.id,
    });
    const result = await this.services.getAll(filterDTO);
    res.sendSuccess(
      result.data,
      'Payouts fetched successfully',
      result.pagination,
    );
  });

  getOrganizerPaymentStates = asyncHandler(async (req, res) => {
    const userid = req.user.id;
    const result = await this.services.getOrganizeBalance(userid);
    res.sendSuccess(result, 'Payouts states fetched successfully');
  });

  // Admin: Approve ya Paid mark karne ke liye
  updateStatus = asyncHandler(async (req, res) => {
    const dto = new UpdatePayoutStatusDTO(req.body, req.user.id);
    const result = await this.services.update(req.params.id, dto);
    res.sendSuccess(result, `Payout status updated to ${dto.status}`);
  });
}

module.exports = PayoutController;
