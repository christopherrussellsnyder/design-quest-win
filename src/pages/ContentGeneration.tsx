import { useMemo, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { useNavigate, useSearchParams } from 'react-router-dom';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  ArrowLeft,
  Clapperboard,
  Loader2,
  Sparkles,
  Wand2,
  Users,
  Film,
  AlertTriangle,
  Check,
  ImageIcon,
} from 'lucide-react';
import { useAdActors, useAdScripts, useVideoAds } from '@/hooks/useVideoAds';
import { VIDEO_ASPECT_RATIOS, VIDEO_HOOK_ANGLES } from '@/config/video.config';
import type { AdScriptVariant } from '@/config/video.config';
import { VideoAdCard } from '@/components/video-ads/VideoAdCard';
import { StoryboardPreview } from '@/components/video-ads/StoryboardPreview';
import { ImageStudio } from '@/components/content-generation/ImageStudio';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function ContentGeneration() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  // Present when the user arrived from a specific strategy day. The whole
  // production layer keys off this: no linked day, no invented visuals.
  const strategyPostId = searchParams.get('strategyPostId') ?? undefined;
  const strategyTheme = searchParams.get('theme') ?? undefined;


  const { data: catalog, isLoading: loadingActors, error: actorsError } = useAdActors();
  const { variants, generate, isGenerating } = useAdScripts();
  const { videos, isLoading: loadingVideos, urls, getPlaybackUrl, createVideo, isCreating, deleteVideo } =
    useVideoAds();

  // Script step
  const [angle, setAngle] = useState<string>('auto');
  const [duration, setDuration] = useState<string>('30');
  const [promoDetail, setPromoDetail] = useState('');
  const [promoCode, setPromoCode] = useState('');
  const [brief, setBrief] = useState('');

  // Selection step
  const [selectedScript, setSelectedScript] = useState<AdScriptVariant | null>(null);
  const [editedScript, setEditedScript] = useState('');
  const [avatarId, setAvatarId] = useState('');
  const [voiceId, setVoiceId] = useState('');
  const [aspectRatio, setAspectRatio] = useState('9:16');

  const actors = catalog?.actors ?? [];
  const voices = catalog?.voices ?? [];
  const quota = catalog?.quota;

  const selectedActor = useMemo(
    () => actors.find((a) => a.avatar_id === avatarId),
    [actors, avatarId],
  );

  const quotaLabel = useMemo(() => {
    if (!quota) return null;
    if (quota.limit === null) return 'Unlimited renders';
    const remaining = quota.remaining ?? 0;
    return quota.is_trial
      ? `${remaining} of ${quota.limit} free trial videos left`
      : `${remaining} of ${quota.limit} videos left this month`;
  }, [quota]);

  const outOfCredits = quota?.limit !== null && (quota?.remaining ?? 1) <= 0;

  const handlePickScript = (variant: AdScriptVariant) => {
    setSelectedScript(variant);
    setEditedScript(variant.script);
  };

  // The storyboard is scene-by-scene locked to the exact words. Once the script
  // is edited by hand we drop back to a clean presenter read rather than
  // rendering visuals over the wrong beats.
  const planIsStale = !!selectedScript && editedScript.trim() !== selectedScript.script.trim();
  const activePlan = selectedScript?.production_plan;

  const handleRender = () => {
    if (!editedScript.trim() || !avatarId || !voiceId) return;
    createVideo({
      script: editedScript.trim(),
      hook: selectedScript?.hook,
      title: selectedScript?.title,
      angle: selectedScript?.angle,
      avatarId,
      avatarName: selectedActor?.name,
      avatarPreviewUrl: selectedActor?.preview_image_url,
      voiceId,
      aspectRatio,
      strategyPostId,
      productionPlan: planIsStale ? undefined : activePlan,
    });
  };


  const providerDown =
    (actorsError as { code?: string })?.code === 'PROVIDER_NOT_CONFIGURED' ||
    (catalog as { code?: string })?.code === 'PROVIDER_NOT_CONFIGURED';

  const canRender = !!editedScript.trim() && !!avatarId && !!voiceId && !isCreating && !outOfCredits;

  return (
    <>
      <Helmet>
        <title>Content Generation | Korex Intelligence</title>
        <meta
          name="description"
          content="Generate production-quality UGC video ads with AI actors and on-brand campaign images — written and rendered from your business context."
        />
      </Helmet>

      <div className="min-h-screen bg-background text-foreground">
        {/* Header */}
        <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-40 px-4 sm:px-6 lg:px-8 py-4 flex items-center gap-3">
          <Button aria-label="Go back"
            variant="ghost"
            size="icon"
            onClick={() => navigate('/ai-strategist')}
            className="text-muted-foreground hover:text-foreground hover:bg-card"
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div className="flex items-center gap-2">
            <Clapperboard className="w-4 h-4 text-primary" />
            <h1 className="text-xl font-semibold tracking-tight">Content Generation</h1>
          </div>
          {quotaLabel && (
            <Badge variant="outline" className="ml-2 border-border text-muted-foreground text-[11px]">
              {quotaLabel}
            </Badge>
          )}
        </header>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
          <Tabs defaultValue="video" className="space-y-6">
            <TabsList className="bg-background border border-card">
              <TabsTrigger value="video" className="text-xs gap-1.5">
                <Clapperboard className="w-3.5 h-3.5" />
                Video ads
              </TabsTrigger>
              <TabsTrigger value="image" className="text-xs gap-1.5">
                <ImageIcon className="w-3.5 h-3.5" />
                Images
              </TabsTrigger>
            </TabsList>

            <TabsContent value="video" className="space-y-6 mt-0">
          {providerDown && (
            <Card className="bg-background border-amber-500/30">
              <CardContent className="p-4 flex items-start gap-3">
                <AlertTriangle className="w-4 h-4 text-amber-500 mt-0.5 shrink-0" />
                <div className="text-sm">
                  <p className="font-medium">Video rendering isn't switched on yet</p>
                  <p className="text-muted-foreground text-xs mt-1">
                    You can still write and save ad scripts. Rendering will activate as soon as the
                    video provider is connected.
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {strategyPostId && (
            <Card className="bg-background border-primary/30">
              <CardContent className="p-4 flex items-start gap-3">
                <Film className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                <div className="text-sm">
                  <p className="font-medium">Linked to a strategy day</p>
                  <p className="text-muted-foreground text-xs mt-1">
                    {strategyTheme
                      ? `Scripts and visuals will be built around “${strategyTheme}”.`
                      : 'Scripts and visuals will be built around that day’s post — same promise, same angle.'}
                  </p>
                </div>
              </CardContent>
            </Card>
          )}


          {/* ---------------- Step 1: Script ---------------- */}
          <section className="space-y-3">
            <div className="flex items-center gap-2">
              <span className="w-5 h-5 rounded border border-border text-[11px] flex items-center justify-center text-muted-foreground">
                1
              </span>
              <h2 className="text-sm font-semibold">Write the hooks</h2>
            </div>

            <Card className="bg-background border-card">
              <CardContent className="p-4 space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <Label className="text-xs text-muted-foreground">Hook angle</Label>
                    <Select value={angle} onValueChange={setAngle}>
                      <SelectTrigger className="bg-muted border-border">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {VIDEO_HOOK_ANGLES.map((a) => (
                          <SelectItem key={a.value} value={a.value}>
                            {a.label} — <span className="text-muted-foreground">{a.hint}</span>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-xs text-muted-foreground">Length</Label>
                    <Select value={duration} onValueChange={setDuration}>
                      <SelectTrigger className="bg-muted border-border">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="15">15 seconds</SelectItem>
                        <SelectItem value="30">30 seconds</SelectItem>
                        <SelectItem value="45">45 seconds</SelectItem>
                        <SelectItem value="60">60 seconds</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-xs text-muted-foreground">Offer (optional)</Label>
                    <Input
                      value={promoDetail}
                      onChange={(e) => setPromoDetail(e.target.value)}
                      placeholder="15% off your first month"
                      className="bg-muted border-border"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-xs text-muted-foreground">Promo code (optional)</Label>
                    <Input
                      value={promoCode}
                      onChange={(e) => setPromoCode(e.target.value)}
                      placeholder="KOREX"
                      className="bg-muted border-border"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs text-muted-foreground">Extra direction (optional)</Label>
                  <Textarea
                    value={brief}
                    onChange={(e) => setBrief(e.target.value)}
                    placeholder="Anything the script must mention — a specific objection to handle, a proof point, a launch date."
                    rows={2}
                    maxLength={4000}
                    className="bg-muted border-border resize-none"
                  />
                </div>

                <Button
                  onClick={() =>
                    generate({
                      angle,
                      durationSeconds: Number(duration),
                      count: 3,
                      promoDetail: promoDetail || undefined,
                      promoCode: promoCode || undefined,
                      customBrief: brief || undefined,
                      strategyPostId,

                    })
                  }
                  disabled={isGenerating}
                  className="w-full sm:w-auto"
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Writing hooks...
                    </>
                  ) : (
                    <>
                      <Wand2 className="w-4 h-4 mr-2" />
                      Generate scripts
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>

            {variants.length > 0 && (
              <div className="grid gap-3 md:grid-cols-3">
                {variants.map((v, i) => {
                  const active = selectedScript?.script === v.script;
                  return (
                    <button
                      key={`${v.angle}-${i}`}
                      type="button"
                      onClick={() => handlePickScript(v)}
                      className={`text-left rounded-md border p-3 transition-colors ${
                        active
                          ? 'border-primary bg-primary/5'
                          : 'border-card bg-background hover:border-border'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <Badge
                          variant="outline"
                          className="border-border text-[10px] capitalize"
                        >
                          {v.angle}
                        </Badge>
                        {active && <Check className="w-3.5 h-3.5 text-primary" />}
                      </div>
                      <p className="text-sm font-medium leading-snug mb-1.5">{v.hook}</p>
                      <p className="text-xs text-muted-foreground line-clamp-4">{v.script}</p>
                      {v.why_it_works && (
                        <p className="text-[11px] text-[hsl(var(--text-tertiary))] mt-2 italic">{v.why_it_works}</p>
                      )}
                    </button>
                  );
                })}
              </div>
            )}
          </section>

          {/* ---------------- Step 2: Cast ---------------- */}
          <section className="space-y-3">
            <div className="flex items-center gap-2">
              <span className="w-5 h-5 rounded border border-border text-[11px] flex items-center justify-center text-muted-foreground">
                2
              </span>
              <h2 className="text-sm font-semibold">Cast the actor</h2>
            </div>

            <Card className="bg-background border-card">
              <CardContent className="p-4 space-y-4">
                {loadingActors ? (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground py-6 justify-center">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Loading the actor library...
                  </div>
                ) : actors.length === 0 ? (
                  <div className="text-sm text-muted-foreground py-6 text-center flex flex-col items-center gap-2">
                    <Users className="w-5 h-5" />
                    No actors available yet.
                  </div>
                ) : (
                  <div className="grid grid-cols-3 sm:grid-cols-5 lg:grid-cols-8 gap-2 max-h-[280px] overflow-y-auto pr-1">
                    {actors.map((a) => (
                      <button
                        key={a.avatar_id}
                        type="button"
                        onClick={() => setAvatarId(a.avatar_id)}
                        title={a.name}
                        className={`rounded-md overflow-hidden border transition-colors ${
                          avatarId === a.avatar_id
                            ? 'border-primary'
                            : 'border-card hover:border-border'
                        }`}
                      >
                        <div className="aspect-[3/4] bg-muted">
                          {a.preview_image_url ? (
                            <img
                              src={a.preview_image_url}
                              alt={`AI actor ${a.name}`}
                              loading="lazy"
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-[hsl(var(--text-tertiary))]">
                              <Users className="w-4 h-4" />
                            </div>
                          )}
                        </div>
                        <p className="text-[10px] px-1 py-1 truncate text-muted-foreground">{a.name}</p>
                      </button>
                    ))}
                  </div>
                )}

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <Label className="text-xs text-muted-foreground">Voice</Label>
                    <Select value={voiceId} onValueChange={setVoiceId}>
                      <SelectTrigger className="bg-muted border-border">
                        <SelectValue placeholder="Choose a voice" />
                      </SelectTrigger>
                      <SelectContent className="max-h-[280px]">
                        {voices.map((v) => (
                          <SelectItem key={v.voice_id} value={v.voice_id}>
                            {v.name}
                            {v.gender ? ` · ${v.gender}` : ''}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-xs text-muted-foreground">Format</Label>
                    <Select value={aspectRatio} onValueChange={setAspectRatio}>
                      <SelectTrigger className="bg-muted border-border">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {VIDEO_ASPECT_RATIOS.map((r) => (
                          <SelectItem key={r.value} value={r.value}>
                            {r.label} — <span className="text-muted-foreground">{r.hint}</span>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>
          </section>

          {/* ---------------- Step 3: Render ---------------- */}
          <section className="space-y-3">
            <div className="flex items-center gap-2">
              <span className="w-5 h-5 rounded border border-border text-[11px] flex items-center justify-center text-muted-foreground">
                3
              </span>
              <h2 className="text-sm font-semibold">Review and render</h2>
            </div>

            <Card className="bg-background border-card">
              <CardContent className="p-4 space-y-3">
                <div className="space-y-1.5">
                  <Label className="text-xs text-muted-foreground">
                    Spoken script — edit freely before rendering
                  </Label>
                  <Textarea
                    value={editedScript}
                    onChange={(e) => setEditedScript(e.target.value)}
                    placeholder="Pick a script above, or write your own here."
                    rows={6}
                    maxLength={3000}
                    className="bg-muted border-border resize-none text-sm leading-relaxed"
                  />
                  <p className="text-[11px] text-[hsl(var(--text-tertiary))]">
                    {editedScript.trim() ? editedScript.trim().split(/\s+/).length : 0} words · about{' '}
                    {Math.round((editedScript.trim().split(/\s+/).filter(Boolean).length || 0) / 2.4)}s
                    spoken
                  </p>
                </div>

                {outOfCredits && (
                  <p className="text-xs text-amber-500 flex items-center gap-1.5">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    You've used your video allowance. Upgrade for more renders.
                  </p>
                )}

                <Button onClick={handleRender} disabled={!canRender} className="w-full sm:w-auto">
                  {isCreating ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Starting render...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 mr-2" />
                      Render video ad
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </section>

          {/* ---------------- Library ---------------- */}
          <section className="space-y-3">
            <div className="flex items-center gap-2">
              <Film className="w-4 h-4 text-muted-foreground" />
              <h2 className="text-sm font-semibold">Your video ads</h2>
              {videos.length > 0 && (
                <span className="text-xs text-[hsl(var(--text-tertiary))]">{videos.length}</span>
              )}
            </div>

            {loadingVideos ? (
              <div className="flex items-center gap-2 text-sm text-muted-foreground py-8 justify-center">
                <Loader2 className="w-4 h-4 animate-spin" />
                Loading your library...
              </div>
            ) : videos.length === 0 ? (
              <Card className="bg-background border-card">
                <CardContent className="p-8 text-center text-sm text-muted-foreground">
                  No video ads yet. Generate a script, cast an actor, and render your first one.
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-3 grid-cols-2 md:grid-cols-4">
                {videos.map((v) => (
                  <VideoAdCard
                    key={v.id}
                    video={v}
                    url={urls[v.id]}
                    onResolveUrl={getPlaybackUrl}
                    onDelete={deleteVideo}
                  />
                ))}
              </div>
            )}
          </section>
            </TabsContent>

            <TabsContent value="image" className="mt-0">
              <ImageStudio />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </>
  );
}
