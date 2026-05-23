/**
 * @method GET /api/v1/docs
 * @description API documentation and endpoints reference
 * @example GET /api/v1/docs
 */
const apiDocsHandler = (req, res) => {
  const apiEndpoints = {
    success: true,
    message: "Property Management Platform API v1",
    version: "1.0.0",
    author: {
      name: "McCann & Curran Development Team",
      title: "Backend Development",
      company: "Property Management Solutions",
    },
    API_ENDPOINTS: {
      SYSTEM: [
        {
          title: "System Health & Status",
          description: "System monitoring and health check endpoints",
        },
        {
          GET: "/health",
          body: null,
          description: "Service health check",
        },
        {
          GET: "/api/v1/health",
          body: null,
          description: "API health status with detailed metrics",
        },
        {
          GET: "/api/v1/docs",
          body: null,
          description: "API documentation and endpoints reference",
        },
      ],
      AUTH: [
        {
          title: "Authentication API",
          description: "User authentication and session management endpoints",
        },
        {
          POST: "/api/v1/auth/register",
          body: {
            email: "string",
            password: "string",
            firstName: "string",
            lastName: "string",
            role: "ADMIN | LANDLORD | TENANT (optional, default: TENANT)",
          },
          description: "Register a new user account",
        },
        {
          POST: "/api/v1/auth/login",
          body: {
            email: "string",
            password: "string",
          },
          description: "Login with email and password",
        },
        {
          POST: "/api/v1/auth/refresh-token",
          body: {
            refreshToken: "string",
          },
          description: "Refresh access token using refresh token",
        },
        {
          POST: "/api/v1/auth/logout",
          body: null,
          Token: "Required",
          description: "Logout and invalidate session",
        },
        {
          GET: "/api/v1/auth/profile",
          body: null,
          Token: "Required",
          description: "Get current user profile",
        },
        {
          POST: "/api/v1/auth/forgot-password",
          body: {
            email: "string",
          },
          description: "Request password reset email",
        },
        {
          POST: "/api/v1/auth/reset-password",
          body: {
            token: "string",
            newPassword: "string",
          },
          description: "Reset password with verification token",
        },
        {
          POST: "/api/v1/auth/verify-email",
          body: {
            token: "string",
          },
          description: "Verify email address with token",
        },
      ],
      USERS: [
        {
          title: "User Management API",
          description: "User CRUD operations and profile management",
        },
        {
          GET: "/api/v1/users",
          body: null,
          Token: "Required (Admin)",
          query: "?page=1&limit=10&search=name&role=LANDLORD",
          description: "Get all users with filtering (Admin only)",
        },
        {
          GET: "/api/v1/users/:id",
          body: null,
          Token: "Required",
          description: "Get user by ID",
        },
        {
          PUT: "/api/v1/users/:id",
          body: {
            firstName: "string (optional)",
            lastName: "string (optional)",
            phone: "string (optional)",
            address: "object (optional)",
          },
          Token: "Required",
          description: "Update user profile",
        },
        {
          DELETE: "/api/v1/users/:id",
          body: null,
          Token: "Required (Admin)",
          description: "Delete user account (Admin only)",
        },
        {
          PATCH: "/api/v1/users/:id/role",
          body: {
            role: "ADMIN | LANDLORD | TENANT",
          },
          Token: "Required (Admin)",
          description: "Update user role (Admin only)",
        },
        {
          PATCH: "/api/v1/users/:id/status",
          body: {
            isActive: "boolean",
          },
          Token: "Required (Admin)",
          description: "Activate/deactivate user account (Admin only)",
        },
      ],
      PROPERTIES: [
        {
          title: "Property Management API",
          description: "Property listings and management endpoints",
        },
        {
          GET: "/api/v1/properties",
          body: null,
          Token: "Required",
          query: "?page=1&limit=10&status=LET&type=APARTMENT&landlordId=uuid",
          description: "Get properties with filtering - Coming Soon",
        },
        {
          POST: "/api/v1/properties",
          body: {
            address: "object",
            type: "APARTMENT | HOUSE | COMMERCIAL",
            bedrooms: "number",
            bathrooms: "number",
            rentAmount: "number",
            deposit: "number",
            status: "LET | NOTICE | VACANT",
          },
          Token: "Required (Landlord/Admin)",
          description: "Create new property listing - Coming Soon",
        },
        {
          GET: "/api/v1/properties/:id",
          body: null,
          Token: "Required",
          description: "Get property details by ID - Coming Soon",
        },
        {
          PUT: "/api/v1/properties/:id",
          body: {
            rentAmount: "number (optional)",
            deposit: "number (optional)",
            status: "string (optional)",
          },
          Token: "Required (Landlord/Admin)",
          description: "Update property details - Coming Soon",
        },
      ],
      TENANCIES: [
        {
          title: "Tenancy Management API",
          description: "Rental agreements and tenancy tracking",
        },
        {
          GET: "/api/v1/tenancies",
          body: null,
          Token: "Required",
          query: "?page=1&limit=10&status=ACTIVE&propertyId=uuid",
          description: "Get tenancies with filtering - Coming Soon",
        },
        {
          POST: "/api/v1/tenancies",
          body: {
            propertyId: "string",
            tenantId: "string",
            startDate: "string (ISO date)",
            endDate: "string (ISO date)",
            rentAmount: "number",
            deposit: "number",
          },
          Token: "Required (Landlord/Admin)",
          description: "Create new tenancy agreement - Coming Soon",
        },
      ],
      MAINTENANCE: [
        {
          title: "Maintenance Management API",
          description: "Maintenance requests and job tracking",
        },
        {
          GET: "/api/v1/maintenance",
          body: null,
          Token: "Required",
          query: "?page=1&limit=10&status=PENDING&priority=HIGH",
          description: "Get maintenance requests - Coming Soon",
        },
        {
          POST: "/api/v1/maintenance",
          body: {
            propertyId: "string",
            title: "string",
            description: "string",
            priority: "LOW | MEDIUM | HIGH | EMERGENCY",
            category: "string",
          },
          Token: "Required (Tenant)",
          description: "Submit maintenance request - Coming Soon",
        },
      ],
      PAYMENTS: [
        {
          title: "Rent Payment API",
          description: "Rent payment processing and tracking",
        },
        {
          GET: "/api/v1/payments",
          body: null,
          Token: "Required",
          query: "?page=1&limit=10&status=PAID&tenancyId=uuid",
          description: "Get payment history - Coming Soon",
        },
        {
          POST: "/api/v1/payments",
          body: {
            tenancyId: "string",
            amount: "number",
            paymentMethod: "BANK_TRANSFER | CARD | CASH",
          },
          Token: "Required (Tenant)",
          description: "Record rent payment - Coming Soon",
        },
      ],
      DOCUMENTS: [
        {
          title: "Document Management API",
          description: "Document upload and management system",
        },
        {
          GET: "/api/v1/documents",
          body: null,
          Token: "Required",
          query: "?page=1&limit=10&type=CONTRACT&entityId=uuid",
          description: "Get documents with filtering - Coming Soon",
        },
        {
          POST: "/api/v1/documents",
          body: {
            file: "multipart/form-data",
            type: "CONTRACT | INVOICE | CERTIFICATE | OTHER",
            entityType: "PROPERTY | TENANCY | MAINTENANCE",
            entityId: "string",
          },
          Token: "Required",
          description: "Upload document - Coming Soon",
        },
      ],
      REPORTS: [
        {
          title: "Reporting API",
          description: "Business intelligence and reporting endpoints",
        },
        {
          GET: "/api/v1/reports/dashboard",
          body: null,
          Token: "Required (Landlord/Admin)",
          description: "Get dashboard metrics - Coming Soon",
        },
        {
          GET: "/api/v1/reports/financial",
          body: null,
          Token: "Required (Landlord/Admin)",
          query: "?startDate=2024-01-01&endDate=2024-12-31",
          description: "Generate financial reports - Coming Soon",
        },
      ],
    },
    notes: {
      authentication:
        "All protected endpoints require Bearer token in Authorization header",
      pagination: "Most list endpoints support page and limit query parameters",
      errorHandling:
        "All endpoints return consistent error format with success boolean",
      development:
        "Some endpoints marked 'Coming Soon' are in development phase",
    },
  };
  res.sendSuccess(apiEndpoints, "API documentation retrieved successfully");
};

module.exports = apiDocsHandler;
