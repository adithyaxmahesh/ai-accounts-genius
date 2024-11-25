import { Badge } from "@/components/ui/badge";

interface ChatMessageProps {
  type: 'user' | 'assistant';
  content: string;
  category?: string;
}

export const ChatMessage = ({ type, content, category }: ChatMessageProps) => {
  return (
    <div
      className={`p-4 rounded-lg ${
        type === 'user'
          ? 'bg-primary text-primary-foreground ml-12'
          : 'bg-muted mr-12'
      }`}
    >
      {category && (
        <Badge className="mb-2" variant="secondary">
          {category}
        </Badge>
      )}
      <p className="whitespace-pre-wrap">{content}</p>
    </div>
  );
};