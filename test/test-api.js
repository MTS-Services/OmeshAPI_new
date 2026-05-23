/**
 * Simple API test script
 * Tests the auth functionality of the OmeshAPI
 */

const baseUrl = "http://localhost:3002";

async function testEndpoint(method, path, body = null, token = null) {
  try {
    const config = {
      method,
      headers: { "Content-Type": "application/json" },
    };
    if (token) config.headers["Authorization"] = `Bearer ${token}`;
    if (body) config.body = JSON.stringify(body);

    const response = await fetch(`${baseUrl}${path}`, config);
    const data = await response.json();

    const icon = response.status < 400 ? "✅" : "❌";
    console.log(`${icon} ${method} ${path} — ${response.status}`);
    if (data.message) console.log(`   ${data.message}`);
    if (data.error) console.log(`   Error: ${data.error}`);
    return { response, data };
  } catch (error) {
    console.error(`❌ ${method} ${path} — ${error.message}`);
    return null;
  }
}

async function runTests() {
  console.log("🚀 OmeshAPI — Auth Test Suite\n");

  // ── 1. Register ──────────────────────────────────────────────────
  console.log("1. Register a new USER");
  const reg = await testEndpoint("POST", "/api/v1/auth/register", {
    fullName: "Test User",
    email: "testuser@example.com",
    password: "TestPassword123!",
    role: "USER",
    phone: "01700000000",
    gender: "MALE",
    location: "Dhaka, Bangladesh",
  });

  // ── 2. Duplicate registration (should 409) ───────────────────────
  console.log("\n2. Register duplicate email (expect 409)");
  await testEndpoint("POST", "/api/v1/auth/register", {
    fullName: "Test User",
    email: "testuser@example.com",
    password: "TestPassword123!",
    role: "USER",
  });

  // ── 3. Login ─────────────────────────────────────────────────────
  console.log("\n3. Login");
  const login = await testEndpoint("POST", "/api/v1/auth/login", {
    email: "testuser@example.com",
    password: "TestPassword123!",
  });

  let accessToken, refreshToken;
  if (login?.data?.data?.tokens) {
    accessToken = login.data.data.tokens.accessToken;
    refreshToken = login.data.data.tokens.refreshToken;
    console.log(`   Access token: ${accessToken.slice(0, 30)}...`);
  }

  // ── 4. Wrong password (expect 401) ───────────────────────────────
  console.log("\n4. Login with wrong password (expect 401)");
  await testEndpoint("POST", "/api/v1/auth/login", {
    email: "testuser@example.com",
    password: "WrongPassword99!",
  });

  // ── 5. Get current user (/me) ─────────────────────────────────────
  console.log("\n5. GET /me (authenticated)");
  await testEndpoint("GET", "/api/v1/auth/me", null, accessToken);

  // ── 6. Get profile ────────────────────────────────────────────────
  console.log("\n6. GET /profile");
  const profile = await testEndpoint(
    "GET",
    "/api/v1/auth/profile",
    null,
    accessToken,
  );
  if (profile?.data?.data) {
    const u = profile.data.data;
    console.log(`   id: ${u.id}  role: ${u.role}  fullName: ${u.fullName}`);
    console.log(`   status: ${u.status}  emailVerified: ${u.emailVerified}`);
  }

  // ── 7. Update profile ─────────────────────────────────────────────
  console.log("\n7. PUT /profile");
  await testEndpoint(
    "PUT",
    "/api/v1/auth/profile",
    {
      fullName: "Updated Test User",
      location: "Chittagong, Bangladesh",
      teamClub: "Dhaka FC",
    },
    accessToken,
  );

  // ── 8. Refresh token ──────────────────────────────────────────────
  console.log("\n8. POST /refresh");
  await testEndpoint("POST", "/api/v1/auth/refresh", { refreshToken });

  // ── 9. Change password ────────────────────────────────────────────
  console.log("\n9. POST /change-password");
  await testEndpoint(
    "POST",
    "/api/v1/auth/change-password",
    {
      currentPassword: "TestPassword123!",
      newPassword: "NewPassword456!",
      confirmPassword: "NewPassword456!",
    },
    accessToken,
  );

  // ── 10. Forgot password ───────────────────────────────────────────
  console.log("\n10. POST /forgot-password");
  const forgot = await testEndpoint("POST", "/api/v1/auth/forgot-password", {
    email: "testuser@example.com",
  });
  const resetCode = forgot?.data?.data?.code;
  if (resetCode) console.log(`   Reset code: ${resetCode}`);

  // ── 11. Reset password ────────────────────────────────────────────
  if (resetCode) {
    console.log("\n11. POST /reset-password");
    await testEndpoint("POST", "/api/v1/auth/reset-password", {
      email: "testuser@example.com",
      token: resetCode,
      password: "ResetPassword789!",
      confirmPassword: "ResetPassword789!",
    });
  }

  // ── 12. Logout ────────────────────────────────────────────────────
  console.log("\n12. POST /logout");
  await testEndpoint("POST", "/api/v1/auth/logout", null, accessToken);

  // ── 13. Access protected route without token (expect 401) ─────────
  console.log("\n13. GET /profile without token (expect 401)");
  await testEndpoint("GET", "/api/v1/auth/profile");

  // ── 14. Delete account ────────────────────────────────────────────
  console.log("\n14. DELETE /account (cleanup)");
  // Re-login with reset password to get fresh token
  const relogin = await testEndpoint("POST", "/api/v1/auth/login", {
    email: "testuser@example.com",
    password: "ResetPassword789!",
  });
  const freshToken = relogin?.data?.data?.tokens?.accessToken;
  if (freshToken) {
    await testEndpoint("DELETE", "/api/v1/auth/account", null, freshToken);
  }

  console.log("\n🎉 Auth Test Suite Complete!");
}

runTests().catch(console.error);
