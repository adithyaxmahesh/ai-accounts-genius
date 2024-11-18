import { useState } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";

export const useDocumentAnalysis = () => {
  const [analyzing, setAnalyzing] = useState(false);
  const { toast } = useToast();

  const analyzeDocument = async (documentId: string) => {
    setAnalyzing(true);
    try {
      const { data, error } = await supabase.functions.invoke('analyze-document', {
        body: { documentId }
      });

      if (error) throw error;

      toast({
        title: "Analysis Complete",
        description: `Found ${data.writeOffs?.length || 0} potential write-offs`,
      });

      return data;
    } catch (error) {
      console.error("Error analyzing document:", error);
      toast({
        title: "Analysis Failed",
        description: error instanceof Error ? error.message : "Failed to analyze document",
        variant: "destructive",
      });
    } finally {
      setAnalyzing(false);
    }
  };

  return {
    analyzing,
    analyzeDocument
  };
};