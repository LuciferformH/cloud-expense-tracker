// ==========================================
// Database Seed Script
// ==========================================
// Populates the database with sample data for development.
// Run with: npx ts-node prisma/seed.ts
// Creates a demo user with expenses, categories, and budgets.

import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const DEMO_USER = {
  email: "demo@cloudexpensetracker.com",
  name: "Demo User",
  password: "Demo1234",
};

const CATEGORIES = [
  { name: "Compute", icon: "cpu", color: "#3B82F6" },
  { name: "Storage", icon: "database", color: "#10B981" },
  { name: "Networking", icon: "network", color: "#F59E0B" },
  { name: "Database", icon: "server", color: "#8B5CF6" },
  { name: "Serverless", icon: "zap", color: "#EC4899" },
  { name: "Other", icon: "layers", color: "#6B7280" },
];

const EXPENSES = [
  // AWS Compute
  { description: "EC2 t3.medium instances", cloudProvider: "AWS", serviceType: "EC2", region: "us-east-1", amountBase: 45.20 },
  { description: "EC2 m5.large instances", cloudProvider: "AWS", serviceType: "EC2", region: "us-west-2", amountBase: 140.50 },
  { description: "Lambda invocations", cloudProvider: "AWS", serviceType: "Lambda", region: "us-east-1", amountBase: 12.30 },
  // AWS Storage
  { description: "S3 Standard Storage", cloudProvider: "AWS", serviceType: "S3", region: "us-east-1", amountBase: 23.45 },
  { description: "EBS gp3 volumes", cloudProvider: "AWS", serviceType: "EBS", region: "us-east-1", amountBase: 32.00 },
  // AWS Database
  { description: "RDS PostgreSQL db.t3.micro", cloudProvider: "AWS", serviceType: "RDS", region: "us-east-1", amountBase: 28.50 },
  { description: "DynamoDB on-demand", cloudProvider: "AWS", serviceType: "DynamoDB", region: "us-east-1", amountBase: 15.80 },
  // Azure
  { description: "Azure VM Standard_D2s_v3", cloudProvider: "Azure", serviceType: "Virtual Machines", region: "eastus", amountBase: 120.00 },
  { description: "Azure Blob Storage", cloudProvider: "Azure", serviceType: "Blob Storage", region: "eastus", amountBase: 8.90 },
  // GCP
  { description: "GCP Compute Engine e2-medium", cloudProvider: "GCP", serviceType: "Compute Engine", region: "us-central1", amountBase: 67.30 },
  { description: "GCP Cloud SQL PostgreSQL", cloudProvider: "GCP", serviceType: "Cloud SQL", region: "us-central1", amountBase: 42.10 },
  // Networking
  { description: "AWS CloudFront distribution", cloudProvider: "AWS", serviceType: "CloudFront", region: "Global", amountBase: 18.75 },
  { description: "AWS Data Transfer", cloudProvider: "AWS", serviceType: "Data Transfer", region: "us-east-1", amountBase: 25.60 },
  { description: "NAT Gateway hours", cloudProvider: "AWS", serviceType: "NAT Gateway", region: "us-east-1", amountBase: 32.40 },
];

async function main() {
  console.log("🌱 Seeding database...");

  // Clean existing data
  await prisma.expense.deleteMany();
  await prisma.budget.deleteMany();
  await prisma.category.deleteMany();
  await prisma.refreshToken.deleteMany();
  await prisma.passwordReset.deleteMany();
  await prisma.user.deleteMany();

  // Create demo user
  const hashedPassword = await bcrypt.hash(DEMO_USER.password, 12);
  const user = await prisma.user.create({
    data: {
      email: DEMO_USER.email,
      name: DEMO_USER.name,
      password: hashedPassword,
    },
  });
  console.log(`✅ Created user: ${user.email}`);

  // Create categories
  const categories = await Promise.all(
    CATEGORIES.map((cat) =>
      prisma.category.create({
        data: { ...cat, userId: user.id },
      })
    )
  );
  console.log(`✅ Created ${categories.length} categories`);

  // Create expenses for the last 6 months
  const now = new Date();
  const categoryMap = new Map(categories.map((c) => [c.name, c.id]));

  for (let monthOffset = 0; monthOffset < 6; monthOffset++) {
    const monthDate = new Date(now.getFullYear(), now.getMonth() - monthOffset, 1);

    for (const expense of EXPENSES) {
      // Random day in the month
      const day = Math.floor(Math.random() * 28) + 1;
      const date = new Date(monthDate.getFullYear(), monthDate.getMonth(), day);

      // Random amount variation (±30%)
      const variation = 1 + (Math.random() * 0.6 - 0.3);
      const amount = Math.round(expense.amountBase * variation * 100) / 100;

      // Map service type to category
      let categoryId = categoryMap.get("Other");
      if (["EC2", "Lambda", "Virtual Machines", "Compute Engine"].includes(expense.serviceType)) {
        categoryId = categoryMap.get("Compute");
      } else if (["S3", "EBS", "Blob Storage"].includes(expense.serviceType)) {
        categoryId = categoryMap.get("Storage");
      } else if (["RDS", "DynamoDB", "Cloud SQL"].includes(expense.serviceType)) {
        categoryId = categoryMap.get("Database");
      } else if (["CloudFront", "Data Transfer", "NAT Gateway"].includes(expense.serviceType)) {
        categoryId = categoryMap.get("Networking");
      }

      await prisma.expense.create({
        data: {
          userId: user.id,
          amount,
          description: expense.description,
          date,
          categoryId,
          cloudProvider: expense.cloudProvider,
          serviceType: expense.serviceType,
          region: expense.region,
        },
      });
    }
  }
  console.log(`✅ Created ${EXPENSES.length * 6} expenses`);

  // Create budgets
  await prisma.budget.createMany({
    data: [
      {
        userId: user.id,
        name: "Total Cloud Spend",
        monthlyLimit: 500,
        alertThreshold: 80,
        startDate: new Date(now.getFullYear(), now.getMonth() - 5, 1),
      },
      {
        userId: user.id,
        name: "AWS Services",
        monthlyLimit: 300,
        alertThreshold: 75,
        startDate: new Date(now.getFullYear(), now.getMonth() - 5, 1),
      },
      {
        userId: user.id,
        name: "Database Costs",
        monthlyLimit: 100,
        alertThreshold: 90,
        startDate: new Date(now.getFullYear(), now.getMonth() - 5, 1),
      },
    ],
  });
  console.log("✅ Created 3 budgets");

  console.log("\n🎉 Seed completed!");
  console.log(`📧 Demo login: ${DEMO_USER.email}`);
  console.log(`🔑 Demo password: ${DEMO_USER.password}`);
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
