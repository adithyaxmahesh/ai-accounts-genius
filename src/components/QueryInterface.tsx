import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Brain, Calculator, Loader2 } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/components/AuthProvider";
import { useQuery } from "@tanstack/react-query";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { ChatMessage } from "./chat/ChatMessage";
import { ChatSuggestions } from "./chat/ChatSuggestions";
import { ChatInput } from "./chat/ChatInput";

interface ChatMessage {
  type: 'user' | 'assistant';
  content: string;
  category?: string;
}

export const QueryInterface = () => {
  const { toast } = useToast();
  const { session } = useAuth();
  const [query, setQuery] = useState("");
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(false);

  const { data: taxAnalysis } = useQuery({
    queryKey: ['tax-analysis', session?.user.id],
    queryFn: async () => {
      if (!session?.user.id) return null;
      const { data, error } = await supabase
        .from('tax_analysis')
        .select('*')
        .eq('user_id', session.user.id)
        .order('created_at', { ascending: false })
        .limit(1);
      
      if (error) throw error;
      return data?.[0];
    },
    enabled: !!session?.user.id
  });

  const handleQuery = async (inputQuery: string = query) => {
    if (!inputQuery.trim()) {
      toast({
        title: "Empty Query",
        description: "Please enter a question or request",
        variant: "destructive",
      });
      return;
    }

    if (!session?.user?.id) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to use the tax assistant",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    const userMessage = { type: 'user' as const, content: inputQuery };
    setChatHistory(prev => [...prev, userMessage]);
    setQuery("");
    
    try {
      const { data, error } = await supabase.functions.invoke('tax-chat', {
        body: { 
          message: inputQuery,
          userId: session?.user.id,
        }
      });

      if (error) throw error;

      if (!data?.answer) {
        throw new Error('No response received from the AI');
      }

      const assistantMessage = { 
        type: 'assistant' as const, 
        content: data.answer,
        category: data.category 
      };
      setChatHistory(prev => [...prev, assistantMessage]);
      
    } catch (error: any) {
      console.error("Error processing query:", error);
      toast({
        title: "Query Failed",
        description: error.message || "There was an error processing your query. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="p-6 glass-card">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Brain className="h-6 w-6 text-primary" />
          <h2 className="text-xl font-semibold">AI Tax Assistant</h2>
        </div>
        {taxAnalysis && (
          <Badge variant="outline" className="flex items-center gap-1">
            <Calculator className="h-4 w-4" />
            Last Analysis: {new Date(taxAnalysis.created_at).toLocaleDateString()}
          </Badge>
        )}
      </div>

      <div className="space-y-4">
        <ScrollArea className="h-[400px] pr-4 border rounded-lg">
          {chatHistory.length > 0 ? (
            <div className="space-y-4 p-4">
              {chatHistory.map((message, index) => (
                <ChatMessage key={index} {...message} />
              ))}
              {loading && (
                <div className="flex items-center gap-2 text-muted-foreground p-3">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Processing your request...
                </div>
              )}
            </div>
          ) : (
            <ChatSuggestions onSuggestionClick={handleQuery} />
          )}
        </ScrollArea>

        <ChatInput
          query={query}
          loading={loading}
          onQueryChange={setQuery}
          onSubmit={() => handleQuery()}
        />
      </div>
    </Card>
  );
};