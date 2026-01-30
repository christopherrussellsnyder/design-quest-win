import React from 'react';
import { Bot, User, Loader2, Copy, Check } from 'lucide-react';
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
}

export function ChatMessageList({ 
  messages, 
  isLoading, 
  messagesEndRef,
  onAction,
  onQuickSuggestion,
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
    <div className="p-4 space-y-6">
      {messages.map((message, index) => (
        <div
          key={message.id}
          className={cn(
            'flex gap-4 animate-fade-in group',
            message.role === 'user' ? 'flex-row-reverse' : ''
          )}
        >
          {/* Avatar */}
          <Tooltip>
            <TooltipTrigger asChild>
              <div className={cn(
                'flex-shrink-0 w-9 h-9 rounded-full flex items-center justify-center',
                message.role === 'user' 
                  ? 'bg-primary text-primary-foreground' 
                  : 'bg-gradient-to-br from-primary/20 to-primary/5 text-primary'
              )}>
                {message.role === 'user' ? (
                  <User className="w-5 h-5" />
                ) : (
                  <Bot className="w-5 h-5" />
                )}
              </div>
            </TooltipTrigger>
            <TooltipContent side={message.role === 'user' ? 'left' : 'right'}>
              {formatDistanceToNow(message.createdAt, { addSuffix: true })}
            </TooltipContent>
          </Tooltip>

          {/* Message bubble */}
          <div className={cn(
            'flex-1 max-w-[80%] rounded-2xl px-4 py-3 relative',
            message.role === 'user' 
              ? 'bg-primary text-primary-foreground ml-auto' 
              : 'bg-muted'
          )}>
            {/* Copy button for assistant messages */}
            {message.role === 'assistant' && message.content && (
              <Button
                variant="ghost"
                size="icon"
                className={cn(
                  'absolute top-2 right-2 h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity',
                  'text-muted-foreground hover:text-foreground'
                )}
                onClick={() => handleCopy(message.id, message.content)}
              >
                {copiedId === message.id ? (
                  <Check className="w-3.5 h-3.5 text-green-500" />
                ) : (
                  <Copy className="w-3.5 h-3.5" />
                )}
              </Button>
            )}

            {/* Attachments */}
            {message.attachments?.map((att, i) => (
              <div key={i} className="mb-3">
                {att.type === 'image' && (
                  <img 
                    src={att.url} 
                    alt={att.name || 'Attachment'} 
                    className="max-w-full rounded-lg max-h-64 object-contain"
                  />
                )}
              </div>
            ))}
            
            {/* Message content with markdown */}
            <div className={cn(
              'prose prose-sm max-w-none',
              message.role === 'user' 
                ? 'prose-invert' 
                : 'dark:prose-invert',
              '[&_ul]:my-2 [&_ol]:my-2 [&_li]:my-0.5',
              '[&_p]:my-1.5 first:[&_p]:mt-0 last:[&_p]:mb-0',
              '[&_h1]:text-lg [&_h2]:text-base [&_h3]:text-sm',
              '[&_code]:bg-background/50 [&_code]:px-1 [&_code]:rounded',
              '[&_pre]:bg-background/50 [&_pre]:p-3 [&_pre]:rounded-lg',
              '[&_strong]:font-semibold',
              '[&_a]:text-primary [&_a]:underline'
            )}>
              <ReactMarkdown>{message.content}</ReactMarkdown>
            </div>

            {/* Action buttons for assistant messages */}
            {message.role === 'assistant' && message.content && index === messages.length - 1 && !isLoading && (
              <ActionButtons 
                content={message.content} 
                onAction={onAction}
              />
            )}
          </div>
        </div>
      ))}
      
      {/* Loading indicator */}
      {isLoading && messages[messages.length - 1]?.role === 'user' && (
        <div className="flex gap-4">
          <div className="flex-shrink-0 w-9 h-9 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
            <Bot className="w-5 h-5 text-primary" />
          </div>
          <div className="bg-muted rounded-2xl px-4 py-3">
            <div className="flex items-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin text-primary" />
              <span className="text-sm text-muted-foreground">AI is thinking...</span>
            </div>
          </div>
        </div>
      )}

      {/* Quick suggestion chips after assistant response */}
      {showQuickSuggestions && onQuickSuggestion && (
        <div className="pl-13 ml-9">
          <QuickSuggestionChips onChipClick={onQuickSuggestion} />
        </div>
      )}
      
      <div ref={messagesEndRef} />
    </div>
  );
}
