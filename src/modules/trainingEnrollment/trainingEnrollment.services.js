const EnrollmentRepository = require('./trainingEnrollment.repository');

class EnrollmentServices {
  constructor() {
    this.enrollmentRepository = new EnrollmentRepository();
  }

  async enroll(dto) {
    return await this.enrollmentRepository.enroll(dto);
  }

  async getMyEnrollments(userId, filterDTO) {
    return await this.enrollmentRepository.getMyEnrollments(userId, filterDTO);
  }

  async exportEnrollments(req, res) {
    return await this.enrollmentRepository.exportEnrollments(req, res);
  }

  async getAllEnrollments(filterDTO) {
    const { data, total } =
      await this.enrollmentRepository.getAllEnrollments(filterDTO);

    return {
      data,
      pagination: {
        currentPage: filterDTO.page,
        itemsPerPage: filterDTO.limit,
        totalItems: total,
        totalPages: Math.ceil(total / filterDTO.limit),
        hasNextPage: filterDTO.page < Math.ceil(total / filterDTO.limit),
        hasPreviousPage: filterDTO.page > 1,
      },
    };
  }

  async updateStatus(id, dto) {
    return await this.enrollmentRepository.updateStatus(id, dto);
  }
}

module.exports = EnrollmentServices;
