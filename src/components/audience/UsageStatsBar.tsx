import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, AlertCircle, Target, Users, TrendingUp, BarChart3 } from "lucide-react";

interface PlatformRequirement {
  platform: string;
  required: string[];
  optional: string[];
  filled: string[];
}

interface UsageStatsBarProps {
  requirements: PlatformRequirement[];
}

export default function UsageStatsBar({ requirements }: UsageStatsBarProps) {
  const platformIcons: Record<string, { icon: any; color: string }> = {
    facebook: { icon: Target, color: 'bg-blue-600' },
    instagram: { icon: Target, color: 'bg-pink-600' },
    linkedin: { icon: Users, color: 'bg-blue-700' },
    twitter: { icon: TrendingUp, color: 'bg-sky-500' },
    tiktok: { icon: BarChart3, color: 'bg-pink-500' },
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {requirements.map((req) => {
        const filledCount = req.filled.length;
        const requiredCount = req.required.length;
        const progress = requiredCount > 0 ? (filledCount / requiredCount) * 100 : 100;
        const isComplete = filledCount >= requiredCount;
        const PlatformIcon = platformIcons[req.platform.toLowerCase()]?.icon || Target;
        const platformColor = platformIcons[req.platform.toLowerCase()]?.color || 'bg-primary';

        return (
          <Card key={req.platform} className={isComplete ? 'border-green-500/30' : 'border-yellow-500/30'}>
            <CardContent className="pt-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className={`p-1.5 rounded ${platformColor}`}>
                    <PlatformIcon className="h-4 w-4 text-white" />
                  </div>
                  <span className="font-medium capitalize">{req.platform}</span>
                </div>
                {isComplete ? (
                  <CheckCircle2 className="h-5 w-5 text-green-500" />
                ) : (
                  <AlertCircle className="h-5 w-5 text-yellow-500" />
                )}
              </div>

              <Progress value={progress} className="h-2 mb-3" />

              <div className="space-y-2">
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Required ({filledCount}/{requiredCount})</p>
                  <div className="flex flex-wrap gap-1">
                    {req.required.map((field) => (
                      <Badge
                        key={field}
                        variant={req.filled.includes(field) ? "default" : "outline"}
                        className="text-xs"
                      >
                        {req.filled.includes(field) && <CheckCircle2 className="h-3 w-3 mr-1" />}
                        {field}
                      </Badge>
                    ))}
                  </div>
                </div>

                {req.optional.length > 0 && (
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Optional</p>
                    <div className="flex flex-wrap gap-1">
                      {req.optional.slice(0, 3).map((field) => (
                        <Badge key={field} variant="secondary" className="text-xs">
                          {field}
                        </Badge>
                      ))}
                      {req.optional.length > 3 && (
                        <Badge variant="secondary" className="text-xs">
                          +{req.optional.length - 3} more
                        </Badge>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}