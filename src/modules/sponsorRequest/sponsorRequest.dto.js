class CreateSponsorRequestDTO {
  constructor(data) {
    this.supportType = data.supportType;
    this.name = String(data.name).trim();
    this.phone = String(data.phone).trim();
    this.email = String(data.email).toLowerCase().trim();
    this.eventName = data.eventName ? String(data.eventName).trim() : null;
    this.message = data.message ? String(data.message).trim() : null;
    this.amount = Number(Number(data.amount).toFixed(2));
  }
}

class FilterSponsorRequestDTO {
  constructor(query = {}) {
    this.page = parseInt(query.page) || 1;
    this.limit = parseInt(query.limit) || 10;
    this.search = query.search;
    this.supportType = ['SPONSORSHIP', 'DONATION'].includes(query.supportType)
      ? query.supportType
      : undefined;
    this.paymentStatus = ['PENDING', 'SUCCEEDED', 'FAILED'].includes(
      query.paymentStatus,
    )
      ? query.paymentStatus
      : undefined;
  }

  getOffset() {
    return (this.page - 1) * this.limit;
  }
}

module.exports = { CreateSponsorRequestDTO, FilterSponsorRequestDTO };
