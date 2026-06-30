// dtos/promoCode.dto.js

class CreatePromoCodeDto {
  constructor(data) {
    this.code = data.code?.toUpperCase();
    this.description = data.description || null;
    this.startsAt = data.startsAt ? new Date(data.startsAt) : null;
    this.expiresAt = data.expiresAt ? new Date(data.expiresAt) : null;
    this.isActive = data.isActive !== undefined ? data.isActive : true;
    this.allowedEmails = data.allowedEmails || []; // Array of strings
    this.description = data.description || null; // Optional description
  }
}

class FilterPromoDTO {
  constructor(query = {}) {
    this.page = parseInt(query.page) || 1;
    this.limit = parseInt(query.limit) || 10;
    this.sortBy = query.sortBy || 'createdAt';
    this.sortOrder = query.sortOrder || 'desc';
    this.search = query.search;
    this.isActive = query.isActive;
    this.startDate = query.startDate;
    this.endDate = query.endDate;
  }

  /**
   * Get pagination offset
   */
  getOffset() {
    return (this.page - 1) * this.limit;
  }
}

class UpdatePromoCodeDto {
  constructor(data) {
    if (data.description !== undefined) this.description = data.description;
    if (data.isActive !== undefined) this.isActive = data.isActive;
    if (data.expiresAt !== undefined) this.expiresAt = new Date(data.expiresAt);
    if (data.allowedEmails !== undefined)
      this.allowedEmails = data.allowedEmails;
  }
}

class ApplyPromoDto {
  constructor(data) {
    this.code = data.code?.toUpperCase();
    this.emails = data.emails;
    this.eventId = data.eventId;
  }
}

module.exports = {
  CreatePromoCodeDto,
  FilterPromoDTO,
  UpdatePromoCodeDto,
  ApplyPromoDto,
};
