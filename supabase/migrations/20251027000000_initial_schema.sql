-- Expense Tracker Complete Schema
-- All tables, functions, and triggers for the expense tracker application

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- ============================================================================
-- CATEGORIES TABLE
-- ============================================================================
-- Stores expense categories (both user-created and default)
create table public.categories (
  id uuid default uuid_generate_v4() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  name text not null,
  icon text not null, -- Emoji or icon identifier
  color text not null, -- Hex color code
  user_id uuid references auth.users(id) on delete cascade,
  is_default boolean default false not null, -- True for system default categories
  sort_order integer default 0 not null, -- For custom ordering

  -- Ensure unique category names per user
  unique(user_id, name)
);

-- Enable RLS
alter table public.categories enable row level security;

-- RLS Policies for categories
create policy "Users can view their own categories"
  on public.categories
  for select
  using (auth.uid() = user_id);

create policy "Users can view default categories"
  on public.categories
  for select
  using (is_default = true and user_id is null);

create policy "Users can create their own categories"
  on public.categories
  for insert
  with check (auth.uid() = user_id and is_default = false);

create policy "Users can update their own categories"
  on public.categories
  for update
  using (auth.uid() = user_id and is_default = false);

create policy "Users can delete their own categories"
  on public.categories
  for delete
  using (auth.uid() = user_id and is_default = false);

-- Indexes for categories
create index categories_user_id_idx on public.categories(user_id);
create index categories_is_default_idx on public.categories(is_default) where is_default = true;

-- ============================================================================
-- EXPENSES TABLE
-- ============================================================================
-- Stores all expense transactions
create table public.expenses (
  id uuid default uuid_generate_v4() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  user_id uuid references auth.users(id) on delete cascade not null,
  amount numeric(12, 2) not null check (amount > 0), -- Support decimals with 2 precision
  currency text default 'USD' not null,
  expense_date date not null, -- The actual date of the expense
  category_id uuid references public.categories(id) on delete restrict not null,
  description text,
  payment_method text check (payment_method in ('credit_card', 'debit_card', 'cash', 'bank_transfer', 'other')),
  receipt_url text, -- URL to receipt image in Supabase Storage (for future AI feature)
  notes text -- Additional notes
);

-- Enable RLS
alter table public.expenses enable row level security;

-- RLS Policies for expenses
create policy "Users can view their own expenses"
  on public.expenses
  for select
  using (auth.uid() = user_id);

create policy "Users can create their own expenses"
  on public.expenses
  for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own expenses"
  on public.expenses
  for update
  using (auth.uid() = user_id);

create policy "Users can delete their own expenses"
  on public.expenses
  for delete
  using (auth.uid() = user_id);

-- Indexes for expenses (critical for query performance)
create index expenses_user_id_idx on public.expenses(user_id);
create index expenses_expense_date_idx on public.expenses(expense_date desc);
create index expenses_category_id_idx on public.expenses(category_id);
create index expenses_user_date_idx on public.expenses(user_id, expense_date desc);
create index expenses_created_at_idx on public.expenses(created_at desc);

-- ============================================================================
-- BUDGETS TABLE
-- ============================================================================
-- Stores monthly budget limits for users
create table public.budgets (
  id uuid default uuid_generate_v4() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  user_id uuid references auth.users(id) on delete cascade not null,
  month text not null, -- Format: YYYY-MM
  amount numeric(12, 2) not null check (amount > 0),

  -- Ensure one budget per month per user
  unique(user_id, month)
);

-- Enable RLS
alter table public.budgets enable row level security;

-- RLS Policies for budgets
create policy "Users can view their own budgets"
  on public.budgets
  for select
  using (auth.uid() = user_id);

create policy "Users can create their own budgets"
  on public.budgets
  for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own budgets"
  on public.budgets
  for update
  using (auth.uid() = user_id);

create policy "Users can delete their own budgets"
  on public.budgets
  for delete
  using (auth.uid() = user_id);

-- Indexes for budgets
create index budgets_user_id_idx on public.budgets(user_id);
create index budgets_user_month_idx on public.budgets(user_id, month);

-- ============================================================================
-- USER SETTINGS TABLE
-- ============================================================================
-- Stores user preferences and settings
create table public.user_settings (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users(id) on delete cascade not null unique,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  currency text default 'USD' not null,
  theme text default 'system' check (theme in ('light', 'dark', 'system')),
  language text default 'en',
  notifications_enabled boolean default true,
  onboarding_completed boolean default false
);

-- Enable RLS
alter table public.user_settings enable row level security;

-- RLS Policies for user_settings
create policy "Users can view their own settings"
  on public.user_settings
  for select
  using (auth.uid() = user_id);

create policy "Users can insert their own settings"
  on public.user_settings
  for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own settings"
  on public.user_settings
  for update
  using (auth.uid() = user_id);

-- Index for user_settings
create index user_settings_user_id_idx on public.user_settings(user_id);

-- ============================================================================
-- FUNCTIONS AND TRIGGERS
-- ============================================================================

-- Function to automatically update updated_at column
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- Triggers for updated_at
create trigger on_categories_updated
  before update on public.categories
  for each row
  execute procedure public.handle_updated_at();

create trigger on_expenses_updated
  before update on public.expenses
  for each row
  execute procedure public.handle_updated_at();

create trigger on_budgets_updated
  before update on public.budgets
  for each row
  execute procedure public.handle_updated_at();

create trigger on_user_settings_updated
  before update on public.user_settings
  for each row
  execute procedure public.handle_updated_at();

-- Function to create default user settings on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.user_settings (user_id)
  values (new.id);
  return new;
end;
$$ language plpgsql security definer;

-- Trigger to create user settings when a new user signs up
create trigger on_auth_user_created
  after insert on auth.users
  for each row
  execute procedure public.handle_new_user();

-- ============================================================================
-- VIEWS (Optional - for easier querying)
-- ============================================================================

-- View for expenses with category information
create view public.expenses_with_categories as
select
  e.id,
  e.created_at,
  e.updated_at,
  e.user_id,
  e.amount,
  e.currency,
  e.expense_date,
  e.description,
  e.payment_method,
  e.receipt_url,
  e.notes,
  c.id as category_id,
  c.name as category_name,
  c.icon as category_icon,
  c.color as category_color
from public.expenses e
inner join public.categories c on e.category_id = c.id;

-- Grant access to the view
alter view public.expenses_with_categories owner to postgres;
grant select on public.expenses_with_categories to authenticated;

-- RLS for the view (inherits from base tables)
alter view public.expenses_with_categories set (security_invoker = on);
