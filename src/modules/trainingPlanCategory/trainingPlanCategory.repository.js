const { prisma } = require('../../config/database');
const { AppError } = require('../../middlewares/errorHandler');
const logger = require('../../utils/logger');

class CategoryRepository {
  async create(data) {
    return await prisma.trainingPlanCategory.create({ data });
  }

  async getAll() {
    return await prisma.trainingPlanCategory.findMany({
      include: { _count: { select: { trainingPlans: true } } },
    });
  }

  async getById(id) {
    try {
      const result = await prisma.trainingPlanCategory.findUnique({
        where: { id },
        include: { trainingPlans: true },
      });

      if (!result) {
        throw new AppError('Record not found', 404);
      }
    } catch (error) {
      logger.error(`Error updating training plan ${id}:`, error);
      throw error;
    }
  }

  async update(id, data) {
    try {
      const result = await prisma.trainingPlanCategory.update({
        where: { id },
        data,
      });

      if (!result) {
        throw new AppError('Record not found', 404);
      }

      return result;
    } catch (error) {
      logger.error(`Error updating training plan ${id}:`, error);
      throw error;
    }
  }

  async delete(id) {
    try {
      const result = await prisma.trainingPlanCategory.delete({
        where: { id },
      });

      if (!result) {
        throw new AppError('Record not found', 404);
      }
      return result;
    } catch (error) {
      logger.error(`Error updating training plan ${id}:`, error);
      throw error;
    }
  }
}

module.exports = CategoryRepository;
