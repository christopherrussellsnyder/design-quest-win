import React from 'react';
import { User, Loader2, Copy, Check, Volume2, RotateCcw } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Message } from '@/pages/AIStrategist';
import ReactMarkdown from 'react-markdown';
import { formatDistanceToNow } from 'date-fns';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Button } from '@/components/ui/button';
import { ActionButtons } from './ActionButtons';
import { QuickSuggestionChips } from './ConversationStarters';
import { useState } from 'react';

interface ChatMessageListProps {
  messages: Message[];
  isLoading: boolean;
  messagesEndRef: React.RefObject<HTMLDivElement>;
  onAction?: (action: string, data?: any) => void;
  onQuickSuggestion?: (prompt: string) => void;
  hasPendingStrategy?: boolean;
}

export const ChatMessageList = React.memo(function ChatMessageList({ 
  messages, 
  isLoading, 
  messagesEndRef,
  onAction,
  onQuickSuggestion,
  hasPendingStrategy,
}: ChatMessageListProps) {
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const lastMessage = messages[messages.length - 1];
  const showQuickSuggestions = lastMessage?.role === 'assistant' && !isLoading;

  const handleCopy = async (messageId: string, content: string) => {
    try {
      await navigator.clipboard.writeText(content);
      setCopiedId(messageId);
      setTimeout(() => setCopiedId(null), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  return (
    <div className="p-6 space-y-5 max-w-4xl mx-auto">
      {messages.map((message, index) => (
        <div
          key={message.id}
          className={cn(
            'flex gap-3 animate-fade-in group',
            message.role === 'user' ? 'justify-end' : 'justify-start'
          )}
        >
          {/* Assistant avatar */}
          {message.role === 'assistant' && (
            <div className="flex-shrink-0 w-8 h-8 rounded-xl bg-gradient-to-br from-primary/30 via-primary/20 to-transparent border border-primary/20 flex items-center justify-center mt-1 shadow-sm overflow-hidden">
              <img src="/korex-logo-transparent.svg" alt="Korex" className="w-5 h-5 object-contain" />
            </div>
          )}

          {/* Message bubble */}
          <div className={cn(
            'relative max-w-[75%] group/msg',
            message.role === 'user' ? 'order-first' : ''
          )}>
            <div className={cn(
              'px-4 py-3 relative',
              message.role === 'user'
                ? 'bg-gradient-to-br from-primary to-arasaka-red-dark text-primary-foreground rounded-2xl rounded-br-md shadow-md shadow-primary/20'
                : 'bg-secondary/80 border border-subtle rounded-2xl rounded-bl-md backdrop-blur-sm'
            )}>
              {/* Attachments */}
              {message.attachments?.map((att, i) => (
                <div key={i} className="mb-3">
                  {att.type === 'image' && (
                    <img 
                      src={att.url} 
                      alt={att.name || 'Attachment'} 
                      className="max-w-full rounded-xl max-h-64 object-contain"
                    />
                  )}
                </div>
              ))}
              
              {/* Message content with markdown */}
              <div className={cn(
                'prose prose-sm max-w-none',
                message.role === 'user' 
                  ? 'prose-invert [&_p]:text-primary-foreground' 
                  : 'dark:prose-invert',
                '[&_ul]:my-2 [&_ol]:my-2 [&_li]:my-0.5',
                '[&_p]:my-1.5 first:[&_p]:mt-0 last:[&_p]:mb-0',
                '[&_h1]:text-lg [&_h2]:text-base [&_h3]:text-sm',
                '[&_code]:bg-background/50 [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:rounded-md [&_code]:text-xs',
                '[&_pre]:bg-background/50 [&_pre]:p-3 [&_pre]:rounded-xl [&_pre]:border [&_pre]:border-subtle',
                '[&_strong]:font-semibold',
                '[&_a]:text-primary [&_a]:underline [&_a]:underline-offset-2'
              )}>
                <ReactMarkdown>{message.content}</ReactMarkdown>
              </div>

              {/* Action buttons for assistant messages */}
              {message.role === 'assistant' && message.content && index === messages.length - 1 && !isLoading && (
                <ActionButtons 
                  content={message.content} 
                  onAction={onAction}
                  hasPendingStrategy={hasPendingStrategy}
                />
              )}
            </div>

            {/* Message toolbar (copy, etc) - appears on hover */}
            {message.role === 'assistant' && message.content && (
              <div className={cn(
                'flex items-center gap-1 mt-1.5 opacity-0 group-hover/msg:opacity-100 transition-opacity duration-200'
              )}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      className="h-7 w-7 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
                      onClick={() => handleCopy(message.id, message.content)}
                    >
                      {copiedId === message.id ? (
                        <Check className="w-3.5 h-3.5 text-success" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </TooltipTrigger>
                  <TooltipContent side="bottom" className="text-xs">Copy</TooltipContent>
                </Tooltip>
                <span className="text-[10px] text-muted-foreground/50 ml-1">
                  {formatDistanceToNow(message.createdAt, { addSuffix: true })}
                </span>
              </div>
            )}

            {/* Timestamp for user messages */}
            {message.role === 'user' && (
              <div className="flex justify-end mt-1">
                <span className="text-[10px] text-muted-foreground/50">
                  {formatDistanceToNow(message.createdAt, { addSuffix: true })}
                </span>
              </div>
            )}
          </div>

          {/* User avatar */}
          {message.role === 'user' && (
            <div className="flex-shrink-0 w-8 h-8 rounded-xl bg-gradient-to-br from-primary to-arasaka-red-dark flex items-center justify-center mt-1 shadow-sm shadow-primary/20">
              <User className="w-4 h-4 text-primary-foreground" />
            </div>
          )}
        </div>
      ))}
      
      {/* Loading indicator */}
      {isLoading && messages[messages.length - 1]?.role === 'user' && (
        <div className="flex gap-3 animate-fade-in">
          <div className="flex-shrink-0 w-8 h-8 rounded-xl bg-gradient-to-br from-primary/30 via-primary/20 to-transparent border border-primary/20 flex items-center justify-center overflow-hidden">
            <img src="/korex-logo-transparent.svg" alt="Korex" className="w-5 h-5 object-contain" />
          </div>
          <div className="bg-secondary/80 border border-subtle rounded-2xl rounded-bl-md px-4 py-3 backdrop-blur-sm">
            <div className="flex items-center gap-3">
              <div className="flex gap-1">
                <span className="w-2 h-2 rounded-full bg-primary/60 animate-bounce [animation-delay:0ms]" />
                <span className="w-2 h-2 rounded-full bg-primary/60 animate-bounce [animation-delay:150ms]" />
                <span className="w-2 h-2 rounded-full bg-primary/60 animate-bounce [animation-delay:300ms]" />
              </div>
              <span className="text-sm text-muted-foreground">Thinking...</span>
            </div>
          </div>
        </div>
      )}

      {/* Quick suggestion chips after assistant response */}
      {showQuickSuggestions && onQuickSuggestion && (
        <div className="pl-11">
          <QuickSuggestionChips onChipClick={onQuickSuggestion} />
        </div>
      )}
      
      <div ref={messagesEndRef} />
    </div>
  );
});