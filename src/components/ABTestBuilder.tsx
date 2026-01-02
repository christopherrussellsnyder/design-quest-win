import { useState } from 'react';
import { Beaker, Plus, Trash2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';

interface Variant {
  name: string;
  content: string;
  variableValue: Record<string, unknown>;
}

interface ABTestBuilderProps {
  onComplete?: (test: unknown) => void;
}

export function ABTestBuilder({ onComplete }: ABTestBuilderProps) {
  const { user } = useAuth();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [testData, setTestData] = useState({
    name: '',
    description: '',
    hypothesis: '',
    variable: 'content',
    sampleSize: 30,
    confidenceLevel: 95,
    variants: [
      { name: 'Control', content: '', variableValue: {} },
      { name: 'Variation A', content: '', variableValue: {} }
    ] as Variant[]
  });
  
  const addVariant = () => {
    const letter = String.fromCharCode(65 + testData.variants.length - 1);
    setTestData({
      ...testData,
      variants: [
        ...testData.variants,
        { name: `Variation ${letter}`, content: '', variableValue: {} }
      ]
    });
  };
  
  const removeVariant = (index: number) => {
    if (testData.variants.length <= 2) {
      toast.error('Need at least 2 variants');
      return;
    }
    setTestData({
      ...testData,
      variants: testData.variants.filter((_, i) => i !== index)
    });
  };
  
  const updateVariant = (index: number, field: keyof Variant, value: string | Record<string, unknown>) => {
    const updated = [...testData.variants];
    updated[index] = { ...updated[index], [field]: value };
    setTestData({ ...testData, variants: updated });
  };
  
  const createTest = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('ab-testing', {
        body: {
          userId: user.id,
          action: 'create_test',
          testData
        }
      });
      
      if (error) throw error;
      
      toast.success('A/B test created successfully!');
      if (onComplete) onComplete(data.test);
    } catch (error) {
      toast.error('Failed to create test');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="space-y-6">
      {/* Progress Steps */}
      <div className="flex items-center justify-center gap-2">
        {[1, 2, 3].map(s => (
          <div key={s} className="flex items-center">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
              step >= s ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
            }`}>
              {s}
            </div>
            {s < 3 && <div className={`w-12 h-1 ${step > s ? 'bg-primary' : 'bg-muted'}`} />}
          </div>
        ))}
      </div>
      <div className="flex justify-center gap-8 text-sm">
        <span className={step >= 1 ? 'text-foreground' : 'text-muted-foreground'}>Setup</span>
        <span className={step >= 2 ? 'text-foreground' : 'text-muted-foreground'}>Variants</span>
        <span className={step >= 3 ? 'text-foreground' : 'text-muted-foreground'}>Review</span>
      </div>
      
      {step === 1 && (
        <Card>
          <CardHeader>
            <CardTitle>Test Setup</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Test Name *</Label>
              <Input 
                value={testData.name}
                onChange={(e) => setTestData({...testData, name: e.target.value})}
                placeholder="Emoji vs No Emoji"
              />
            </div>
            
            <div className="space-y-2">
              <Label>Hypothesis</Label>
              <Textarea 
                value={testData.hypothesis}
                onChange={(e) => setTestData({...testData, hypothesis: e.target.value})}
                placeholder="Posts with emojis will get higher engagement than posts without emojis"
                className="min-h-[100px]"
              />
            </div>
            
            <div className="space-y-2">
              <Label>Variable Being Tested</Label>
              <Select 
                value={testData.variable}
                onValueChange={(value) => setTestData({...testData, variable: value})}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="content">Content/Copy</SelectItem>
                  <SelectItem value="media">Media Type</SelectItem>
                  <SelectItem value="hashtags">Hashtags</SelectItem>
                  <SelectItem value="cta">Call-to-Action</SelectItem>
                  <SelectItem value="length">Content Length</SelectItem>
                  <SelectItem value="timing">Posting Time</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Minimum Sample Size</Label>
                <Input 
                  type="number" 
                  value={testData.sampleSize}
                  onChange={(e) => setTestData({...testData, sampleSize: parseInt(e.target.value) || 30})}
                  min="10"
                />
                <p className="text-xs text-muted-foreground">Posts needed per variant</p>
              </div>
              
              <div className="space-y-2">
                <Label>Confidence Level</Label>
                <Select 
                  value={testData.confidenceLevel.toString()}
                  onValueChange={(value) => setTestData({...testData, confidenceLevel: parseInt(value)})}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="90">90%</SelectItem>
                    <SelectItem value="95">95%</SelectItem>
                    <SelectItem value="99">99%</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <Button 
              onClick={() => setStep(2)}
              disabled={!testData.name}
              className="w-full"
            >
              Continue to Variants
            </Button>
          </CardContent>
        </Card>
      )}
      
      {step === 2 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold">Configure Variants</h2>
            <Button variant="outline" onClick={addVariant}>
              <Plus className="w-4 h-4 mr-2" />
              Add Variant
            </Button>
          </div>
          
          {testData.variants.map((variant, idx) => (
            <Card key={idx}>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                      idx === 0 ? 'bg-blue-600' : 'bg-primary'
                    } text-white`}>
                      {idx === 0 ? 'C' : String.fromCharCode(65 + idx - 1)}
                    </div>
                    <Input 
                      value={variant.name}
                      onChange={(e) => updateVariant(idx, 'name', e.target.value)}
                      className="w-40 font-semibold"
                    />
                    {idx === 0 && (
                      <span className="text-xs bg-blue-500/20 text-blue-400 px-2 py-1 rounded">CONTROL</span>
                    )}
                  </div>
                  {idx > 1 && (
                    <Button 
                      variant="ghost" 
                      size="icon"
                      onClick={() => removeVariant(idx)}
                      className="text-destructive"
                    >
                      <Trash2 className="w-5 h-5" />
                    </Button>
                  )}
                </div>
                
                <div className="space-y-2">
                  <Label>Content Template</Label>
                  <Textarea 
                    value={variant.content}
                    onChange={(e) => updateVariant(idx, 'content', e.target.value)}
                    className="min-h-[120px]"
                    placeholder={idx === 0 ? "Control version of your content..." : "Variation of your content..."}
                  />
                </div>
              </CardContent>
            </Card>
          ))}
          
          <div className="flex gap-3">
            <Button variant="outline" onClick={() => setStep(1)}>
              Back
            </Button>
            <Button onClick={() => setStep(3)} className="flex-1">
              Review Test
            </Button>
          </div>
        </div>
      )}
      
      {step === 3 && (
        <div className="space-y-6">
          <h2 className="text-xl font-bold">Review A/B Test</h2>
          
          <Card>
            <CardContent className="pt-6 space-y-4">
              <div>
                <p className="text-muted-foreground text-sm">Test Name</p>
                <p className="font-semibold">{testData.name}</p>
              </div>
              
              <div>
                <p className="text-muted-foreground text-sm">Hypothesis</p>
                <p>{testData.hypothesis || 'Not specified'}</p>
              </div>
              
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <p className="text-muted-foreground text-sm">Variable</p>
                  <p className="capitalize">{testData.variable}</p>
                </div>
                <div>
                  <p className="text-muted-foreground text-sm">Sample Size</p>
                  <p>{testData.sampleSize} posts/variant</p>
                </div>
                <div>
                  <p className="text-muted-foreground text-sm">Confidence</p>
                  <p>{testData.confidenceLevel}%</p>
                </div>
              </div>
              
              <div>
                <p className="text-muted-foreground text-sm mb-2">Variants ({testData.variants.length})</p>
                <div className="space-y-2">
                  {testData.variants.map((variant, idx) => (
                    <div key={idx} className="bg-muted p-3 rounded">
                      <p className="font-semibold mb-1">{variant.name}</p>
                      <p className="text-muted-foreground text-sm">
                        {variant.content.substring(0, 100)}{variant.content.length > 100 ? '...' : ''}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
          
          <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
            <p className="text-blue-400 text-sm">
              📊 This test will run until {testData.sampleSize * testData.variants.length} posts are published 
              ({testData.sampleSize} per variant) or statistical significance is reached at {testData.confidenceLevel}% confidence.
            </p>
          </div>
          
          <div className="flex gap-3">
            <Button variant="outline" onClick={() => setStep(2)}>
              Back
            </Button>
            <Button 
              onClick={createTest}
              disabled={loading}
              className="flex-1"
            >
              <Beaker className="w-5 h-5 mr-2" />
              {loading ? 'Creating...' : 'Create A/B Test'}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
