import { useState } from 'react';
import { X, Clock, Sparkles, Calendar, Facebook, Instagram, Twitter, Linkedin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';

interface QueueSettings {
  scheduleType: 'fixed_intervals' | 'specific_times' | 'best_times';
  intervalHours: number;
  startTime: string;
  endTime: string;
  specificTimes: string[];
  minTimeBetween: number;
  maxPostsPerDay: number;
  skipWeekends: boolean;
  randomizeTime: boolean;
  isActive: boolean;
}

interface QueueSettingsModalProps {
  platform: string;
  isOpen: boolean;
  onClose: () => void;
  settings: QueueSettings;
  onSave: (settings: QueueSettings) => void;
  postCount: number;
  nextPostTime?: string;
  lastPostedTime?: string;
}

const platformIcons: Record<string, React.ReactNode> = {
  facebook: <Facebook className="w-6 h-6 text-blue-500" />,
  instagram: <Instagram className="w-6 h-6 text-pink-500" />,
  twitter: <Twitter className="w-6 h-6 text-sky-500" />,
  linkedin: <Linkedin className="w-6 h-6 text-blue-600" />,
};

export function QueueSettingsModal({
  platform,
  isOpen,
  onClose,
  settings: initialSettings,
  onSave,
  postCount,
  nextPostTime,
  lastPostedTime,
}: QueueSettingsModalProps) {
  const [settings, setSettings] = useState<QueueSettings>(initialSettings);
  const [newTime, setNewTime] = useState('12:00');

  const handleAddTime = () => {
    if (newTime && !settings.specificTimes.includes(newTime)) {
      setSettings({
        ...settings,
        specificTimes: [...settings.specificTimes, newTime].sort(),
      });
    }
  };

  const handleRemoveTime = (time: string) => {
    setSettings({
      ...settings,
      specificTimes: settings.specificTimes.filter(t => t !== time),
    });
  };

  const handleSave = () => {
    onSave(settings);
    onClose();
  };

  const handleReset = () => {
    setSettings({
      scheduleType: 'best_times',
      intervalHours: 4,
      startTime: '09:00',
      endTime: '18:00',
      specificTimes: ['09:00', '14:00', '18:00'],
      minTimeBetween: 60,
      maxPostsPerDay: 5,
      skipWeekends: false,
      randomizeTime: true,
      isActive: true,
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            {platformIcons[platform]}
            <span className="capitalize">{platform} Queue Settings</span>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          {/* Posting Schedule */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-foreground">Posting Schedule</h3>
            
            <div className="space-y-3">
              {/* Fixed Intervals */}
              <label className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                settings.scheduleType === 'fixed_intervals' ? 'border-primary bg-primary/5' : 'border-border hover:bg-muted/50'
              }`}>
                <input
                  type="radio"
                  name="scheduleType"
                  checked={settings.scheduleType === 'fixed_intervals'}
                  onChange={() => setSettings({ ...settings, scheduleType: 'fixed_intervals' })}
                  className="mt-1"
                />
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-primary" />
                    <span className="font-medium text-foreground">Fixed Intervals</span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">Post every few hours within a time range</p>
                  
                  {settings.scheduleType === 'fixed_intervals' && (
                    <div className="mt-3 space-y-3">
                      <div>
                        <label className="text-xs text-muted-foreground">Post every {settings.intervalHours} hours</label>
                        <Slider
                          value={[settings.intervalHours]}
                          onValueChange={([value]) => setSettings({ ...settings, intervalHours: value })}
                          min={1}
                          max={24}
                          step={1}
                          className="mt-2"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="text-xs text-muted-foreground">From</label>
                          <Input
                            type="time"
                            value={settings.startTime}
                            onChange={(e) => setSettings({ ...settings, startTime: e.target.value })}
                          />
                        </div>
                        <div>
                          <label className="text-xs text-muted-foreground">To</label>
                          <Input
                            type="time"
                            value={settings.endTime}
                            onChange={(e) => setSettings({ ...settings, endTime: e.target.value })}
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </label>

              {/* Specific Times */}
              <label className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                settings.scheduleType === 'specific_times' ? 'border-primary bg-primary/5' : 'border-border hover:bg-muted/50'
              }`}>
                <input
                  type="radio"
                  name="scheduleType"
                  checked={settings.scheduleType === 'specific_times'}
                  onChange={() => setSettings({ ...settings, scheduleType: 'specific_times' })}
                  className="mt-1"
                />
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-primary" />
                    <span className="font-medium text-foreground">Specific Times</span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">Choose exact times to post each day</p>
                  
                  {settings.scheduleType === 'specific_times' && (
                    <div className="mt-3 space-y-2">
                      <div className="flex flex-wrap gap-2">
                        {settings.specificTimes.map(time => (
                          <span
                            key={time}
                            className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-primary/20 text-primary text-xs"
                          >
                            {time}
                            <button
                              onClick={() => handleRemoveTime(time)}
                              className="hover:text-destructive"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </span>
                        ))}
                      </div>
                      <div className="flex gap-2">
                        <Input
                          type="time"
                          value={newTime}
                          onChange={(e) => setNewTime(e.target.value)}
                          className="flex-1"
                        />
                        <Button variant="outline" size="sm" onClick={handleAddTime}>
                          Add
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </label>

              {/* Best Times */}
              <label className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                settings.scheduleType === 'best_times' ? 'border-primary bg-primary/5' : 'border-border hover:bg-muted/50'
              }`}>
                <input
                  type="radio"
                  name="scheduleType"
                  checked={settings.scheduleType === 'best_times'}
                  onChange={() => setSettings({ ...settings, scheduleType: 'best_times' })}
                  className="mt-1"
                />
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-primary" />
                    <span className="font-medium text-foreground">Best Times Only</span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-primary/20 text-primary uppercase font-bold">Recommended</span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">Auto-post at optimal engagement times</p>
                  
                  {settings.scheduleType === 'best_times' && (
                    <div className="mt-2 p-2 rounded bg-muted/50 text-xs text-muted-foreground">
                      Optimal times for {platform}: 9:00 AM, 1:00 PM, 5:00 PM
                    </div>
                  )}
                </div>
              </label>
            </div>
          </div>

          {/* Queue Rules */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-foreground">Queue Rules</h3>
            
            <div className="space-y-4">
              <div>
                <label className="text-sm text-muted-foreground">
                  Minimum time between posts: {settings.minTimeBetween} minutes
                </label>
                <Slider
                  value={[settings.minTimeBetween]}
                  onValueChange={([value]) => setSettings({ ...settings, minTimeBetween: value })}
                  min={30}
                  max={480}
                  step={30}
                  className="mt-2"
                />
              </div>

              <div>
                <label className="text-sm text-muted-foreground">
                  Maximum posts per day: {settings.maxPostsPerDay}
                </label>
                <Slider
                  value={[settings.maxPostsPerDay]}
                  onValueChange={([value]) => setSettings({ ...settings, maxPostsPerDay: value })}
                  min={1}
                  max={20}
                  step={1}
                  className="mt-2"
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <span className="text-sm text-foreground">Skip weekends</span>
                  <p className="text-xs text-muted-foreground">Don't post on Saturday/Sunday</p>
                </div>
                <Switch
                  checked={settings.skipWeekends}
                  onCheckedChange={(checked) => setSettings({ ...settings, skipWeekends: checked })}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <span className="text-sm text-foreground">Randomize timing</span>
                  <p className="text-xs text-muted-foreground">Add ±30min variance for natural posting</p>
                </div>
                <Switch
                  checked={settings.randomizeTime}
                  onCheckedChange={(checked) => setSettings({ ...settings, randomizeTime: checked })}
                />
              </div>
            </div>
          </div>

          {/* Queue Status */}
          <div className="space-y-3 p-4 rounded-lg bg-muted/50">
            <h3 className="text-sm font-semibold text-foreground">Queue Status</h3>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <span className="text-muted-foreground">Status:</span>
                <span className={`ml-2 font-medium ${settings.isActive ? 'text-emerald-400' : 'text-amber-400'}`}>
                  {settings.isActive ? 'Active' : 'Paused'}
                </span>
              </div>
              <div>
                <span className="text-muted-foreground">Posts in queue:</span>
                <span className="ml-2 font-medium text-foreground">{postCount}</span>
              </div>
              {nextPostTime && (
                <div>
                  <span className="text-muted-foreground">Next post:</span>
                  <span className="ml-2 font-medium text-foreground">{nextPostTime}</span>
                </div>
              )}
              {lastPostedTime && (
                <div>
                  <span className="text-muted-foreground">Last posted:</span>
                  <span className="ml-2 font-medium text-foreground">{lastPostedTime}</span>
                </div>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-between pt-4 border-t border-border">
            <Button variant="outline" onClick={handleReset}>
              Reset to Default
            </Button>
            <div className="flex gap-3">
              <Button variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button onClick={handleSave}>
                Save Settings
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
