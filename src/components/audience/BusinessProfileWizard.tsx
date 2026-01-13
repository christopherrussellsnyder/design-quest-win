import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Building2,
  Target,
  DollarSign,
  Users,
  Sparkles,
  ChevronRight,
  ChevronLeft,
  Check,
  Loader2,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

interface BusinessProfile {
  business_name: string;
  industry: string;
  niche: string;
  target_age_min: number;
  target_age_max: number;
  target_genders: string[];
  target_locations: string[];
  target_interests: string[];
  business_goals: string[];
  average_order_value: number;
  price_point: string;
  products_services: string;
  unique_selling_points: string[];
  competitor_names: string[];
}

interface BusinessProfileWizardProps {
  onComplete: (profile: BusinessProfile) => void;
  existingProfile?: BusinessProfile | null;
}

const industries = [
  "E-commerce",
  "SaaS",
  "Consulting",
  "Local Business",
  "Healthcare",
  "Education",
  "Finance",
  "Real Estate",
  "Hospitality",
  "Manufacturing",
  "Retail",
  "Media & Entertainment",
  "Non-profit",
  "Other",
];

const businessGoals = [
  "Brand Awareness",
  "Lead Generation",
  "Sales/Conversions",
  "Website Traffic",
  "App Installs",
  "Engagement",
  "Video Views",
  "Store Visits",
];

const interestCategories = [
  "Technology",
  "Business",
  "Fitness & Health",
  "Fashion",
  "Food & Dining",
  "Travel",
  "Entertainment",
  "Sports",
  "Arts & Culture",
  "Home & Garden",
  "Automotive",
  "Finance & Investing",
];

const locations = [
  "United States",
  "United Kingdom",
  "Canada",
  "Australia",
  "Germany",
  "France",
  "Spain",
  "Italy",
  "Netherlands",
  "Global",
];

export default function BusinessProfileWizard({ onComplete, existingProfile }: BusinessProfileWizardProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [step, setStep] = useState(1);
  const [saving, setSaving] = useState(false);
  const totalSteps = 4;

  const [profile, setProfile] = useState<BusinessProfile>({
    business_name: "",
    industry: "",
    niche: "",
    target_age_min: 25,
    target_age_max: 54,
    target_genders: ["all"],
    target_locations: [],
    target_interests: [],
    business_goals: [],
    average_order_value: 50,
    price_point: "medium",
    products_services: "",
    unique_selling_points: [],
    competitor_names: [],
  });

  const [uspInput, setUspInput] = useState("");
  const [competitorInput, setCompetitorInput] = useState("");

  useEffect(() => {
    if (existingProfile) {
      setProfile(existingProfile);
    }
  }, [existingProfile]);

  const updateProfile = (key: keyof BusinessProfile, value: any) => {
    setProfile(prev => ({ ...prev, [key]: value }));
  };

  const toggleArrayItem = (key: keyof BusinessProfile, item: string) => {
    const currentArray = profile[key] as string[];
    const newArray = currentArray.includes(item)
      ? currentArray.filter(i => i !== item)
      : [...currentArray, item];
    updateProfile(key, newArray);
  };

  const addToArray = (key: keyof BusinessProfile, item: string, clearInput: () => void) => {
    if (item.trim()) {
      const currentArray = profile[key] as string[];
      if (!currentArray.includes(item.trim())) {
        updateProfile(key, [...currentArray, item.trim()]);
      }
      clearInput();
    }
  };

  const removeFromArray = (key: keyof BusinessProfile, item: string) => {
    const currentArray = profile[key] as string[];
    updateProfile(key, currentArray.filter(i => i !== item));
  };

  const handleSave = async () => {
    if (!user) return;

    setSaving(true);
    try {
      const { error } = await supabase
        .from('business_profiles')
        .upsert({
          user_id: user.id,
          ...profile,
        }, {
          onConflict: 'user_id'
        });

      if (error) throw error;

      toast({
        title: "Profile saved",
        description: "Your business profile has been saved successfully",
      });

      onComplete(profile);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to save profile",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 rounded-lg bg-primary/10">
                <Building2 className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 className="text-lg font-semibold">Business Information</h3>
                <p className="text-sm text-muted-foreground">Tell us about your business</p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <Label>Business Name</Label>
                <Input
                  value={profile.business_name}
                  onChange={(e) => updateProfile('business_name', e.target.value)}
                  placeholder="Your company name"
                  className="mt-1.5"
                />
              </div>

              <div>
                <Label>Industry</Label>
                <Select value={profile.industry} onValueChange={(v) => updateProfile('industry', v)}>
                  <SelectTrigger className="mt-1.5">
                    <SelectValue placeholder="Select your industry" />
                  </SelectTrigger>
                  <SelectContent>
                    {industries.map(ind => (
                      <SelectItem key={ind} value={ind}>{ind}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Niche/Specialty</Label>
                <Input
                  value={profile.niche}
                  onChange={(e) => updateProfile('niche', e.target.value)}
                  placeholder="e.g., Sustainable fashion, B2B SaaS for HR"
                  className="mt-1.5"
                />
              </div>

              <div>
                <Label>Products/Services Description</Label>
                <Textarea
                  value={profile.products_services}
                  onChange={(e) => updateProfile('products_services', e.target.value)}
                  placeholder="Describe what you sell or the services you offer..."
                  className="mt-1.5"
                  rows={3}
                />
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 rounded-lg bg-primary/10">
                <Users className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 className="text-lg font-semibold">Target Demographics</h3>
                <p className="text-sm text-muted-foreground">Define your ideal customer</p>
              </div>
            </div>

            <div className="space-y-6">
              <div>
                <Label>Target Age Range</Label>
                <div className="mt-4 px-2">
                  <Slider
                    value={[profile.target_age_min, profile.target_age_max]}
                    onValueChange={([min, max]) => {
                      updateProfile('target_age_min', min);
                      updateProfile('target_age_max', max);
                    }}
                    min={13}
                    max={65}
                    step={1}
                  />
                  <div className="flex justify-between mt-2 text-sm text-muted-foreground">
                    <span>{profile.target_age_min} years</span>
                    <span>{profile.target_age_max}+ years</span>
                  </div>
                </div>
              </div>

              <div>
                <Label>Target Gender</Label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {["all", "male", "female", "other"].map(gender => (
                    <Button
                      key={gender}
                      type="button"
                      variant={profile.target_genders.includes(gender) ? "default" : "outline"}
                      size="sm"
                      onClick={() => {
                        if (gender === "all") {
                          updateProfile('target_genders', ["all"]);
                        } else {
                          const filtered = profile.target_genders.filter(g => g !== "all");
                          if (filtered.includes(gender)) {
                            updateProfile('target_genders', filtered.filter(g => g !== gender));
                          } else {
                            updateProfile('target_genders', [...filtered, gender]);
                          }
                        }
                      }}
                    >
                      {gender.charAt(0).toUpperCase() + gender.slice(1)}
                    </Button>
                  ))}
                </div>
              </div>

              <div>
                <Label>Target Locations</Label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {locations.map(loc => (
                    <Button
                      key={loc}
                      type="button"
                      variant={profile.target_locations.includes(loc) ? "default" : "outline"}
                      size="sm"
                      onClick={() => toggleArrayItem('target_locations', loc)}
                    >
                      {loc}
                    </Button>
                  ))}
                </div>
              </div>

              <div>
                <Label>Target Interests</Label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {interestCategories.map(interest => (
                    <Button
                      key={interest}
                      type="button"
                      variant={profile.target_interests.includes(interest) ? "default" : "outline"}
                      size="sm"
                      onClick={() => toggleArrayItem('target_interests', interest)}
                    >
                      {interest}
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 rounded-lg bg-primary/10">
                <Target className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 className="text-lg font-semibold">Business Goals</h3>
                <p className="text-sm text-muted-foreground">What do you want to achieve?</p>
              </div>
            </div>

            <div className="space-y-6">
              <div>
                <Label>Primary Goals (select all that apply)</Label>
                <div className="grid grid-cols-2 gap-2 mt-2">
                  {businessGoals.map(goal => (
                    <Button
                      key={goal}
                      type="button"
                      variant={profile.business_goals.includes(goal) ? "default" : "outline"}
                      size="sm"
                      className="justify-start"
                      onClick={() => toggleArrayItem('business_goals', goal)}
                    >
                      {profile.business_goals.includes(goal) && <Check className="h-4 w-4 mr-2" />}
                      {goal}
                    </Button>
                  ))}
                </div>
              </div>

              <div>
                <Label>Unique Selling Points</Label>
                <div className="flex gap-2 mt-1.5">
                  <Input
                    value={uspInput}
                    onChange={(e) => setUspInput(e.target.value)}
                    placeholder="What makes you unique?"
                    onKeyPress={(e) => e.key === 'Enter' && addToArray('unique_selling_points', uspInput, () => setUspInput(''))}
                  />
                  <Button
                    type="button"
                    onClick={() => addToArray('unique_selling_points', uspInput, () => setUspInput(''))}
                  >
                    Add
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2 mt-2">
                  {profile.unique_selling_points.map((usp, i) => (
                    <Badge key={i} variant="secondary" className="gap-1">
                      {usp}
                      <button onClick={() => removeFromArray('unique_selling_points', usp)} className="ml-1 hover:text-destructive">×</button>
                    </Badge>
                  ))}
                </div>
              </div>

              <div>
                <Label>Competitor Names (optional)</Label>
                <div className="flex gap-2 mt-1.5">
                  <Input
                    value={competitorInput}
                    onChange={(e) => setCompetitorInput(e.target.value)}
                    placeholder="Add competitor names"
                    onKeyPress={(e) => e.key === 'Enter' && addToArray('competitor_names', competitorInput, () => setCompetitorInput(''))}
                  />
                  <Button
                    type="button"
                    onClick={() => addToArray('competitor_names', competitorInput, () => setCompetitorInput(''))}
                  >
                    Add
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2 mt-2">
                  {profile.competitor_names.map((comp, i) => (
                    <Badge key={i} variant="secondary" className="gap-1">
                      {comp}
                      <button onClick={() => removeFromArray('competitor_names', comp)} className="ml-1 hover:text-destructive">×</button>
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 rounded-lg bg-primary/10">
                <DollarSign className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 className="text-lg font-semibold">Pricing & Budget</h3>
                <p className="text-sm text-muted-foreground">Help us understand your market position</p>
              </div>
            </div>

            <div className="space-y-6">
              <div>
                <Label>Average Order Value / Price Point ($)</Label>
                <Input
                  type="number"
                  value={profile.average_order_value}
                  onChange={(e) => updateProfile('average_order_value', parseFloat(e.target.value) || 0)}
                  placeholder="50"
                  className="mt-1.5"
                />
              </div>

              <div>
                <Label>Price Point Category</Label>
                <Select value={profile.price_point} onValueChange={(v) => updateProfile('price_point', v)}>
                  <SelectTrigger className="mt-1.5">
                    <SelectValue placeholder="Select price point" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Budget-Friendly (Under $50)</SelectItem>
                    <SelectItem value="medium">Mid-Range ($50-$200)</SelectItem>
                    <SelectItem value="high">Premium ($200-$500)</SelectItem>
                    <SelectItem value="luxury">Luxury ($500+)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Card className="bg-muted/50">
                <CardContent className="pt-4">
                  <h4 className="font-medium mb-3">Profile Summary</h4>
                  <div className="space-y-2 text-sm">
                    <p><span className="text-muted-foreground">Business:</span> {profile.business_name || 'Not set'}</p>
                    <p><span className="text-muted-foreground">Industry:</span> {profile.industry || 'Not set'}</p>
                    <p><span className="text-muted-foreground">Target Age:</span> {profile.target_age_min}-{profile.target_age_max}</p>
                    <p><span className="text-muted-foreground">Goals:</span> {profile.business_goals.join(', ') || 'Not set'}</p>
                    <p><span className="text-muted-foreground">Locations:</span> {profile.target_locations.join(', ') || 'Global'}</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        );
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              Business Profile Wizard
            </CardTitle>
            <CardDescription>Complete your profile to get AI-powered targeting recommendations</CardDescription>
          </div>
          <div className="flex items-center gap-2">
            {Array.from({ length: totalSteps }).map((_, i) => (
              <div
                key={i}
                className={`h-2 w-8 rounded-full transition-colors ${
                  i + 1 <= step ? 'bg-primary' : 'bg-muted'
                }`}
              />
            ))}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {renderStep()}

        <div className="flex justify-between mt-8 pt-6 border-t">
          <Button
            variant="outline"
            onClick={() => setStep(s => s - 1)}
            disabled={step === 1}
          >
            <ChevronLeft className="h-4 w-4 mr-2" />
            Back
          </Button>

          {step < totalSteps ? (
            <Button onClick={() => setStep(s => s + 1)}>
              Next
              <ChevronRight className="h-4 w-4 ml-2" />
            </Button>
          ) : (
            <Button onClick={handleSave} disabled={saving}>
              {saving ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Check className="h-4 w-4 mr-2" />
                  Save & Generate Recommendations
                </>
              )}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}