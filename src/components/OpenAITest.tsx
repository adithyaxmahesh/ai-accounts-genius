import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";

export const OpenAITest = () => {
  const { toast } = useToast();

  const testOpenAI = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('test-openai', {
        body: { test: true }
      });

      if (error) throw error;

      toast({
        title: "OpenAI Test Result",
        description: data?.message || "No response received",
      });

    } catch (error) {
      console.error('Error testing OpenAI:', error);
      toast({
        title: "Test Failed",
        description: error instanceof Error ? error.message : "Failed to test OpenAI connection",
        variant: "destructive",
      });
    }
  };

  return (
    <Button onClick={testOpenAI}>
      Test OpenAI Connection
    </Button>
  );
};