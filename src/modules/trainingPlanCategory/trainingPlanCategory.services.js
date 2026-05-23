const logger = require('../../utils/logger');
const CategoryRepository = require('./trainingPlanCategory.repository');

class CategoryServices {
  constructor() {
    this.categoryRepository = new CategoryRepository();
  }

  async create(dto) {
    try {
      return await this.categoryRepository.create(dto);
    } catch (error) {
      logger.error('Create training plan category failed:', error);
      throw error;
    }
  }

  async getAll() {
    try {
      return await this.categoryRepository.getAll();
    } catch (error) {
      logger.error('Getting training plan category failed:', error);
      throw error;
    }
  }

  async getById(id) {
    try {
      return await this.categoryRepository.getById(id);
    } catch (error) {
      logger.error('Getting by id training plan category failed:', error);
      throw error;
    }
  }

  async update(id, dto) {
    try {
      return await this.categoryRepository.update(id, dto);
    } catch (error) {
      logger.error('Update training plan category failed:', error);
      throw error;
    }
  }

  async delete(id) {
    try {
      return await this.categoryRepository.delete(id);
    } catch (error) {
      logger.error('delete training plan category failed:', error);
      throw error;
    }
  }
}

module.exports = CategoryServices;
