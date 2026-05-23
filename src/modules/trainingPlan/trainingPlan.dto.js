/**
 * Training Plan Management Data Transfer Objects (DTOs)
 * Defines data structures for event management operations
 */

export class CreateTrainingPlanDTO {
  constructor(data) {
    this.categoryId = data.categoryId;
    this.durationMin = data.durationMin ? Number(data.durationMin) : 0;
    this.title = data.title;
    this.description = data.description;
    this.isActive = data.isActive ?? true;
    this.weeks = Array.isArray(data.weeks)
      ? data.weeks.map((week) => ({
          weekNo: Number(week.weekNo),
          days: Array.isArray(week.days)
            ? week.days.map((day) => {
                if (typeof day === 'object' && day !== null) {
                  return day.activity || day.dayName || 'Training Day';
                }
                return String(day);
              })
            : [],
        }))
      : [];
  }
}

export class filterTrainingDTO {
  constructor(query = {}) {
    this.page = parseInt(query.page) || 1;
    this.limit = parseInt(query.limit) || 10;
    this.sortBy = query.sortBy || 'createdAt';
    this.sortOrder = query.sortOrder || 'desc';
    this.search = query.search;
    this.category = query.category;
    this.isActive = query.isActive;
  }

  /**
   * Get pagination offset
   */
  getOffset() {
    return (this.page - 1) * this.limit;
  }
}

export class UpdateTrainingPlanDTO {
  constructor(data) {
    if (data.categoryId !== undefined) this.categoryId = data.categoryId;
    if (data.durationMin !== undefined)
      this.durationMin = Number(data.durationMin);
    if (data.title !== undefined) this.title = data.title;
    if (data.description !== undefined) this.description = data.description;
    if (data.isActive !== undefined) this.isActive = data.isActive;
    if (data.weeks && Array.isArray(data.weeks)) {
      this.weeks = data.weeks.map((week) => ({
        weekNo: Number(week.weekNo),
        days: Array.isArray(week.days) ? week.days : [],
      }));
    }
  }
}
