import { Badge } from "@/components/ui/badge";
import { MessageSquare, Bot } from "lucide-react";

interface ChatMessageProps {
  type: 'user' | 'assistant';
  content: string;
  category?: string;
}

export const ChatMessage = ({ type, content, category }: ChatMessageProps) => {
  return (
    <div className={`flex gap-3 ${type === 'user' ? 'bg-muted/50' : 'bg-background'} p-6`}>
      <div className="flex-shrink-0">
        {type === 'user' ? (
          <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center">
            <MessageSquare className="h-4 w-4 text-primary-foreground" />
          </div>
        ) : (
          <div className="h-8 w-8 rounded-full bg-accent flex items-center justify-center">
            <Bot className="h-4 w-4 text-accent-foreground" />
          </div>
        )}
      </div>
      <div className="flex-1 space-y-2">
        {category && (
          <Badge variant="outline" className="mb-2">
            {category}
          </Badge>
        )}
        <p className="text-sm leading-relaxed whitespace-pre-wrap">{content}</p>
      </div>
    </div>
  );
};