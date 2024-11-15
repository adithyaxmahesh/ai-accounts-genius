import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Brain, Send, Loader2 } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/components/AuthProvider";

export const QueryInterface = () => {
  const { toast } = useToast();
  const { session } = useAuth();
  const [query, setQuery] = useState("");
  const [answer, setAnswer] = useState("");
  const [loading, setLoading] = useState(false);

  const handleQuery = async () => {
    if (!query.trim()) return;

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('analyze-query', {
        body: { query, userId: session?.user.id }
      });

      if (error) throw error;

      setAnswer(data.answer);
      toast({
        title: "Analysis Complete",
        description: "Your query has been processed",
      });
    } catch (error) {
      console.error("Error processing query:", error);
      toast({
        title: "Query Failed",
        description: "There was an error processing your query",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="p-6 glass-card">
      <div className="flex items-center gap-2 mb-4">
        <Brain className="h-6 w-6 text-primary" />
        <h2 className="text-xl font-semibold">AI Financial Assistant</h2>
      </div>

      <div className="space-y-4">
        <div className="flex gap-2">
          <Input
            placeholder="Ask anything about your finances..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleQuery()}
          />
          <Button onClick={handleQuery} disabled={loading}>
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </div>

        {answer && (
          <div className="p-4 bg-muted rounded-lg">
            <p className="whitespace-pre-wrap">{answer}</p>
          </div>
        )}
      </div>
    </Card>
  );
};