-- Add new columns to scheduled_posts for advanced scheduler features
ALTER TABLE public.scheduled_posts 
ADD COLUMN IF NOT EXISTS is_recurring boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS parent_recurring_id uuid REFERENCES scheduled_posts(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS approval_status text DEFAULT 'draft' CHECK (approval_status IN ('draft', 'needs_review', 'approved', 'rejected')),
ADD COLUMN IF NOT EXISTS reviewed_by uuid,
ADD COLUMN IF NOT EXISTS reviewed_at timestamp with time zone,
ADD COLUMN IF NOT EXISTS version integer DEFAULT 1,
ADD COLUMN IF NOT EXISTS queue_position integer,
ADD COLUMN IF NOT EXISTS best_time_suggestion timestamp with time zone;

-- Add index for queue management
CREATE INDEX IF NOT EXISTS idx_scheduled_posts_queue ON scheduled_posts(user_id, platforms, queue_position);
CREATE INDEX IF NOT EXISTS idx_scheduled_posts_approval ON scheduled_posts(user_id, approval_status);
CREATE INDEX IF NOT EXISTS idx_scheduled_posts_recurring ON scheduled_posts(parent_recurring_id);
CREATE INDEX IF NOT EXISTS idx_scheduled_posts_scheduled_time ON scheduled_posts(scheduled_time);