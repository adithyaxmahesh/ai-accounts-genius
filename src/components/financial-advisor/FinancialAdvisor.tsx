import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Brain } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/components/AuthProvider";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

interface AdviceMessage {
  type: 'user' | 'assistant';
  content: string;
  category?: string;
}

export const FinancialAdvisor = () => {
  const { toast } = useToast();
  const { session } = useAuth();
  const [query, setQuery] = useState("");
  const [messages, setMessages] = useState<AdviceMessage[]>([]);
  const [loading, setLoading] = useState(false);

  const handleAdviceRequest = async () => {
    if (!query.trim()) {
      toast({
        title: "Empty Query",
        description: "Please enter your financial question",
        variant: "destructive",
      });
      return;
    }

    if (!session?.user?.id) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to use the financial advisor",
        variant: "destructive",
      });
      return;
    }

    const userMessage = { type: 'user' as const, content: query };
    setMessages(prev => [...prev, userMessage]);
    
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('financial-ai', {
        body: { 
          message: query,
          userId: session?.user.id,
        }
      });

      if (error) throw error;

      const assistantMessage = { 
        type: 'assistant' as const, 
        content: data.advice,
        category: data.category 
      };
      setMessages(prev => [...prev, assistantMessage]);
      
    } catch (error) {
      console.error("Error getting financial advice:", error);
      toast({
        title: "Request Failed",
        description: "Unable to get financial advice. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
      setQuery("");
    }
  };

  return (
    <Card className="p-6">
      <div className="flex items-center gap-2 mb-4">
        <Brain className="h-6 w-6 text-primary" />
        <h2 className="text-xl font-semibold">AI Financial Advisor</h2>
      </div>

      <div className="space-y-4">
        <ScrollArea className="h-[300px] pr-4 border rounded-lg">
          <div className="space-y-4 p-4">
            {messages.length > 0 ? (
              messages.map((message, index) => (
                <div
                  key={index}
                  className={`p-4 rounded-lg ${
                    message.type === 'user'
                      ? 'bg-primary/10 ml-auto max-w-[80%]'
                      : 'bg-muted mr-auto max-w-[80%]'
                  }`}
                >
                  <p className="text-sm">{message.content}</p>
                  {message.category && (
                    <span className="text-xs text-muted-foreground mt-1 block">
                      Category: {message.category}
                    </span>
                  )}
                </div>
              ))
            ) : (
              <div className="text-center text-muted-foreground p-4">
                <p>Ask me anything about your finances!</p>
                <p className="text-sm mt-2">
                  Examples:
                  <br />
                  "How can I improve my cash flow?"
                  <br />
                  "What tax deductions should I consider?"
                  <br />
                  "How should I plan for business expansion?"
                </p>
              </div>
            )}
          </div>
        </ScrollArea>

        <div className="flex gap-2">
          <Textarea
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Ask for financial advice..."
            className="flex-1"
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleAdviceRequest();
              }
            }}
          />
          <Button 
            onClick={handleAdviceRequest}
            disabled={loading}
          >
            {loading ? "Thinking..." : "Ask"}
          </Button>
        </div>
      </div>
    </Card>
  );
};