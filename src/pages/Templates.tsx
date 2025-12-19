import { useState, useEffect } from 'react';
import { Plus, Copy, Edit2, Trash2, FileText, Sparkles, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { EmptyState } from '@/components/ui/empty-state';

interface Template {
  id: string;
  name: string;
  category: string;
  content: string;
  variables: string[];
  platform: string | null;
  created_at: string;
}

const categories = ['Marketing', 'Educational', 'Promotional', 'Engagement', 'Announcement', 'Other'];

export default function Templates() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<Template | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  
  const [formData, setFormData] = useState({
    name: '',
    category: 'Marketing',
    content: '',
    platform: 'all',
  });

  useEffect(() => {
    if (user) {
      loadTemplates();
    }
  }, [user]);

  const loadTemplates = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('content_library')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_template', true)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const formattedTemplates: Template[] = (data || []).map(item => ({
        id: item.id,
        name: item.title || 'Untitled Template',
        category: item.category || 'Other',
        content: item.generated_content || item.content_text || '',
        variables: extractVariables(item.generated_content || item.content_text || ''),
        platform: item.platform,
        created_at: item.created_at || new Date().toISOString(),
      }));

      setTemplates(formattedTemplates);
    } catch (error) {
      console.error('Error loading templates:', error);
    } finally {
      setLoading(false);
    }
  };

  const extractVariables = (content: string): string[] => {
    const matches = content.match(/\{\{([^}]+)\}\}/g) || [];
    return matches.map(m => m.replace(/\{\{|\}\}/g, '').trim());
  };

  const handleSave = async () => {
    if (!user || !formData.name.trim() || !formData.content.trim()) {
      toast({
        title: 'Error',
        description: 'Please fill in all required fields',
        variant: 'destructive',
      });
      return;
    }

    try {
      if (editingTemplate) {
        const { error } = await supabase
          .from('content_library')
          .update({
            title: formData.name,
            category: formData.category,
            generated_content: formData.content,
            platform: formData.platform === 'all' ? null : formData.platform,
            updated_at: new Date().toISOString(),
          })
          .eq('id', editingTemplate.id);

        if (error) throw error;
        toast({ title: 'Template updated' });
      } else {
        const { error } = await supabase
          .from('content_library')
          .insert({
            user_id: user.id,
            title: formData.name,
            category: formData.category,
            generated_content: formData.content,
            content_type: 'template',
            platform: formData.platform === 'all' ? null : formData.platform,
            is_template: true,
          });

        if (error) throw error;
        toast({ title: 'Template created' });
      }

      setShowCreateModal(false);
      setEditingTemplate(null);
      setFormData({ name: '', category: 'Marketing', content: '', platform: 'all' });
      loadTemplates();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to save template',
        variant: 'destructive',
      });
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase
        .from('content_library')
        .delete()
        .eq('id', id);

      if (error) throw error;
      toast({ title: 'Template deleted' });
      loadTemplates();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to delete template',
        variant: 'destructive',
      });
    }
  };

  const handleCopy = (content: string) => {
    navigator.clipboard.writeText(content);
    toast({ title: 'Copied to clipboard' });
  };

  const handleEdit = (template: Template) => {
    setEditingTemplate(template);
    setFormData({
      name: template.name,
      category: template.category,
      content: template.content,
      platform: template.platform || 'all',
    });
    setShowCreateModal(true);
  };

  const filteredTemplates = templates.filter(t => 
    selectedCategory === 'all' || t.category === selectedCategory
  );

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <Link to="/dashboard" className="text-muted-foreground hover:text-foreground">
                <ArrowLeft className="w-5 h-5" />
              </Link>
              <h1 className="text-2xl font-bold text-foreground">Content Templates</h1>
            </div>
            <p className="text-muted-foreground">Create reusable templates with variables</p>
          </div>
          <Button onClick={() => {
            setEditingTemplate(null);
            setFormData({ name: '', category: 'Marketing', content: '', platform: 'all' });
            setShowCreateModal(true);
          }}>
            <Plus className="w-4 h-4 mr-2" />
            New Template
          </Button>
        </div>

        {/* Filters */}
        <div className="flex gap-2 mb-6 flex-wrap">
          <Button
            variant={selectedCategory === 'all' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSelectedCategory('all')}
          >
            All
          </Button>
          {categories.map(cat => (
            <Button
              key={cat}
              variant={selectedCategory === cat ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedCategory(cat)}
            >
              {cat}
            </Button>
          ))}
        </div>

        {/* Templates Grid */}
        {loading ? (
          <div className="text-center py-12 text-muted-foreground">Loading templates...</div>
        ) : filteredTemplates.length === 0 ? (
          <EmptyState
            icon={FileText}
            title="No templates yet"
            description="Create your first template to save time on repetitive content"
            action={() => setShowCreateModal(true)}
            actionLabel="Create Template"
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredTemplates.map(template => (
              <div
                key={template.id}
                className="bg-card border border-border rounded-lg p-5 hover:border-primary/50 transition-colors"
              >
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <Badge variant="secondary" className="mb-2">{template.category}</Badge>
                    <h3 className="font-semibold text-foreground">{template.name}</h3>
                  </div>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="icon" onClick={() => handleCopy(template.content)}>
                      <Copy className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => handleEdit(template)}>
                      <Edit2 className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => handleDelete(template.id)}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
                
                <p className="text-sm text-muted-foreground mb-3 line-clamp-3">
                  {template.content}
                </p>
                
                {template.variables.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {template.variables.map(v => (
                      <Badge key={v} variant="outline" className="text-xs">
                        {`{{${v}}}`}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Create/Edit Modal */}
        <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>
                {editingTemplate ? 'Edit Template' : 'Create Template'}
              </DialogTitle>
            </DialogHeader>
            
            <div className="space-y-4 py-4">
              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">
                  Template Name *
                </label>
                <Input
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., Product Launch"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-foreground mb-2 block">Category</label>
                  <Select
                    value={formData.category}
                    onValueChange={value => setFormData({ ...formData, category: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map(cat => (
                        <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-foreground mb-2 block">Platform</label>
                  <Select
                    value={formData.platform}
                    onValueChange={value => setFormData({ ...formData, platform: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Platforms</SelectItem>
                      <SelectItem value="facebook">Facebook</SelectItem>
                      <SelectItem value="instagram">Instagram</SelectItem>
                      <SelectItem value="twitter">Twitter</SelectItem>
                      <SelectItem value="linkedin">LinkedIn</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">
                  Content *
                </label>
                <Textarea
                  value={formData.content}
                  onChange={e => setFormData({ ...formData, content: e.target.value })}
                  placeholder="Use {{variable_name}} for dynamic content..."
                  rows={6}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  <Sparkles className="w-3 h-3 inline mr-1" />
                  Tip: Use {"{{variable}}"} syntax for replaceable fields
                </p>
              </div>
            </div>
            
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowCreateModal(false)}>
                Cancel
              </Button>
              <Button onClick={handleSave}>
                {editingTemplate ? 'Save Changes' : 'Create Template'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
