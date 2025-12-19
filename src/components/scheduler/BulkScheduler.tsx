import { useState } from 'react';
import { Upload, Plus, Trash2, Calendar, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface BulkPost {
  id: string;
  content: string;
  platform: string;
  date: string;
  time: string;
}

interface BulkSchedulerProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function BulkScheduler({ isOpen, onClose, onSuccess }: BulkSchedulerProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [posts, setPosts] = useState<BulkPost[]>([
    { id: '1', content: '', platform: 'all', date: '', time: '09:00' }
  ]);

  const addPost = () => {
    setPosts([
      ...posts,
      { id: crypto.randomUUID(), content: '', platform: 'all', date: '', time: '09:00' }
    ]);
  };

  const removePost = (id: string) => {
    if (posts.length > 1) {
      setPosts(posts.filter(p => p.id !== id));
    }
  };

  const updatePost = (id: string, field: keyof BulkPost, value: string) => {
    setPosts(posts.map(p => p.id === id ? { ...p, [field]: value } : p));
  };

  const handleCSVUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const csv = event.target?.result as string;
        const lines = csv.split('\n').filter(line => line.trim());
        const headers = lines[0].toLowerCase().split(',').map(h => h.trim());
        
        const newPosts: BulkPost[] = lines.slice(1).map((line, index) => {
          const values = line.split(',').map(v => v.trim().replace(/^"|"$/g, ''));
          const post: BulkPost = {
            id: crypto.randomUUID(),
            content: '',
            platform: 'all',
            date: '',
            time: '09:00'
          };
          
          headers.forEach((header, i) => {
            if (header === 'content' && values[i]) post.content = values[i];
            if (header === 'platform' && values[i]) post.platform = values[i];
            if (header === 'date' && values[i]) post.date = values[i];
            if (header === 'time' && values[i]) post.time = values[i];
          });
          
          return post;
        }).filter(p => p.content.trim());

        if (newPosts.length > 0) {
          setPosts(newPosts);
          toast({ title: `Imported ${newPosts.length} posts from CSV` });
        } else {
          toast({
            title: 'No valid posts found',
            description: 'CSV should have columns: content, platform, date, time',
            variant: 'destructive'
          });
        }
      } catch (error) {
        toast({
          title: 'Error parsing CSV',
          description: 'Please check the file format',
          variant: 'destructive'
        });
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const scheduleBulk = async () => {
    if (!user) return;

    const validPosts = posts.filter(p => p.content.trim() && p.date);
    if (validPosts.length === 0) {
      toast({
        title: 'No valid posts',
        description: 'Please add content and dates for your posts',
        variant: 'destructive'
      });
      return;
    }

    setLoading(true);
    try {
      const postsToInsert = validPosts.map(post => {
        const scheduledTime = new Date(`${post.date}T${post.time}:00`);
        const platforms = post.platform === 'all' 
          ? ['facebook', 'instagram', 'twitter'] 
          : [post.platform];

        return {
          user_id: user.id,
          title: post.content.slice(0, 50) + (post.content.length > 50 ? '...' : ''),
          content: post.content,
          platforms,
          scheduled_time: scheduledTime.toISOString(),
          post_type: 'text',
          status: 'scheduled',
        };
      });

      const { error } = await supabase
        .from('scheduled_posts')
        .insert(postsToInsert);

      if (error) throw error;

      toast({
        title: 'Posts scheduled',
        description: `${validPosts.length} posts have been scheduled`,
      });
      
      setPosts([{ id: '1', content: '', platform: 'all', date: '', time: '09:00' }]);
      onSuccess?.();
      onClose();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to schedule posts',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const downloadTemplate = () => {
    const csv = 'content,platform,date,time\n"Your post content here",all,2024-12-25,09:00\n"Another post",facebook,2024-12-26,14:00';
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'bulk-schedule-template.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Bulk Scheduler
          </DialogTitle>
        </DialogHeader>

        <div className="flex gap-2 mb-4">
          <label className="cursor-pointer">
            <input
              type="file"
              accept=".csv"
              onChange={handleCSVUpload}
              className="hidden"
            />
            <Button variant="outline" size="sm" asChild>
              <span>
                <Upload className="w-4 h-4 mr-2" />
                Upload CSV
              </span>
            </Button>
          </label>
          <Button variant="ghost" size="sm" onClick={downloadTemplate}>
            Download Template
          </Button>
        </div>

        <div className="flex-1 overflow-y-auto space-y-3 pr-2">
          {posts.map((post, index) => (
            <div
              key={post.id}
              className="grid grid-cols-12 gap-2 items-start p-3 bg-muted/50 rounded-lg"
            >
              <div className="col-span-12 sm:col-span-5">
                <Textarea
                  value={post.content}
                  onChange={e => updatePost(post.id, 'content', e.target.value)}
                  placeholder="Post content..."
                  rows={2}
                  className="resize-none"
                />
              </div>
              
              <div className="col-span-4 sm:col-span-2">
                <Select
                  value={post.platform}
                  onValueChange={value => updatePost(post.id, 'platform', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All</SelectItem>
                    <SelectItem value="facebook">Facebook</SelectItem>
                    <SelectItem value="instagram">Instagram</SelectItem>
                    <SelectItem value="twitter">Twitter</SelectItem>
                    <SelectItem value="linkedin">LinkedIn</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="col-span-4 sm:col-span-2">
                <Input
                  type="date"
                  value={post.date}
                  onChange={e => updatePost(post.id, 'date', e.target.value)}
                />
              </div>
              
              <div className="col-span-3 sm:col-span-2">
                <Input
                  type="time"
                  value={post.time}
                  onChange={e => updatePost(post.id, 'time', e.target.value)}
                />
              </div>
              
              <div className="col-span-1">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => removePost(post.id)}
                  disabled={posts.length === 1}
                  className="text-muted-foreground hover:text-destructive"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>

        <Button variant="outline" onClick={addPost} className="mt-2">
          <Plus className="w-4 h-4 mr-2" />
          Add Another Post
        </Button>

        <DialogFooter className="mt-4">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={scheduleBulk} disabled={loading}>
            <Send className="w-4 h-4 mr-2" />
            Schedule {posts.filter(p => p.content.trim() && p.date).length} Posts
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
