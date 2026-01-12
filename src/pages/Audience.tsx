import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Users,
  Plus,
  Search,
  Filter,
  Grid3X3,
  List,
  Target,
  TrendingUp,
  Eye,
  Heart,
  UserPlus,
  Settings,
  Copy,
  Trash2,
  MoreVertical,
  ChevronRight,
  Sparkles,
  Zap,
  Globe,
  MapPin,
  Calendar,
  Activity,
  Loader2,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

// Mock data for audience segments
const mockSegments = [
  {
    id: "1",
    name: "Young Urban Professionals",
    type: "demographic",
    description: "Professionals in major cities aged 25-35",
    size: 45230,
    engagementRate: 5.2,
    growth: 5.2,
    platforms: ["facebook", "instagram", "linkedin"],
    color: "#8B5CF6",
    icon: "👔",
    criteria: {
      age: { min: 25, max: 35 },
      locations: ["New York", "Los Angeles", "Chicago"],
      gender: ["all"],
    },
    isActive: true,
    createdAt: "2024-11-15",
  },
  {
    id: "2",
    name: "Fitness Enthusiasts",
    type: "interest",
    description: "Active lifestyle and fitness focused audience",
    size: 28900,
    engagementRate: 6.8,
    growth: 8.5,
    platforms: ["instagram", "facebook"],
    color: "#10B981",
    icon: "💪",
    criteria: {
      interests: ["Fitness", "Health", "Wellness", "Nutrition"],
    },
    isActive: true,
    createdAt: "2024-11-10",
  },
  {
    id: "3",
    name: "High Engagers",
    type: "behavioral",
    description: "Most engaged followers in top 25%",
    size: 12500,
    engagementRate: 8.5,
    growth: 12.3,
    platforms: ["all"],
    color: "#F59E0B",
    icon: "⭐",
    criteria: {
      engagement: "top_25_percent",
      timeframe: "last_30_days",
    },
    isActive: true,
    createdAt: "2024-11-01",
  },
  {
    id: "4",
    name: "Local Customers",
    type: "demographic",
    description: "Local area customers within 50 miles",
    size: 8750,
    engagementRate: 4.8,
    growth: 2.1,
    platforms: ["facebook"],
    color: "#3B82F6",
    icon: "📍",
    criteria: {
      locations: ["Bradenton, FL"],
      radius: 50,
      age: { min: 25, max: 55 },
    },
    isActive: true,
    createdAt: "2024-10-20",
  },
  {
    id: "5",
    name: "Tech Early Adopters",
    type: "interest",
    description: "Technology enthusiasts and early adopters",
    size: 35100,
    engagementRate: 6.2,
    growth: 15.8,
    platforms: ["twitter", "linkedin"],
    color: "#EC4899",
    icon: "🚀",
    criteria: {
      interests: ["Technology", "Gadgets", "Innovation", "AI"],
    },
    isActive: true,
    createdAt: "2024-10-15",
  },
  {
    id: "6",
    name: "Inactive Users",
    type: "behavioral",
    description: "Users to re-engage (60+ days inactive)",
    size: 15400,
    engagementRate: 0.5,
    growth: -3.2,
    platforms: ["all"],
    color: "#EF4444",
    icon: "😴",
    criteria: {
      engagement: "inactive",
      timeframe: "60_days",
    },
    isActive: false,
    createdAt: "2024-09-01",
  },
];

const segmentTypes = [
  {
    id: "demographic",
    name: "Demographic Segment",
    icon: Users,
    description: "Target by age, gender, location, language",
    color: "violet",
  },
  {
    id: "interest",
    name: "Interest-Based Segment",
    icon: Heart,
    description: "Target by interests, hobbies, preferences",
    color: "pink",
  },
  {
    id: "behavioral",
    name: "Behavioral Segment",
    icon: Activity,
    description: "Target by actions, engagement patterns",
    color: "orange",
  },
  {
    id: "custom",
    name: "Custom Segment",
    icon: Settings,
    description: "Build with custom rules and combinations",
    color: "blue",
  },
  {
    id: "lookalike",
    name: "Lookalike Audience",
    icon: UserPlus,
    description: "Find similar users to existing audience",
    color: "green",
  },
];

const quickTemplates = [
  { name: "Highly Engaged Young Adults", icon: "🔥" },
  { name: "Local Business Customers", icon: "🏪" },
  { name: "Inactive Users to Re-engage", icon: "🔄" },
  { name: "VIP Customers", icon: "👑" },
];

const interestCategories = [
  { name: "Technology", subcategories: ["AI/ML", "Gadgets", "Software", "Gaming"] },
  { name: "Fitness & Health", subcategories: ["Gym", "Yoga", "Nutrition", "Running"] },
  { name: "Business", subcategories: ["Entrepreneurship", "Marketing", "Finance", "Leadership"] },
  { name: "Lifestyle", subcategories: ["Travel", "Food", "Fashion", "Home Decor"] },
  { name: "Entertainment", subcategories: ["Movies", "Music", "Sports", "Art"] },
];

interface Segment {
  id: string;
  name: string;
  type: string;
  description: string;
  size: number;
  engagementRate: number;
  growth: number;
  platforms: string[];
  color: string;
  icon: string;
  criteria: any;
  isActive: boolean;
  createdAt: string;
}

export default function Audience() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [view, setView] = useState<"grid" | "list">("grid");
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createStep, setCreateStep] = useState(1);
  const [selectedType, setSelectedType] = useState("");
  const [segments, setSegments] = useState<Segment[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  // Form state
  const [segmentName, setSegmentName] = useState("");
  const [segmentDescription, setSegmentDescription] = useState("");
  const [segmentColor, setSegmentColor] = useState("#8B5CF6");
  const [ageRange, setAgeRange] = useState([18, 65]);
  const [selectedGenders, setSelectedGenders] = useState<string[]>(["all"]);
  const [selectedLocations, setSelectedLocations] = useState<string[]>([]);
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [selectedBehaviors, setSelectedBehaviors] = useState<string[]>([]);
  const [similarityLevel, setSimilarityLevel] = useState([5]);

  useEffect(() => {
    if (user) {
      loadSegments();
    }
  }, [user]);

  const loadSegments = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('audiences')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const formattedSegments: Segment[] = (data || []).map(item => ({
        id: item.id,
        name: item.name,
        type: item.behaviors?.length ? 'behavioral' : item.interests?.length ? 'interest' : 'demographic',
        description: item.description || '',
        size: Math.floor(Math.random() * 50000) + 5000,
        engagementRate: Math.round((Math.random() * 5 + 2) * 10) / 10,
        growth: Math.round((Math.random() * 10 - 2) * 10) / 10,
        platforms: item.platforms || ['all'],
        color: '#8B5CF6',
        icon: item.behaviors?.length ? '⭐' : item.interests?.length ? '💡' : '👤',
        criteria: {
          age: { min: item.age_min || 18, max: item.age_max || 65 },
          locations: item.countries || [],
          gender: item.gender || ['all'],
          interests: item.interests || [],
          behaviors: item.behaviors || [],
        },
        isActive: true,
        createdAt: item.created_at || new Date().toISOString(),
      }));

      setSegments(formattedSegments);
    } catch (error) {
      console.error('Error loading segments:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredSegments = segments.filter((segment) => {
    const matchesSearch = segment.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      segment.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = typeFilter === "all" || segment.type === typeFilter;
    return matchesSearch && matchesType;
  });

  const totalAudienceSize = segments.reduce((sum, s) => sum + s.size, 0);
  const avgEngagement = segments.length > 0 
    ? (segments.reduce((sum, s) => sum + s.engagementRate, 0) / segments.length).toFixed(1)
    : '0.0';
  const activeSegments = segments.filter((s) => s.isActive).length;

  const formatNumber = (num: number) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + "M";
    if (num >= 1000) return (num / 1000).toFixed(1) + "K";
    return num.toString();
  };

  const resetForm = () => {
    setCreateStep(1);
    setSelectedType("");
    setSegmentName("");
    setSegmentDescription("");
    setSegmentColor("#8B5CF6");
    setAgeRange([18, 65]);
    setSelectedGenders(["all"]);
    setSelectedLocations([]);
    setSelectedInterests([]);
    setSelectedBehaviors([]);
    setSimilarityLevel([5]);
  };

  const handleCreateSegment = async () => {
    if (!user) return;
    
    if (!segmentName.trim()) {
      toast({
        title: "Error",
        description: "Please enter a segment name",
        variant: "destructive",
      });
      return;
    }

    setSaving(true);
    try {
      const { data, error } = await supabase
        .from('audiences')
        .insert({
          user_id: user.id,
          name: segmentName.trim(),
          description: segmentDescription.trim() || null,
          age_min: ageRange[0],
          age_max: ageRange[1],
          gender: selectedGenders,
          countries: selectedLocations.length > 0 ? selectedLocations : null,
          interests: selectedInterests.length > 0 ? selectedInterests : null,
          behaviors: selectedBehaviors.length > 0 ? selectedBehaviors : null,
          platforms: ['facebook', 'instagram', 'twitter', 'linkedin'],
        })
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Segment created",
        description: `"${segmentName}" has been created successfully`,
      });

      setShowCreateModal(false);
      resetForm();
      loadSegments();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to create segment",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteSegment = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    
    try {
      const { error } = await supabase
        .from('audiences')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({ title: "Segment deleted" });
      loadSegments();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to delete segment",
        variant: "destructive",
      });
    }
  };

  const renderCreateStep = () => {
    switch (createStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-foreground mb-4">Choose Segment Type</h3>
              <div className="grid grid-cols-1 gap-3">
                {segmentTypes.map((type) => (
                  <button
                    key={type.id}
                    onClick={() => {
                      setSelectedType(type.id);
                      setCreateStep(2);
                    }}
                    className={`flex items-center gap-4 p-4 rounded-lg border transition-all text-left hover:border-primary hover:bg-primary/5 ${
                      selectedType === type.id ? "border-primary bg-primary/10" : "border-border bg-card"
                    }`}
                  >
                    <div className={`p-3 rounded-lg bg-${type.color}-500/20`}>
                      <type.icon className={`h-6 w-6 text-${type.color}-400`} />
                    </div>
                    <div>
                      <p className="font-medium text-foreground">{type.name}</p>
                      <p className="text-sm text-muted-foreground">{type.description}</p>
                    </div>
                    <ChevronRight className="h-5 w-5 text-muted-foreground ml-auto" />
                  </button>
                ))}
              </div>
            </div>

            <div className="border-t border-border pt-4">
              <h4 className="text-sm font-medium text-muted-foreground mb-3">Quick Start Templates</h4>
              <div className="flex flex-wrap gap-2">
                {quickTemplates.map((template) => (
                  <Button
                    key={template.name}
                    variant="outline"
                    size="sm"
                    className="gap-2"
                    onClick={() => {
                      setSegmentName(template.name);
                      setSelectedType("custom");
                      setCreateStep(2);
                    }}
                  >
                    <span>{template.icon}</span>
                    {template.name}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
              <Badge variant="outline">{segmentTypes.find((t) => t.id === selectedType)?.name}</Badge>
            </div>

            {selectedType === "demographic" && (
              <div className="space-y-6">
                <div>
                  <Label className="text-foreground">Age Range</Label>
                  <div className="mt-4 px-2">
                    <Slider
                      value={ageRange}
                      onValueChange={setAgeRange}
                      min={13}
                      max={65}
                      step={1}
                      className="w-full"
                    />
                    <div className="flex justify-between mt-2 text-sm text-muted-foreground">
                      <span>{ageRange[0]} years</span>
                      <span>{ageRange[1]}+ years</span>
                    </div>
                  </div>
                </div>

                <div>
                  <Label className="text-foreground">Gender</Label>
                  <div className="flex gap-2 mt-2">
                    {["all", "male", "female", "other"].map((gender) => (
                      <Button
                        key={gender}
                        variant={selectedGenders.includes(gender) ? "default" : "outline"}
                        size="sm"
                        onClick={() => {
                          if (gender === "all") {
                            setSelectedGenders(["all"]);
                          } else {
                            const newGenders = selectedGenders.filter((g) => g !== "all");
                            if (newGenders.includes(gender)) {
                              setSelectedGenders(newGenders.filter((g) => g !== gender));
                            } else {
                              setSelectedGenders([...newGenders, gender]);
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
                  <Label className="text-foreground">Locations</Label>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {["United States", "Canada", "United Kingdom", "Australia", "Germany"].map((loc) => (
                      <Button
                        key={loc}
                        variant={selectedLocations.includes(loc) ? "default" : "outline"}
                        size="sm"
                        onClick={() => {
                          if (selectedLocations.includes(loc)) {
                            setSelectedLocations(selectedLocations.filter((l) => l !== loc));
                          } else {
                            setSelectedLocations([...selectedLocations, loc]);
                          }
                        }}
                      >
                        {loc}
                      </Button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {selectedType === "interest" && (
              <div className="space-y-4">
                <Label className="text-foreground">Select Interests</Label>
                {interestCategories.map((category) => (
                  <div key={category.name} className="space-y-2">
                    <p className="text-sm font-medium text-muted-foreground">{category.name}</p>
                    <div className="flex flex-wrap gap-2">
                      {category.subcategories.map((sub) => (
                        <Button
                          key={sub}
                          variant={selectedInterests.includes(sub) ? "default" : "outline"}
                          size="sm"
                          onClick={() => {
                            if (selectedInterests.includes(sub)) {
                              setSelectedInterests(selectedInterests.filter((i) => i !== sub));
                            } else {
                              setSelectedInterests([...selectedInterests, sub]);
                            }
                          }}
                        >
                          {sub}
                        </Button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {selectedType === "behavioral" && (
              <div className="space-y-4">
                <Label className="text-foreground">Behavioral Criteria</Label>
                <div className="space-y-3">
                  {[
                    { id: "high_engagers", label: "High Engagers", desc: "Top 25% by engagement" },
                    { id: "frequent_purchasers", label: "Frequent Purchasers", desc: "Multiple purchases" },
                    { id: "new_followers", label: "New Followers", desc: "Joined in last 30 days" },
                    { id: "inactive", label: "Inactive Users", desc: "No activity in 60+ days" },
                    { id: "content_sharers", label: "Content Sharers", desc: "High share rate" },
                  ].map((behavior) => (
                    <div
                      key={behavior.id}
                      className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all ${
                        selectedBehaviors.includes(behavior.id)
                          ? "border-primary bg-primary/10"
                          : "border-border hover:border-primary/50"
                      }`}
                      onClick={() => {
                        if (selectedBehaviors.includes(behavior.id)) {
                          setSelectedBehaviors(selectedBehaviors.filter((b) => b !== behavior.id));
                        } else {
                          setSelectedBehaviors([...selectedBehaviors, behavior.id]);
                        }
                      }}
                    >
                      <Checkbox checked={selectedBehaviors.includes(behavior.id)} />
                      <div>
                        <p className="font-medium text-foreground">{behavior.label}</p>
                        <p className="text-sm text-muted-foreground">{behavior.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {selectedType === "lookalike" && (
              <div className="space-y-6">
                <div>
                  <Label className="text-foreground">Source Audience</Label>
                  <Select>
                    <SelectTrigger className="mt-2">
                      <SelectValue placeholder="Select existing segment" />
                    </SelectTrigger>
                    <SelectContent>
                      {mockSegments.map((seg) => (
                        <SelectItem key={seg.id} value={seg.id}>
                          {seg.icon} {seg.name} ({formatNumber(seg.size)})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="text-foreground">Similarity Level: {similarityLevel[0]}%</Label>
                  <div className="mt-4 px-2">
                    <Slider
                      value={similarityLevel}
                      onValueChange={setSimilarityLevel}
                      min={1}
                      max={10}
                      step={1}
                    />
                    <div className="flex justify-between mt-2 text-xs text-muted-foreground">
                      <span>1% - Most Similar</span>
                      <span>10% - Broader Match</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {selectedType === "custom" && (
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Combine multiple criteria to create a custom segment.
                </p>
                <div className="grid grid-cols-2 gap-3">
                  <Button variant="outline" className="justify-start gap-2" onClick={() => setSelectedType("demographic")}>
                    <Users className="h-4 w-4" /> Add Demographics
                  </Button>
                  <Button variant="outline" className="justify-start gap-2" onClick={() => setSelectedType("interest")}>
                    <Heart className="h-4 w-4" /> Add Interests
                  </Button>
                  <Button variant="outline" className="justify-start gap-2" onClick={() => setSelectedType("behavioral")}>
                    <Activity className="h-4 w-4" /> Add Behaviors
                  </Button>
                  <Button variant="outline" className="justify-start gap-2">
                    <Globe className="h-4 w-4" /> Add Locations
                  </Button>
                </div>
              </div>
            )}

            <div className="flex gap-3 pt-4 border-t border-border">
              <Button variant="outline" onClick={() => setCreateStep(1)}>
                Back
              </Button>
              <Button onClick={() => setCreateStep(3)} className="flex-1">
                Continue
              </Button>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div>
              <Label htmlFor="segmentName" className="text-foreground">Segment Name *</Label>
              <Input
                id="segmentName"
                value={segmentName}
                onChange={(e) => setSegmentName(e.target.value)}
                placeholder="e.g., Young Professionals NYC"
                className="mt-2"
              />
            </div>

            <div>
              <Label htmlFor="segmentDesc" className="text-foreground">Description</Label>
              <Textarea
                id="segmentDesc"
                value={segmentDescription}
                onChange={(e) => setSegmentDescription(e.target.value)}
                placeholder="Describe this segment and when to use it..."
                className="mt-2"
                rows={3}
              />
              <p className="text-xs text-muted-foreground mt-1">{segmentDescription.length}/500</p>
            </div>

            <div>
              <Label className="text-foreground">Segment Color</Label>
              <div className="flex gap-2 mt-2">
                {["#8B5CF6", "#3B82F6", "#10B981", "#F59E0B", "#EF4444", "#EC4899"].map((color) => (
                  <button
                    key={color}
                    onClick={() => setSegmentColor(color)}
                    className={`w-8 h-8 rounded-full transition-transform ${
                      segmentColor === color ? "ring-2 ring-offset-2 ring-primary scale-110" : ""
                    }`}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            </div>

            <Card className="bg-muted/50">
              <CardContent className="pt-4">
                <h4 className="font-medium text-foreground mb-3">Estimated Segment Size</h4>
                <div className="flex items-center gap-3">
                  <div className="text-3xl font-bold text-foreground">~45,000</div>
                  <Badge variant="outline" className="text-green-400 border-green-400">
                    🟢 Large Segment
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground mt-2">
                  Based on your selected criteria
                </p>
              </CardContent>
            </Card>

            <div className="flex gap-3 pt-4 border-t border-border">
              <Button variant="outline" onClick={() => setCreateStep(2)}>
                Back
              </Button>
              <Button onClick={handleCreateSegment} className="flex-1" disabled={!segmentName || saving}>
                {saving ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Sparkles className="h-4 w-4 mr-2" />
                )}
                {saving ? "Creating..." : "Create Segment"}
              </Button>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Audience</h1>
            <p className="text-muted-foreground">Manage and target your audience segments</p>
          </div>
          <Button onClick={() => setShowCreateModal(true)} className="gap-2">
            <Plus className="h-4 w-4" />
            New Segment
          </Button>
        </div>

        {/* Overview Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="bg-card border-border">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Audience</p>
                  <p className="text-2xl font-bold text-foreground">{formatNumber(totalAudienceSize)}</p>
                </div>
                <div className="p-3 rounded-lg bg-violet-500/20">
                  <Users className="h-6 w-6 text-violet-400" />
                </div>
              </div>
              <p className="text-xs text-green-400 mt-2">+12.5% from last month</p>
            </CardContent>
          </Card>

          <Card className="bg-card border-border">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Active Segments</p>
                  <p className="text-2xl font-bold text-foreground">{activeSegments}</p>
                </div>
                <div className="p-3 rounded-lg bg-green-500/20">
                  <Target className="h-6 w-6 text-green-400" />
                </div>
              </div>
              <p className="text-xs text-muted-foreground mt-2">{mockSegments.length} total segments</p>
            </CardContent>
          </Card>

          <Card className="bg-card border-border">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Avg. Engagement</p>
                  <p className="text-2xl font-bold text-foreground">{avgEngagement}%</p>
                </div>
                <div className="p-3 rounded-lg bg-pink-500/20">
                  <Heart className="h-6 w-6 text-pink-400" />
                </div>
              </div>
              <p className="text-xs text-green-400 mt-2">↑ 1.2% above average</p>
            </CardContent>
          </Card>

          <Card className="bg-card border-border">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Reach</p>
                  <p className="text-2xl font-bold text-foreground">2.4M</p>
                </div>
                <div className="p-3 rounded-lg bg-cyan-500/20">
                  <Eye className="h-6 w-6 text-cyan-400" />
                </div>
              </div>
              <p className="text-xs text-green-400 mt-2">+18.3% this month</p>
            </CardContent>
          </Card>
        </div>

        {/* Filters & Search */}
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div className="flex gap-3 flex-1">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search segments..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-40">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="demographic">Demographic</SelectItem>
                <SelectItem value="interest">Interest</SelectItem>
                <SelectItem value="behavioral">Behavioral</SelectItem>
                <SelectItem value="custom">Custom</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex gap-2">
            <Button
              variant={view === "grid" ? "default" : "outline"}
              size="icon"
              onClick={() => setView("grid")}
            >
              <Grid3X3 className="h-4 w-4" />
            </Button>
            <Button
              variant={view === "list" ? "default" : "outline"}
              size="icon"
              onClick={() => setView("list")}
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Segments Grid/List */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : filteredSegments.length === 0 ? (
          <Card className="bg-card border-border">
            <CardContent className="py-12 text-center">
              <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">No segments yet</h3>
              <p className="text-muted-foreground mb-4">Create your first audience segment to get started</p>
              <Button onClick={() => setShowCreateModal(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Create Segment
              </Button>
            </CardContent>
          </Card>
        ) : view === "grid" ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredSegments.map((segment) => (
              <Card
                key={segment.id}
                className="bg-card border-border hover:border-primary/50 transition-all cursor-pointer group"
                onClick={() => navigate(`/audience/${segment.id}`)}
              >
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-10 h-10 rounded-lg flex items-center justify-center text-lg"
                        style={{ backgroundColor: segment.color + "20" }}
                      >
                        {segment.icon}
                      </div>
                      <div>
                        <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">
                          {segment.name}
                        </h3>
                        <Badge variant="outline" className="text-xs capitalize">
                          {segment.type}
                        </Badge>
                      </div>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>
                          <Settings className="h-4 w-4 mr-2" /> Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Copy className="h-4 w-4 mr-2" /> Duplicate
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          className="text-destructive"
                          onClick={(e) => handleDeleteSegment(segment.id, e)}
                        >
                          <Trash2 className="h-4 w-4 mr-2" /> Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>

                  <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                    {segment.description}
                  </p>

                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <p className="text-xs text-muted-foreground">Size</p>
                      <p className="font-semibold text-foreground">{formatNumber(segment.size)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Engagement</p>
                      <p className="font-semibold text-foreground">{segment.engagementRate}%</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex gap-1">
                      {segment.platforms.slice(0, 3).map((platform) => (
                        <Badge key={platform} variant="secondary" className="text-xs">
                          {platform === "all" ? "All" : platform.charAt(0).toUpperCase()}
                        </Badge>
                      ))}
                    </div>
                    <div className="flex items-center gap-1 text-sm">
                      {segment.growth > 0 ? (
                        <span className="text-green-400 flex items-center">
                          <TrendingUp className="h-3 w-3 mr-1" />
                          +{segment.growth}%
                        </span>
                      ) : (
                        <span className="text-red-400 flex items-center">
                          <TrendingUp className="h-3 w-3 mr-1 rotate-180" />
                          {segment.growth}%
                        </span>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="bg-card border-border">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left p-4 text-sm font-medium text-muted-foreground">Segment</th>
                    <th className="text-left p-4 text-sm font-medium text-muted-foreground">Type</th>
                    <th className="text-left p-4 text-sm font-medium text-muted-foreground">Size</th>
                    <th className="text-left p-4 text-sm font-medium text-muted-foreground">Engagement</th>
                    <th className="text-left p-4 text-sm font-medium text-muted-foreground">Growth</th>
                    <th className="text-left p-4 text-sm font-medium text-muted-foreground">Platforms</th>
                    <th className="text-left p-4 text-sm font-medium text-muted-foreground">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredSegments.map((segment) => (
                    <tr
                      key={segment.id}
                      className="border-b border-border hover:bg-muted/50 cursor-pointer"
                      onClick={() => navigate(`/audience/${segment.id}`)}
                    >
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <span
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: segment.color }}
                          />
                          <div>
                            <p className="font-medium text-foreground">{segment.name}</p>
                            <p className="text-xs text-muted-foreground">{segment.description}</p>
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <Badge variant="outline" className="capitalize">{segment.type}</Badge>
                      </td>
                      <td className="p-4 text-foreground">{formatNumber(segment.size)}</td>
                      <td className="p-4 text-foreground">{segment.engagementRate}%</td>
                      <td className="p-4">
                        <span className={segment.growth > 0 ? "text-green-400" : "text-red-400"}>
                          {segment.growth > 0 ? "+" : ""}{segment.growth}%
                        </span>
                      </td>
                      <td className="p-4">
                        <div className="flex gap-1">
                          {segment.platforms.slice(0, 3).map((p) => (
                            <Badge key={p} variant="secondary" className="text-xs">
                              {p === "all" ? "All" : p.charAt(0).toUpperCase()}
                            </Badge>
                          ))}
                        </div>
                      </td>
                      <td className="p-4">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem>Edit</DropdownMenuItem>
                            <DropdownMenuItem>Duplicate</DropdownMenuItem>
                            <DropdownMenuItem 
                              className="text-destructive"
                              onClick={(e) => handleDeleteSegment(segment.id, e)}
                            >
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        )}

        {/* Create Segment Modal */}
        <Dialog open={showCreateModal} onOpenChange={(open) => {
          setShowCreateModal(open);
          if (!open) resetForm();
        }}>
          <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Create Audience Segment
              </DialogTitle>
            </DialogHeader>

            {/* Step Indicator */}
            <div className="flex items-center gap-2 mb-4">
              {[1, 2, 3].map((step) => (
                <div key={step} className="flex items-center gap-2">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                      createStep >= step
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {step}
                  </div>
                  {step < 3 && (
                    <div className={`w-8 h-0.5 ${createStep > step ? "bg-primary" : "bg-muted"}`} />
                  )}
                </div>
              ))}
            </div>

            {renderCreateStep()}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
