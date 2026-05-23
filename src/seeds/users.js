/**
 * ============================================================================
 * USER SEEDER
 * ============================================================================
 * Seeds the database with test users for all roles
 *
 * Usage: node src/seeds/users.js
 * ============================================================================
 */

const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

const USERS = [
  // ========== ADMIN ==========
  {
    fullName: "Admin User",
    email: "admin@omesh.com",
    password: "Admin@123",
    role: "ADMIN",
    status: "ACTIVE",
    emailVerified: true,
    phone: "+1234567890",
    gender: "MALE",
    location: "New York, USA",
  },

  // ========== ORGANIZERS ==========
  {
    fullName: "John Organizer",
    email: "organizer@omesh.com",
    password: "Organizer@123",
    role: "ORGANIZER",
    status: "ACTIVE",
    emailVerified: true,
    phone: "+1234567891",
    gender: "MALE",
    location: "Los Angeles, USA",
    organizerProfile: {
      organizationName: "Elite Sports Events",
      bio: "Professional sports event organizer with 10+ years experience",
      website: "https://elitesports.com",
    },
  },
  {
    fullName: "Sarah Events",
    email: "sarah.events@omesh.com",
    password: "Organizer@123",
    role: "ORGANIZER",
    status: "ACTIVE",
    emailVerified: true,
    phone: "+1234567892",
    gender: "FEMALE",
    location: "Chicago, USA",
    organizerProfile: {
      organizationName: "Marathon Masters",
      bio: "Specializing in marathon and running events",
      website: "https://marathonmasters.com",
    },
  },

  // ========== REGULAR USERS ==========
  {
    fullName: "Alice Runner",
    email: "user@omesh.com",
    password: "User@123",
    role: "USER",
    status: "ACTIVE",
    emailVerified: true,
    phone: "+1234567893",
    gender: "FEMALE",
    dateOfBirth: new Date("1995-03-15"),
    location: "Boston, USA",
    teamClub: "Boston Runners Club",
  },
  {
    fullName: "Bob Athlete",
    email: "bob.athlete@omesh.com",
    password: "User@123",
    role: "USER",
    status: "ACTIVE",
    emailVerified: true,
    phone: "+1234567894",
    gender: "MALE",
    dateOfBirth: new Date("1990-07-20"),
    location: "Seattle, USA",
    teamClub: "Seattle Sports Team",
  },
  {
    fullName: "Charlie Sports",
    email: "charlie@omesh.com",
    password: "User@123",
    role: "USER",
    status: "ACTIVE",
    emailVerified: true,
    phone: "+1234567895",
    gender: "MALE",
    dateOfBirth: new Date("1992-11-10"),
    location: "Miami, USA",
  },
  {
    fullName: "Diana Marathon",
    email: "diana@omesh.com",
    password: "User@123",
    role: "USER",
    status: "ACTIVE",
    emailVerified: true,
    phone: "+1234567896",
    gender: "FEMALE",
    dateOfBirth: new Date("1988-05-25"),
    location: "Denver, USA",
    teamClub: "Mile High Runners",
  },
];

async function seedUsers() {
  console.log("🌱 Starting user seeding...\n");

  try {
    // Clear existing users (optional - comment out if you want to keep existing data)
    console.log("🗑️  Clearing existing users...");
    await prisma.user.deleteMany({});
    console.log("✅ Cleared existing users\n");

    // Seed users
    for (const userData of USERS) {
      const { password, organizerProfile, ...userFields } = userData;

      // Hash password
      const passwordHash = await bcrypt.hash(password, 12);

      // Create user with organizer profile if needed
      const user = await prisma.user.create({
        data: {
          ...userFields,
          passwordHash,
          joinedAt: new Date(),
          lastLoginAt: new Date(),
          ...(organizerProfile && {
            organizerProfile: {
              create: organizerProfile,
            },
          }),
        },
        include: {
          organizerProfile: true,
        },
      });

      console.log(`✅ Created ${user.role}: ${user.fullName} (${user.email})`);
    }

    console.log("\n🎉 User seeding completed successfully!");
    console.log("\n📋 Summary:");
    console.log(`   - Admin: admin@omesh.com (Admin@123)`);
    console.log(`   - Organizer: organizer@omesh.com (Organizer@123)`);
    console.log(`   - Organizer: sarah.events@omesh.com (Organizer@123)`);
    console.log(`   - User: user@omesh.com (User@123)`);
    console.log(`   - User: bob.athlete@omesh.com (User@123)`);
    console.log(`   - User: charlie@omesh.com (User@123)`);
    console.log(`   - User: diana@omesh.com (User@123)`);
  } catch (error) {
    console.error("❌ Error seeding users:", error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the seeder
seedUsers().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});
