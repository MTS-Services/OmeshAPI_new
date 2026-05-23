/**
 * User Management Data Transfer Objects (DTOs)
 * Defines data structures for user management operations
 */

/**
 * User list filter DTO
 */
class UserFilterDTO {
  constructor(query = {}) {
    this.page = parseInt(query.page) || 1;
    this.limit = parseInt(query.limit) || 10;
    this.sortBy = query.sortBy || "createdAt";
    this.sortOrder = query.sortOrder || "desc";
    this.search = query.search;
    this.role = query.role;
    this.status = query.status;
  }

  /**
   * Get pagination offset
   */
  getOffset() {
    return (this.page - 1) * this.limit;
  }
}

/**
 * Create user DTO (for admin)
 */
class CreateUserDTO {
  constructor(data) {
    this.name = data.name;
    this.email = data.email;
    this.password = data.password;
    this.phone = data.phone;
    this.address = data.address;
    this.ppsNumber = data.ppsNumber;
    this.avatar = data.avatar;
    this.role = data.role;

    // Role-specific fields
    if (data.role === "LANDLORD") {
      this.dateOfBirth = data.dateOfBirth;
      this.pps = data.pps;
      this.pps2 = data.pps2;
    }

    if (data.role === "TENANT") {
      this.moveInDate = data.moveInDate;
      this.status = data.status || "ACTIVE";
    }
  }
}

/**
 * Update user DTO (for admin)
 */
class UpdateUserDTO {
  constructor(data) {
    this.name = data.name;
    this.email = data.email;
    this.phone = data.phone;
    this.address = data.address;
    this.ppsNumber = data.ppsNumber;
    this.avatar = data.avatar;
    this.role = data.role;
  }

  /**
   * Get only defined fields for update
   */
  getUpdateData() {
    const updateData = {};

    if (this.name !== undefined) updateData.name = this.name;
    if (this.email !== undefined) updateData.email = this.email;
    if (this.phone !== undefined) updateData.phone = this.phone;
    if (this.address !== undefined) updateData.address = this.address;
    if (this.ppsNumber !== undefined) updateData.ppsNumber = this.ppsNumber;
    if (this.avatar !== undefined) updateData.avatar = this.avatar;
    if (this.role !== undefined) updateData.role = this.role;

    return updateData;
  }
}

/**
 * User list response DTO
 */
class UserListResponseDTO {
  constructor(user) {
    this.id = user.id;
    this.name = user.name;
    this.email = user.email;
    this.phone = user.phone;
    this.role = user.role;
    this.avatar = user.avatar;
    this.createdAt = user.createdAt;
    this.updatedAt = user.updatedAt;

    // Add profile summary
    this.profileSummary = this._getProfileSummary(user);
  }

  /**
   * Get profile summary based on role
   */
  _getProfileSummary(user) {
    if (user.landlordProfile) {
      return {
        type: "LANDLORD",
        propertiesCount: user.landlordProfile.properties?.length || 0,
      };
    }

    if (user.tenantProfile) {
      return {
        type: "TENANT",
        status: user.tenantProfile.status,
        currentTenancy:
          user.tenantProfile.tenancies?.find((t) => t.status === "ACTIVE") ||
          null,
      };
    }

    return { type: "ADMIN" };
  }
}

/**
 * User detail response DTO
 */
class UserDetailResponseDTO {
  constructor(user) {
    this.id = user.id;
    this.name = user.name;
    this.email = user.email;
    this.phone = user.phone;
    this.address = user.address;
    this.ppsNumber = user.ppsNumber;
    this.avatar = user.avatar;
    this.role = user.role;
    this.createdAt = user.createdAt;
    this.updatedAt = user.updatedAt;

    // Add detailed profile data
    this.profile = this._getProfileData(user);
    this.statistics = this._getStatistics(user);
  }

  /**
   * Get detailed profile data
   */
  _getProfileData(user) {
    if (user.landlordProfile) {
      return {
        type: "LANDLORD",
        dateOfBirth: user.landlordProfile.dateOfBirth,
        pps: user.landlordProfile.pps,
        pps2: user.landlordProfile.pps2,
        propertiesManaged: user.landlordProfile.properties?.length || 0,
        totalTenancies: user.landlordProfile.tenancies?.length || 0,
      };
    }

    if (user.tenantProfile) {
      return {
        type: "TENANT",
        moveInDate: user.tenantProfile.moveInDate,
        status: user.tenantProfile.status,
        currentTenancy: user.tenantProfile.tenancies?.find(
          (t) => t.status === "ACTIVE",
        ),
        maintenanceRequests:
          user.tenantProfile.maintenanceRequests?.length || 0,
        rentPayments: user.tenantProfile.rentPayments?.length || 0,
      };
    }

    return { type: "ADMIN" };
  }

  /**
   * Get user statistics
   */
  _getStatistics(user) {
    return {
      documentsUploaded: user.uploadedDocuments?.length || 0,
      messagesSent: user.sentMessages?.length || 0,
      auditLogs: user.auditLogs?.length || 0,
      conversations: user.conversations?.length || 0,
    };
  }
}

/**
 * Bulk action DTO
 */
class BulkActionDTO {
  constructor(data) {
    this.userIds = data.userIds || [];
    this.action = data.action; // 'activate', 'deactivate', 'delete', 'changeRole'
    this.params = data.params || {}; // Additional parameters for the action
  }
}

module.exports = {
  UserFilterDTO,
  CreateUserDTO,
  UpdateUserDTO,
  UserListResponseDTO,
  UserDetailResponseDTO,
  BulkActionDTO,
};
