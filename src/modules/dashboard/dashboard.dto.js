export class filterUserDTO {
  constructor(query = {}) {
    this.page = parseInt(query.page) || 1;
    this.limit = parseInt(query.limit) || 10;
    this.sortBy = query.sortBy || 'createdAt';
    this.sortOrder = query.sortOrder || 'desc';
    this.search = query.search;
  }

  /**
   * Get pagination offset
   */
  getOffset() {
    return (this.page - 1) * this.limit;
  }
}
