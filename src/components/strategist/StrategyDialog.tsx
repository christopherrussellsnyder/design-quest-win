import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Lightbulb } from 'lucide-react';

interface StrategyDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (platform: string, duration: number) => void;
}

const platforms = [
  { value: 'instagram', label: 'Instagram' },
  { value: 'tiktok', label: 'TikTok' },
  { value: 'linkedin', label: 'LinkedIn' },
  { value: 'twitter', label: 'Twitter/X' },
  { value: 'facebook', label: 'Facebook' },
  { value: 'multi-platform', label: 'Multi-Platform' },
];

const durations = [
  { value: 7, label: '7 days' },
  { value: 14, label: '14 days' },
];

export function StrategyDialog({ open, onOpenChange, onSubmit }: StrategyDialogProps) {
  const [platform, setPlatform] = useState('instagram');
  const [duration, setDuration] = useState(30);

  const handleSubmit = () => {
    onSubmit(platform, duration);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Lightbulb className="w-5 h-5 text-primary" />
            Generate Content Strategy
          </DialogTitle>
          <DialogDescription>
            AI will create a personalized content plan based on your business context.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="platform">Platform</Label>
            <Select value={platform} onValueChange={setPlatform}>
              <SelectTrigger id="platform">
                <SelectValue placeholder="Select platform" />
              </SelectTrigger>
              <SelectContent>
                {platforms.map((p) => (
                  <SelectItem key={p.value} value={p.value}>
                    {p.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="duration">Duration</Label>
            <Select 
              value={duration.toString()} 
              onValueChange={(v) => setDuration(parseInt(v))}
            >
              <SelectTrigger id="duration">
                <SelectValue placeholder="Select duration" />
              </SelectTrigger>
              <SelectContent>
                {durations.map((d) => (
                  <SelectItem key={d.value} value={d.value.toString()}>
                    {d.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit}>
            Generate Strategy
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
