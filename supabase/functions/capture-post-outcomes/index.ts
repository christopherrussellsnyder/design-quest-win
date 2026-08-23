import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.57.4';
import { corsHeaders } from 'npm:@supabase/supabase-js@2/cors';

// Captures real-world outcomes for strategy posts whose scheduled date is 48h-14d old.
// - Users with an active Meta connection: pulls real ad performance (source='meta_api')
// - Everyone else: creates a pending row so the UI can ask "how did this actually perform?"
Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
  const supabase = createClient(Deno.env.get('SUPABASE_URL')!, serviceKey);

  // Callable by the nightly cron (service role / cron context) or a signed-in user.
  const authHeader = req.headers.get('Authorization') ?? '';
  const isCron = req.headers.get('Lovable-Context') === 'cron' || authHeader === `Bearer ${serviceKey}`;
  if (!isCron) {
    const token = authHeader.replace('Bearer ', '');
    const { data: userData } = await supabase.auth.getUser(token);
    if (!userData?.user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
  }


  try {
    const now = Date.now();
    const windowEnd = new Date(now - 48 * 3600 * 1000).toISOString().slice(0, 10);
    const windowStart = new Date(now - 14 * 24 * 3600 * 1000).toISOString().slice(0, 10);

    const { data: posts, error: postsErr } = await supabase
      .from('strategy_posts')
      .select('id, post_date, predicted_engagement, critic_score, hook_technique, post_type, content_strategies!inner(user_id)')
      .gte('post_date', windowStart)
      .lte('post_date', windowEnd)
      .limit(500);

    if (postsErr) throw postsErr;
    const candidates = (posts ?? []) as any[];
    if (!candidates.length) {
      return json({ ok: true, created: 0, measured: 0, message: 'no candidate posts' });
    }

    const { data: existing } = await supabase
      .from('outcome_tracking')
      .select('strategy_post_id, actual_engagement')
      .in('strategy_post_id', candidates.map((p) => p.id));
    const existingMap = new Map((existing ?? []).map((r: any) => [r.strategy_post_id, r]));

    // Group by user
    const byUser = new Map<string, any[]>();
    for (const p of candidates) {
      const uid = p.content_strategies?.user_id;
      if (!uid) continue;
      if (!byUser.has(uid)) byUser.set(uid, []);
      byUser.get(uid)!.push(p);
    }

    let created = 0;
    let measured = 0;

    for (const [userId, userPosts] of byUser) {
      const { data: profile } = await supabase
        .from('business_profiles')
        .select('niche, industry')
        .eq('user_id', userId)
        .maybeSingle();
      const niche = (profile as any)?.niche || (profile as any)?.industry || 'general';

      const { data: adAccount } = await supabase
        .from('connected_ad_accounts')
        .select('id, status')
        .eq('user_id', userId)
        .eq('platform', 'meta')
        .eq('status', 'active')
        .maybeSingle();

      let snapshots: any[] = [];
      if (adAccount) {
        const { data: snaps } = await supabase
          .from('ad_performance_snapshots')
          .select('date_start, impressions, reach, clicks, ctr, purchases')
          .eq('user_id', userId)
          .gte('date_start', windowStart)
          .lte('date_start', windowEnd);
        snapshots = snaps ?? [];
      }

      for (const p of userPosts) {
        const prior = existingMap.get(p.id);
        if (prior && prior.actual_engagement != null) continue;

        const dayRows = snapshots.filter((s) => s.date_start === p.post_date);
        let actuals: Record<string, any> = {};
        let source = 'manual_entry';

        if (dayRows.length) {
          const impressions = sum(dayRows, 'impressions');
          const clicks = sum(dayRows, 'clicks');
          const reach = sum(dayRows, 'reach');
          const purchases = sum(dayRows, 'purchases');
          actuals = {
            actual_engagement: impressions > 0 ? round2((clicks / impressions) * 100) : 0,
            actual_reach: reach || null,
            actual_conversions: purchases || null,
            measured_at: new Date().toISOString(),
          };
          source = 'meta_api';
          measured++;
        }

        const row = {
          user_id: userId,
          strategy_post_id: p.id,
          predicted_engagement: p.predicted_engagement,
          predicted_score: p.critic_score,
          niche,
          pattern_hook_technique: p.hook_technique || null,
          pattern_post_type: p.post_type || null,
          source,
          ...actuals,
        };

        const { error: upErr } = await supabase
          .from('outcome_tracking')
          .upsert(row, { onConflict: 'strategy_post_id' });
        if (upErr) console.error('outcome upsert failed', p.id, upErr.message);
        else if (!prior) created++;
      }
    }

    console.log(`capture-post-outcomes: created=${created} measured=${measured}`);
    return json({ ok: true, created, measured });
  } catch (e) {
    console.error('capture-post-outcomes error', e);
    return json({ error: (e as Error).message }, 500);
  }
});

function sum(rows: any[], key: string) {
  return rows.reduce((a, r) => a + (Number(r[key]) || 0), 0);
}
function round2(n: number) {
  return Math.round(n * 100) / 100;
}
function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}
