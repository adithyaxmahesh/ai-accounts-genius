import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";

export const useDocumentProcessing = () => {
  const { toast } = useToast();

  const processDocument = async (documentId: string) => {
    try {
      const { data, error } = await supabase.functions.invoke('analyze-document', {
        body: { documentId }
      });

      if (error) throw error;

      toast({
        title: "Analysis Complete",
        description: "Document has been processed successfully",
      });

      return data;
    } catch (error) {
      console.error("Error processing document:", error);
      toast({
        title: "Processing Failed",
        description: error instanceof Error ? error.message : "Failed to process document",
        variant: "destructive",
      });
      throw error;
    }
  };

  const processTaxDocument = async (documentId: string) => {
    try {
      const { data, error } = await supabase.functions.invoke('process-tax-document', {
        body: { documentId }
      });

      if (error) throw error;

      toast({
        title: "Tax Document Processed",
        description: "Your tax document has been analyzed and the data has been extracted for your tax return.",
      });

      return data;
    } catch (error) {
      console.error("Error processing tax document:", error);
      toast({
        title: "Processing Failed",
        description: error instanceof Error ? error.message : "Failed to process tax document",
        variant: "destructive",
      });
      throw error;
    }
  };

  return {
    processDocument,
    processTaxDocument
  };
};