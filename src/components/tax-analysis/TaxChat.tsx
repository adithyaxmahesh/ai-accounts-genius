import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { Send, Bot, User } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/components/AuthProvider";

export const TaxChat = () => {
  const { session } = useAuth();
  const { toast } = useToast();
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const sendMessage = async () => {
    if (!message.trim()) return;

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('tax-chat', {
        body: { message, userId: session?.user.id }
      });

      if (error) throw error;

      toast({
        title: "Response Received",
        description: "The AI has processed your question.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to process your question. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
      setMessage("");
    }
  };

  return (
    <Card className="p-6">
      <div className="flex items-center gap-2 mb-4">
        <Bot className="h-5 w-5 text-primary" />
        <h3 className="text-lg font-semibold">Tax Assistant</h3>
      </div>

      <ScrollArea className="h-[400px] mb-4 border rounded-lg p-4">
        <div className="space-y-4">
          <div className="flex gap-2">
            <Bot className="h-6 w-6 text-primary" />
            <div className="bg-muted p-3 rounded-lg">
              Hello! I'm your AI tax assistant. How can I help you with your tax-related questions?
            </div>
          </div>
          {/* Chat messages would be mapped here */}
        </div>
      </ScrollArea>

      <div className="flex gap-2">
        <Textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Ask a tax-related question..."
          className="flex-1"
        />
        <Button 
          onClick={sendMessage}
          disabled={!message.trim() || loading}
          className="self-end"
        >
          <Send className="h-4 w-4" />
        </Button>
      </div>
    </Card>
  );
};