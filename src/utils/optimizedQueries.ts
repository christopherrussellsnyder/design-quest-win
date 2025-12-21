import { supabase } from '@/integrations/supabase/client';

// Efficient scheduled posts fetching with pagination
export async function fetchScheduledPosts(
  userId: string,
  page = 1,
  limit = 20,
  status?: string
) {
  const offset = (page - 1) * limit;

  let query = supabase
    .from('scheduled_posts')
    .select('*', { count: 'exact' })
    .eq('user_id', userId)
    .order('scheduled_time', { ascending: false })
    .range(offset, offset + limit - 1);

  if (status) {
    query = query.eq('status', status);
  }

  const { data, error, count } = await query;

  return {
    data,
    error,
    totalPages: Math.ceil((count || 0) / limit),
    totalCount: count || 0
  };
}

// Efficient content library fetching with pagination
export async function fetchContentLibrary(
  userId: string,
  page = 1,
  limit = 20,
  contentType?: string
) {
  const offset = (page - 1) * limit;

  let query = supabase
    .from('content_library')
    .select('*', { count: 'exact' })
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);

  if (contentType) {
    query = query.eq('content_type', contentType);
  }

  const { data, error, count } = await query;

  return {
    data,
    error,
    totalPages: Math.ceil((count || 0) / limit),
    totalCount: count || 0
  };
}

// Efficient campaigns fetching
export async function fetchCampaigns(
  userId: string,
  status?: 'active' | 'paused' | 'draft'
) {
  let query = supabase
    .from('campaigns')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (status) {
    query = query.eq('status', status);
  }

  const { data, error } = await query;
  return { data, error };
}

// Efficient analytics summary
export async function fetchAnalyticsSummary(
  userId: string,
  dateFrom: string,
  dateTo: string
) {
  const { data, error } = await supabase
    .from('analytics')
    .select('impressions, reach, engagement, likes, comments, shares, clicks')
    .eq('user_id', userId)
    .gte('metric_date', dateFrom)
    .lte('metric_date', dateTo);

  if (error) return { data: null, error };

  // Aggregate in JavaScript
  const summary = data?.reduce(
    (acc, row) => ({
      totalImpressions: acc.totalImpressions + (row.impressions || 0),
      totalReach: acc.totalReach + (row.reach || 0),
      totalEngagement: acc.totalEngagement + (row.engagement || 0),
      totalLikes: acc.totalLikes + (row.likes || 0),
      totalComments: acc.totalComments + (row.comments || 0),
      totalShares: acc.totalShares + (row.shares || 0),
      totalClicks: acc.totalClicks + (row.clicks || 0)
    }),
    {
      totalImpressions: 0,
      totalReach: 0,
      totalEngagement: 0,
      totalLikes: 0,
      totalComments: 0,
      totalShares: 0,
      totalClicks: 0
    }
  );

  return { data: summary, error: null };
}

// Search content with text matching
export async function searchContent(userId: string, query: string) {
  const { data, error } = await supabase
    .from('content_library')
    .select('*')
    .eq('user_id', userId)
    .or(`title.ilike.%${query}%,generated_content.ilike.%${query}%`)
    .limit(50);

  return { data, error };
}

// Fetch media with filters
export async function fetchMediaLibrary(
  userId: string,
  page = 1,
  limit = 24,
  fileType?: string,
  folderId?: string
) {
  const offset = (page - 1) * limit;

  let query = supabase
    .from('media_library')
    .select('*', { count: 'exact' })
    .eq('user_id', userId)
    .order('uploaded_at', { ascending: false })
    .range(offset, offset + limit - 1);

  if (fileType) {
    query = query.eq('file_type', fileType);
  }

  if (folderId) {
    query = query.eq('folder_id', folderId);
  }

  const { data, error, count } = await query;

  return {
    data,
    error,
    totalPages: Math.ceil((count || 0) / limit),
    totalCount: count || 0
  };
}
