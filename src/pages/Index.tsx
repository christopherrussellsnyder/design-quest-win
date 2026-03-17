import { Link } from 'react-router-dom';
import { TrendingUp, Target, Zap, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

const Index = () => {
  const downloadLogoPNG = async () => {
    const size = 1024;
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');
    
    if (!ctx) {
      toast.error('Could not create canvas context');
      return;
    }

    const svgString = `
      <svg xmlns="http://www.w3.org/2000/svg" width="1024" height="1024" viewBox="0 0 1024 1024">
        <rect width="1024" height="1024" rx="192" fill="#060606"/>
        <g transform="translate(256, 192)">
          <polygon points="0,0 154,0 358,282 154,282" fill="#CC0000"/>
          <polygon points="0,716 154,716 154,434 0,282" fill="#CC0000"/>
          <polygon points="180,297 358,0 512,0 282,358" fill="#CC0000" opacity="0.9"/>
          <polygon points="180,419 282,358 512,716 358,716" fill="#CC0000" opacity="0.85"/>
          <polygon points="538,282 614,204 614,512 538,434" fill="#FF1A1A" opacity="0.6"/>
        </g>
      </svg>
    `;

    const blob = new Blob([svgString], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const img = new Image();
    
    img.onload = () => {
      ctx.drawImage(img, 0, 0, size, size);
      URL.revokeObjectURL(url);
      
      canvas.toBlob((pngBlob) => {
        if (!pngBlob) {
          toast.error('Could not generate PNG');
          return;
        }
        
        const downloadUrl = URL.createObjectURL(pngBlob);
        const a = document.createElement('a');
        a.href = downloadUrl;
        a.download = 'korex-logo-1024x1024.png';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(downloadUrl);
        
        toast.success('Logo downloaded successfully!');
      }, 'image/png');
    };
    
    img.onerror = () => {
      toast.error('Could not load SVG');
      URL.revokeObjectURL(url);
    };
    
    img.src = url;
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="max-w-6xl mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-8">
            <img src="/korex-wordmark-lockup.svg" alt="Korex Intelligence Systems Logo" className="h-[120px]" />
          </div>
          <p className="text-xl text-muted-foreground mb-8">
            Transform your marketing with intelligent insights and automation
          </p>
          <div className="flex items-center justify-center gap-4 flex-wrap">
            <Link
              to="/signup"
              className="px-8 py-4 bg-gradient-to-r from-primary to-accent text-primary-foreground font-semibold rounded-lg hover:opacity-90 transition-opacity"
            >
              Get Started
            </Link>
            <Link
              to="/login"
              className="px-8 py-4 bg-secondary text-secondary-foreground font-semibold rounded-lg hover:bg-secondary/80 transition-colors"
            >
              Sign In
            </Link>
          </div>
          
          {/* Logo Download Section */}
          <div className="mt-8 pt-6 border-t border-border/50">
            <Button
              onClick={downloadLogoPNG}
              variant="outline"
              className="gap-2"
            >
              <Download className="w-4 h-4" />
              Download Logo (1024x1024 PNG)
            </Button>
            <p className="text-xs text-muted-foreground mt-2">
              Transparent background • Optimized PNG format
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-16">
          <div className="bg-card/50 border border-border rounded-xl p-6">
            <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
              <TrendingUp className="w-6 h-6 text-primary" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Real-time Analytics</h3>
            <p className="text-muted-foreground">Track your campaign performance with live data and insights</p>
          </div>
          <div className="bg-card/50 border border-border rounded-xl p-6">
            <div className="w-12 h-12 rounded-lg bg-accent/10 flex items-center justify-center mb-4">
              <Target className="w-6 h-6 text-accent" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Smart Campaigns</h3>
            <p className="text-muted-foreground">Create and manage campaigns across multiple channels</p>
          </div>
          <div className="bg-card/50 border border-border rounded-xl p-6">
            <div className="w-12 h-12 rounded-lg bg-cyan/10 flex items-center justify-center mb-4">
              <Zap className="w-6 h-6 text-cyan" />
            </div>
            <h3 className="text-lg font-semibold mb-2">AI Optimization</h3>
            <p className="text-muted-foreground">Let AI suggest improvements for better ROI</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;