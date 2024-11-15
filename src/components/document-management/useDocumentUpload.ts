import { useState, useEffect } from "react";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/components/AuthProvider";
import { ProcessedDocument } from "../types";

export const useDocumentUpload = () => {
  const { toast } = useToast();
  const { session } = useAuth();
  const [uploading, setUploading] = useState(false);
  const [documents, setDocuments] = useState<ProcessedDocument[]>([]);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    if (session?.user.id) {
      fetchDocuments();
    }
  }, [session?.user.id]);

  const fetchDocuments = async () => {
    if (!session?.user.id) return;

    try {
      const { data, error } = await supabase
        .from('processed_documents')
        .select('*')
        .eq('user_id', session.user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const formattedDocs: ProcessedDocument[] = data.map(doc => ({
        id: doc.id,
        name: doc.original_filename,
        status: doc.processing_status,
        confidence: doc.confidence_score || 0,
        uploadedAt: doc.created_at,
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

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      const file = event.target.files?.[0];
      if (!file) return;

      if (file.size > 100 * 1024 * 1024) {
        toast({
          title: "File Too Large",
          description: "Maximum file size is 100MB",
          variant: "destructive",
        });
        return;
      }

      setUploading(true);
      const fileName = `${Math.random()}.${file.name.split(".").pop()}`;
      
      const { error: uploadError } = await supabase.storage
        .from("documents")
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const { data: docRecord, error: dbError } = await supabase
        .from('processed_documents')
        .insert({
          user_id: session?.user.id,
          original_filename: file.name,
          storage_path: fileName,
          processing_status: 'uploaded',
          document_type: file.name.split(".").pop()
        })
        .select()
        .single();

      if (dbError) throw dbError;

      const newDoc: ProcessedDocument = {
        id: docRecord.id,
        name: file.name,
        status: "Uploaded",
        confidence: 0,
        uploadedAt: new Date().toISOString(),
        type: file.name.split(".").pop() || 'unknown',
        storage_path: fileName
      };

      setDocuments(prev => [newDoc, ...prev]);
      
      toast({
        title: "Upload Successful",
        description: "Your document has been uploaded and is ready for analysis.",
      });

    } catch (error) {
      console.error("Upload error:", error);
      toast({
        title: "Upload Failed",
        description: error instanceof Error ? error.message : "There was an error uploading your document.",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
      if (event.target) {
        event.target.value = '';
      }
    }
  };

  const analyzeDocument = async (documentId: string) => {
    setProcessing(true);
    try {
      const { data, error } = await supabase.functions.invoke('analyze-document', {
        body: { documentId }
      });

      if (error) throw error;

      toast({
        title: "Analysis Complete",
        description: "Document has been processed successfully",
      });

      setDocuments(prev => prev.map(doc => 
        doc.id === documentId 
          ? { 
              ...doc, 
              status: 'Analyzed',
              confidence: data?.confidence_score || 95
            }
          : doc
      ));
    } catch (error) {
      console.error("Error analyzing document:", error);
      toast({
        title: "Analysis Failed",
        description: error instanceof Error ? error.message : "There was an error analyzing your document.",
        variant: "destructive",
      });
    } finally {
      setProcessing(false);
    }
  };

  return {
    uploading,
    processing,
    documents,
    handleFileUpload,
    analyzeDocument
  };
};