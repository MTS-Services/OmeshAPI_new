const { AppError } = require('../../middlewares/errorHandler');

class RegistrationDTO {
  constructor(data = {}) {
    const participants = Array.isArray(data.participants) ? data.participants : [];
    if (
      !data.eventId ||
      participants.length === 0 ||
      participants.some(
        (p) =>
          typeof p?.firstName !== 'string' ||
          typeof p?.lastName !== 'string' ||
          !p.firstName.trim() ||
          !p.lastName.trim(),
      )
    ) {
      throw new AppError('Event and participant names are required.', 400);
    }

    this.eventId = data.eventId;
    this.pricingTierId = data.pricingTierId || null;
    this.source = data.source;
    this.couponCode = data.couponCode || null;
    this.declarationAccepted = data.declarationAccepted === true;
    this.participants = participants.map((p) => ({
      firstName: p.firstName.trim(),
      lastName: p.lastName.trim(),
      email: p.email ? String(p.email).toLowerCase().trim() || null : null,
      phone: p.phone || null,
      gender: p.gender || null,
      age: p.age ? parseInt(p.age) : null,
      dateOfBirth: p.dateOfBirth ? new Date(p.dateOfBirth) : null,
      location: p.location || null,
      teamClub: p.teamClub || null,
      residential_area: p.residential_area || null,
      selectedTShirtSize: p.selectedTShirtSize || null,
      buyTShirt: p.buyTShirt || false,
      status:
        data.source === 'MANUAL_ADD'
          ? 'CONFIRMED'
          : p.status || 'PENDING_PAYMENT',
    }));
  }
}

class FilterRegistrationDTO {
  constructor(query = {}) {
    this.page = parseInt(query.page) || 1;
    this.limit = parseInt(query.limit) || 10;
    this.sortBy = query.sortBy || 'createdAt';
    this.sortOrder = query.sortOrder || 'desc';
    this.search = query.search;
    this.status = query.status;
    this.startDate = query.startDate;
    this.endDate = query.endDate;
    this.status = query.status;
    this.eventId = query.eventId;
    this.source = query.source;
    this.country = query.country;
    this.organizerId = query.organizerId;
  }

  /**
   * Get pagination offset
   */
  getOffset() {
    return (this.page - 1) * this.limit;
  }
}

module.exports = {
  RegistrationDTO,
  FilterRegistrationDTO,
};
