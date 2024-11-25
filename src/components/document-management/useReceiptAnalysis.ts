import { useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";

export const useReceiptAnalysis = () => {
  const { toast } = useToast();
  const [analyzing, setAnalyzing] = useState(false);

  const analyzeReceipt = async (documentId: string) => {
    setAnalyzing(true);
    try {
      const { data, error } = await supabase.functions.invoke('analyze-receipt', {
        body: { documentId }
      });

      if (error) throw error;

      toast({
        title: "Receipt Analyzed",
        description: "The receipt has been processed and categorized successfully.",
      });

      return data;
    } catch (error) {
      console.error("Error analyzing receipt:", error);
      toast({
        title: "Analysis Failed",
        description: "Failed to analyze the receipt. Please try again.",
        variant: "destructive",
      });
    } finally {
      setAnalyzing(false);
    }
  };

  return {
    analyzing,
    analyzeReceipt
  };
};