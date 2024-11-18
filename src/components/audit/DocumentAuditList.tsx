import { Button } from "@/components/ui/button";
import { FileText, Download, Search } from "lucide-react";
import { format } from "date-fns";
import { ProcessedDocument } from "@/components/types";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

interface DocumentAuditListProps {
  documents: ProcessedDocument[];
  onViewDetails: (documentId: string) => void;
}

export const DocumentAuditList = ({ documents, onViewDetails }: DocumentAuditListProps) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState<string | null>(null);
  const navigate = useNavigate();

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
        navigate(`/audit/${existingAudit.id}`);
        return;
      }

      toast({
        title: "Processing",
        description: "Analyzing document and creating audit report...",
      });

      // Create a new audit for this document
      const { data: newAudit, error: createError } = await supabase
        .from('audit_reports')
        .insert({
          title: `Document Analysis Audit ${format(new Date(), 'MM/dd/yyyy')}`,
          description: 'Document analysis and verification',
          status: 'pending',
          document_id: documentId,
          user_id: (await supabase.auth.getUser()).data.user?.id,
          findings: [],
          recommendations: [
            "Review document contents thoroughly",
            "Verify all financial calculations",
            "Check for compliance with regulations"
          ]
        })
        .select()
        .single();

      if (createError) throw createError;

      if (newAudit) {
        // Analyze the document and update the audit with findings
        const response = await fetch('/api/analyze-document', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ documentId }),
        });

        if (!response.ok) {
          throw new Error('Failed to analyze document');
        }

        const analysisResult = await response.json();
        
        // Update audit with analysis results
        const { error: updateError } = await supabase
          .from('audit_reports')
          .update({
            findings: analysisResult.findings || [],
            risk_level: analysisResult.risk_level || 'low',
            recommendations: analysisResult.recommendations || []
          })
          .eq('id', newAudit.id);

        if (updateError) throw updateError;
        
        toast({
          title: "Success",
          description: "Document analyzed successfully",
        });

        navigate(`/audit/${newAudit.id}`);
      }
    } catch (error) {
      console.error("Error handling document view:", error);
      toast({
        title: "Error",
        description: "Failed to analyze document",
        variant: "destructive",
      });
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {documents.map((doc) => (
        <div key={doc.id} className="p-4 border rounded-lg shadow-sm bg-white">
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
        </div>
      ))}
    </div>
  );
};