import { useState, useEffect, useRef } from 'react';
import { Search, X, FileText, Megaphone, Calendar, Clock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface SearchResult {
  id: string;
  type: 'campaign' | 'post';
  title: string;
  subtitle: string;
  status?: string;
  date?: string;
}

export default function SearchBar() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Debounced search
  useEffect(() => {
    if (!query.trim() || query.length < 2) {
      setResults([]);
      return;
    }

    const searchTimeout = setTimeout(async () => {
      setIsLoading(true);
      try {
        const searchResults: SearchResult[] = [];

        // Search campaigns
        const { data: campaigns } = await supabase
          .from('campaigns')
          .select('id, name, status, platform, created_at')
          .eq('user_id', user?.id)
          .ilike('name', `%${query}%`)
          .limit(5);

        if (campaigns) {
          campaigns.forEach((campaign) => {
            searchResults.push({
              id: campaign.id,
              type: 'campaign',
              title: campaign.name,
              subtitle: `${campaign.platform} • ${campaign.status}`,
              status: campaign.status,
              date: new Date(campaign.created_at).toLocaleDateString(),
            });
          });
        }

        // Search scheduled posts
        const { data: posts } = await supabase
          .from('scheduled_posts')
          .select('id, title, content, status, scheduled_time, platforms')
          .eq('user_id', user?.id)
          .or(`title.ilike.%${query}%,content.ilike.%${query}%`)
          .limit(5);

        if (posts) {
          posts.forEach((post) => {
            searchResults.push({
              id: post.id,
              type: 'post',
              title: post.title || post.content?.slice(0, 50) + '...',
              subtitle: `${post.platforms?.join(', ') || 'Multiple'} • ${post.status}`,
              status: post.status,
              date: new Date(post.scheduled_time).toLocaleDateString(),
            });
          });
        }

        setResults(searchResults);
      } catch (error) {
        console.error('Search error:', error);
      } finally {
        setIsLoading(false);
      }
    }, 300);

    return () => clearTimeout(searchTimeout);
  }, [query, user?.id]);

  const handleResultClick = (result: SearchResult) => {
    navigate('/ai-strategist');
    setIsOpen(false);
    setQuery('');
  };

  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'active':
      case 'published':
        return 'bg-emerald-500/20 text-emerald-400';
      case 'paused':
      case 'scheduled':
        return 'bg-amber-500/20 text-amber-400';
      case 'draft':
        return 'bg-slate-500/20 text-slate-400';
      default:
        return 'bg-slate-500/20 text-slate-400';
    }
  };

  return (
    <div className="relative">
      <div className="relative">
        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          placeholder="Search campaigns, content..."
          className="bg-slate-800/50 border border-slate-700 rounded-lg pl-10 pr-10 py-2 text-sm w-72 focus:outline-none focus:border-violet-500 transition-colors"
        />
        {query && (
          <button
            onClick={() => {
              setQuery('');
              setResults([]);
            }}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Search Results Dropdown */}
      {isOpen && query.length >= 2 && (
        <div
          ref={dropdownRef}
          className="absolute top-full left-0 mt-2 w-96 bg-slate-900 border border-slate-700 rounded-xl shadow-xl z-50 overflow-hidden"
        >
          {isLoading ? (
            <div className="p-4 text-center">
              <div className="animate-spin w-5 h-5 border-2 border-violet-500 border-t-transparent rounded-full mx-auto mb-2"></div>
              <p className="text-sm text-slate-400">Searching...</p>
            </div>
          ) : results.length > 0 ? (
            <div className="max-h-80 overflow-y-auto">
              <div className="p-2">
                <p className="text-xs text-slate-500 px-2 py-1">
                  {results.length} result{results.length !== 1 ? 's' : ''} found
                </p>
              </div>
              {results.map((result) => (
                <button
                  key={`${result.type}-${result.id}`}
                  onClick={() => handleResultClick(result)}
                  className="w-full p-3 flex items-start gap-3 hover:bg-slate-800/50 transition-colors text-left border-t border-slate-800/50"
                >
                  <div
                    className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                      result.type === 'campaign'
                        ? 'bg-violet-500/20 text-violet-400'
                        : 'bg-cyan-500/20 text-cyan-400'
                    }`}
                  >
                    {result.type === 'campaign' ? (
                      <Megaphone className="w-4 h-4" />
                    ) : (
                      <FileText className="w-4 h-4" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="text-sm font-medium text-slate-200 truncate">
                        {result.title}
                      </span>
                      {result.status && (
                        <span
                          className={`text-xs px-1.5 py-0.5 rounded ${getStatusColor(
                            result.status
                          )}`}
                        >
                          {result.status}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-xs text-slate-500">
                      <span>{result.subtitle}</span>
                      {result.date && (
                        <>
                          <span>•</span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {result.date}
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          ) : (
            <div className="p-6 text-center">
              <Search className="w-8 h-8 text-slate-600 mx-auto mb-2" />
              <p className="text-sm text-slate-400">No results found for "{query}"</p>
              <p className="text-xs text-slate-500 mt-1">
                Try searching for campaign names or post content
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
