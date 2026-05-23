const { prisma } = require('../../config/database');
const { AppError } = require('../../middlewares/errorHandler');
const logger = require('../../utils/logger');

class TrainingPlanRepository {
  async createTrainingPlan(trainingPlanDTO) {
    try {
      const result = await prisma.trainingPlan.create({
        data: {
          categoryId: trainingPlanDTO.categoryId,
          durationMin: trainingPlanDTO.durationMin,
          title: trainingPlanDTO.title,
          category: {
            connect: { id: trainingPlanDTO.categoryId },
          },
          description: trainingPlanDTO.description,
          weeks: {
            create: trainingPlanDTO.weeks.map((week) => ({
              weekNo: week.weekNo,
              days: week.days,
            })),
          },
        },
        include: {
          weeks: true,
        },
      });

      logger.info(
        `Training Plan created by admin: ${result.title} (ID: ${result.id})`,
      );
      return result;
    } catch (error) {
      logger.error('Error creating training plan:', error);
      throw error;
    }
  }

  async getAll(filterDTO) {
    try {
      const { sortBy, sortOrder, search, limit, category, isActive } =
        filterDTO;
      const offset = filterDTO.getOffset();

      // 1. Array-based where conditions
      const whereCondition = [];

      // 2. Build Search Clause (OR logic inside AND array)
      if (search) {
        whereCondition.push({
          OR: [
            { title: { contains: search, mode: 'insensitive' } },
            {
              category: {
                plan: { contains: search, mode: 'insensitive' },
              },
            },
          ],
        });
      }

      // 3. Category Filter (Relation-based)
      if (category) {
        whereCondition.push({
          category: {
            slug: category,
          },
        });
      }

      // 4. IsActive Filter (Safe Boolean parsing)
      if (isActive !== undefined && isActive !== null && isActive !== '') {
        const activeStatus = String(isActive).toLowerCase() === 'true';
        whereCondition.push({
          isActive: activeStatus,
        });
      }

      // 5. Final where object
      const finalWhere =
        whereCondition.length > 0 ? { AND: whereCondition } : {};

      const [training, total] = await Promise.all([
        prisma.trainingPlan.findMany({
          where: finalWhere,
          include: {
            weeks: {
              orderBy: { weekNo: 'asc' },
            },
            category: true,
          },
          orderBy: {
            [sortBy]: sortOrder,
          },
          skip: offset,
          take: limit,
        }),
        prisma.trainingPlan.count({ where: finalWhere }),
      ]);

      return {
        training,
        total,
      };
    } catch (error) {
      logger.error('Error getting training plans:', error);
      throw error;
    }
  }

  async getById(id) {
    try {
      const result = await prisma.trainingPlan.findUnique({
        where: { id },
        include: {
          weeks: true,
          category: true,
        },
      });
      return result;
    } catch (error) {
      logger.error('Error getting event:', error);
      throw error;
    }
  }

  async updateTrainingPlan(id, updateData) {
    try {
      const { weeks, ...planData } = updateData;
      const result = await prisma.$transaction(async (tx) => {
        const updatedPlan = await tx.trainingPlan.update({
          where: { id },
          data: {
            ...planData,
            category: {
              connect: { id: updateData.categoryId },
            },
          },
        });

        if (weeks) {
          await tx.trainingWeek.deleteMany({
            where: { planId: id },
          });
          await tx.trainingPlan.update({
            where: { id },
            data: {
              weeks: {
                create: weeks.map((w) => ({
                  weekNo: w.weekNo,
                  days: w.days,
                })),
              },
            },
          });
        }

        return updatedPlan;
      });

      return result;
    } catch (error) {
      logger.error(`Error updating training plan ${id}:`, error);
      throw error;
    }
  }

  async deleteTrainingPlan(id) {
    try {
      const result = await prisma.trainingPlan.delete({
        where: {
          id,
        },
      });

      if (!result) {
        throw new AppError('training Plan not found', 404);
      }

      return result;
    } catch (error) {
      logger.error(`Error updating training plan ${id}:`, error);
      throw error;
    }
  }
}

module.exports = TrainingPlanRepository;
