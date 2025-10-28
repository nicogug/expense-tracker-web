#!/usr/bin/env tsx

/**
 * Seed Demo Data Script
 *
 * This script creates default categories, a demo user, and populates the database with sample expenses and budget data.
 *
 * Usage:
 *   pnpm seed:demo
 *
 * Demo credentials:
 *   Email: demo@example.com
 *   Password: Demo123!
 */

import { config } from "dotenv";
import { createClient } from "@supabase/supabase-js";
import path from "path";

// Load environment variables from .env.local
config({ path: path.resolve(process.cwd(), ".env.local") });

// Configuration
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const DEMO_USER = {
  email: "demo@example.com",
  password: "Demo123!",
};

const DEMO_BUDGET = 2000.0;

// Validate environment variables
if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error("❌ Error: Missing required environment variables");
  console.error(
    "Make sure NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set"
  );
  console.error(
    "You can find the service role key by running: supabase status"
  );
  process.exit(1);
}

// Create admin client with service role key (bypasses RLS)
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

async function main() {
  console.log("🌱 Starting demo data seeding...\n");

  try {
    // Step 1: Check if demo user already exists
    console.log("📧 Checking for existing demo user...");
    const { data: existingUsers } = await supabase.auth.admin.listUsers();
    const existingUser = existingUsers?.users.find(
      (u) => u.email === DEMO_USER.email
    );

    let userId: string;

    if (existingUser) {
      console.log(`✓ Demo user already exists: ${DEMO_USER.email}`);
      userId = existingUser.id;

      // Clean up existing data for fresh seed
      console.log("🧹 Cleaning up existing demo data...");
      await supabase.from("expenses").delete().eq("user_id", userId);
      await supabase.from("budgets").delete().eq("user_id", userId);
      console.log("✓ Cleaned up existing data");
    } else {
      // Step 2: Create demo user
      console.log(`👤 Creating demo user: ${DEMO_USER.email}`);
      const { data: newUser, error: createError } =
        await supabase.auth.admin.createUser({
          email: DEMO_USER.email,
          password: DEMO_USER.password,
          email_confirm: true,
        });

      if (createError) {
        throw new Error(`Failed to create user: ${createError.message}`);
      }

      if (!newUser.user) {
        throw new Error("User creation succeeded but no user data returned");
      }

      userId = newUser.user.id;
      console.log(`✓ Created demo user with ID: ${userId}`);
    }

    // Step 3: Create or get default categories
    console.log("\n📂 Setting up default categories...");

    // Define default categories
    const defaultCategories = [
      { name: "Food & Dining", icon: "🍔", color: "#FF6B6B", sort_order: 1 },
      { name: "Transportation", icon: "🚗", color: "#4ECDC4", sort_order: 2 },
      { name: "Shopping", icon: "🛍️", color: "#45B7D1", sort_order: 3 },
      { name: "Entertainment", icon: "🎬", color: "#96CEB4", sort_order: 4 },
      {
        name: "Bills & Utilities",
        icon: "💡",
        color: "#FFEAA7",
        sort_order: 5,
      },
      { name: "Healthcare", icon: "🏥", color: "#DDA0DD", sort_order: 6 },
      { name: "Groceries", icon: "🛒", color: "#98D8C8", sort_order: 7 },
      { name: "Travel", icon: "✈️", color: "#F7DC6F", sort_order: 8 },
      { name: "Education", icon: "📚", color: "#BB8FCE", sort_order: 9 },
      { name: "Personal Care", icon: "💅", color: "#85C1E9", sort_order: 10 },
      { name: "Gifts", icon: "🎁", color: "#F8C471", sort_order: 11 },
      { name: "Other", icon: "📝", color: "#A9A9A9", sort_order: 12 },
    ];

    // Check if default categories already exist
    const { data: existingCategories, error: fetchError } = await supabase
      .from("categories")
      .select("id, name")
      .eq("is_default", true);

    if (fetchError) {
      throw new Error(`Failed to fetch categories: ${fetchError.message}`);
    }

    let categoryMap: Map<string, string>;

    if (!existingCategories || existingCategories.length === 0) {
      // Create default categories
      console.log("Creating default categories...");
      const { data: newCategories, error: createError } = await supabase
        .from("categories")
        .insert(
          defaultCategories.map((cat) => ({
            ...cat,
            is_default: true,
            user_id: null,
          }))
        )
        .select("id, name");

      if (createError) {
        throw new Error(
          `Failed to create default categories: ${createError.message}`
        );
      }

      categoryMap = new Map(newCategories.map((c) => [c.name, c.id]));
      console.log(`✓ Created ${newCategories.length} default categories`);
    } else {
      // Use existing categories
      categoryMap = new Map(existingCategories.map((c) => [c.name, c.id]));
      console.log(
        `✓ Found ${existingCategories.length} existing default categories`
      );
    }

    // Step 4: Create sample expenses
    console.log("\n💰 Creating sample expenses...");
    const now = new Date();
    const expenses = [
      // This week
      {
        user_id: userId,
        amount: 45.5,
        currency: "USD",
        expense_date: new Date(now.getTime() - 0 * 24 * 60 * 60 * 1000)
          .toISOString()
          .split("T")[0],
        category_id: categoryMap.get("Food & Dining"),
        description: "Dinner at Italian restaurant",
        payment_method: "credit_card",
      },
      {
        user_id: userId,
        amount: 12.99,
        currency: "USD",
        expense_date: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000)
          .toISOString()
          .split("T")[0],
        category_id: categoryMap.get("Food & Dining"),
        description: "Morning coffee and bagel",
        payment_method: "debit_card",
      },
      {
        user_id: userId,
        amount: 89.0,
        currency: "USD",
        expense_date: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000)
          .toISOString()
          .split("T")[0],
        category_id: categoryMap.get("Shopping"),
        description: "New running shoes",
        payment_method: "credit_card",
      },
      {
        user_id: userId,
        amount: 25.0,
        currency: "USD",
        expense_date: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000)
          .toISOString()
          .split("T")[0],
        category_id: categoryMap.get("Transportation"),
        description: "Uber to downtown",
        payment_method: "debit_card",
      },
      {
        user_id: userId,
        amount: 15.99,
        currency: "USD",
        expense_date: new Date(now.getTime() - 4 * 24 * 60 * 60 * 1000)
          .toISOString()
          .split("T")[0],
        category_id: categoryMap.get("Entertainment"),
        description: "Movie ticket",
        payment_method: "cash",
      },
      {
        user_id: userId,
        amount: 67.3,
        currency: "USD",
        expense_date: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000)
          .toISOString()
          .split("T")[0],
        category_id: categoryMap.get("Groceries"),
        description: "Weekly groceries",
        payment_method: "debit_card",
      },
      // Last week
      {
        user_id: userId,
        amount: 120.0,
        currency: "USD",
        expense_date: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
          .toISOString()
          .split("T")[0],
        category_id: categoryMap.get("Bills & Utilities"),
        description: "Internet bill",
        payment_method: "bank_transfer",
      },
      {
        user_id: userId,
        amount: 32.5,
        currency: "USD",
        expense_date: new Date(now.getTime() - 8 * 24 * 60 * 60 * 1000)
          .toISOString()
          .split("T")[0],
        category_id: categoryMap.get("Food & Dining"),
        description: "Lunch with colleagues",
        payment_method: "credit_card",
      },
      {
        user_id: userId,
        amount: 200.0,
        currency: "USD",
        expense_date: new Date(now.getTime() - 9 * 24 * 60 * 60 * 1000)
          .toISOString()
          .split("T")[0],
        category_id: categoryMap.get("Shopping"),
        description: "New headphones",
        payment_method: "credit_card",
      },
      {
        user_id: userId,
        amount: 35.0,
        currency: "USD",
        expense_date: new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000)
          .toISOString()
          .split("T")[0],
        category_id: categoryMap.get("Transportation"),
        description: "Gas fill-up",
        payment_method: "cash",
      },
      {
        user_id: userId,
        amount: 50.0,
        currency: "USD",
        expense_date: new Date(now.getTime() - 11 * 24 * 60 * 60 * 1000)
          .toISOString()
          .split("T")[0],
        category_id: categoryMap.get("Entertainment"),
        description: "Concert tickets",
        payment_method: "credit_card",
      },
      {
        user_id: userId,
        amount: 85.0,
        currency: "USD",
        expense_date: new Date(now.getTime() - 12 * 24 * 60 * 60 * 1000)
          .toISOString()
          .split("T")[0],
        category_id: categoryMap.get("Groceries"),
        description: "Groceries and household items",
        payment_method: "debit_card",
      },
      {
        user_id: userId,
        amount: 75.0,
        currency: "USD",
        expense_date: new Date(now.getTime() - 13 * 24 * 60 * 60 * 1000)
          .toISOString()
          .split("T")[0],
        category_id: categoryMap.get("Healthcare"),
        description: "Doctor visit copay",
        payment_method: "debit_card",
      },
      // Week 2
      {
        user_id: userId,
        amount: 28.99,
        currency: "USD",
        expense_date: new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000)
          .toISOString()
          .split("T")[0],
        category_id: categoryMap.get("Food & Dining"),
        description: "Takeout dinner",
        payment_method: "credit_card",
      },
      {
        user_id: userId,
        amount: 180.0,
        currency: "USD",
        expense_date: new Date(now.getTime() - 15 * 24 * 60 * 60 * 1000)
          .toISOString()
          .split("T")[0],
        category_id: categoryMap.get("Bills & Utilities"),
        description: "Electricity bill",
        payment_method: "bank_transfer",
      },
      {
        user_id: userId,
        amount: 42.5,
        currency: "USD",
        expense_date: new Date(now.getTime() - 16 * 24 * 60 * 60 * 1000)
          .toISOString()
          .split("T")[0],
        category_id: categoryMap.get("Food & Dining"),
        description: "Brunch with friends",
        payment_method: "credit_card",
      },
      {
        user_id: userId,
        amount: 95.0,
        currency: "USD",
        expense_date: new Date(now.getTime() - 17 * 24 * 60 * 60 * 1000)
          .toISOString()
          .split("T")[0],
        category_id: categoryMap.get("Shopping"),
        description: "New jeans",
        payment_method: "debit_card",
      },
      {
        user_id: userId,
        amount: 55.0,
        currency: "USD",
        expense_date: new Date(now.getTime() - 18 * 24 * 60 * 60 * 1000)
          .toISOString()
          .split("T")[0],
        category_id: categoryMap.get("Groceries"),
        description: "Groceries",
        payment_method: "debit_card",
      },
      // Week 3
      {
        user_id: userId,
        amount: 18.5,
        currency: "USD",
        expense_date: new Date(now.getTime() - 20 * 24 * 60 * 60 * 1000)
          .toISOString()
          .split("T")[0],
        category_id: categoryMap.get("Food & Dining"),
        description: "Coffee shop",
        payment_method: "debit_card",
      },
      {
        user_id: userId,
        amount: 125.0,
        currency: "USD",
        expense_date: new Date(now.getTime() - 21 * 24 * 60 * 60 * 1000)
          .toISOString()
          .split("T")[0],
        category_id: categoryMap.get("Shopping"),
        description: "Birthday gift",
        payment_method: "credit_card",
      },
      {
        user_id: userId,
        amount: 40.0,
        currency: "USD",
        expense_date: new Date(now.getTime() - 22 * 24 * 60 * 60 * 1000)
          .toISOString()
          .split("T")[0],
        category_id: categoryMap.get("Transportation"),
        description: "Taxi rides",
        payment_method: "cash",
      },
      {
        user_id: userId,
        amount: 65.0,
        currency: "USD",
        expense_date: new Date(now.getTime() - 23 * 24 * 60 * 60 * 1000)
          .toISOString()
          .split("T")[0],
        category_id: categoryMap.get("Groceries"),
        description: "Weekly groceries",
        payment_method: "debit_card",
      },
      {
        user_id: userId,
        amount: 30.0,
        currency: "USD",
        expense_date: new Date(now.getTime() - 24 * 24 * 60 * 60 * 1000)
          .toISOString()
          .split("T")[0],
        category_id: categoryMap.get("Entertainment"),
        description: "Streaming subscription",
        payment_method: "credit_card",
      },
    ];

    const { error: expensesError } = await supabase
      .from("expenses")
      .insert(expenses);

    if (expensesError) {
      throw new Error(`Failed to create expenses: ${expensesError.message}`);
    }

    const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
    console.log(
      `✓ Created ${
        expenses.length
      } sample expenses (Total: $${totalExpenses.toFixed(2)})`
    );

    // Step 5: Create budget for current month
    console.log("\n💵 Creating monthly budget...");
    const currentMonth = now.toISOString().slice(0, 7); // YYYY-MM format

    const { error: budgetError } = await supabase.from("budgets").insert({
      user_id: userId,
      month: currentMonth,
      amount: DEMO_BUDGET,
    });

    if (budgetError) {
      throw new Error(`Failed to create budget: ${budgetError.message}`);
    }

    console.log(
      `✓ Created budget for ${currentMonth}: $${DEMO_BUDGET.toFixed(2)}`
    );

    // Success summary
    console.log("\n✅ Demo data seeding completed successfully!\n");
    console.log("═══════════════════════════════════════");
    console.log("Demo User Credentials:");
    console.log(`  Email:    ${DEMO_USER.email}`);
    console.log(`  Password: ${DEMO_USER.password}`);
    console.log("═══════════════════════════════════════");
    console.log(`\n📊 Summary:`);
    console.log(`  • User ID: ${userId}`);
    console.log(`  • Categories: ${categoryMap.size} default categories`);
    console.log(`  • Expenses: ${expenses.length} transactions`);
    console.log(`  • Total Spent: $${totalExpenses.toFixed(2)}`);
    console.log(`  • Budget: $${DEMO_BUDGET.toFixed(2)}`);
    console.log(`  • Remaining: $${(DEMO_BUDGET - totalExpenses).toFixed(2)}`);
    console.log(
      `  • Budget Used: ${((totalExpenses / DEMO_BUDGET) * 100).toFixed(1)}%`
    );
    console.log("\n🎉 You can now sign in at http://localhost:3000/signin\n");
  } catch (error) {
    console.error(
      "\n❌ Seeding failed:",
      error instanceof Error ? error.message : error
    );
    process.exit(1);
  }
}

main();
