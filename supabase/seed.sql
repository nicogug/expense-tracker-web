-- Supabase Seed Data
-- This file contains sample data for local development
-- It will be executed when running `supabase db reset`

-- ============================================================================
-- NOTE: Creating Test Users
-- ============================================================================
-- Users should be created through Supabase Auth, not directly in auth.users
--
-- To create test users for local development:
-- 1. Visit Supabase Studio: http://127.0.0.1:54323/project/default/auth/users
-- 2. Click "Add User" and create a test user
-- 3. Or use the signup endpoint in your application
--
-- For automated seeding with users, you can use this test user UUID:
-- Test User: 00000000-0000-0000-0000-000000000001
-- Email: test@example.com
-- Password: password123
--
-- Create it manually in Studio, then uncomment the posts below
-- ============================================================================

-- ============================================================================
-- Seed data for posts table
-- ============================================================================
-- Note: These are commented out by default. After creating a test user in
-- Supabase Studio, uncomment these and update the user_id to match your test user

/*
INSERT INTO public.posts (user_id, title, content, published) VALUES
  (
    '00000000-0000-0000-0000-000000000001'::uuid, -- Replace with your test user ID
    'Welcome to My Blog',
    'This is my first blog post! I''m excited to share my thoughts and ideas with you.',
    true
  ),
  (
    '00000000-0000-0000-0000-000000000001'::uuid,
    'Getting Started with Next.js 16',
    'Next.js 16 brings amazing new features like Turbopack by default, improved performance, and better developer experience. In this post, we''ll explore what''s new.',
    true
  ),
  (
    '00000000-0000-0000-0000-000000000001'::uuid,
    'Building with Supabase',
    'Supabase is an incredible open-source Firebase alternative. Learn how to build secure, scalable applications with Supabase and Next.js.',
    true
  ),
  (
    '00000000-0000-0000-0000-000000000001'::uuid,
    'Draft: Work in Progress',
    'This is a draft post that hasn''t been published yet. Only the author can see this.',
    false
  );
*/

-- Add your own seed data here
