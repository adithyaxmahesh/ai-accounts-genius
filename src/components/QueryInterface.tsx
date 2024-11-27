import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Brain } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/components/AuthProvider";
import { useQuery } from "@tanstack/react-query";
import { ScrollArea } from "@/components/ui/scroll-area";
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

  const { data: writeOffs } = useQuery({
    queryKey: ['write-offs', session?.user.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('write_offs')
        .select('*, tax_codes(*)')
        .eq('user_id', session?.user.id);
      
      if (error) throw error;
      return data;
    }
  });

  const { data: revenueRecords } = useQuery({
    queryKey: ['revenue-records', session?.user.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('revenue_records')
        .select('*')
        .eq('user_id', session?.user.id);
      
      if (error) throw error;
      return data;
    }
  });

  const { data: taxAnalysis } = useQuery({
    queryKey: ['tax-analysis', session?.user.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('tax_analysis')
        .select('*')
        .eq('user_id', session?.user.id)
        .order('created_at', { ascending: false })
        .limit(1);
      
      if (error) throw error;
      return data?.[0];
    }
  });

  const handleQuery = async () => {
    if (!query.trim()) {
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

    const userMessage = { type: 'user' as const, content: query };
    setChatHistory(prev => [...prev, userMessage]);
    
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('tax-chat', {
        body: { 
          message: query,
          userId: session?.user.id,
          context: {
            writeOffs,
            revenueRecords,
            taxAnalysis
          }
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
      
    } catch (error) {
      console.error("Error processing query:", error);
      toast({
        title: "Query Failed",
        description: "There was an error processing your query. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
      setQuery("");
    }
  };

  return (
    <Card className="max-w-3xl mx-auto">
      <div className="flex items-center gap-2 border-b p-4">
        <Brain className="h-5 w-5 text-primary" />
        <h2 className="text-lg font-semibold">AI Tax Assistant</h2>
      </div>

      <div className="flex flex-col h-[600px]">
        <ScrollArea className="flex-1 p-4">
          {chatHistory.length > 0 ? (
            <div className="space-y-px">
              {chatHistory.map((message, index) => (
                <ChatMessage key={index} {...message} />
              ))}
            </div>
          ) : (
            <ChatSuggestions />
          )}
        </ScrollArea>

        <div className="border-t p-4">
          <ChatInput
            query={query}
            loading={loading}
            onQueryChange={setQuery}
            onSubmit={handleQuery}
          />
        </div>
      </div>
    </Card>
  );
};
