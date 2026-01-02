import { useState, useEffect } from 'react';
import { Beaker, Plus, Play, BarChart3 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { ABTestBuilder } from '@/components/ABTestBuilder';
import { ABTestResults } from '@/components/ABTestResults';

interface Variant {
  id: string;
  variant_name: string;
  is_control: boolean;
  posts_published: number;
  avg_engagement_rate: number;
}

interface ABTest {
  id: string;
  name: string;
  description: string;
  hypothesis: string;
  status: string;
  variable_being_tested: string;
  minimum_sample_size: number;
  confidence_level: number;
  start_date: string | null;
  end_date: string | null;
  created_at: string;
  ab_test_variants: Variant[];
}

export default function ABTestingPage() {
  const { user } = useAuth();
  const [tests, setTests] = useState<ABTest[]>([]);
  const [loading, setLoading] = useState(true);
  const [showBuilder, setShowBuilder] = useState(false);
  const [selectedTest, setSelectedTest] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      loadTests();
    }
  }, [user]);

  const loadTests = async () => {
    if (!user) return;
    try {
      const { data, error } = await supabase.functions.invoke('ab-testing', {
        body: { userId: user.id, action: 'get_tests' }
      });
      if (error) throw error;
      setTests(data?.tests || []);
    } catch (error) {
      console.error('Failed to load tests:', error);
      toast.error('Failed to load A/B tests');
    } finally {
      setLoading(false);
    }
  };

  const startTest = async (testId: string) => {
    try {
      const { error } = await supabase.functions.invoke('ab-testing', {
        body: { action: 'start_test', testId }
      });
      if (error) throw error;
      toast.success('Test started!');
      loadTests();
    } catch (error) {
      toast.error('Failed to start test');
    }
  };

  const handleTestCreated = () => {
    setShowBuilder(false);
    loadTests();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'running': return 'bg-green-500';
      case 'completed': return 'bg-blue-500';
      case 'paused': return 'bg-yellow-500';
      default: return 'bg-muted';
    }
  };

  if (selectedTest) {
    return (
      <div className="container mx-auto p-6 max-w-4xl">
        <Button variant="outline" onClick={() => setSelectedTest(null)} className="mb-6">
          ← Back to Tests
        </Button>
        <ABTestResults testId={selectedTest} />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">A/B Testing</h1>
          <p className="text-muted-foreground mt-1">
            Test content variations to find what works best
          </p>
        </div>
        <Dialog open={showBuilder} onOpenChange={setShowBuilder}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              New A/B Test
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create A/B Test</DialogTitle>
            </DialogHeader>
            <ABTestBuilder onComplete={handleTestCreated} />
          </DialogContent>
        </Dialog>
      </div>

      {loading ? (
        <div className="grid gap-4 md:grid-cols-2">
          {[1, 2, 3, 4].map(i => (
            <Card key={i} className="animate-pulse">
              <CardContent className="pt-6 h-40" />
            </Card>
          ))}
        </div>
      ) : tests.length === 0 ? (
        <Card>
          <CardContent className="pt-12 pb-12 text-center">
            <Beaker className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-xl font-semibold mb-2">No A/B Tests Yet</h3>
            <p className="text-muted-foreground mb-6">
              Create your first test to start optimizing your content
            </p>
            <Button onClick={() => setShowBuilder(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Create First Test
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {tests.map(test => {
            const totalPosts = test.ab_test_variants?.reduce((sum, v) => sum + v.posts_published, 0) || 0;
            const targetPosts = test.minimum_sample_size * (test.ab_test_variants?.length || 2);
            const progress = Math.min((totalPosts / targetPosts) * 100, 100);

            return (
              <Card key={test.id} className="hover:border-primary/50 transition-colors cursor-pointer" onClick={() => setSelectedTest(test.id)}>
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg">{test.name}</CardTitle>
                      <p className="text-muted-foreground text-sm mt-1">
                        Testing: {test.variable_being_tested}
                      </p>
                    </div>
                    <Badge variant="outline" className={`${getStatusColor(test.status)} bg-opacity-20`}>
                      {test.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between text-sm mb-3">
                    <span className="text-muted-foreground">
                      {test.ab_test_variants?.length || 0} variants
                    </span>
                    <span className="text-muted-foreground">
                      {totalPosts} / {targetPosts} posts
                    </span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-primary transition-all"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                  <div className="flex items-center gap-2 mt-4">
                    {test.status === 'draft' && (
                      <Button 
                        size="sm" 
                        onClick={(e) => { e.stopPropagation(); startTest(test.id); }}
                      >
                        <Play className="w-3 h-3 mr-1" />
                        Start
                      </Button>
                    )}
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={(e) => { e.stopPropagation(); setSelectedTest(test.id); }}
                    >
                      <BarChart3 className="w-3 h-3 mr-1" />
                      Results
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
