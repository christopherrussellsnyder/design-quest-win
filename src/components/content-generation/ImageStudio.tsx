import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
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
import { Download, ImageIcon, Loader2, Sparkles } from 'lucide-react';

const PLATFORMS = [
  { value: 'instagram', label: 'Instagram feed', hint: 'Square 1:1' },
  { value: 'tiktok', label: 'TikTok / Reels / Stories', hint: 'Vertical 9:16' },
  { value: 'linkedin', label: 'LinkedIn', hint: 'Landscape' },
  { value: 'youtube', label: 'YouTube thumbnail', hint: 'Landscape' },
];

const STYLES = [
  { value: '', label: 'Auto — match my brand' },
  { value: 'Photorealistic editorial photography, natural lighting, shallow depth of field', label: 'Photoreal editorial' },
  { value: 'Clean studio product shot on seamless backdrop, soft key light', label: 'Studio product' },
  { value: 'Bold high-contrast graphic poster, flat shapes, strong typography space', label: 'Bold graphic poster' },
  { value: 'Candid smartphone UGC look, slightly imperfect framing, authentic', label: 'Candid UGC' },
  { value: 'Dark cinematic tech aesthetic, moody rim lighting, subtle grain', label: 'Dark cinematic' },
];

const ENGINES = [
  { value: 'openai/gpt-image-2', label: 'Flagship — maximum fidelity', hint: 'Best detail and typography' },
  { value: 'google/gemini-3-pro-image', label: 'Pro alternative', hint: 'Different look, strong realism' },
  { value: 'openai/gpt-image-1-mini', label: 'Draft — fast concepts', hint: 'Quick exploration' },
];

interface GeneratedImage {
  url: string;
  prompt: string;
  size: string;
}

export function ImageStudio() {
  const [concept, setConcept] = useState('');
  const [textOverlay, setTextOverlay] = useState('');
  const [platform, setPlatform] = useState('instagram');
  const [style, setStyle] = useState('');
  const [palette, setPalette] = useState('');
  const [engine, setEngine] = useState('openai/gpt-image-2');
  const [isGenerating, setIsGenerating] = useState(false);
  const [images, setImages] = useState<GeneratedImage[]>([]);

  const handleGenerate = async () => {
    if (!concept.trim()) return;
    setIsGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-post-visual', {
        body: {
          visualDescription: concept.trim(),
          textOverlay: textOverlay.trim() || undefined,
          colorPalette: palette.trim() || undefined,
          stylePrompt: style || undefined,
          platform,
          model: engine,
          quality: engine === 'openai/gpt-image-1-mini' ? 'medium' : 'high',
          enhance: true,
        },
      });

      const payload = data as { url?: string; prompt?: string; size?: string; error?: string; code?: string } | null;

      if (error || payload?.error) {
        const message = payload?.error ?? error?.message ?? 'Image generation failed.';
        const code = payload?.code;
        if (code === 'AI_CREDITS_DEPLETED' || code === 'UPGRADE_REQUIRED') {
          window.dispatchEvent(
            new CustomEvent('korex:upgrade-required', { detail: { reason: code, message } }),
          );
          return;
        }
        toast({ title: 'Image generation failed', description: message, variant: 'destructive' });
        return;
      }

      if (!payload?.url) {
        toast({ title: 'No image returned', description: 'Please try again.', variant: 'destructive' });
        return;
      }

      setImages((prev) => [
        { url: payload.url as string, prompt: payload.prompt ?? concept, size: payload.size ?? '' },
        ...prev,
      ]);
      toast({ title: 'Image ready', description: 'Saved to your media library.' });
    } catch (err) {
      toast({
        title: 'Image generation failed',
        description: (err as Error).message,
        variant: 'destructive',
      });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card className="bg-[#0C0D0F] border-[#1E1F23]">
        <CardContent className="p-4 space-y-4">
          <div className="space-y-1.5">
            <Label className="text-xs text-[#A0A0A8]">What should the image show?</Label>
            <Textarea
              value={concept}
              onChange={(e) => setConcept(e.target.value)}
              placeholder="A founder at a desk reviewing a campaign dashboard at night, warm desk lamp, city window behind."
              rows={3}
              maxLength={1200}
              className="bg-[#111214] border-[#2A2B2E] resize-none"
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label className="text-xs text-[#A0A0A8]">Placement</Label>
              <Select value={platform} onValueChange={setPlatform}>
                <SelectTrigger className="bg-[#111214] border-[#2A2B2E]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PLATFORMS.map((p) => (
                    <SelectItem key={p.value} value={p.value}>
                      {p.label} — <span className="text-muted-foreground">{p.hint}</span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs text-[#A0A0A8]">Look</Label>
              <Select value={style || 'auto'} onValueChange={(v) => setStyle(v === 'auto' ? '' : v)}>
                <SelectTrigger className="bg-[#111214] border-[#2A2B2E]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {STYLES.map((s) => (
                    <SelectItem key={s.label} value={s.value || 'auto'}>
                      {s.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs text-[#A0A0A8]">Engine</Label>
              <Select value={engine} onValueChange={setEngine}>
                <SelectTrigger className="bg-[#111214] border-[#2A2B2E]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {ENGINES.map((e) => (
                    <SelectItem key={e.value} value={e.value}>
                      {e.label} — <span className="text-muted-foreground">{e.hint}</span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs text-[#A0A0A8]">Text overlay (optional)</Label>
              <Input
                value={textOverlay}
                onChange={(e) => setTextOverlay(e.target.value)}
                placeholder="Stop guessing. Start scaling."
                maxLength={120}
                className="bg-[#111214] border-[#2A2B2E]"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs text-[#A0A0A8]">Color palette (optional)</Label>
              <Input
                value={palette}
                onChange={(e) => setPalette(e.target.value)}
                placeholder="Deep black, crimson red accents"
                maxLength={120}
                className="bg-[#111214] border-[#2A2B2E]"
              />
            </div>
          </div>

          <Button
            onClick={handleGenerate}
            disabled={isGenerating || !concept.trim()}
            className="w-full sm:w-auto"
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Rendering at full quality...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 mr-2" />
                Generate image
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      <section className="space-y-3">
        <div className="flex items-center gap-2">
          <ImageIcon className="w-4 h-4 text-[#A0A0A8]" />
          <h2 className="text-sm font-semibold">This session</h2>
          {images.length > 0 && <span className="text-xs text-[#6B6C72]">{images.length}</span>}
        </div>

        {images.length === 0 ? (
          <Card className="bg-[#0C0D0F] border-[#1E1F23]">
            <CardContent className="p-8 text-center text-sm text-[#A0A0A8]">
              No images yet. Every render is art-directed automatically before it hits the image
              engine, then produced at maximum quality — expect 30-60 seconds. Describe the shot above — everything you generate is also saved to your
              media library.
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-3 grid-cols-2 md:grid-cols-4">
            {images.map((img) => (
              <Card key={img.url} className="bg-[#0C0D0F] border-[#1E1F23] overflow-hidden">
                <img
                  src={img.url}
                  alt={img.prompt.slice(0, 120)}
                  loading="lazy"
                  className="w-full aspect-square object-cover"
                />
                <CardContent className="p-2 flex items-center justify-between gap-2">
                  <span className="text-[10px] text-[#6B6C72]">{img.size}</span>
                  <Button asChild variant="ghost" size="sm" className="h-7 px-2">
                    <a href={img.url} target="_blank" rel="noreferrer" download>
                      <Download className="w-3.5 h-3.5" />
                    </a>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
