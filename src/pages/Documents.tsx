import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, FileText, Upload } from "lucide-react";
import { DocumentUpload } from "@/components/DocumentUpload";
import { DocumentAuditFilters } from "@/components/audit/DocumentAuditFilters";
import { DocumentAuditList } from "@/components/audit/DocumentAuditList";
import { useDocumentUpload } from "@/components/document-management/useDocumentUpload";
import { startOfYear, endOfYear, startOfQuarter, endOfQuarter } from "date-fns";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { ProcessedDocument } from "@/components/types";

const Documents = () => {
  const navigate = useNavigate();
  const { documents, handleFileUpload } = useDocumentUpload();
  const [filteredDocuments, setFilteredDocuments] = useState<ProcessedDocument[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    setFilteredDocuments(documents);
  }, [documents]);

  const handleFilterChange = async ({ timeframe, startDate, endDate }) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      let query = supabase
        .from('processed_documents')
        .select('*')
        .eq('user_id', user.id);

      if (timeframe === 'year' && startDate) {
        const year = startDate.getFullYear();
        query = query
          .gte('created_at', startOfYear(new Date(year, 0)).toISOString())
          .lte('created_at', endOfYear(new Date(year, 0)).toISOString());
      } else if (timeframe === 'quarter' && startDate) {
        query = query
          .gte('created_at', startOfQuarter(startDate).toISOString())
          .lte('created_at', endOfQuarter(startDate).toISOString());
      } else if (timeframe === 'custom' && startDate && endDate) {
        query = query
          .gte('created_at', startDate.toISOString())
          .lte('created_at', endDate.toISOString());
      }

      const { data, error } = await query.order('created_at', { ascending: false });

      if (error) throw error;

      const formattedDocs: ProcessedDocument[] = data.map(doc => ({
        id: doc.id,
        name: doc.original_filename,
        status: doc.processing_status,
        confidence: doc.confidence_score || 0,
        uploadedAt: doc.created_at,
        type: doc.document_type,
        storage_path: doc.storage_path,
        documentDate: doc.document_date
      }));

      setFilteredDocuments(formattedDocs);
    } catch (error) {
      console.error("Error filtering documents:", error);
      toast({
        title: "Error",
        description: "Failed to filter documents",
        variant: "destructive"
      });
    }
  };

  const handleViewDetails = (documentId: string) => {
    navigate(`/audit/${documentId}`);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="flex flex-col h-screen">
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center space-x-4">
            <Button 
              variant="ghost" 
              onClick={() => navigate('/dashboard')}
              className="hover-scale"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
            <h1 className="text-3xl font-bold">Document History</h1>
          </div>
        </div>

        <div className="flex-1 p-6 space-y-6 overflow-auto">
          <DocumentUpload className="w-full" />
          
          <Card className="p-6 w-full">
            <h2 className="text-xl font-semibold mb-4">Document Audit History</h2>
            <DocumentAuditFilters onFilterChange={handleFilterChange} />
            <DocumentAuditList 
              documents={filteredDocuments}
              onViewDetails={handleViewDetails}
            />
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Documents;