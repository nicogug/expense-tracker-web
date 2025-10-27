# Supabase Mutations

This directory contains reusable mutation functions for creating, updating, and deleting data in Supabase.

## Guidelines

- **Server Actions**: Mutations should be implemented as Server Actions with 'use server'
- **Type-safe**: Always define proper TypeScript types for inputs and outputs
- **Validation**: Validate input data before mutations
- **Error handling**: Return errors in a consistent format
- **Revalidation**: Use Next.js revalidation after mutations to update cached data

## Example Structure

```typescript
// mutations/posts.ts
'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function createPost(formData: FormData) {
  const supabase = await createClient()

  const title = formData.get('title') as string
  const content = formData.get('content') as string

  // Validate
  if (!title || !content) {
    return { error: 'Title and content are required' }
  }

  // Insert
  const { data, error } = await supabase
    .from('posts')
    .insert({ title, content })
    .select()
    .single()

  if (error) {
    return { error: error.message }
  }

  // Revalidate
  revalidatePath('/posts')

  return { data }
}

export async function deletePost(id: string) {
  const supabase = await createClient()

  const { error } = await supabase
    .from('posts')
    .delete()
    .eq('id', id)

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/posts')
  return { success: true }
}
```

## Usage in Client Components

```tsx
'use client'

import { createPost } from '@/lib/supabase/mutations/posts'

export function CreatePostForm() {
  return (
    <form action={createPost}>
      <input name="title" />
      <textarea name="content" />
      <button type="submit">Create</button>
    </form>
  )
}
```

## Naming Conventions

- Use verb prefixes: `create`, `update`, `delete`, `upsert`
- Be specific: `createPost`, `updateUserProfile`, `deleteComment`
- Return consistent format: `{ data?, error? }` or `{ success: boolean, error? }`
