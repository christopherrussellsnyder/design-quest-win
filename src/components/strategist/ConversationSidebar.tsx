import React from 'react';
import { Plus, MessageSquare, ChevronLeft, ChevronRight, Sparkles, MoreHorizontal, Trash2, Star, Pencil, FolderPlus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
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
}: ConversationSidebarProps) {
  return (
    <div className={cn(
      'relative flex flex-col bg-muted/30 border-r transition-all duration-300',
      isOpen ? 'w-72' : 'w-0'
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
                      'group flex items-center gap-2 p-3 rounded-lg cursor-pointer transition-all',
                      'hover:bg-muted',
                      selectedId === conv.id && 'bg-muted ring-1 ring-primary/20'
                    )}
                    onClick={() => onSelect(conv.id)}
                  >
                    <MessageSquare className="w-4 h-4 flex-shrink-0 text-muted-foreground" />
                    <div className="flex-1 min-w-0 mr-1">
                      <p className="text-sm font-medium truncate">
                        {conv.title || 'New Conversation'}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(conv.updated_at), { addSuffix: true })}
                      </p>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 flex-shrink-0 text-muted-foreground hover:text-foreground hover:bg-accent opacity-100"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <MoreHorizontal className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" sideOffset={4} className="w-48 z-[100] bg-popover border shadow-md">
                        <DropdownMenuItem disabled className="text-muted-foreground">
                          <Star className="w-4 h-4 mr-2" />
                          Star
                        </DropdownMenuItem>
                        <DropdownMenuItem disabled className="text-muted-foreground">
                          <Pencil className="w-4 h-4 mr-2" />
                          Rename
                        </DropdownMenuItem>
                        <DropdownMenuItem disabled className="text-muted-foreground">
                          <FolderPlus className="w-4 h-4 mr-2" />
                          Add to project
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
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
