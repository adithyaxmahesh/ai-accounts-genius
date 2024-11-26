import { Button } from "@/components/ui/button";
import { Brain, Calculator, Receipt } from "lucide-react";

interface ChatSuggestionsProps {
  onSuggestionClick?: (suggestion: string) => void;
}

export const ChatSuggestions = ({ onSuggestionClick }: ChatSuggestionsProps) => {
  const suggestions = [
    {
      icon: Calculator,
      text: "How can I optimize my monthly budget?",
      category: "budgeting"
    },
    {
      icon: Receipt,
      text: "What tax deductions am I eligible for?",
      category: "tax"
    },
    {
      icon: Brain,
      text: "Analyze my investment portfolio risk",
      category: "investment"
    }
  ];

  return (
    <div className="p-4 space-y-4">
      <p className="text-muted-foreground text-center">
        Get started with some suggestions:
      </p>
      <div className="grid gap-2">
        {suggestions.map((suggestion, index) => {
          const Icon = suggestion.icon;
          return (
            <Button
              key={index}
              variant="outline"
              className="flex items-center gap-2 w-full justify-start"
              onClick={() => onSuggestionClick?.(suggestion.text)}
            >
              <Icon className="h-4 w-4" />
              <span className="text-sm">{suggestion.text}</span>
            </Button>
          );
        })}
      </div>
    </div>
  );
};