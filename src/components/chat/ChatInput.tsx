import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send, Loader2 } from "lucide-react";

interface ChatInputProps {
  query: string;
  loading: boolean;
  onQueryChange: (value: string) => void;
  onSubmit: () => void;
}

export const ChatInput = ({ query, loading, onQueryChange, onSubmit }: ChatInputProps) => {
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      onSubmit();
    }
  };

  return (
    <div className="flex gap-2">
      <Input
        placeholder="Ask about expenses, tax write-offs, or financial optimization..."
        value={query}
        onChange={(e) => onQueryChange(e.target.value)}
        onKeyPress={handleKeyPress}
        className="flex-1"
      />
      <Button onClick={onSubmit} disabled={loading}>
        {loading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Send className="h-4 w-4" />
        )}
      </Button>
    </div>
  );
};