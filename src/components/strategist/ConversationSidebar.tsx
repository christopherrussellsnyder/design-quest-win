import React, { useState } from 'react';
import { Plus, MessageSquare, ChevronLeft, ChevronRight, Sparkles, MoreHorizontal, Trash2, Pencil, Star } from 'lucide-react';
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
      'relative flex flex-col bg-muted/30 border-r transition-all duration-300',
      isOpen ? 'w-80' : 'w-0'
    )}>
      {/* Toggle button */}
      <Button
        variant="ghost"
        size="icon"
        className={cn(
          'absolute -right-4 top-4 z-20 h-8 w-8 rounded-full border bg-background shadow-md',
          !isOpen && 'right-[-48px]'
        )}
        onClick={onToggle}
      >
        {isOpen ? <ChevronLeft className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
      </Button>

      {isOpen && (
        <>
          {/* Header */}
          <div className="p-4 border-b">
            <div className="flex items-center gap-2 mb-4">
              <div className="p-2 rounded-lg bg-primary/10">
                <Sparkles className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h2 className="font-semibold text-sm">AI Strategist</h2>
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
                  <div className="animate-pulse space-y-2">
                    {[1, 2, 3].map(i => (
                      <div key={i} className="h-12 bg-muted rounded-md" />
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
                      'flex items-center gap-2 p-3 rounded-lg cursor-pointer transition-all',
                      'hover:bg-muted',
                      selectedId === conv.id && 'bg-muted ring-1 ring-primary/20'
                    )}
                    onClick={() => onSelect(conv.id)}
                  >
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <button
                          type="button"
                          aria-label="Conversation options"
                          className="flex-shrink-0 p-1 rounded text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <MoreHorizontal className="w-4 h-4" />
                        </button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="start" sideOffset={4} className="w-44 z-[200] bg-popover border shadow-lg">
                        <DropdownMenuItem
                          onClick={(e) => {
                            e.stopPropagation();
                            if (onFavorite) onFavorite(conv.id);
                          }}
                        >
                          <Star className="w-4 h-4 mr-2" />
                          Favorite
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={(e) => {
                            e.stopPropagation();
                            setRenamingId(conv.id);
                            setRenameValue(conv.title || 'New Conversation');
                          }}
                        >
                          <Pencil className="w-4 h-4 mr-2" />
                          Rename
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="text-destructive focus:text-destructive focus:bg-destructive/10"
                          onClick={(e) => {
                            e.stopPropagation();
                            onDelete(conv.id);
                          }}
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                    <MessageSquare className="w-4 h-4 flex-shrink-0 text-muted-foreground" />
                    <div className="flex-1 min-w-0">
                      {renamingId === conv.id ? (
                        <input
                          autoFocus
                          className="text-sm font-medium w-full bg-background border rounded px-1 py-0.5"
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
                        <p className="text-sm font-medium truncate">
                          {conv.title || 'New Conversation'}
                        </p>
                      )}
                      <p className="text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(conv.updated_at), { addSuffix: true })}
                      </p>
                    </div>
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
