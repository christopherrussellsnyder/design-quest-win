import React, { useCallback, useState } from 'react';
import { Upload, X, Image, FileText, Loader2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';

interface UploadedFile {
  file: File;
  preview: string;
  progress: number;
  status: 'pending' | 'uploading' | 'complete' | 'error';
  error?: string;
}

interface ScreenshotUploaderProps {
  onUpload: (file: File) => Promise<string>;
  onAnalyze: (imageUrl: string) => Promise<void>;
  disabled?: boolean;
  className?: string;
}

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ACCEPTED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];

export function ScreenshotUploader({ 
  onUpload, 
  onAnalyze, 
  disabled = false,
  className 
}: ScreenshotUploaderProps) {
  const [uploadedFile, setUploadedFile] = useState<UploadedFile | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const validateFile = (file: File): string | null => {
    if (!ACCEPTED_TYPES.includes(file.type)) {
      return 'Please upload a JPG, PNG, WebP, or PDF file';
    }
    if (file.size > MAX_FILE_SIZE) {
      return 'File size must be less than 10MB';
    }
    return null;
  };

  const handleFile = useCallback((file: File) => {
    const error = validateFile(file);
    if (error) {
      setUploadedFile({
        file,
        preview: '',
        progress: 0,
        status: 'error',
        error,
      });
      return;
    }

    const preview = URL.createObjectURL(file);
    setUploadedFile({
      file,
      preview,
      progress: 0,
      status: 'pending',
    });
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const file = e.dataTransfer.files[0];
    if (file) {
      handleFile(file);
    }
  }, [handleFile]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFile(file);
    }
  }, [handleFile]);

  const removeFile = useCallback(() => {
    if (uploadedFile?.preview) {
      URL.revokeObjectURL(uploadedFile.preview);
    }
    setUploadedFile(null);
  }, [uploadedFile]);

  const handleUploadAndAnalyze = async () => {
    if (!uploadedFile || uploadedFile.status !== 'pending') return;

    try {
      setUploadedFile(prev => prev ? { ...prev, status: 'uploading', progress: 10 } : null);
      
      // Simulate progress during upload
      const progressInterval = setInterval(() => {
        setUploadedFile(prev => {
          if (prev && prev.progress < 50) {
            return { ...prev, progress: prev.progress + 10 };
          }
          return prev;
        });
      }, 200);

      const imageUrl = await onUpload(uploadedFile.file);
      
      clearInterval(progressInterval);
      setUploadedFile(prev => prev ? { ...prev, progress: 60 } : null);

      // Start analysis
      setIsAnalyzing(true);
      setUploadedFile(prev => prev ? { ...prev, progress: 70 } : null);
      
      await onAnalyze(imageUrl);
      
      setUploadedFile(prev => prev ? { ...prev, status: 'complete', progress: 100 } : null);
      
      // Clear after success
      setTimeout(() => {
        removeFile();
      }, 1000);
      
    } catch (error) {
      console.error('Upload/analyze error:', error);
      setUploadedFile(prev => prev ? { 
        ...prev, 
        status: 'error', 
        error: error instanceof Error ? error.message : 'Upload failed'
      } : null);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className={cn('space-y-3', className)}>
      {!uploadedFile ? (
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          className={cn(
            'relative border-2 border-dashed rounded-lg p-6 transition-all cursor-pointer',
            'hover:border-primary/50 hover:bg-primary/5',
            isDragging && 'border-primary bg-primary/10',
            disabled && 'opacity-50 cursor-not-allowed',
            'border-muted-foreground/25'
          )}
        >
          <input
            type="file"
            accept=".jpg,.jpeg,.png,.webp,.pdf"
            onChange={handleInputChange}
            disabled={disabled}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          />
          <div className="flex flex-col items-center gap-2 text-center">
            <div className="p-3 rounded-full bg-primary/10">
              <Upload className="w-6 h-6 text-primary" />
            </div>
            <div>
              <p className="text-sm font-medium">
                Drop analytics screenshot here
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                JPG, PNG, WebP, or PDF up to 10MB
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className="border rounded-lg p-4 bg-card">
          <div className="flex items-start gap-3">
            {/* Preview */}
            <div className="relative w-16 h-16 rounded-md overflow-hidden bg-muted flex-shrink-0">
              {uploadedFile.file.type === 'application/pdf' ? (
                <div className="w-full h-full flex items-center justify-center">
                  <FileText className="w-8 h-8 text-muted-foreground" />
                </div>
              ) : uploadedFile.preview ? (
                <img
                  src={uploadedFile.preview}
                  alt="Preview"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Image className="w-8 h-8 text-muted-foreground" />
                </div>
              )}
            </div>

            {/* File info */}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">
                {uploadedFile.file.name}
              </p>
              <p className="text-xs text-muted-foreground">
                {formatFileSize(uploadedFile.file.size)}
              </p>
              
              {uploadedFile.status === 'error' && (
                <div className="flex items-center gap-1 mt-1 text-destructive">
                  <AlertCircle className="w-3 h-3" />
                  <p className="text-xs">{uploadedFile.error}</p>
                </div>
              )}

              {(uploadedFile.status === 'uploading' || isAnalyzing) && (
                <div className="mt-2 space-y-1">
                  <Progress value={uploadedFile.progress} className="h-1.5" />
                  <p className="text-xs text-muted-foreground">
                    {isAnalyzing ? 'Analyzing with AI...' : 'Uploading...'}
                  </p>
                </div>
              )}
            </div>

            {/* Remove button */}
            {uploadedFile.status !== 'uploading' && !isAnalyzing && (
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 flex-shrink-0"
                onClick={removeFile}
              >
                <X className="w-4 h-4" />
              </Button>
            )}
          </div>

          {/* Action buttons */}
          {uploadedFile.status === 'pending' && (
            <div className="flex gap-2 mt-3">
              <Button
                onClick={handleUploadAndAnalyze}
                disabled={disabled}
                className="flex-1"
                size="sm"
              >
                <Image className="w-4 h-4 mr-2" />
                Analyze Screenshot
              </Button>
            </div>
          )}

          {(uploadedFile.status === 'uploading' || isAnalyzing) && (
            <div className="flex items-center justify-center gap-2 mt-3 text-sm text-muted-foreground">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>{isAnalyzing ? 'AI is analyzing your screenshot...' : 'Uploading...'}</span>
            </div>
          )}

          {uploadedFile.status === 'error' && (
            <Button
              onClick={() => setUploadedFile(prev => prev ? { ...prev, status: 'pending', error: undefined } : null)}
              variant="outline"
              size="sm"
              className="w-full mt-3"
            >
              Try Again
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
