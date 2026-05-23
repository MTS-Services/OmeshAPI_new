class CreatePayoutDTO {
  constructor(data, organizerId) {
    this.organizerId = organizerId;
    this.amount = parseFloat(data.amount);
    this.currency = data.currency || 'USD';
    this.method = data.method; // PAYPAL, BANK, CARD
    this.note = data.note;
    this.accountNumber = data.accountNumber;
  }
}

class filterPayRequestDTO {
  constructor(query = {}) {
    this.page = parseInt(query.page) || 1;
    this.limit = parseInt(query.limit) || 10;
    this.sortBy = query.sortBy || 'createdAt';
    this.sortOrder = query.sortOrder || 'desc';
    this.status = query.status;
    this.organizerId = query.organizerId;
  }

  /**
   * Get pagination offset
   */
  getOffset() {
    return (this.page - 1) * this.limit;
  }
}

class UpdatePayoutStatusDTO {
  constructor(data, adminId) {
    this.status = data.status; // APPROVED, REJECTED, PAID
    this.reviewedById = adminId;
    this.reviewedAt = new Date();
    this.note = data.adminNote;
    if (data.status === 'PAID') {
      this.paidAt = new Date();
    }
  }
}

module.exports = {
  CreatePayoutDTO,
  filterPayRequestDTO,
  UpdatePayoutStatusDTO,
};
