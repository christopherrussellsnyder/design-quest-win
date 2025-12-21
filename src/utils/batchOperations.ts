import { supabase } from '@/integrations/supabase/client';
import type { Database } from '@/integrations/supabase/types';

type Tables = Database['public']['Tables'];
type TableName = keyof Tables;

// Batch insert for bulk operations
export async function batchInsert(
  table: TableName,
  records: Tables[typeof table]['Insert'][],
  chunkSize = 100
) {
  const results: { success: boolean; error?: unknown }[] = [];

  // Split into chunks
  for (let i = 0; i < records.length; i += chunkSize) {
    const chunk = records.slice(i, i + chunkSize);
    const { error } = await supabase.from(table).insert(chunk as never[]);

    if (error) {
      results.push({ success: false, error });
    } else {
      results.push({ success: true });
    }
  }

  const failedCount = results.filter(r => !r.success).length;
  return {
    success: failedCount === 0,
    totalProcessed: records.length,
    failedChunks: failedCount,
    results
  };
}

// Batch update by IDs
export async function batchUpdate(
  table: TableName,
  updates: { id: string; data: Record<string, unknown> }[],
  chunkSize = 50
) {
  const results: { id: string; success: boolean; error?: unknown }[] = [];

  // Process in chunks with Promise.all for parallel execution within chunks
  for (let i = 0; i < updates.length; i += chunkSize) {
    const chunk = updates.slice(i, i + chunkSize);

    const chunkResults = await Promise.all(
      chunk.map(async ({ id, data }) => {
        const { error } = await supabase
          .from(table)
          .update(data as never)
          .eq('id', id);

        return { id, success: !error, error };
      })
    );

    results.push(...chunkResults);
  }

  const failedCount = results.filter(r => !r.success).length;
  return {
    success: failedCount === 0,
    totalProcessed: updates.length,
    failedCount,
    results
  };
}

// Batch delete by IDs
export async function batchDelete(
  table: TableName,
  ids: string[],
  chunkSize = 100
) {
  const results: { success: boolean; error?: unknown }[] = [];

  for (let i = 0; i < ids.length; i += chunkSize) {
    const chunk = ids.slice(i, i + chunkSize);
    const { error } = await supabase
      .from(table)
      .delete()
      .in('id', chunk);

    results.push({ success: !error, error });
  }

  const failedCount = results.filter(r => !r.success).length;
  return {
    success: failedCount === 0,
    totalDeleted: ids.length - failedCount * chunkSize,
    results
  };
}

// Bulk schedule posts
export async function bulkSchedulePosts(
  posts: Tables['scheduled_posts']['Insert'][]
) {
  return batchInsert('scheduled_posts', posts);
}

// Bulk update post statuses
export async function bulkUpdatePostStatus(
  postIds: string[],
  status: string
) {
  const updates = postIds.map(id => ({
    id,
    data: { status, updated_at: new Date().toISOString() }
  }));

  return batchUpdate('scheduled_posts', updates);
}
