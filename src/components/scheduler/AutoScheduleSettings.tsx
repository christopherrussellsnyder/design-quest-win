import { useState, useEffect } from 'react';
import { Clock, Settings, Zap } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

interface AutoSchedulePreferences {
  enabled: boolean;
  posts_per_day: number;
  posts_per_week: number;
  avoid_weekends: boolean;
  avoid_nights: boolean;
  min_hours_between_posts: number;
  auto_fill_queue: boolean;
}

export function AutoScheduleSettings() {
  const { user } = useAuth();
  const [preferences, setPreferences] = useState<AutoSchedulePreferences | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  useEffect(() => {
    if (user) {
      loadPreferences();
    }
  }, [user]);
  
  const loadPreferences = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('auto-optimize-timing', {
        body: { userId: user.id, action: 'get_preferences' }
      });
      if (error) throw error;
      setPreferences(data.preferences);
    } catch (error) {
      console.error('Failed to load preferences:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const savePreferences = async () => {
    if (!user || !preferences) return;
    setSaving(true);
    try {
      const { error } = await supabase.functions.invoke('auto-optimize-timing', {
        body: { 
          userId: user.id, 
          action: 'update_preferences',
          preferences: preferences
        }
      });
      if (error) throw error;
      toast.success('Auto-schedule settings saved!');
    } catch (error) {
      console.error('Failed to save preferences:', error);
      toast.error('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };
  
  const updatePref = <K extends keyof AutoSchedulePreferences>(key: K, value: AutoSchedulePreferences[K]) => {
    setPreferences(prev => prev ? { ...prev, [key]: value } : null);
  };
  
  if (loading) {
    return (
      <div className="bg-card border border-border rounded-lg p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-muted rounded w-1/3"></div>
          <div className="h-10 bg-muted rounded"></div>
        </div>
      </div>
    );
  }
  
  if (!preferences) return null;
  
  return (
    <div className="bg-card border border-border rounded-lg p-6 space-y-6">
      <div className="flex items-center gap-3">
        <Zap className="w-5 h-5 text-primary" />
        <div>
          <h3 className="font-semibold text-foreground">Auto-Schedule Settings</h3>
          <p className="text-sm text-muted-foreground">Let Korex optimize your posting schedule</p>
        </div>
      </div>
      
      <div className="space-y-4">
        {/* Enable toggle */}
        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium text-foreground">Enable Auto-Scheduling</p>
            <p className="text-sm text-muted-foreground">Automatically optimize post timing</p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={preferences.enabled}
              onChange={(e) => updatePref('enabled', e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-muted peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
          </label>
        </div>
        
        {/* Posts per day/week */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Posts per Day</label>
            <input
              type="number"
              min="1"
              max="10"
              value={preferences.posts_per_day}
              onChange={(e) => updatePref('posts_per_day', parseInt(e.target.value) || 1)}
              className="w-full bg-muted text-foreground px-4 py-2 rounded border border-border"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Posts per Week</label>
            <input
              type="number"
              min="1"
              max="50"
              value={preferences.posts_per_week}
              onChange={(e) => updatePref('posts_per_week', parseInt(e.target.value) || 7)}
              className="w-full bg-muted text-foreground px-4 py-2 rounded border border-border"
            />
          </div>
        </div>
        
        {/* Min hours between posts */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">Minimum Hours Between Posts</label>
          <input
            type="number"
            min="1"
            max="24"
            value={preferences.min_hours_between_posts}
            onChange={(e) => updatePref('min_hours_between_posts', parseInt(e.target.value) || 4)}
            className="w-full bg-muted text-foreground px-4 py-2 rounded border border-border"
          />
          <p className="text-xs text-muted-foreground mt-1">Prevents posts from being too close together</p>
        </div>
        
        {/* Checkboxes */}
        <div className="space-y-3">
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={preferences.avoid_weekends}
              onChange={(e) => updatePref('avoid_weekends', e.target.checked)}
              className="w-4 h-4 rounded border-border"
            />
            <div>
              <p className="text-sm font-medium text-foreground">Avoid Weekends</p>
              <p className="text-xs text-muted-foreground">Don't schedule posts on Saturday or Sunday</p>
            </div>
          </label>
          
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={preferences.avoid_nights}
              onChange={(e) => updatePref('avoid_nights', e.target.checked)}
              className="w-4 h-4 rounded border-border"
            />
            <div>
              <p className="text-sm font-medium text-foreground">Avoid Late Nights</p>
              <p className="text-xs text-muted-foreground">Don't schedule between 10 PM - 6 AM</p>
            </div>
          </label>
          
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={preferences.auto_fill_queue}
              onChange={(e) => updatePref('auto_fill_queue', e.target.checked)}
              className="w-4 h-4 rounded border-border"
            />
            <div>
              <p className="text-sm font-medium text-foreground">Auto-Fill Queue</p>
              <p className="text-xs text-muted-foreground">Automatically schedule drafts to optimal times</p>
            </div>
          </label>
        </div>
        
        {/* Save button */}
        <button 
          onClick={savePreferences}
          disabled={saving}
          className="w-full py-2 bg-primary text-primary-foreground rounded hover:bg-primary/90 disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {saving ? (
            <>
              <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin"></div>
              Saving...
            </>
          ) : (
            <>
              <Settings className="w-4 h-4" />
              Save Settings
            </>
          )}
        </button>
      </div>
    </div>
  );
}
