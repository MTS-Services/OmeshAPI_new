const logger = require('../../utils/logger');
const TrainingPlanRepository = require('./trainingPlan.repository');

class TrainingPlanServices {
  constructor() {
    this.trainingPlanRepository = new TrainingPlanRepository();
  }

  async create(trainingPlanDTO) {
    try {
      const result =
        await this.trainingPlanRepository.createTrainingPlan(trainingPlanDTO);
      return result;
    } catch (error) {
      logger.error('Create training plan failed:', error);
      throw error;
    }
  }

  async getAll(filterDTO) {
    try {
      const { training, total } =
        await this.trainingPlanRepository.getAll(filterDTO);

      return {
        data: training,
        pagination: {
          currentPage: filterDTO.page,
          itemsPerPage: filterDTO.limit,
          totalItems: total,
          totalPages: Math.ceil(total / filterDTO.limit),
          hasNextPage: filterDTO.page < Math.ceil(total / filterDTO.limit),
          hasPreviousPage: filterDTO.page > 1,
        },
      };
    } catch (error) {
      logger.error('Create training plan failed:', error);
      throw error;
    }
  }

  async getById(id) {
    try {
      const result = await this.trainingPlanRepository.getById(id);
      return result;
    } catch (error) {
      logger.error('get by training plan failed:', error);
      throw error;
    }
  }

  async updateById(id, updateData) {
    try {
      const result = await this.trainingPlanRepository.updateTrainingPlan(
        id,
        updateData,
      );
      return result;
    } catch (error) {
      logger.error('get by training plan failed:', error);
      throw error;
    }
  }

  async deleteData(id) {
    try {
      const result = await this.trainingPlanRepository.deleteTrainingPlan(id);
      return result;
    } catch (error) {
      logger.error('get by training plan failed:', error);
      throw error;
    }
  }
}

module.exports = TrainingPlanServices;
