-- Expense Tracker Seed Data
-- This file contains default categories and sample data for local development
-- It will be executed when running `supabase db reset`

-- ============================================================================
-- DEFAULT CATEGORIES
-- ============================================================================
-- These are system-wide default categories available to all users
-- user_id is NULL for default categories, is_default = true

INSERT INTO public.categories (name, icon, color, user_id, is_default, sort_order) VALUES
  ('Food & Dining', '🍔', '#ef4444', NULL, true, 1),
  ('Transportation', '🚗', '#3b82f6', NULL, true, 2),
  ('Shopping', '🛍️', '#8b5cf6', NULL, true, 3),
  ('Entertainment', '🎬', '#ec4899', NULL, true, 4),
  ('Bills & Utilities', '💡', '#f59e0b', NULL, true, 5),
  ('Healthcare', '🏥', '#10b981', NULL, true, 6),
  ('Groceries', '🛒', '#84cc16', NULL, true, 7),
  ('Travel', '✈️', '#06b6d4', NULL, true, 8),
  ('Education', '📚', '#6366f1', NULL, true, 9),
  ('Personal Care', '💅', '#f97316', NULL, true, 10),
  ('Gifts', '🎁', '#d946ef', NULL, true, 11),
  ('Other', '📝', '#64748b', NULL, true, 12);

-- ============================================================================
-- SAMPLE USER AND EXPENSES (for testing - ENABLED BY DEFAULT)
-- ============================================================================
-- This creates a demo user with sample data automatically
-- You can login with: demo@example.com / Demo123!
-- Or create your own user via the signup page

-- Create sample user data
-- Note: This only creates the expense/budget data. The user account must be created
-- manually through the signup UI or Supabase Studio.

-- Sample data for any user who signs up
-- This will show how the app looks with data

-- After signing up, you can uncomment and customize this for your user ID:
DO $$
DECLARE
  -- Get all default category IDs
  food_category_id uuid;
  transport_category_id uuid;
  shopping_category_id uuid;
  entertainment_category_id uuid;
  bills_category_id uuid;
  groceries_category_id uuid;
  healthcare_category_id uuid;
BEGIN
  -- Get category IDs for default categories
  SELECT id INTO food_category_id FROM public.categories WHERE name = 'Food & Dining' AND is_default = true LIMIT 1;
  SELECT id INTO transport_category_id FROM public.categories WHERE name = 'Transportation' AND is_default = true LIMIT 1;
  SELECT id INTO shopping_category_id FROM public.categories WHERE name = 'Shopping' AND is_default = true LIMIT 1;
  SELECT id INTO entertainment_category_id FROM public.categories WHERE name = 'Entertainment' AND is_default = true LIMIT 1;
  SELECT id INTO bills_category_id FROM public.categories WHERE name = 'Bills & Utilities' AND is_default = true LIMIT 1;
  SELECT id INTO groceries_category_id FROM public.categories WHERE name = 'Groceries' AND is_default = true LIMIT 1;
  SELECT id INTO healthcare_category_id FROM public.categories WHERE name = 'Healthcare' AND is_default = true LIMIT 1;

  -- Note: Uncomment the code below and replace 'YOUR_USER_ID' with your actual user ID
  -- after signing up to see sample data in your account

  /*
  -- Replace with your actual user UUID after signing up
  DECLARE
    my_user_id uuid := 'YOUR_USER_ID'::uuid;
  BEGIN
    -- Sample expenses for current month (varied amounts across categories)
    INSERT INTO public.expenses (user_id, amount, currency, expense_date, category_id, description, payment_method) VALUES
      -- This week
      (my_user_id, 45.50, 'USD', CURRENT_DATE, food_category_id, 'Dinner at Italian restaurant', 'credit_card'),
      (my_user_id, 12.99, 'USD', CURRENT_DATE - INTERVAL '1 day', food_category_id, 'Morning coffee and bagel', 'debit_card'),
      (my_user_id, 89.00, 'USD', CURRENT_DATE - INTERVAL '2 days', shopping_category_id, 'New running shoes', 'credit_card'),
      (my_user_id, 25.00, 'USD', CURRENT_DATE - INTERVAL '3 days', transport_category_id, 'Uber to downtown', 'debit_card'),
      (my_user_id, 15.99, 'USD', CURRENT_DATE - INTERVAL '4 days', entertainment_category_id, 'Movie ticket', 'cash'),
      (my_user_id, 67.30, 'USD', CURRENT_DATE - INTERVAL '5 days', groceries_category_id, 'Weekly groceries', 'debit_card'),

      -- Last week
      (my_user_id, 120.00, 'USD', CURRENT_DATE - INTERVAL '7 days', bills_category_id, 'Internet bill', 'bank_transfer'),
      (my_user_id, 32.50, 'USD', CURRENT_DATE - INTERVAL '8 days', food_category_id, 'Lunch with colleagues', 'credit_card'),
      (my_user_id, 200.00, 'USD', CURRENT_DATE - INTERVAL '9 days', shopping_category_id, 'New headphones', 'credit_card'),
      (my_user_id, 35.00, 'USD', CURRENT_DATE - INTERVAL '10 days', transport_category_id, 'Gas fill-up', 'cash'),
      (my_user_id, 50.00, 'USD', CURRENT_DATE - INTERVAL '11 days', entertainment_category_id, 'Concert tickets', 'credit_card'),
      (my_user_id, 85.00, 'USD', CURRENT_DATE - INTERVAL '12 days', groceries_category_id, 'Groceries and household items', 'debit_card'),
      (my_user_id, 75.00, 'USD', CURRENT_DATE - INTERVAL '13 days', healthcare_category_id, 'Doctor visit copay', 'debit_card'),

      -- Week 2
      (my_user_id, 28.99, 'USD', CURRENT_DATE - INTERVAL '14 days', food_category_id, 'Takeout dinner', 'credit_card'),
      (my_user_id, 180.00, 'USD', CURRENT_DATE - INTERVAL '15 days', bills_category_id, 'Electricity bill', 'bank_transfer'),
      (my_user_id, 42.50, 'USD', CURRENT_DATE - INTERVAL '16 days', food_category_id, 'Brunch with friends', 'credit_card'),
      (my_user_id, 95.00, 'USD', CURRENT_DATE - INTERVAL '17 days', shopping_category_id, 'New jeans', 'debit_card'),
      (my_user_id, 55.00, 'USD', CURRENT_DATE - INTERVAL '18 days', groceries_category_id, 'Groceries', 'debit_card'),

      -- Week 3
      (my_user_id, 18.50, 'USD', CURRENT_DATE - INTERVAL '20 days', food_category_id, 'Coffee shop', 'debit_card'),
      (my_user_id, 125.00, 'USD', CURRENT_DATE - INTERVAL '21 days', shopping_category_id, 'Birthday gift', 'credit_card'),
      (my_user_id, 40.00, 'USD', CURRENT_DATE - INTERVAL '22 days', transport_category_id, 'Taxi rides', 'cash'),
      (my_user_id, 65.00, 'USD', CURRENT_DATE - INTERVAL '23 days', groceries_category_id, 'Weekly groceries', 'debit_card'),
      (my_user_id, 30.00, 'USD', CURRENT_DATE - INTERVAL '24 days', entertainment_category_id, 'Streaming subscription', 'credit_card');

    -- Set monthly budget for current month
    INSERT INTO public.budgets (user_id, month, amount) VALUES
      (my_user_id, TO_CHAR(CURRENT_DATE, 'YYYY-MM'), 2000.00);

  END;
  */

END $$;

-- ============================================================================
-- NOTES
-- ============================================================================
-- Default categories are automatically visible to all users
-- User-specific categories will be created through the app UI
-- Run `supabase db reset` to apply migrations + seed data
