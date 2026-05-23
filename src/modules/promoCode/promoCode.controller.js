// controllers/promoCode.controller.js

const { asyncHandler } = require('../../middlewares/errorHandler');
const {
  CreatePromoCodeDto,
  FilterPromoDTO,
  UpdatePromoCodeDto,
  ApplyPromoDto,
} = require('./promoCode.dto');
const PromoCodeService = require('./promoCode.services');

class PromoCodeController {
  constructor() {
    this.services = new PromoCodeService();
  }

  create = asyncHandler(async (req, res) => {
    const data = new CreatePromoCodeDto(req.body);
    const user = req.user;
    data.userId = user.id;
    const result = await this.services.create(data);
    res.sendCreated(result, 'promo code create successfully');
  });

  getAll = asyncHandler(async (req, res) => {
    const filterDTO = new FilterPromoDTO(req.query);
    const userId = req.user.id;
    const result = await this.services.getAll(filterDTO, userId);
    res.sendSuccess(
      result.data,
      'promo code retrieved successfully',
      result.pagination,
    );
  });

  update = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const data = new UpdatePromoCodeDto(req.body);
    const result = await this.services.update(id, data);
    res.sendSuccess(result, 'promo code updated successfully');
  });

  apply = asyncHandler(async (req, res) => {
    const data = new ApplyPromoDto(req.body);
    const result = await this.services.validateAndApply(data);
    res.sendSuccess(result, 'promo code applied successfully');
  });

  delete = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const result = await this.services.deletePromoCode(id);
    res.sendSuccess(result, 'promo code delete successfully');
  });
}

module.exports = PromoCodeController;
