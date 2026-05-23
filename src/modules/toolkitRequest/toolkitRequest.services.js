const { prisma } = require('../../config/database');
const { AppError } = require('../../middlewares/errorHandler');
const logger = require('../../utils/logger');

class ToolkitServices {
  async create(data) {
    try {
      return await prisma.toolkitRequest.create({ data });
    } catch (error) {
      logger.error('Error creating ToolkitRequest:', error);
      throw error;
    }
  }

  async getAll(filterDTO) {
    try {
      const { search, status, limit, sortBy, sortOrder } = filterDTO;
      const offset = filterDTO.getOffset();
      const whereCondition = [];

      if (status) whereCondition.push({ status });

      if (search) {
        whereCondition.push({
          OR: [
            { eventName: { contains: search, mode: 'insensitive' } },
            { fullName: { contains: search, mode: 'insensitive' } },
            { email: { contains: search, mode: 'insensitive' } },
          ],
        });
      }

      const finalWhere =
        whereCondition.length > 0 ? { AND: whereCondition } : {};

      const [requests, total] = await Promise.all([
        prisma.toolkitRequest.findMany({
          where: finalWhere,
          include: { submitter: { select: { fullName: true, email: true } } },
          orderBy: { [sortBy]: sortOrder },
          skip: offset,
          take: limit,
        }),
        prisma.toolkitRequest.count({ where: finalWhere }),
      ]);

      return {
        data: requests,
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
      logger.error('Error fetching ToolkitRequests:', error);
      throw error;
    }
  }

  async getById(id) {
    try {
      const result = await prisma.toolkitRequest.findUnique({
        where: { id },
      });

      if (!result) {
        throw new AppError('toolkit request not found ', 404);
      }
      return result;
    } catch (error) {
      logger.error('Error fetching ToolkitRequests:', error);
      throw error;
    }
  }

  async update(id, data) {
    try {
      return await prisma.toolkitRequest.update({
        where: { id },
        data,
      });
    } catch (error) {
      if (error.code === 'P2025') throw new Error('Request not found');
      throw error;
    }
  }

  async deleteById(id) {
    try {
      const result = await prisma.toolkitRequest.delete({
        where: { id },
      });

      if (!result) {
        throw new AppError('toolkit not found ', 404);
      }
    } catch (error) {
      logger.error('Error deleting ToolkitRequests:', error);
      throw error;
    }
  }
}

module.exports = ToolkitServices;
