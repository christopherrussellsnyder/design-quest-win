import React from 'react';
import { ImagePlus, Globe, Lightbulb } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface QuickActionsProps {
  onUploadClick: () => void;
  onWebsiteClick: () => void;
  onStrategyClick: () => void;
  disabled?: boolean;
}

export function QuickActions({
  onUploadClick,
  onWebsiteClick,
  onStrategyClick,
  disabled,
}: QuickActionsProps) {
  return (
    <div className="flex gap-2">
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            onClick={onUploadClick}
            disabled={disabled}
            className="gap-2"
          >
            <ImagePlus className="w-4 h-4" />
            <span className="hidden sm:inline">Upload</span>
          </Button>
        </TooltipTrigger>
        <TooltipContent>Upload analytics screenshot</TooltipContent>
      </Tooltip>
      
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            onClick={onWebsiteClick}
            disabled={disabled}
            className="gap-2"
          >
            <Globe className="w-4 h-4" />
            <span className="hidden sm:inline">Website</span>
          </Button>
        </TooltipTrigger>
        <TooltipContent>Analyze your website</TooltipContent>
      </Tooltip>
      
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            onClick={onStrategyClick}
            disabled={disabled}
            className="gap-2"
          >
            <Lightbulb className="w-4 h-4" />
            <span className="hidden sm:inline">Strategy</span>
          </Button>
        </TooltipTrigger>
        <TooltipContent>Generate content strategy</TooltipContent>
      </Tooltip>
    </div>
  );
}
