class CreateEnrollmentDTO {
  constructor(data, userId) {
    this.planId = data.planId;
    this.userId = userId;
  }
}

class filterPlanEnrollmentDTO {
  constructor(query = {}) {
    this.page = parseInt(query.page) || 1;
    this.limit = parseInt(query.limit) || 10;
    this.sortBy = query.sortBy || 'createdAt';
    this.sortOrder = query.sortOrder || 'desc';
    this.status = query.status;
  }

  /**
   * Get pagination offset
   */
  getOffset() {
    return (this.page - 1) * this.limit;
  }
}

class UpdateEnrollmentStatusDTO {
  constructor(data) {
    this.status = data.status; // ACTIVE, COMPLETED, CANCELLED
    if (data.status === 'COMPLETED') {
      this.completedAt = new Date();
    }
  }
}

module.exports = {
  CreateEnrollmentDTO,
  filterPlanEnrollmentDTO,
  UpdateEnrollmentStatusDTO,
};
