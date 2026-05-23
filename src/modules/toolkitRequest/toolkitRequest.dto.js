class CreateToolkitRequestDTO {
  constructor(data, userId = null) {
    this.submitterId = userId;
    this.eventName = data.eventName;
    this.eventDate = data.eventDate ? new Date(data.eventDate) : null;
    this.quantity = parseInt(data.quantity);
    this.designImageUrls = Array.isArray(data.designImageUrls)
      ? data.designImageUrls
      : [];
    this.needsDesignHelp =
      data.needsDesignHelp === true || data.needsDesignHelp === 'true';
    this.fullName = data.fullName;
    this.email = data.email;
    this.phone = data.phone;
  }
}

class filterToolkitDTO {
  constructor(query = {}) {
    this.page = parseInt(query.page) || 1;
    this.limit = parseInt(query.limit) || 10;
    this.sortBy = query.sortBy || 'createdAt';
    this.sortOrder = query.sortOrder || 'desc';
    this.search = query.search;
    this.status = query.status;
  }

  /**
   * Get pagination offset
   */
  getOffset() {
    return (this.page - 1) * this.limit;
  }
}

class ReviewToolkitDTO {
  constructor(data, adminId) {
    this.status = data.status; // e.g., 'QUOTED', 'APPROVED', 'REJECTED'
    this.quoteAmount = data.quoteAmount ? parseFloat(data.quoteAmount) : null;
    this.quoteCurrency = data.quoteCurrency || 'USD';
    this.adminNote = data.adminNote;
    this.reviewedById = adminId;
    this.reviewedAt = new Date();
  }
}

module.exports = {
  CreateToolkitRequestDTO,
  filterToolkitDTO,
  ReviewToolkitDTO,
};
