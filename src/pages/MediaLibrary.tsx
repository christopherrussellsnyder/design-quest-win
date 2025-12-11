import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Upload, Grid3X3, List, Search, Filter, FolderPlus, Star, Clock, 
  Image, Video, FileText, Trash2, Download, Copy, Edit2, MoreVertical,
  X, Check, ChevronRight, Folder, Plus, Eye, ArrowLeft, ExternalLink,
  RotateCw, Crop, Sun, Contrast, Palette, Type, Maximize, ZoomIn, ZoomOut,
  FlipHorizontal, FlipVertical, RotateCcw, Sparkles, HardDrive, AlertCircle,
  Play, Film, GalleryHorizontalEnd, Heart, ImagePlus, Camera
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Slider } from '@/components/ui/slider';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from '@/components/ui/dropdown-menu';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface MediaItem {
  id: string;
  filename: string;
  original_filename: string;
  file_type: 'image' | 'video' | 'document' | 'gif';
  mime_type: string;
  file_size: number;
  storage_url: string;
  thumbnail_url?: string;
  width?: number;
  height?: number;
  duration?: number;
  folder_id?: string;
  tags: string[];
  title?: string;
  description?: string;
  alt_text?: string;
  times_used: number;
  last_used_at?: string;
  avg_engagement_rate: number;
  total_impressions: number;
  is_favorite: boolean;
  uploaded_at: string;
}

interface MediaFolder {
  id: string;
  name: string;
  color: string;
  icon?: string;
  parent_folder_id?: string;
  item_count: number;
  total_size: number;
}

// Mock data for demonstration
const mockMedia: MediaItem[] = [
  {
    id: '1',
    filename: 'product-launch-hero.jpg',
    original_filename: 'product-launch-hero.jpg',
    file_type: 'image',
    mime_type: 'image/jpeg',
    file_size: 2457600,
    storage_url: 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=1920&h=1080&fit=crop',
    thumbnail_url: 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=400&h=400&fit=crop',
    width: 1920,
    height: 1080,
    tags: ['product', 'launch', 'hero'],
    title: 'Product Launch Hero Image',
    times_used: 5,
    avg_engagement_rate: 6.2,
    total_impressions: 45000,
    is_favorite: true,
    uploaded_at: '2024-11-15T10:30:00Z'
  },
  {
    id: '2',
    filename: 'team-photo-office.jpg',
    original_filename: 'team-photo-office.jpg',
    file_type: 'image',
    mime_type: 'image/jpeg',
    file_size: 1843200,
    storage_url: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=1920&h=1280&fit=crop',
    thumbnail_url: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=400&h=400&fit=crop',
    width: 1920,
    height: 1280,
    tags: ['team', 'office', 'culture'],
    title: 'Team Photo - Office',
    times_used: 3,
    avg_engagement_rate: 5.8,
    total_impressions: 32000,
    is_favorite: false,
    uploaded_at: '2024-11-10T14:20:00Z'
  },
  {
    id: '3',
    filename: 'social-promo-graphic.png',
    original_filename: 'social-promo-graphic.png',
    file_type: 'image',
    mime_type: 'image/png',
    file_size: 512000,
    storage_url: 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=1080&h=1080&fit=crop',
    thumbnail_url: 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=400&h=400&fit=crop',
    width: 1080,
    height: 1080,
    tags: ['social', 'promo', 'graphic'],
    title: 'Social Promo Graphic',
    times_used: 8,
    avg_engagement_rate: 7.5,
    total_impressions: 78000,
    is_favorite: true,
    uploaded_at: '2024-11-08T09:15:00Z'
  },
  {
    id: '4',
    filename: 'product-showcase-video.mp4',
    original_filename: 'product-showcase-video.mp4',
    file_type: 'video',
    mime_type: 'video/mp4',
    file_size: 15728640,
    storage_url: 'https://images.unsplash.com/photo-1536240478700-b869070f9279?w=1920&h=1080&fit=crop',
    thumbnail_url: 'https://images.unsplash.com/photo-1536240478700-b869070f9279?w=400&h=400&fit=crop',
    width: 1920,
    height: 1080,
    duration: 45,
    tags: ['video', 'product', 'showcase'],
    title: 'Product Showcase Video',
    times_used: 2,
    avg_engagement_rate: 8.9,
    total_impressions: 125000,
    is_favorite: false,
    uploaded_at: '2024-11-05T16:45:00Z'
  },
  {
    id: '5',
    filename: 'behind-the-scenes.jpg',
    original_filename: 'behind-the-scenes.jpg',
    file_type: 'image',
    mime_type: 'image/jpeg',
    file_size: 1024000,
    storage_url: 'https://images.unsplash.com/photo-1497215728101-856f4ea42174?w=1920&h=1280&fit=crop',
    thumbnail_url: 'https://images.unsplash.com/photo-1497215728101-856f4ea42174?w=400&h=400&fit=crop',
    width: 1920,
    height: 1280,
    tags: ['bts', 'office', 'work'],
    title: 'Behind the Scenes',
    times_used: 1,
    avg_engagement_rate: 4.2,
    total_impressions: 18000,
    is_favorite: false,
    uploaded_at: '2024-11-01T11:00:00Z'
  },
  {
    id: '6',
    filename: 'instagram-story-template.png',
    original_filename: 'instagram-story-template.png',
    file_type: 'image',
    mime_type: 'image/png',
    file_size: 358400,
    storage_url: 'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=1080&h=1920&fit=crop',
    thumbnail_url: 'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=400&h=400&fit=crop',
    width: 1080,
    height: 1920,
    tags: ['instagram', 'story', 'template'],
    title: 'Instagram Story Template',
    times_used: 12,
    avg_engagement_rate: 6.8,
    total_impressions: 92000,
    is_favorite: true,
    uploaded_at: '2024-10-28T08:30:00Z'
  },
  {
    id: '7',
    filename: 'customer-testimonial.jpg',
    original_filename: 'customer-testimonial.jpg',
    file_type: 'image',
    mime_type: 'image/jpeg',
    file_size: 819200,
    storage_url: 'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=1200&h=800&fit=crop',
    thumbnail_url: 'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=400&h=400&fit=crop',
    width: 1200,
    height: 800,
    tags: ['testimonial', 'customer', 'review'],
    title: 'Customer Testimonial',
    times_used: 4,
    avg_engagement_rate: 5.5,
    total_impressions: 28000,
    is_favorite: false,
    uploaded_at: '2024-10-25T13:15:00Z'
  },
  {
    id: '8',
    filename: 'brand-guidelines.pdf',
    original_filename: 'brand-guidelines.pdf',
    file_type: 'document',
    mime_type: 'application/pdf',
    file_size: 4194304,
    storage_url: '#',
    thumbnail_url: undefined,
    tags: ['brand', 'guidelines', 'document'],
    title: 'Brand Guidelines',
    times_used: 0,
    avg_engagement_rate: 0,
    total_impressions: 0,
    is_favorite: false,
    uploaded_at: '2024-10-20T10:00:00Z'
  },
  {
    id: '9',
    filename: 'celebration-gif.gif',
    original_filename: 'celebration-gif.gif',
    file_type: 'gif',
    mime_type: 'image/gif',
    file_size: 2097152,
    storage_url: 'https://images.unsplash.com/photo-1533227268428-f9ed0900fb3b?w=600&h=600&fit=crop',
    thumbnail_url: 'https://images.unsplash.com/photo-1533227268428-f9ed0900fb3b?w=400&h=400&fit=crop',
    width: 600,
    height: 600,
    tags: ['gif', 'celebration', 'fun'],
    title: 'Celebration GIF',
    times_used: 6,
    avg_engagement_rate: 7.2,
    total_impressions: 55000,
    is_favorite: false,
    uploaded_at: '2024-10-15T15:30:00Z'
  },
  {
    id: '10',
    filename: 'product-flat-lay.jpg',
    original_filename: 'product-flat-lay.jpg',
    file_type: 'image',
    mime_type: 'image/jpeg',
    file_size: 1536000,
    storage_url: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=1200&h=1200&fit=crop',
    thumbnail_url: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&h=400&fit=crop',
    width: 1200,
    height: 1200,
    tags: ['product', 'flatlay', 'minimalist'],
    title: 'Product Flat Lay',
    times_used: 7,
    avg_engagement_rate: 6.9,
    total_impressions: 67000,
    is_favorite: true,
    uploaded_at: '2024-10-10T09:45:00Z'
  }
];

const mockFolders: MediaFolder[] = [
  { id: 'f1', name: 'Product Photography', color: '#8B5CF6', item_count: 15, total_size: 25600000 },
  { id: 'f2', name: 'Team & Culture', color: '#3B82F6', item_count: 8, total_size: 12800000 },
  { id: 'f3', name: 'Marketing Materials', color: '#10B981', item_count: 12, total_size: 18400000 },
  { id: 'f4', name: 'Social Graphics', color: '#F59E0B', item_count: 20, total_size: 8960000 },
  { id: 'f5', name: 'Videos', color: '#EF4444', item_count: 5, total_size: 52428800 }
];

const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
};

const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
};

const MediaLibrary: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  // State
  const [media, setMedia] = useState<MediaItem[]>(mockMedia);
  const [folders, setFolders] = useState<MediaFolder[]>(mockFolders);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFolder, setSelectedFolder] = useState<string | null>(null);
  const [selectedType, setSelectedType] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('newest');
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  
  // Modals
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [folderModalOpen, setFolderModalOpen] = useState(false);
  const [editorModalOpen, setEditorModalOpen] = useState(false);
  const [selectedMedia, setSelectedMedia] = useState<MediaItem | null>(null);
  
  // Upload state
  const [uploadingFiles, setUploadingFiles] = useState<{ file: File; progress: number; status: 'uploading' | 'complete' | 'error' }[]>([]);
  
  // Editor state
  const [editorBrightness, setEditorBrightness] = useState(0);
  const [editorContrast, setEditorContrast] = useState(0);
  const [editorSaturation, setEditorSaturation] = useState(0);
  const [editorRotation, setEditorRotation] = useState(0);
  const [selectedFilter, setSelectedFilter] = useState('none');
  
  // Folder form state
  const [folderName, setFolderName] = useState('');
  const [folderColor, setFolderColor] = useState('#8B5CF6');

  // Calculate storage stats
  const totalStorage = useMemo(() => {
    return media.reduce((acc, item) => acc + item.file_size, 0);
  }, [media]);
  
  const maxStorage = 25 * 1024 * 1024 * 1024; // 25 GB
  const storagePercentage = (totalStorage / maxStorage) * 100;
  
  const mediaStats = useMemo(() => {
    return {
      images: media.filter(m => m.file_type === 'image').length,
      videos: media.filter(m => m.file_type === 'video').length,
      documents: media.filter(m => m.file_type === 'document').length,
      gifs: media.filter(m => m.file_type === 'gif').length
    };
  }, [media]);

  // Filter and sort media
  const filteredMedia = useMemo(() => {
    let result = [...media];
    
    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(item => 
        item.filename.toLowerCase().includes(query) ||
        item.title?.toLowerCase().includes(query) ||
        item.tags.some(tag => tag.toLowerCase().includes(query))
      );
    }
    
    // Folder filter
    if (selectedFolder === 'favorites') {
      result = result.filter(item => item.is_favorite);
    } else if (selectedFolder === 'unused') {
      result = result.filter(item => item.times_used === 0);
    } else if (selectedFolder === 'recent') {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      result = result.filter(item => new Date(item.uploaded_at) >= thirtyDaysAgo);
    } else if (selectedFolder && selectedFolder !== 'all') {
      result = result.filter(item => item.folder_id === selectedFolder);
    }
    
    // Type filter
    if (selectedType !== 'all') {
      result = result.filter(item => item.file_type === selectedType);
    }
    
    // Sort
    switch (sortBy) {
      case 'newest':
        result.sort((a, b) => new Date(b.uploaded_at).getTime() - new Date(a.uploaded_at).getTime());
        break;
      case 'oldest':
        result.sort((a, b) => new Date(a.uploaded_at).getTime() - new Date(b.uploaded_at).getTime());
        break;
      case 'name':
        result.sort((a, b) => a.filename.localeCompare(b.filename));
        break;
      case 'size':
        result.sort((a, b) => b.file_size - a.file_size);
        break;
      case 'used':
        result.sort((a, b) => b.times_used - a.times_used);
        break;
    }
    
    return result;
  }, [media, searchQuery, selectedFolder, selectedType, sortBy]);

  // Handlers
  const handleFileUpload = (files: FileList | null) => {
    if (!files) return;
    
    const newUploads = Array.from(files).map(file => ({
      file,
      progress: 0,
      status: 'uploading' as const
    }));
    
    setUploadingFiles(prev => [...prev, ...newUploads]);
    
    // Simulate upload progress
    newUploads.forEach((upload, index) => {
      let progress = 0;
      const interval = setInterval(() => {
        progress += Math.random() * 20;
        if (progress >= 100) {
          progress = 100;
          clearInterval(interval);
          
          setUploadingFiles(prev => prev.map((u, i) => 
            u.file === upload.file ? { ...u, progress: 100, status: 'complete' } : u
          ));
          
          // Add to media library
          const newMedia: MediaItem = {
            id: `new-${Date.now()}-${index}`,
            filename: upload.file.name,
            original_filename: upload.file.name,
            file_type: upload.file.type.startsWith('image/') ? 'image' : 
                       upload.file.type.startsWith('video/') ? 'video' : 
                       upload.file.type === 'image/gif' ? 'gif' : 'document',
            mime_type: upload.file.type,
            file_size: upload.file.size,
            storage_url: URL.createObjectURL(upload.file),
            thumbnail_url: upload.file.type.startsWith('image/') ? URL.createObjectURL(upload.file) : undefined,
            tags: [],
            times_used: 0,
            avg_engagement_rate: 0,
            total_impressions: 0,
            is_favorite: false,
            uploaded_at: new Date().toISOString()
          };
          
          setMedia(prev => [newMedia, ...prev]);
        } else {
          setUploadingFiles(prev => prev.map(u => 
            u.file === upload.file ? { ...u, progress } : u
          ));
        }
      }, 200);
    });
  };

  const handleToggleFavorite = (id: string) => {
    setMedia(prev => prev.map(item => 
      item.id === id ? { ...item, is_favorite: !item.is_favorite } : item
    ));
    toast.success('Updated favorites');
  };

  const handleDeleteMedia = (id: string) => {
    setMedia(prev => prev.filter(item => item.id !== id));
    setSelectedItems(prev => prev.filter(itemId => itemId !== id));
    toast.success('Media deleted');
  };

  const handleCopyUrl = (url: string) => {
    navigator.clipboard.writeText(url);
    toast.success('URL copied to clipboard');
  };

  const handleSelectItem = (id: string, selected: boolean) => {
    if (selected) {
      setSelectedItems(prev => [...prev, id]);
    } else {
      setSelectedItems(prev => prev.filter(itemId => itemId !== id));
    }
  };

  const handleSelectAll = () => {
    if (selectedItems.length === filteredMedia.length) {
      setSelectedItems([]);
    } else {
      setSelectedItems(filteredMedia.map(m => m.id));
    }
  };

  const handleBulkDelete = () => {
    setMedia(prev => prev.filter(item => !selectedItems.includes(item.id)));
    setSelectedItems([]);
    toast.success(`${selectedItems.length} items deleted`);
  };

  const handleCreateFolder = () => {
    if (!folderName.trim()) return;
    
    const newFolder: MediaFolder = {
      id: `folder-${Date.now()}`,
      name: folderName,
      color: folderColor,
      item_count: 0,
      total_size: 0
    };
    
    setFolders(prev => [...prev, newFolder]);
    setFolderName('');
    setFolderColor('#8B5CF6');
    setFolderModalOpen(false);
    toast.success('Folder created');
  };

  const openMediaDetail = (item: MediaItem) => {
    setSelectedMedia(item);
    setDetailModalOpen(true);
  };

  const openEditor = (item: MediaItem) => {
    setSelectedMedia(item);
    setEditorBrightness(0);
    setEditorContrast(0);
    setEditorSaturation(0);
    setEditorRotation(0);
    setSelectedFilter('none');
    setEditorModalOpen(true);
  };

  const getFileTypeIcon = (type: string) => {
    switch (type) {
      case 'image': return <Image className="w-4 h-4" />;
      case 'video': return <Video className="w-4 h-4" />;
      case 'document': return <FileText className="w-4 h-4" />;
      case 'gif': return <GalleryHorizontalEnd className="w-4 h-4" />;
      default: return <FileText className="w-4 h-4" />;
    }
  };

  const getFileTypeBadge = (type: string) => {
    const colors: Record<string, string> = {
      image: 'bg-blue-500/20 text-blue-400',
      video: 'bg-purple-500/20 text-purple-400',
      document: 'bg-orange-500/20 text-orange-400',
      gif: 'bg-green-500/20 text-green-400'
    };
    return colors[type] || 'bg-slate-500/20 text-slate-400';
  };

  const getEditorFilterStyle = () => {
    let filters = [];
    if (editorBrightness !== 0) filters.push(`brightness(${100 + editorBrightness}%)`);
    if (editorContrast !== 0) filters.push(`contrast(${100 + editorContrast}%)`);
    if (editorSaturation !== 0) filters.push(`saturate(${100 + editorSaturation}%)`);
    
    switch (selectedFilter) {
      case 'grayscale': filters.push('grayscale(100%)'); break;
      case 'sepia': filters.push('sepia(100%)'); break;
      case 'vintage': filters.push('sepia(50%) contrast(90%)'); break;
      case 'cool': filters.push('hue-rotate(180deg) saturate(80%)'); break;
      case 'warm': filters.push('hue-rotate(-30deg) saturate(120%)'); break;
    }
    
    return {
      filter: filters.join(' ') || 'none',
      transform: `rotate(${editorRotation}deg)`
    };
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      {/* Header */}
      <div className="border-b border-slate-800 bg-slate-900/50 sticky top-0 z-40">
        <div className="max-w-[1800px] mx-auto px-6 py-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => navigate('/dashboard')}
                className="text-slate-400 hover:text-white"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
              <div>
                <h1 className="text-2xl font-bold">Media Library</h1>
                <p className="text-slate-400 text-sm">Manage your images, videos, and media assets</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <Button 
                onClick={() => setUploadModalOpen(true)}
                className="bg-violet-600 hover:bg-violet-700"
              >
                <Upload className="w-4 h-4 mr-2" />
                Upload
              </Button>
            </div>
          </div>
          
          {/* Quick Stats */}
          <div className="flex items-center gap-6 text-sm">
            <div className="flex items-center gap-2">
              <span className="text-slate-400">Total:</span>
              <span className="font-medium">{media.length} items</span>
            </div>
            <div className="flex items-center gap-2">
              <HardDrive className="w-4 h-4 text-slate-400" />
              <span className="text-slate-400">Storage:</span>
              <span className="font-medium">{formatFileSize(totalStorage)} / 25 GB</span>
              <Progress value={storagePercentage} className="w-24 h-2" />
            </div>
            <div className="flex items-center gap-4 text-slate-400">
              <span className="flex items-center gap-1">
                <Image className="w-4 h-4" /> {mediaStats.images}
              </span>
              <span className="flex items-center gap-1">
                <Video className="w-4 h-4" /> {mediaStats.videos}
              </span>
              <span className="flex items-center gap-1">
                <FileText className="w-4 h-4" /> {mediaStats.documents}
              </span>
              <span className="flex items-center gap-1">
                <GalleryHorizontalEnd className="w-4 h-4" /> {mediaStats.gifs}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-[1800px] mx-auto flex">
        {/* Sidebar */}
        <div className="w-64 border-r border-slate-800 p-4 sticky top-[120px] h-[calc(100vh-120px)] overflow-y-auto">
          {/* Quick Actions */}
          <div className="mb-6">
            <Button 
              onClick={() => setUploadModalOpen(true)}
              className="w-full bg-violet-600 hover:bg-violet-700 mb-2"
            >
              <Upload className="w-4 h-4 mr-2" />
              Upload Media
            </Button>
            <Button 
              variant="outline"
              className="w-full border-slate-700 hover:bg-slate-800"
            >
              <Camera className="w-4 h-4 mr-2" />
              Browse Stock Images
            </Button>
          </div>

          {/* Quick Filters */}
          <div className="mb-6">
            <h3 className="text-sm font-medium text-slate-400 mb-3">Quick Filters</h3>
            <div className="space-y-1">
              <Button
                variant="ghost"
                className={`w-full justify-start ${selectedFolder === 'all' || !selectedFolder ? 'bg-slate-800' : ''}`}
                onClick={() => setSelectedFolder('all')}
              >
                <Grid3X3 className="w-4 h-4 mr-2" />
                All Media
                <span className="ml-auto text-slate-400">{media.length}</span>
              </Button>
              <Button
                variant="ghost"
                className={`w-full justify-start ${selectedFolder === 'recent' ? 'bg-slate-800' : ''}`}
                onClick={() => setSelectedFolder('recent')}
              >
                <Clock className="w-4 h-4 mr-2" />
                Recent
              </Button>
              <Button
                variant="ghost"
                className={`w-full justify-start ${selectedFolder === 'favorites' ? 'bg-slate-800' : ''}`}
                onClick={() => setSelectedFolder('favorites')}
              >
                <Star className="w-4 h-4 mr-2" />
                Favorites
                <span className="ml-auto text-slate-400">{media.filter(m => m.is_favorite).length}</span>
              </Button>
              <Button
                variant="ghost"
                className={`w-full justify-start ${selectedFolder === 'unused' ? 'bg-slate-800' : ''}`}
                onClick={() => setSelectedFolder('unused')}
              >
                <AlertCircle className="w-4 h-4 mr-2" />
                Unused
                <span className="ml-auto text-slate-400">{media.filter(m => m.times_used === 0).length}</span>
              </Button>
            </div>
          </div>

          {/* Folders */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-medium text-slate-400">Folders</h3>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => setFolderModalOpen(true)}
                className="h-6 w-6 p-0"
              >
                <Plus className="w-4 h-4" />
              </Button>
            </div>
            <div className="space-y-1">
              {folders.map(folder => (
                <Button
                  key={folder.id}
                  variant="ghost"
                  className={`w-full justify-start ${selectedFolder === folder.id ? 'bg-slate-800' : ''}`}
                  onClick={() => setSelectedFolder(folder.id)}
                >
                  <Folder className="w-4 h-4 mr-2" style={{ color: folder.color }} />
                  <span className="truncate">{folder.name}</span>
                  <span className="ml-auto text-slate-400 text-xs">{folder.item_count}</span>
                </Button>
              ))}
            </div>
          </div>

          {/* File Types */}
          <div>
            <h3 className="text-sm font-medium text-slate-400 mb-3">File Types</h3>
            <div className="space-y-1">
              {[
                { type: 'all', label: 'All Types', count: media.length },
                { type: 'image', label: 'Images', count: mediaStats.images },
                { type: 'video', label: 'Videos', count: mediaStats.videos },
                { type: 'document', label: 'Documents', count: mediaStats.documents },
                { type: 'gif', label: 'GIFs', count: mediaStats.gifs }
              ].map(item => (
                <Button
                  key={item.type}
                  variant="ghost"
                  className={`w-full justify-start ${selectedType === item.type ? 'bg-slate-800' : ''}`}
                  onClick={() => setSelectedType(item.type)}
                >
                  {item.type !== 'all' && getFileTypeIcon(item.type)}
                  {item.type === 'all' && <Grid3X3 className="w-4 h-4" />}
                  <span className="ml-2">{item.label}</span>
                  <span className="ml-auto text-slate-400">{item.count}</span>
                </Button>
              ))}
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 p-6">
          {/* Toolbar */}
          <div className="flex items-center gap-4 mb-6">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input
                placeholder="Search media..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-slate-900 border-slate-700"
              />
            </div>
            
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-40 bg-slate-900 border-slate-700">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">Newest First</SelectItem>
                <SelectItem value="oldest">Oldest First</SelectItem>
                <SelectItem value="name">Name (A-Z)</SelectItem>
                <SelectItem value="size">Largest First</SelectItem>
                <SelectItem value="used">Most Used</SelectItem>
              </SelectContent>
            </Select>

            <div className="flex border border-slate-700 rounded-lg overflow-hidden">
              <Button
                variant="ghost"
                size="sm"
                className={`rounded-none ${viewMode === 'grid' ? 'bg-slate-800' : ''}`}
                onClick={() => setViewMode('grid')}
              >
                <Grid3X3 className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className={`rounded-none ${viewMode === 'list' ? 'bg-slate-800' : ''}`}
                onClick={() => setViewMode('list')}
              >
                <List className="w-4 h-4" />
              </Button>
            </div>
            
            {selectedItems.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleSelectAll}
              >
                {selectedItems.length === filteredMedia.length ? 'Deselect All' : 'Select All'}
              </Button>
            )}
          </div>

          {/* Media Grid */}
          {viewMode === 'grid' && (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {filteredMedia.map(item => (
                <div
                  key={item.id}
                  className={`group relative bg-slate-900 rounded-lg overflow-hidden border ${
                    selectedItems.includes(item.id) ? 'border-violet-500' : 'border-slate-800'
                  } hover:border-slate-700 transition-all`}
                >
                  {/* Thumbnail */}
                  <div 
                    className="aspect-square relative cursor-pointer"
                    onClick={() => openMediaDetail(item)}
                  >
                    {item.file_type === 'image' || item.file_type === 'gif' ? (
                      <img
                        src={item.thumbnail_url || item.storage_url}
                        alt={item.title || item.filename}
                        className="w-full h-full object-cover"
                      />
                    ) : item.file_type === 'video' ? (
                      <div className="w-full h-full bg-slate-800 flex items-center justify-center relative">
                        {item.thumbnail_url ? (
                          <img
                            src={item.thumbnail_url}
                            alt={item.title || item.filename}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <Video className="w-12 h-12 text-slate-600" />
                        )}
                        <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                          <Play className="w-12 h-12 text-white" />
                        </div>
                      </div>
                    ) : (
                      <div className="w-full h-full bg-slate-800 flex items-center justify-center">
                        <FileText className="w-12 h-12 text-slate-600" />
                      </div>
                    )}
                    
                    {/* Type Badge */}
                    <div className={`absolute top-2 left-2 px-2 py-0.5 rounded text-xs font-medium ${getFileTypeBadge(item.file_type)}`}>
                      {item.file_type.toUpperCase()}
                    </div>
                    
                    {/* Selection Checkbox */}
                    <div 
                      className={`absolute top-2 right-2 ${selectedItems.includes(item.id) || 'opacity-0 group-hover:opacity-100'} transition-opacity`}
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Checkbox
                        checked={selectedItems.includes(item.id)}
                        onCheckedChange={(checked) => handleSelectItem(item.id, !!checked)}
                        className="bg-slate-900/80 border-slate-600"
                      />
                    </div>
                    
                    {/* Favorite */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleToggleFavorite(item.id);
                      }}
                      className={`absolute bottom-2 right-2 p-1 rounded ${
                        item.is_favorite ? 'text-yellow-400' : 'text-white/60 opacity-0 group-hover:opacity-100'
                      } hover:text-yellow-400 transition-all`}
                    >
                      <Star className={`w-4 h-4 ${item.is_favorite ? 'fill-current' : ''}`} />
                    </button>
                    
                    {/* Hover Overlay */}
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                      <Button
                        size="sm"
                        variant="ghost"
                        className="bg-white/10 hover:bg-white/20"
                        onClick={(e) => {
                          e.stopPropagation();
                          openMediaDetail(item);
                        }}
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                      {item.file_type === 'image' && (
                        <Button
                          size="sm"
                          variant="ghost"
                          className="bg-white/10 hover:bg-white/20"
                          onClick={(e) => {
                            e.stopPropagation();
                            openEditor(item);
                          }}
                        >
                          <Edit2 className="w-4 h-4" />
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant="ghost"
                        className="bg-white/10 hover:bg-white/20"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleCopyUrl(item.storage_url);
                        }}
                      >
                        <Copy className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                  
                  {/* Info */}
                  <div className="p-3">
                    <p className="text-sm font-medium truncate">{item.title || item.filename}</p>
                    <div className="flex items-center justify-between mt-1 text-xs text-slate-400">
                      <span>{formatFileSize(item.file_size)}</span>
                      <span>Used {item.times_used}x</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Media List View */}
          {viewMode === 'list' && (
            <div className="bg-slate-900 rounded-lg border border-slate-800 overflow-hidden">
              <table className="w-full">
                <thead className="bg-slate-800/50">
                  <tr>
                    <th className="w-10 p-3">
                      <Checkbox
                        checked={selectedItems.length === filteredMedia.length && filteredMedia.length > 0}
                        onCheckedChange={() => handleSelectAll()}
                      />
                    </th>
                    <th className="w-16 p-3"></th>
                    <th className="text-left p-3 text-sm font-medium text-slate-400">Name</th>
                    <th className="text-left p-3 text-sm font-medium text-slate-400">Type</th>
                    <th className="text-left p-3 text-sm font-medium text-slate-400">Size</th>
                    <th className="text-left p-3 text-sm font-medium text-slate-400">Used</th>
                    <th className="text-left p-3 text-sm font-medium text-slate-400">Uploaded</th>
                    <th className="w-10 p-3"></th>
                  </tr>
                </thead>
                <tbody>
                  {filteredMedia.map(item => (
                    <tr 
                      key={item.id} 
                      className="border-t border-slate-800 hover:bg-slate-800/50 cursor-pointer"
                      onClick={() => openMediaDetail(item)}
                    >
                      <td className="p-3" onClick={(e) => e.stopPropagation()}>
                        <Checkbox
                          checked={selectedItems.includes(item.id)}
                          onCheckedChange={(checked) => handleSelectItem(item.id, !!checked)}
                        />
                      </td>
                      <td className="p-3">
                        <div className="w-10 h-10 rounded bg-slate-800 overflow-hidden">
                          {item.thumbnail_url ? (
                            <img src={item.thumbnail_url} alt="" className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              {getFileTypeIcon(item.file_type)}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="p-3">
                        <div className="flex items-center gap-2">
                          {item.is_favorite && <Star className="w-4 h-4 text-yellow-400 fill-current" />}
                          <span className="truncate max-w-[200px]">{item.title || item.filename}</span>
                        </div>
                      </td>
                      <td className="p-3">
                        <Badge variant="secondary" className={getFileTypeBadge(item.file_type)}>
                          {item.file_type}
                        </Badge>
                      </td>
                      <td className="p-3 text-slate-400">{formatFileSize(item.file_size)}</td>
                      <td className="p-3 text-slate-400">{item.times_used}x</td>
                      <td className="p-3 text-slate-400">{formatDate(item.uploaded_at)}</td>
                      <td className="p-3" onClick={(e) => e.stopPropagation()}>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreVertical className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => openMediaDetail(item)}>
                              <Eye className="w-4 h-4 mr-2" /> View Details
                            </DropdownMenuItem>
                            {item.file_type === 'image' && (
                              <DropdownMenuItem onClick={() => openEditor(item)}>
                                <Edit2 className="w-4 h-4 mr-2" /> Edit
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuItem onClick={() => handleCopyUrl(item.storage_url)}>
                              <Copy className="w-4 h-4 mr-2" /> Copy URL
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleToggleFavorite(item.id)}>
                              <Star className="w-4 h-4 mr-2" /> {item.is_favorite ? 'Remove from Favorites' : 'Add to Favorites'}
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem 
                              onClick={() => handleDeleteMedia(item.id)}
                              className="text-red-400"
                            >
                              <Trash2 className="w-4 h-4 mr-2" /> Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {filteredMedia.length === 0 && (
            <div className="text-center py-16">
              <Image className="w-16 h-16 text-slate-600 mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">No media found</h3>
              <p className="text-slate-400 mb-4">
                {searchQuery ? 'Try adjusting your search or filters' : 'Upload your first media to get started'}
              </p>
              <Button onClick={() => setUploadModalOpen(true)} className="bg-violet-600 hover:bg-violet-700">
                <Upload className="w-4 h-4 mr-2" />
                Upload Media
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Bulk Actions Bar */}
      {selectedItems.length > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 flex items-center gap-4 shadow-xl z-50">
          <span className="text-sm">{selectedItems.length} items selected</span>
          <div className="flex items-center gap-2">
            <Button size="sm" variant="ghost">
              <Folder className="w-4 h-4 mr-2" /> Move
            </Button>
            <Button size="sm" variant="ghost">
              <Star className="w-4 h-4 mr-2" /> Favorite
            </Button>
            <Button size="sm" variant="ghost">
              <Download className="w-4 h-4 mr-2" /> Download
            </Button>
            <Button size="sm" variant="ghost" className="text-red-400 hover:text-red-300" onClick={handleBulkDelete}>
              <Trash2 className="w-4 h-4 mr-2" /> Delete
            </Button>
          </div>
          <Button size="sm" variant="ghost" onClick={() => setSelectedItems([])}>
            <X className="w-4 h-4" />
          </Button>
        </div>
      )}

      {/* Upload Modal */}
      <Dialog open={uploadModalOpen} onOpenChange={setUploadModalOpen}>
        <DialogContent className="max-w-2xl bg-slate-900 border-slate-800">
          <DialogHeader>
            <DialogTitle>Upload Media</DialogTitle>
          </DialogHeader>
          
          <div className="py-4">
            {/* Drop Zone */}
            <label className="block border-2 border-dashed border-slate-700 rounded-lg p-12 text-center cursor-pointer hover:border-violet-500 transition-colors">
              <input
                type="file"
                multiple
                accept="image/*,video/*,.pdf"
                className="hidden"
                onChange={(e) => handleFileUpload(e.target.files)}
              />
              <Upload className="w-12 h-12 text-slate-500 mx-auto mb-4" />
              <p className="text-lg font-medium mb-2">Drag & drop files here or click to browse</p>
              <p className="text-sm text-slate-400">
                Supports: JPG, PNG, GIF, WebP, MP4, MOV, PDF • Max 100 MB per file
              </p>
            </label>
            
            {/* Upload Progress */}
            {uploadingFiles.length > 0 && (
              <div className="mt-6 space-y-3">
                {uploadingFiles.map((upload, index) => (
                  <div key={index} className="flex items-center gap-3 p-3 bg-slate-800 rounded-lg">
                    <div className="w-10 h-10 rounded bg-slate-700 flex items-center justify-center">
                      {upload.file.type.startsWith('image/') ? (
                        <Image className="w-5 h-5 text-slate-400" />
                      ) : upload.file.type.startsWith('video/') ? (
                        <Video className="w-5 h-5 text-slate-400" />
                      ) : (
                        <FileText className="w-5 h-5 text-slate-400" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{upload.file.name}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <Progress value={upload.progress} className="flex-1 h-1.5" />
                        <span className="text-xs text-slate-400">
                          {upload.status === 'complete' ? (
                            <Check className="w-4 h-4 text-green-400" />
                          ) : (
                            `${Math.round(upload.progress)}%`
                          )}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setUploadModalOpen(false)}>
              Done
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Media Detail Modal */}
      <Dialog open={detailModalOpen} onOpenChange={setDetailModalOpen}>
        <DialogContent className="max-w-4xl bg-slate-900 border-slate-800 max-h-[90vh] overflow-hidden">
          {selectedMedia && (
            <div className="flex gap-6">
              {/* Preview */}
              <div className="flex-1 bg-slate-800 rounded-lg overflow-hidden flex items-center justify-center min-h-[400px]">
                {selectedMedia.file_type === 'image' || selectedMedia.file_type === 'gif' ? (
                  <img
                    src={selectedMedia.storage_url}
                    alt={selectedMedia.title || selectedMedia.filename}
                    className="max-w-full max-h-[500px] object-contain"
                  />
                ) : selectedMedia.file_type === 'video' ? (
                  <video 
                    src={selectedMedia.storage_url}
                    controls
                    className="max-w-full max-h-[500px]"
                  />
                ) : (
                  <div className="text-center">
                    <FileText className="w-20 h-20 text-slate-600 mx-auto mb-4" />
                    <p className="text-slate-400">{selectedMedia.filename}</p>
                  </div>
                )}
              </div>
              
              {/* Details */}
              <div className="w-80 overflow-y-auto max-h-[70vh]">
                <h3 className="font-semibold text-lg mb-4">{selectedMedia.title || selectedMedia.filename}</h3>
                
                <div className="space-y-4">
                  {/* File Info */}
                  <div className="bg-slate-800 rounded-lg p-4 space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-400">Type</span>
                      <Badge className={getFileTypeBadge(selectedMedia.file_type)}>
                        {selectedMedia.file_type}
                      </Badge>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-400">Size</span>
                      <span>{formatFileSize(selectedMedia.file_size)}</span>
                    </div>
                    {selectedMedia.width && selectedMedia.height && (
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-400">Dimensions</span>
                        <span>{selectedMedia.width} × {selectedMedia.height}</span>
                      </div>
                    )}
                    {selectedMedia.duration && (
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-400">Duration</span>
                        <span>{selectedMedia.duration}s</span>
                      </div>
                    )}
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-400">Uploaded</span>
                      <span>{formatDate(selectedMedia.uploaded_at)}</span>
                    </div>
                  </div>
                  
                  {/* Usage Stats */}
                  <div className="bg-slate-800 rounded-lg p-4 space-y-2">
                    <h4 className="font-medium mb-2">Usage & Performance</h4>
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-400">Times Used</span>
                      <span>{selectedMedia.times_used}</span>
                    </div>
                    {selectedMedia.times_used > 0 && (
                      <>
                        <div className="flex justify-between text-sm">
                          <span className="text-slate-400">Avg. Engagement</span>
                          <span>{selectedMedia.avg_engagement_rate}%</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-slate-400">Total Impressions</span>
                          <span>{selectedMedia.total_impressions.toLocaleString()}</span>
                        </div>
                      </>
                    )}
                  </div>
                  
                  {/* Tags */}
                  {selectedMedia.tags.length > 0 && (
                    <div>
                      <h4 className="text-sm font-medium text-slate-400 mb-2">Tags</h4>
                      <div className="flex flex-wrap gap-1">
                        {selectedMedia.tags.map(tag => (
                          <Badge key={tag} variant="secondary" className="bg-slate-800">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {/* Actions */}
                  <div className="pt-4 space-y-2">
                    <Button 
                      className="w-full bg-violet-600 hover:bg-violet-700"
                      onClick={() => handleCopyUrl(selectedMedia.storage_url)}
                    >
                      <Copy className="w-4 h-4 mr-2" /> Copy URL
                    </Button>
                    {selectedMedia.file_type === 'image' && (
                      <Button 
                        variant="outline" 
                        className="w-full"
                        onClick={() => {
                          setDetailModalOpen(false);
                          openEditor(selectedMedia);
                        }}
                      >
                        <Edit2 className="w-4 h-4 mr-2" /> Edit Image
                      </Button>
                    )}
                    <Button variant="outline" className="w-full">
                      <Download className="w-4 h-4 mr-2" /> Download
                    </Button>
                    <Button 
                      variant="outline" 
                      className="w-full text-red-400 hover:text-red-300 border-red-900 hover:border-red-800"
                      onClick={() => {
                        handleDeleteMedia(selectedMedia.id);
                        setDetailModalOpen(false);
                      }}
                    >
                      <Trash2 className="w-4 h-4 mr-2" /> Delete
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Image Editor Modal */}
      <Dialog open={editorModalOpen} onOpenChange={setEditorModalOpen}>
        <DialogContent className="max-w-5xl bg-slate-900 border-slate-800 max-h-[90vh]">
          <DialogHeader>
            <DialogTitle>Edit Image</DialogTitle>
          </DialogHeader>
          
          {selectedMedia && (
            <div className="flex gap-6">
              {/* Preview */}
              <div className="flex-1 bg-slate-800 rounded-lg overflow-hidden flex items-center justify-center min-h-[400px]">
                <img
                  src={selectedMedia.storage_url}
                  alt={selectedMedia.title || selectedMedia.filename}
                  className="max-w-full max-h-[400px] object-contain transition-all"
                  style={getEditorFilterStyle()}
                />
              </div>
              
              {/* Editor Controls */}
              <div className="w-72 space-y-6">
                {/* Quick Actions */}
                <div>
                  <h4 className="text-sm font-medium mb-3">Transform</h4>
                  <div className="grid grid-cols-4 gap-2">
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => setEditorRotation(r => r - 90)}
                    >
                      <RotateCcw className="w-4 h-4" />
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => setEditorRotation(r => r + 90)}
                    >
                      <RotateCw className="w-4 h-4" />
                    </Button>
                    <Button size="sm" variant="outline">
                      <FlipHorizontal className="w-4 h-4" />
                    </Button>
                    <Button size="sm" variant="outline">
                      <FlipVertical className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
                
                {/* Adjustments */}
                <div>
                  <h4 className="text-sm font-medium mb-3">Adjustments</h4>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span className="text-slate-400">Brightness</span>
                        <span>{editorBrightness}</span>
                      </div>
                      <Slider
                        value={[editorBrightness]}
                        onValueChange={([v]) => setEditorBrightness(v)}
                        min={-100}
                        max={100}
                        step={1}
                      />
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span className="text-slate-400">Contrast</span>
                        <span>{editorContrast}</span>
                      </div>
                      <Slider
                        value={[editorContrast]}
                        onValueChange={([v]) => setEditorContrast(v)}
                        min={-100}
                        max={100}
                        step={1}
                      />
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span className="text-slate-400">Saturation</span>
                        <span>{editorSaturation}</span>
                      </div>
                      <Slider
                        value={[editorSaturation]}
                        onValueChange={([v]) => setEditorSaturation(v)}
                        min={-100}
                        max={100}
                        step={1}
                      />
                    </div>
                  </div>
                </div>
                
                {/* Filters */}
                <div>
                  <h4 className="text-sm font-medium mb-3">Filters</h4>
                  <div className="grid grid-cols-3 gap-2">
                    {['none', 'grayscale', 'sepia', 'vintage', 'cool', 'warm'].map(filter => (
                      <button
                        key={filter}
                        className={`p-2 rounded border text-xs capitalize ${
                          selectedFilter === filter 
                            ? 'border-violet-500 bg-violet-500/20' 
                            : 'border-slate-700 hover:border-slate-600'
                        }`}
                        onClick={() => setSelectedFilter(filter)}
                      >
                        {filter}
                      </button>
                    ))}
                  </div>
                </div>
                
                {/* Actions */}
                <div className="pt-4 space-y-2">
                  <Button 
                    className="w-full"
                    variant="outline"
                    onClick={() => {
                      setEditorBrightness(0);
                      setEditorContrast(0);
                      setEditorSaturation(0);
                      setEditorRotation(0);
                      setSelectedFilter('none');
                    }}
                  >
                    Reset
                  </Button>
                  <Button className="w-full bg-violet-600 hover:bg-violet-700">
                    <Check className="w-4 h-4 mr-2" /> Save Changes
                  </Button>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Create Folder Modal */}
      <Dialog open={folderModalOpen} onOpenChange={setFolderModalOpen}>
        <DialogContent className="max-w-md bg-slate-900 border-slate-800">
          <DialogHeader>
            <DialogTitle>Create Folder</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div>
              <Label>Folder Name</Label>
              <Input
                value={folderName}
                onChange={(e) => setFolderName(e.target.value)}
                placeholder="e.g., Product Photos"
                className="mt-1.5 bg-slate-800 border-slate-700"
              />
            </div>
            
            <div>
              <Label>Color</Label>
              <div className="flex gap-2 mt-1.5">
                {['#8B5CF6', '#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#EC4899'].map(color => (
                  <button
                    key={color}
                    className={`w-8 h-8 rounded-full border-2 ${
                      folderColor === color ? 'border-white' : 'border-transparent'
                    }`}
                    style={{ backgroundColor: color }}
                    onClick={() => setFolderColor(color)}
                  />
                ))}
              </div>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setFolderModalOpen(false)}>
              Cancel
            </Button>
            <Button 
              className="bg-violet-600 hover:bg-violet-700"
              onClick={handleCreateFolder}
              disabled={!folderName.trim()}
            >
              Create Folder
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default MediaLibrary;
