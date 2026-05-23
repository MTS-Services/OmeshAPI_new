const { prisma } = require('../../config/database');
const { AppError } = require('../../middlewares/errorHandler');
const logger = require('../../utils/logger');
const XLSX = require('xlsx');

class EnrollmentRepository {
  async enroll(data) {
    try {
      return await prisma.trainingEnrollment.create({
        data,
        include: { plan: true },
      });
    } catch (error) {
      logger.error('Error in EnrollmentRepository.enroll:', error);
      throw error;
    }
  }

  async getMyEnrollments(userId, filterDTO) {
    try {
      const { sortBy, sortOrder, status, limit } = filterDTO;

      const offset = filterDTO.getOffset();
      const whereCondition = [];
      if (userId) {
        whereCondition.push({
          userId: userId,
        });
      }

      if (status) {
        whereCondition.push({
          status: status,
        });
      }

      const finalWhere =
        whereCondition.length > 0 ? { AND: whereCondition } : {};

      const [trainingEnrollment, total] = await Promise.all([
        prisma.trainingEnrollment.findMany({
          where: finalWhere,
          skip: offset,
          take: limit,
        }),
        prisma.trainingEnrollment.count({ where: finalWhere }),
      ]);

      return {
        data: trainingEnrollment,
        total,
      };
    } catch (error) {
      logger.error('Error in EnrollmentRepository.getMyEnrollments:', error);
      throw error;
    }
  }

  async getAllEnrollments(filterDTO) {
    try {
      const { sortBy, sortOrder, status, limit } = filterDTO;

      const offset = filterDTO.getOffset();
      const whereCondition = [];

      if (status) {
        whereCondition.push({
          status: status,
        });
      }

      const finalWhere =
        whereCondition.length > 0 ? { AND: whereCondition } : {};

      const [trainingEnrollment, total] = await Promise.all([
        prisma.trainingEnrollment.findMany({
          where: finalWhere,
          //   orderBy: {
          //     [sortBy]: sortOrder,
          //   },
          include: {
            user: true,
            plan: {
              select: { title: true, category: true },
            },
          },
          skip: offset,
          take: limit,
        }),
        prisma.trainingEnrollment.count({ where: finalWhere }),
      ]);

      return {
        data: trainingEnrollment,
        total,
      };
    } catch (error) {
      logger.error('Error in EnrollmentRepository.getMyEnrollments:', error);
      throw error;
    }
  }

  async exportEnrollments(req, res) {
    try {
      const { format } = req.query; // 'csv' বা 'xlsx'

      const enrollments = await prisma.trainingEnrollment.findMany({
        include: {
          user: { select: { fullName: true } },
          plan: { select: { title: true } },
        },
        orderBy: { startedAt: 'desc' },
      });

      const worksheetData = enrollments.map((item) => ({
        'User Name': `${item.user.fullName}`,
        'Plan Title': item.plan.title,
        'Join Date': item.startedAt.toISOString().split('T')[0],
        Status: item.status,
      }));

      const worksheet = XLSX.utils.json_to_sheet(worksheetData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Enrollments');

      if (format === 'csv') {
        const csvBuffer = XLSX.write(workbook, {
          type: 'buffer',
          bookType: 'csv',
        });
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader(
          'Content-Disposition',
          'attachment; filename=enrollments.csv',
        );
        return res.send(csvBuffer);
      } else {
        const excelBuffer = XLSX.write(workbook, {
          type: 'buffer',
          bookType: 'xlsx',
        });
        res.setHeader(
          'Content-Type',
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        );
        res.setHeader(
          'Content-Disposition',
          'attachment; filename=enrollments.xlsx',
        );
        return res.send(excelBuffer);
      }
    } catch (error) {
      console.error('Export Error:', error);
      res.status(500).json({ message: 'Export failed' });
    }
  }

  async updateStatus(id, data) {
    try {
      return await prisma.trainingEnrollment.update({
        where: {
          id: id,
        },
        data,
      });
    } catch (error) {
      logger.error('Error in EnrollmentRepository.updateStatus:', error);
      if (error.code === 'P2025') {
        throw new Error('Enrollment record not found or unauthorized.');
      }
      throw error;
    }
  }

  async getById(id) {
    try {
      const result = await prisma.trainingEnrollment.findUnique({
        where: { id },
        include: { plan: { include: { weeks: true } } },
      });
      return result;
    } catch (error) {
      logger.error('Error in EnrollmentRepository.getById:', error);
      throw error;
    }
  }
}

module.exports = EnrollmentRepository;
