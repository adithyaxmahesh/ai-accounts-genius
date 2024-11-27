import { useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { ProcessedDocument } from "../types";
import { useQuery, useQueryClient } from "@tanstack/react-query";

export const useDocumentUpload = () => {
  const [uploading, setUploading] = useState(false);
  const [processing, setProcessing] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: documents = [] } = useQuery({
    queryKey: ['documents'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      const { data, error } = await supabase
        .from('processed_documents')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      return data.map((doc: any) => ({
        id: doc.id,
        name: doc.original_filename,
        status: doc.processing_status,
        confidence: doc.confidence_score,
        documentDate: doc.document_date,
        uploadedAt: doc.created_at,
        storage_path: doc.storage_path
      }));
    }
  });

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      const file = event.target.files?.[0];
      if (!file) return;

      setUploading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No user logged in');

      // Upload file to storage
      const fileExt = file.name.split('.').pop();
      const filePath = `${user.id}/${crypto.randomUUID()}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from('documents')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // Create document record
      const { data: doc, error: insertError } = await supabase
        .from('processed_documents')
        .insert({
          user_id: user.id,
          original_filename: file.name,
          storage_path: filePath,
          processing_status: 'Pending',
          document_type: fileExt
        })
        .select()
        .single();

      if (insertError) throw insertError;

      toast({
        title: "Upload Successful",
        description: "Document has been uploaded successfully.",
      });

      // Refresh documents list
      queryClient.invalidateQueries({ queryKey: ['documents'] });

    } catch (error) {
      console.error('Upload error:', error);
      toast({
        title: "Upload Failed",
        description: error instanceof Error ? error.message : "Failed to upload document",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
      if (event.target) event.target.value = '';
    }
  };

  const analyzeDocument = async (documentId: string) => {
    try {
      setProcessing(true);

      // Update status to Processing
      await supabase
        .from('processed_documents')
        .update({ processing_status: 'Processing' })
        .eq('id', documentId);

      // Call the analyze-document function
      const { data, error } = await supabase.functions.invoke('analyze-document', {
        body: { documentId }
      });

      if (error) throw error;

      // Update document with analysis results
      await supabase
        .from('processed_documents')
        .update({
          processing_status: 'Analyzed',
          confidence_score: data.confidence_score || 0,
          extracted_data: data.extracted_data || {},
          document_date: data.document_date || null
        })
        .eq('id', documentId);

      // Refresh documents list
      queryClient.invalidateQueries({ queryKey: ['documents'] });

    } catch (error) {
      console.error('Analysis error:', error);
      toast({
        title: "Analysis Failed",
        description: error instanceof Error ? error.message : "Failed to analyze document",
        variant: "destructive",
      });

      // Reset status on error
      await supabase
        .from('processed_documents')
        .update({ processing_status: 'Pending' })
        .eq('id', documentId);

    } finally {
      setProcessing(false);
    }
  };

  const handleDeleteDocument = async (documentId: string) => {
    try {
      const doc = documents.find(d => d.id === documentId);
      if (!doc) return;

      // Delete file from storage
      const { error: storageError } = await supabase.storage
        .from('documents')
        .remove([doc.storage_path]);

      if (storageError) throw storageError;

      // Delete document record
      const { error: deleteError } = await supabase
        .from('processed_documents')
        .delete()
        .eq('id', documentId);

      if (deleteError) throw deleteError;

      toast({
        title: "Document Deleted",
        description: "Document has been deleted successfully.",
      });

      // Refresh documents list
      queryClient.invalidateQueries({ queryKey: ['documents'] });

    } catch (error) {
      console.error('Delete error:', error);
      toast({
        title: "Delete Failed",
        description: error instanceof Error ? error.message : "Failed to delete document",
        variant: "destructive",
      });
    }
  };

  return {
    uploading,
    processing,
    documents,
    handleFileUpload,
    analyzeDocument,
    handleDeleteDocument
  };
};