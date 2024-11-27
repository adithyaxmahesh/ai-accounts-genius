import { Bot } from "lucide-react";

export const ChatSuggestions = () => {
  return (
    <div className="flex gap-3 p-6">
      <div className="flex-shrink-0">
        <div className="h-8 w-8 rounded-full bg-accent flex items-center justify-center">
          <Bot className="h-4 w-4 text-accent-foreground" />
        </div>
      </div>
      <div className="flex-1">
        <p className="text-sm text-muted-foreground">
          Hello! I'm your AI tax assistant. You can ask me questions about:
        </p>
        <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
          <li>• Tax deductions and write-offs</li>
          <li>• Business expense categorization</li>
          <li>• Tax planning strategies</li>
          <li>• Financial optimization tips</li>
        </ul>
      </div>
    </div>
  );
};