import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { ProcessedDocument } from "../types";
import { useToast } from "@/components/ui/use-toast";

export const useDocumentFetching = (userId: string | undefined) => {
  const [documents, setDocuments] = useState<ProcessedDocument[]>([]);
  const { toast } = useToast();

  const fetchDocuments = async () => {
    if (!userId) return;

    try {
      const { data, error } = await supabase
        .from('processed_documents')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const formattedDocs: ProcessedDocument[] = data.map(doc => ({
        id: doc.id,
        name: doc.original_filename,
        status: doc.processing_status,
        confidence: doc.confidence_score || 0,
        uploadedAt: doc.created_at,
        documentDate: doc.document_date || null,
        type: doc.document_type || 'unknown',
        storage_path: doc.storage_path
      }));

      setDocuments(formattedDocs);
    } catch (error) {
      console.error("Error fetching documents:", error);
      toast({
        title: "Error",
        description: "Failed to fetch document history",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    if (userId) {
      fetchDocuments();
    }
  }, [userId]);

  return {
    documents,
    fetchDocuments,
    setDocuments
  };
};