-- Initial Schema Migration
-- This is an example migration showing best practices for Supabase
-- You can modify this to fit your application's needs

-- Enable UUID extension (if not already enabled)
create extension if not exists "uuid-ossp";

-- Create a table for public posts
-- Note: This table is accessible to all users (with RLS policies)
create table public.posts (
  id uuid default uuid_generate_v4() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  title text not null,
  content text,
  user_id uuid references auth.users(id) on delete cascade not null,
  published boolean default false not null
);

-- Enable Row Level Security (RLS)
alter table public.posts enable row level security;

-- Create policies for the posts table

-- Policy: Anyone can view published posts
create policy "Published posts are viewable by everyone"
  on public.posts
  for select
  using (published = true);

-- Policy: Users can view their own posts (published or unpublished)
create policy "Users can view their own posts"
  on public.posts
  for select
  using (auth.uid() = user_id);

-- Policy: Users can create their own posts
create policy "Users can create their own posts"
  on public.posts
  for insert
  with check (auth.uid() = user_id);

-- Policy: Users can update their own posts
create policy "Users can update their own posts"
  on public.posts
  for update
  using (auth.uid() = user_id);

-- Policy: Users can delete their own posts
create policy "Users can delete their own posts"
  on public.posts
  for delete
  using (auth.uid() = user_id);

-- Create a function to automatically update the updated_at column
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- Create a trigger to call the updated_at function
create trigger on_posts_updated
  before update on public.posts
  for each row
  execute procedure public.handle_updated_at();

-- Create indexes for better query performance
create index posts_user_id_idx on public.posts(user_id);
create index posts_created_at_idx on public.posts(created_at desc);
create index posts_published_idx on public.posts(published) where published = true;

-- Optional: Create a view for published posts with user information
-- This is useful if you want to join with auth.users metadata
-- Note: auth.users is not directly accessible, so you'd need a profiles table
-- For now, this is commented out as an example:
/*
create view public.published_posts_with_user as
select
  posts.id,
  posts.created_at,
  posts.title,
  posts.content,
  posts.user_id,
  profiles.username,
  profiles.avatar_url
from public.posts
inner join public.profiles on posts.user_id = profiles.id
where posts.published = true;
*/
