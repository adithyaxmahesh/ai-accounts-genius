import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/components/ui/use-toast";
import { Brain, Calculator, ChartBar, Coins, Receipt, Shield, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/components/AuthProvider";

const categories = [
  { id: 'budget', icon: Calculator, label: 'Budgeting' },
  { id: 'tax', icon: Receipt, label: 'Tax Planning' },
  { id: 'risk', icon: Shield, label: 'Risk Management' },
  { id: 'investment', icon: ChartBar, label: 'Investment' },
  { id: 'savings', icon: Coins, label: 'Savings' }
];

export const FinancialAdvisor = () => {
  const { toast } = useToast();
  const { session } = useAuth();
  const [query, setQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("budget");
  const [loading, setLoading] = useState(false);
  const [conversation, setConversation] = useState<Array<{ type: 'user' | 'ai', content: string }>>([]);

  const handleSubmit = async () => {
    if (!query.trim()) {
      toast({
        title: "Empty Query",
        description: "Please enter your question",
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

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('financial-ai', {
        body: {
          query,
          type: selectedCategory,
          userId: session?.user.id,
        }
      });

      if (error) throw error;

      if (!data?.answer) {
        throw new Error('No response received from the AI');
      }

      setConversation(prev => [
        ...prev,
        { type: 'user', content: query },
        { type: 'ai', content: data.answer }
      ]);
      setQuery("");
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: "Error",
        description: "Failed to process your request. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="p-6">
      <div className="flex items-center gap-2 mb-4">
        <Brain className="h-6 w-6 text-primary" />
        <h2 className="text-xl font-semibold">AI Financial Advisor</h2>
      </div>

      <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
        {categories.map(({ id, icon: Icon, label }) => (
          <Button
            key={id}
            variant={selectedCategory === id ? "default" : "outline"}
            className="flex items-center gap-2"
            onClick={() => setSelectedCategory(id)}
            disabled={loading}
          >
            <Icon className="h-4 w-4" />
            {label}
          </Button>
        ))}
      </div>

      <ScrollArea className="h-[400px] mb-4 border rounded-lg p-4">
        {conversation.length === 0 ? (
          <div className="text-center text-muted-foreground">
            <p>Ask me anything about your finances!</p>
            <p className="text-sm mt-2">Examples:</p>
            <ul className="text-sm mt-1 space-y-1">
              <li>"How can I optimize my monthly budget?"</li>
              <li>"What tax deductions am I eligible for?"</li>
              <li>"Analyze my investment portfolio risk"</li>
            </ul>
          </div>
        ) : (
          <div className="space-y-4">
            {conversation.map((msg, index) => (
              <div
                key={index}
                className={`flex gap-2 ${
                  msg.type === 'user' ? 'justify-end' : 'justify-start'
                }`}
              >
                <div
                  className={`p-3 rounded-lg max-w-[80%] ${
                    msg.type === 'user'
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted'
                  }`}
                >
                  {msg.content}
                </div>
              </div>
            ))}
          </div>
        )}
      </ScrollArea>

      <div className="flex gap-2">
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Ask about your finances..."
          onKeyPress={(e) => e.key === 'Enter' && !loading && handleSubmit()}
          disabled={loading}
        />
        <Button onClick={handleSubmit} disabled={loading}>
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
              Processing...
            </>
          ) : (
            "Ask"
          )}
        </Button>
      </div>
    </Card>
  );
};