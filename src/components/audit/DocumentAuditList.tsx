import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, Download, Search } from "lucide-react";
import { format } from "date-fns";
import { ProcessedDocument } from "@/components/document-management/types";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { useState } from "react";

interface DocumentAuditListProps {
  documents: ProcessedDocument[];
  onViewDetails: (documentId: string) => void;
}

export const DocumentAuditList = ({ documents, onViewDetails }: DocumentAuditListProps) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState<string | null>(null);

  const handleDownload = async (doc: ProcessedDocument) => {
    try {
      const { data, error } = await supabase.storage
        .from('documents')
        .download(doc.storage_path);

      if (error) throw error;

      const url = URL.createObjectURL(data);
      const a = document.createElement('a');
      a.href = url;
      a.download = doc.name;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Download error:", error);
      toast({
        title: "Download Failed",
        description: "Failed to download the document",
        variant: "destructive",
      });
    }
  };

  const handleViewDetails = async (documentId: string) => {
    setLoading(documentId);
    try {
      // First check if an audit already exists for this document
      const { data: existingAudit, error: auditError } = await supabase
        .from('audit_reports')
        .select('id')
        .eq('document_id', documentId)
        .single();

      if (auditError && auditError.code !== 'PGRST116') {
        throw auditError;
      }

      if (existingAudit?.id) {
        onViewDetails(existingAudit.id);
        return;
      }

      // Create a new audit for this document
      const { data: newAudit, error: createError } = await supabase
        .from('audit_reports')
        .insert({
          title: `Document Analysis Audit ${format(new Date(), 'MM/dd/yyyy')}`,
          description: 'Document analysis and verification',
          status: 'pending',
          document_id: documentId,
          user_id: (await supabase.auth.getUser()).data.user?.id
        })
        .select()
        .single();

      if (createError) throw createError;

      if (newAudit) {
        onViewDetails(newAudit.id);
      }
    } catch (error) {
      console.error("Error handling document view:", error);
      toast({
        title: "Error",
        description: "Failed to create audit for document",
        variant: "destructive",
      });
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {documents.map((doc) => (
        <Card key={doc.id} className="p-4 hover:shadow-lg transition-shadow">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center space-x-3">
              <FileText className="h-6 w-6 text-blue-500" />
              <div>
                <h3 className="font-medium truncate max-w-[200px]">{doc.name}</h3>
                <p className="text-sm text-muted-foreground">
                  {format(new Date(doc.uploadedAt), 'MMM d, yyyy')}
                </p>
              </div>
            </div>
          </div>
          
          <div className="flex justify-end space-x-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleDownload(doc)}
            >
              <Download className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleViewDetails(doc.id)}
              disabled={loading === doc.id}
            >
              <Search className={`h-4 w-4 ${loading === doc.id ? 'animate-spin' : ''}`} />
            </Button>
          </div>
        </Card>
      ))}
    </div>
  );
};