# Supabase Queries

This directory contains reusable query functions for fetching data from Supabase.

## Guidelines

- **Server-side only**: Queries should use the server client from `@/lib/supabase/server`
- **Type-safe**: Always define proper TypeScript types for query results
- **Error handling**: Always handle errors gracefully
- **Single responsibility**: Each file should focus on a specific domain/table

## Example Structure

```typescript
// queries/posts.ts
import { createClient } from '@/lib/supabase/server'

export async function getPosts() {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('posts')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) throw error
  return data
}

export async function getPostById(id: string) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('posts')
    .select('*')
    .eq('id', id)
    .single()

  if (error) throw error
  return data
}
```

## Usage in Server Components

```tsx
import { getPosts } from '@/lib/supabase/queries/posts'

export default async function PostsPage() {
  const posts = await getPosts()
  return (
    <div>
      {posts.map((post) => (
        <div key={post.id}>{post.title}</div>
      ))}
    </div>
  )
}
```

## Naming Conventions

- Use `get` prefix for single item queries: `getUserById`, `getPost`
- Use `list` or plural for multiple items: `listUsers`, `getPosts`
- Use descriptive names: `getUserWithPosts`, `getPublishedPosts`
