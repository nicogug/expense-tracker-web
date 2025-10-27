# Supabase Integration

This directory contains the complete Supabase integration for the application, following official best practices for Next.js 15 App Router.

## Architecture Overview

```
lib/supabase/
├── client.ts              # Browser client (Client Components)
├── server.ts              # Server client (Server Components, Actions, Route Handlers)
├── middleware.ts          # Middleware client (auth token refresh)
├── config.ts              # Configuration and constants
├── types.ts               # TypeScript types (auto-generated from DB schema)
├── queries/               # Server-side read operations
│   ├── auth.ts            # Authentication queries
│   └── README.md          # Query guidelines
└── mutations/             # Server-side write operations
    ├── auth.ts            # Authentication mutations
    └── README.md          # Mutation guidelines
```

## Quick Start

### 1. Environment Setup

Copy `.env.example` to `.env.local` and fill in your Supabase credentials:

```bash
cp .env.example .env.local
```

Get your credentials from: https://app.supabase.com/project/_/settings/api

### 2. Client Usage Patterns

#### Server Components (Recommended)

```tsx
// app/posts/page.tsx
import { createClient } from '@/lib/supabase/server'

export default async function PostsPage() {
  const supabase = await createClient()
  const { data: posts } = await supabase.from('posts').select()

  return <div>{/* render posts */}</div>
}
```

#### Client Components

```tsx
// components/realtime-posts.tsx
'use client'
import { createClient } from '@/lib/supabase/client'
import { useEffect, useState } from 'react'

export function RealtimePosts() {
  const [posts, setPosts] = useState([])
  const supabase = createClient()

  useEffect(() => {
    const channel = supabase
      .channel('posts')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'posts' },
        (payload) => {/* handle change */}
      )
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [supabase])

  return <div>{/* render posts */}</div>
}
```

#### Server Actions

```tsx
// app/actions.ts
'use server'
import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function createPost(formData: FormData) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('posts')
    .insert({ title: formData.get('title') })

  if (error) return { error: error.message }

  revalidatePath('/posts')
  return { data }
}
```

### 3. Authentication

#### Protect a Page (Server Component)

```tsx
// app/dashboard/page.tsx
import { requireAuth } from '@/lib/auth/route-protection'

export default async function DashboardPage() {
  const user = await requireAuth()
  return <div>Welcome {user.email}</div>
}
```

#### Auth in Client Components

```tsx
'use client'
import { useUser } from '@/hooks/use-user'

export function UserProfile() {
  const { user, loading } = useUser()

  if (loading) return <div>Loading...</div>
  if (!user) return <div>Not logged in</div>

  return <div>Welcome {user.email}</div>
}
```

#### Sign In/Sign Up Forms

```tsx
'use client'
import { signIn, signUp } from '@/lib/supabase/mutations/auth'

export function AuthForms() {
  return (
    <>
      <form action={signIn}>
        <input name="email" type="email" required />
        <input name="password" type="password" required />
        <button type="submit">Sign In</button>
      </form>

      <form action={signUp}>
        <input name="email" type="email" required />
        <input name="password" type="password" required />
        <button type="submit">Sign Up</button>
      </form>
    </>
  )
}
```

## Key Concepts

### Security Best Practices

1. **Always use `getUser()` in server code, never `getSession()`**
   - `getUser()` validates the token on every call
   - `getSession()` only checks local storage without validation

2. **Middleware handles token refresh automatically**
   - Runs on every request
   - Refreshes expired tokens
   - Updates cookies for both server and client

3. **Use Row Level Security (RLS) in Supabase**
   - Never trust client-side code alone
   - Implement policies in your database

### Data Fetching Patterns

1. **Queries** (`lib/supabase/queries/`)
   - Read operations
   - Server-side only
   - Use React cache() for deduplication
   - Return data or throw errors

2. **Mutations** (`lib/supabase/mutations/`)
   - Write operations (create, update, delete)
   - Implemented as Server Actions
   - Return `{ data?, error? }` format
   - Call `revalidatePath()` after mutations

### TypeScript Types

Generate types from your database schema:

```bash
# From cloud project
npx supabase gen types typescript --project-id YOUR_PROJECT_ID > lib/supabase/types.ts

# From local development
npx supabase gen types typescript --local > lib/supabase/types.ts
```

Use generated types:

```tsx
import type { Tables } from '@/lib/supabase/types'

type Post = Tables<'posts'>
type NewPost = TablesInsert<'posts'>
```

## Common Patterns & Examples

### Fetching Data (Server Component)

```tsx
// app/posts/page.tsx
import { createClient } from '@/lib/supabase/server'

export default async function PostsPage() {
  const supabase = await createClient()

  const { data: posts, error } = await supabase
    .from('posts')
    .select()
    .order('created_at', { ascending: false })

  if (error) throw error

  return (
    <div>
      {posts.map(post => (
        <article key={post.id}>
          <h2>{post.title}</h2>
          <p>{post.content}</p>
        </article>
      ))}
    </div>
  )
}
```

### Creating Data (Server Action)

```tsx
// lib/supabase/mutations/posts.ts
'use server'
import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function createPost(formData: FormData) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('posts')
    .insert({
      title: formData.get('title'),
      content: formData.get('content'),
    })
    .select()
    .single()

  if (error) return { error: error.message }

  revalidatePath('/posts')
  return { data }
}
```

```tsx
// app/posts/new/page.tsx
'use client'
import { createPost } from '@/lib/supabase/mutations/posts'

export default function NewPostPage() {
  return (
    <form action={createPost}>
      <input name="title" required />
      <textarea name="content" required />
      <button type="submit">Create Post</button>
    </form>
  )
}
```

### Updating Data (Server Action)

```tsx
// lib/supabase/mutations/posts.ts
'use server'
import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function updatePost(id: string, formData: FormData) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('posts')
    .update({
      title: formData.get('title'),
      content: formData.get('content'),
    })
    .eq('id', id)
    .select()
    .single()

  if (error) return { error: error.message }

  revalidatePath('/posts')
  revalidatePath(`/posts/${id}`)
  return { data }
}
```

### Deleting Data (Server Action)

```tsx
// lib/supabase/mutations/posts.ts
'use server'
import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export async function deletePost(id: string) {
  const supabase = await createClient()

  const { error } = await supabase
    .from('posts')
    .delete()
    .eq('id', id)

  if (error) return { error: error.message }

  revalidatePath('/posts')
  redirect('/posts')
}
```

### Pagination

```tsx
// app/posts/page.tsx
import { createClient } from '@/lib/supabase/server'

export default async function PostsPage({
  searchParams,
}: {
  searchParams: { page?: string }
}) {
  const page = Number(searchParams.page) || 1
  const itemsPerPage = 10
  const from = (page - 1) * itemsPerPage
  const to = from + itemsPerPage - 1

  const supabase = await createClient()

  const { data: posts, error, count } = await supabase
    .from('posts')
    .select('*', { count: 'exact' })
    .range(from, to)
    .order('created_at', { ascending: false })

  if (error) throw error

  const totalPages = Math.ceil((count || 0) / itemsPerPage)

  return (
    <div>
      {posts.map(post => (
        <article key={post.id}>{post.title}</article>
      ))}
      <nav>
        {Array.from({ length: totalPages }, (_, i) => (
          <a key={i} href={`?page=${i + 1}`}>
            {i + 1}
          </a>
        ))}
      </nav>
    </div>
  )
}
```

### Filtering & Search

```tsx
// app/posts/page.tsx
import { createClient } from '@/lib/supabase/server'

export default async function PostsPage({
  searchParams,
}: {
  searchParams: { search?: string; author?: string }
}) {
  const supabase = await createClient()

  let query = supabase
    .from('posts')
    .select('*')
    .order('created_at', { ascending: false })

  // Text search
  if (searchParams.search) {
    query = query.ilike('title', `%${searchParams.search}%`)
  }

  // Filter by author
  if (searchParams.author) {
    query = query.eq('author_id', searchParams.author)
  }

  const { data: posts, error } = await query

  if (error) throw error

  return <div>{/* render posts */}</div>
}
```

### Joins (Relationships)

```tsx
// app/posts/[id]/page.tsx
import { createClient } from '@/lib/supabase/server'

export default async function PostPage({
  params,
}: {
  params: { id: string }
}) {
  const supabase = await createClient()

  const { data: post, error } = await supabase
    .from('posts')
    .select(`
      *,
      author:users(id, name, email),
      comments(
        id,
        content,
        created_at,
        user:users(name)
      )
    `)
    .eq('id', params.id)
    .single()

  if (error) throw error

  return (
    <article>
      <h1>{post.title}</h1>
      <p>By {post.author.name}</p>
      <div>{post.content}</div>

      <section>
        <h2>Comments ({post.comments.length})</h2>
        {post.comments.map(comment => (
          <div key={comment.id}>
            <p>{comment.content}</p>
            <small>By {comment.user.name}</small>
          </div>
        ))}
      </section>
    </article>
  )
}
```

### Real-time Subscriptions

```tsx
// components/realtime-posts.tsx
'use client'
import { createClient } from '@/lib/supabase/client'
import { useEffect, useState } from 'react'
import type { Tables } from '@/lib/supabase/types'

export function RealtimePosts() {
  const [posts, setPosts] = useState<Tables<'posts'>[]>([])
  const supabase = createClient()

  useEffect(() => {
    // Initial fetch
    supabase.from('posts').select().then(({ data }) => {
      if (data) setPosts(data)
    })

    // Subscribe to changes
    const channel = supabase
      .channel('posts')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'posts' },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            setPosts(prev => [payload.new as Tables<'posts'>, ...prev])
          } else if (payload.eventType === 'UPDATE') {
            setPosts(prev =>
              prev.map(post =>
                post.id === payload.new.id ? (payload.new as Tables<'posts'>) : post
              )
            )
          } else if (payload.eventType === 'DELETE') {
            setPosts(prev => prev.filter(post => post.id !== payload.old.id))
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [supabase])

  return (
    <div>
      {posts.map(post => (
        <article key={post.id}>{post.title}</article>
      ))}
    </div>
  )
}
```

### File Upload (Storage)

```tsx
// lib/supabase/mutations/storage.ts
'use server'
import { createClient } from '@/lib/supabase/server'

export async function uploadAvatar(userId: string, formData: FormData) {
  const file = formData.get('avatar') as File
  if (!file) return { error: 'No file provided' }

  const supabase = await createClient()

  const fileExt = file.name.split('.').pop()
  const filePath = `${userId}/avatar.${fileExt}`

  const { data, error } = await supabase.storage
    .from('avatars')
    .upload(filePath, file, {
      cacheControl: '3600',
      upsert: true, // Replace existing file
    })

  if (error) return { error: error.message }

  // Get public URL
  const { data: { publicUrl } } = supabase.storage
    .from('avatars')
    .getPublicUrl(filePath)

  return { data: { path: data.path, url: publicUrl } }
}
```

```tsx
// app/profile/page.tsx
'use client'
import { uploadAvatar } from '@/lib/supabase/mutations/storage'
import { useUser } from '@/hooks/use-user'

export default function ProfilePage() {
  const { user } = useUser()

  async function handleSubmit(formData: FormData) {
    if (!user) return
    const result = await uploadAvatar(user.id, formData)
    if (result.error) {
      console.error(result.error)
    } else {
      console.log('Uploaded:', result.data?.url)
    }
  }

  return (
    <form action={handleSubmit}>
      <input type="file" name="avatar" accept="image/*" required />
      <button type="submit">Upload Avatar</button>
    </form>
  )
}
```

### Optimistic Updates (Client)

```tsx
'use client'
import { createClient } from '@/lib/supabase/client'
import { useState, useTransition } from 'react'
import type { Tables } from '@/lib/supabase/types'

export function LikeButton({ post }: { post: Tables<'posts'> }) {
  const [likes, setLikes] = useState(post.likes)
  const [isPending, startTransition] = useTransition()
  const supabase = createClient()

  function handleLike() {
    // Optimistic update
    setLikes(prev => prev + 1)

    startTransition(async () => {
      const { data, error } = await supabase
        .from('posts')
        .update({ likes: likes + 1 })
        .eq('id', post.id)
        .select('likes')
        .single()

      if (error) {
        // Revert on error
        setLikes(prev => prev - 1)
        console.error(error)
      } else {
        // Update with server value
        setLikes(data.likes)
      }
    })
  }

  return (
    <button onClick={handleLike} disabled={isPending}>
      Like ({likes})
    </button>
  )
}
```

## Troubleshooting

### "Missing environment variables" error

Make sure `.env.local` exists and contains:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### Auth not persisting

Check that middleware is running - it should be in `middleware.ts` at the root of your project.

### Cookie errors

Make sure you're using the correct client:
- Server Components → `lib/supabase/server.ts`
- Client Components → `lib/supabase/client.ts`
- Middleware → `lib/supabase/middleware.ts`

## Resources

- [Supabase Docs](https://supabase.com/docs)
- [Next.js + Supabase Guide](https://supabase.com/docs/guides/auth/server-side/nextjs)
- [Supabase JS Reference](https://supabase.com/docs/reference/javascript)
