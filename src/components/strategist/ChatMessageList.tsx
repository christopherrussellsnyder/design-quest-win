import React from 'react';
import { Bot, User, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Message } from '@/pages/AIStrategist';
import ReactMarkdown from 'react-markdown';
import { formatDistanceToNow } from 'date-fns';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface ChatMessageListProps {
  messages: Message[];
  isLoading: boolean;
  messagesEndRef: React.RefObject<HTMLDivElement>;
}

export function ChatMessageList({ 
  messages, 
  isLoading, 
  messagesEndRef 
}: ChatMessageListProps) {
  return (
    <div className="p-4 space-y-6">
      {messages.map((message) => (
        <div
          key={message.id}
          className={cn(
            'flex gap-4 animate-fade-in',
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
            'flex-1 max-w-[80%] rounded-2xl px-4 py-3',
            message.role === 'user' 
              ? 'bg-primary text-primary-foreground ml-auto' 
              : 'bg-muted'
          )}>
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
              '[&_pre]:bg-background/50 [&_pre]:p-3 [&_pre]:rounded-lg'
            )}>
              <ReactMarkdown>{message.content}</ReactMarkdown>
            </div>
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
      
      <div ref={messagesEndRef} />
    </div>
  );
}
