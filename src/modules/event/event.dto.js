/**
 * Event Management Data Transfer Objects (DTOs)
 * Defines data structures for event management operations
 */

/**
 * Create Event DTO
 */

export class CreateEventDTO {
  constructor(data) {
    // Basic Info
    this.title = data.title;
    this.slug = data.slug;
    this.coverImageUrl = data.coverImageUrl || null;
    this.flag = data.flag ?? false;
    this.status = data.status || 'DRAFT';

    // Schedule & Location
    this.startAt = new Date(data.startAt);
    this.endAt = data.endAt ? new Date(data.endAt) : null;
    this.timezone = data.timezone || 'UTC';
    this.time = data.time;
    this.location = data.location;
    this.country = data.country;
    this.distance = data.distance || null;

    // Pricing & Capacity
    // Ensure price is treated as a number/decimal string for Prisma
    this.price = data.price || 0;
    this.currency = data.currency || 'USD';
    this.totalSeats = Number(data.totalSeats) || 0;
    this.availableSeats = Number(data.availableSeats) || this.totalSeats;

    // Rich Description
    this.headline = data.headline || null;
    this.body = data.body || null;
    this.tagline = data.tagline || null;
    this.bulletsTop = Array.isArray(data.bulletsTop) ? data.bulletsTop : [];
    this.bulletsBottom = Array.isArray(data.bulletsBottom)
      ? data.bulletsBottom
      : [];
    this.images = Array.isArray(data.images) ? data.images : [];
    this.tShirtIncluded = data.tShirtIncluded ?? false;
    this.tShirtSizes = Array.isArray(data.tShirtSizes) ? data.tShirtSizes : [];
    this.tShirtPrice = data.tShirtPrice || 0;
    this.isFree = data.isFree ?? false;
    this.tShirtImageUrl = Array.isArray(data.tShirtImageUrl)
      ? data.tShirtImageUrl
      : [];
    this.promoCode = data.promoCode || null;

    // Relations
    // this.organizerId = data.organizerId;
  }
}

export class filterEventDTO {
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
    this.country = query.country;
    this.createdAfter = query.createdAfter;
    this.organizerId = query.organizerId;
  }

  /**
   * Get pagination offset
   */
  getOffset() {
    return (this.page - 1) * this.limit;
  }
}

export class UpdateEventDTO {
  constructor(data) {
    // Only assign properties if they are present in the input data
    if (data.title !== undefined) this.title = data.title;
    if (data.slug !== undefined) this.slug = data.slug;
    if (data.coverImageUrl !== undefined)
      this.coverImageUrl = data.coverImageUrl;
    if (data.flag !== undefined) this.flag = data.flag;
    if (data.status !== undefined) this.status = data.status;

    // Schedule & Location
    if (data.startAt !== undefined) this.startAt = new Date(data.startAt);
    if (data.endAt !== undefined)
      this.endAt = data.endAt ? new Date(data.endAt) : null;
    if (data.timezone !== undefined) this.timezone = data.timezone;
    if (data.location !== undefined) this.location = data.location;
    if (data.time !== undefined) this.time = data.time;
    if (data.country !== undefined) this.country = data.country;
    if (data.distance !== undefined) this.distance = data.distance;
    if (data.registerClose !== undefined)
      this.registerClose = data.registerClose;
    if (data.complete !== undefined) this.complete = data.complete;

    // Pricing & Capacity
    if (data.price !== undefined) this.price = data.price;
    if (data.currency !== undefined) this.currency = data.currency;
    if (data.totalSeats !== undefined)
      this.totalSeats = Number(data.totalSeats);
    if (data.availableSeats !== undefined)
      this.availableSeats = Number(data.availableSeats);

    // Rich Description
    if (data.headline !== undefined) this.headline = data.headline;
    if (data.body !== undefined) this.body = data.body;
    if (data.tagline !== undefined) this.tagline = data.tagline;

    if (Array.isArray(data.bulletsTop)) this.bulletsTop = data.bulletsTop;
    if (Array.isArray(data.images)) this.images = data.images;
    if (Array.isArray(data.bulletsBottom))
      this.bulletsBottom = data.bulletsBottom;
    if (data.tShirtIncluded !== undefined)
      this.tShirtIncluded = data.tShirtIncluded;
    if (Array.isArray(data.tShirtSizes)) this.tShirtSizes = data.tShirtSizes;
    if (data.tShirtPrice !== undefined) this.tShirtPrice = data.tShirtPrice;
    if (data.isFree !== undefined) this.isFree = data.isFree;
    if (Array.isArray(data.tShirtImageUrl))
      this.tShirtImageUrl = data.tShirtImageUrl;
    if (data.promoCode !== undefined) this.promoCode = data.promoCode;
  }
}

export class EventStatusUpdateDTO {
  constructor(data) {
    this.status = data.status;
  }
}
