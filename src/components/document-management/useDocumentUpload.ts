import { useState, useEffect } from "react";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/components/AuthProvider";
import { ProcessedDocument } from "../types";
import { extractDateFromDocument } from "./documentUtils";
import { useDocumentProcessing } from "./useDocumentProcessing";
import { useDocumentFetching } from "./useDocumentFetching";

export const useDocumentUpload = () => {
  const { toast } = useToast();
  const { session } = useAuth();
  const [uploading, setUploading] = useState(false);
  const [processing, setProcessing] = useState(false);
  
  const { 
    documents,
    fetchDocuments,
    setDocuments 
  } = useDocumentFetching(session?.user.id);
  
  const {
    processDocument,
    processTaxDocument
  } = useDocumentProcessing();

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
      
      if (isTaxDocument(file.name)) {
        await processTaxDocument(docRecord.id);
      }

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
    try {
      setProcessing(true);
      await processDocument(documentId);
      await fetchDocuments();
      
      toast({
        title: "Analysis Complete",
        description: "Document has been successfully analyzed.",
      });
    } catch (error) {
      console.error("Analysis error:", error);
      toast({
        title: "Analysis Failed",
        description: "Failed to analyze document. Please try again.",
        variant: "destructive",
      });
    } finally {
      setProcessing(false);
    }
  };

  const handleDeleteDocument = async (documentId: string) => {
    try {
      const documentToDelete = documents.find(doc => doc.id === documentId);
      if (!documentToDelete) return;

      // Delete from storage
      const { error: storageError } = await supabase.storage
        .from("documents")
        .remove([documentToDelete.storage_path]);

      if (storageError) throw storageError;

      // Delete from database
      const { error: dbError } = await supabase
        .from('processed_documents')
        .delete()
        .eq('id', documentId);

      if (dbError) throw dbError;

      setDocuments(prev => prev.filter(doc => doc.id !== documentId));

      toast({
        title: "Document Deleted",
        description: "Document has been successfully deleted.",
      });
    } catch (error) {
      console.error("Delete error:", error);
      toast({
        title: "Delete Failed",
        description: "Failed to delete document. Please try again.",
        variant: "destructive",
      });
    }
  };

  const isTaxDocument = (fileName: string): boolean => {
    const taxDocPatterns = ['w2', '1099', 'tax', 'return', 'schedule'];
    const lowerFileName = fileName.toLowerCase();
    return taxDocPatterns.some(pattern => lowerFileName.includes(pattern));
  };

  return {
    uploading,
    processing,
    documents,
    handleFileUpload,
    processDocument,
    analyzeDocument,
    handleDeleteDocument
  };
};