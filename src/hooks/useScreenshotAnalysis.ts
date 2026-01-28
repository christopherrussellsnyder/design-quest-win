import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

interface AnalysisResult {
  success: boolean;
  analysis: string;
  extractedData: any;
  analyticsId?: string;
}

export function useScreenshotAnalysis() {
  const [isUploading, setIsUploading] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const uploadScreenshot = useCallback(async (file: File): Promise<string> => {
    setIsUploading(true);
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('You must be logged in to upload screenshots');
      }

      const timestamp = Date.now();
      const sanitizedFilename = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
      const filePath = `${user.id}/${timestamp}_${sanitizedFilename}`;

      const { data, error } = await supabase.storage
        .from('analytics-screenshots')
        .upload(filePath, file, {
          contentType: file.type,
          upsert: false,
        });

      if (error) {
        console.error('Upload error:', error);
        throw new Error('Failed to upload screenshot');
      }

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('analytics-screenshots')
        .getPublicUrl(data.path);

      return publicUrl;
    } finally {
      setIsUploading(false);
    }
  }, []);

  const analyzeScreenshot = useCallback(async (imageUrl: string): Promise<AnalysisResult> => {
    setIsAnalyzing(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('analyze-screenshot', {
        body: { imageUrl },
      });

      if (error) {
        console.error('Analysis error:', error);
        throw new Error(error.message || 'Failed to analyze screenshot');
      }

      if (!data.success) {
        throw new Error(data.error || 'Analysis failed');
      }

      return data;
    } finally {
      setIsAnalyzing(false);
    }
  }, []);

  const uploadAndAnalyze = useCallback(async (file: File): Promise<AnalysisResult | null> => {
    try {
      const imageUrl = await uploadScreenshot(file);
      const result = await analyzeScreenshot(imageUrl);
      
      toast({
        title: 'Analysis Complete',
        description: 'Your analytics screenshot has been analyzed successfully.',
      });
      
      return result;
    } catch (error) {
      console.error('Upload and analyze error:', error);
      toast({
        title: 'Analysis Failed',
        description: error instanceof Error ? error.message : 'An error occurred',
        variant: 'destructive',
      });
      return null;
    }
  }, [uploadScreenshot, analyzeScreenshot]);

  return {
    uploadScreenshot,
    analyzeScreenshot,
    uploadAndAnalyze,
    isUploading,
    isAnalyzing,
    isProcessing: isUploading || isAnalyzing,
  };
}
