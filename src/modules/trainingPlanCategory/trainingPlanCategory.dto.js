class CreateCategoryDTO {
  constructor(data) {
    this.plan = data.plan;
    this.slug = data.slug;
    this.description = data.description;
  }
}

class UpdateCategoryDTO {
  constructor(data) {
    if (data.plan) this.plan = data.plan;
    if (data.slug) this.slug = data.slug;
    if (data.description) this.description = data.description;
  }
}

module.exports = { CreateCategoryDTO, UpdateCategoryDTO };
