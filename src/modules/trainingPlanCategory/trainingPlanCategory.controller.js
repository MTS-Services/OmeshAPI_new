const { asyncHandler } = require('../../middlewares/errorHandler');
const {
  CreateCategoryDTO,
  UpdateCategoryDTO,
} = require('./trainingPlanCategory.dto');
const CategoryServices = require('./trainingPlanCategory.services');

class CategoryController {
  constructor() {
    this.categoryServices = new CategoryServices();
  }

  create = asyncHandler(async (req, res) => {
    const dto = new CreateCategoryDTO(req.body);
    const result = await this.categoryServices.create(dto);
    res.sendCreated(result, 'Category created successfully');
  });

  getAll = asyncHandler(async (req, res) => {
    const result = await this.categoryServices.getAll();
    res.sendSuccess(result, 'Categories retrieved successfully');
  });

  getById = asyncHandler(async (req, res) => {
    const result = await this.categoryServices.getById(req.params.id);
    res.sendSuccess(result, 'Category retrieved successfully');
  });

  update = asyncHandler(async (req, res) => {
    const dto = new UpdateCategoryDTO(req.body);
    const result = await this.categoryServices.update(req.params.id, dto);
    res.sendSuccess(result, 'Category updated successfully');
  });

  delete = asyncHandler(async (req, res) => {
    const result = await this.categoryServices.delete(req.params.id);
    res.sendSuccess(result, 'Category deleted successfully');
  });
}

module.exports = CategoryController;
