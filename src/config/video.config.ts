// Video ad generation limits — must stay in sync with
// supabase/functions/_shared/video-quota.ts
export const VIDEO_AD_LIMITS = {
  starter: 2, // lifetime trial
  pro: 10, // per month
  agency: 35, // per month
} as const;

export const VIDEO_ASPECT_RATIOS = [
  { value: '9:16', label: 'Vertical 9:16', hint: 'TikTok, Reels, Shorts' },
  { value: '1:1', label: 'Square 1:1', hint: 'Feed placements' },
  { value: '16:9', label: 'Landscape 16:9', hint: 'YouTube, in-stream' },
] as const;

export const VIDEO_HOOK_ANGLES = [
  {
    value: 'auto',
    label: 'Test all three',
    hint: 'Rotate intelligence, time and money hooks',
  },
  {
    value: 'intelligence',
    label: 'Intelligence',
    hint: 'How the thinking beats guessing',
  },
  { value: 'time', label: 'Time saved', hint: 'Hours given back every week' },
  { value: 'money', label: 'Money saved', hint: 'Versus agencies and freelancers' },
] as const;

export type VideoAdStatus = 'queued' | 'processing' | 'completed' | 'failed';

export interface VideoAdRecord {
  id: string;
  title: string | null;
  hook: string | null;
  script: string;
  angle: string | null;
  avatar_id: string;
  avatar_name: string | null;
  avatar_preview_url: string | null;
  voice_id: string | null;
  aspect_ratio: string;
  status: VideoAdStatus;
  storage_path: string | null;
  thumbnail_url: string | null;
  duration_seconds: number | null;
  error_message: string | null;
  created_at: string;
}

export interface AdScriptVariant {
  angle: string;
  title: string;
  hook: string;
  script: string;
  estimated_seconds?: number;
  why_it_works?: string;
}

export interface AdActor {
  avatar_id: string;
  name: string;
  preview_image_url?: string;
  preview_video_url?: string;
  gender?: string;
}

export interface AdVoice {
  voice_id: string;
  name: string;
  language?: string;
  gender?: string;
}

export interface VideoQuota {
  tier: 'starter' | 'pro' | 'agency' | 'founder';
  limit: number | null;
  used: number;
  remaining: number | null;
  is_trial: boolean;
}
