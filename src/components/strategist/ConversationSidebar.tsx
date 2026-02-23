import React, { useState } from 'react';
import { Plus, MessageSquare, ChevronLeft, ChevronRight, Sparkles, MoreVertical, Trash2, Pencil, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { formatDistanceToNow } from 'date-fns';
import { cn } from '@/lib/utils';
import { Conversation } from '@/pages/AIStrategist';

interface ConversationSidebarProps {
  conversations: Conversation[];
  selectedId?: string;
  isLoading: boolean;
  isOpen: boolean;
  onToggle: () => void;
  onSelect: (id: string) => void;
  onNewChat: () => void;
  onDelete: (id: string) => void;
  onRename?: (id: string, newTitle: string) => void;
  onFavorite?: (id: string) => void;
}

export function ConversationSidebar({
  conversations,
  selectedId,
  isLoading,
  isOpen,
  onToggle,
  onSelect,
  onNewChat,
  onDelete,
  onRename,
  onFavorite,
}: ConversationSidebarProps) {
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState('');
  return (
    <div className={cn(
      'relative flex flex-col bg-secondary border-r border-subtle backdrop-blur-sm transition-all duration-300 overflow-visible',
      isOpen ? 'w-80' : 'w-0'
    )}>
      {/* Toggle button */}
      <Button
        variant="ghost"
        size="icon"
        className={cn(
          'absolute -right-4 top-4 z-50 h-8 w-8 rounded-full border border-subtle bg-secondary shadow-md hover:border-primary hover:shadow-glow pointer-events-auto',
          !isOpen && 'right-[-48px]'
        )}
        onClick={onToggle}
      >
        {isOpen ? <ChevronLeft className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
      </Button>

      {isOpen && (
        <>
          {/* Header */}
          <div className="p-4 border-b border-subtle">
            <div className="flex items-center gap-2 mb-4">
              <div className="p-2 rounded-md bg-gradient-to-br from-primary to-arasaka-red-dark shadow-glow">
                <Sparkles className="w-5 h-5 text-primary-foreground" />
              </div>
              <div>
                <h2 className="font-bold text-sm text-gradient">AI Strategist</h2>
                <p className="text-xs text-muted-foreground">Marketing Intelligence</p>
              </div>
            </div>
            <Button 
              onClick={onNewChat}
              className="w-full"
              size="sm"
            >
              <Plus className="w-4 h-4 mr-2" />
              New Chat
            </Button>
          </div>
          
          {/* Conversations list */}
          <ScrollArea className="flex-1">
            <div className="p-2 space-y-1">
              {isLoading ? (
                <div className="p-4 text-center">
                  <div className="space-y-2">
                    {[1, 2, 3].map(i => (
                      <div key={i} className="h-12 shimmer rounded-md" />
                    ))}
                  </div>
                </div>
              ) : conversations.length === 0 ? (
                <div className="p-6 text-center">
                  <MessageSquare className="w-8 h-8 mx-auto text-muted-foreground/50 mb-2" />
                  <p className="text-sm text-muted-foreground">No conversations yet</p>
                  <p className="text-xs text-muted-foreground mt-1">Start a new chat to begin</p>
                </div>
              ) : (
                conversations.map((conv) => (
                  <div
                    key={conv.id}
                    className={cn(
                      'group flex items-center gap-2 py-3 px-4 rounded-md cursor-pointer transition-all duration-200 border-l-[3px] border-l-transparent',
                      'hover:bg-surface-tertiary hover:border-l-primary',
                      selectedId === conv.id && 'bg-surface-elevated border-l-primary'
                    )}
                    onClick={() => onSelect(conv.id)}
                  >
                    <MessageSquare className="w-4 h-4 flex-shrink-0 text-muted-foreground" />
                    <div className="flex-1 min-w-0">
                      {renamingId === conv.id ? (
                        <input
                          autoFocus
                          className="text-sm font-medium w-full bg-secondary border border-medium rounded-md px-2 py-1 text-foreground focus:outline-none focus:border-primary focus:ring-[3px] focus:ring-primary/10"
                          value={renameValue}
                          onChange={(e) => setRenameValue(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              if (onRename) onRename(conv.id, renameValue);
                              setRenamingId(null);
                            }
                            if (e.key === 'Escape') setRenamingId(null);
                          }}
                          onBlur={() => {
                            if (onRename) onRename(conv.id, renameValue);
                            setRenamingId(null);
                          }}
                          onClick={(e) => e.stopPropagation()}
                        />
                      ) : (
                        <p className="text-sm font-medium truncate text-foreground">
                          {conv.title || 'New Conversation'}
                        </p>
                      )}
                      <p className="text-xs text-muted-foreground mt-1">
                        {formatDistanceToNow(new Date(conv.updated_at), { addSuffix: true })}
                      </p>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <button
                          type="button"
                          aria-label="Conversation options"
                          className="flex-shrink-0 w-6 h-6 flex items-center justify-center rounded text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:bg-white/10"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <MoreVertical className="w-4 h-4" />
                        </button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" sideOffset={4} className="z-[200]">
                        <DropdownMenuItem
                          onClick={(e) => {
                            e.stopPropagation();
                            if (onFavorite) onFavorite(conv.id);
                          }}
                        >
                          <Star className="w-4 h-4" />
                          Favorite
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={(e) => {
                            e.stopPropagation();
                            setRenamingId(conv.id);
                            setRenameValue(conv.title || 'New Conversation');
                          }}
                        >
                          <Pencil className="w-4 h-4" />
                          Rename
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="text-error focus:text-error focus:bg-error/10"
                          onClick={(e) => {
                            e.stopPropagation();
                            onDelete(conv.id);
                          }}
                        >
                          <Trash2 className="w-4 h-4" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                ))
              )}
            </div>
          </ScrollArea>
        </>
      )}
    </div>
  );
}
