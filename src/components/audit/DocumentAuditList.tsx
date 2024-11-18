import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, Download, Search } from "lucide-react";
import { format } from "date-fns";
import { ProcessedDocument } from "@/components/document-management/types";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";

interface DocumentAuditListProps {
  documents: ProcessedDocument[];
  onViewDetails: (documentId: string) => void;
}

export const DocumentAuditList = ({ documents, onViewDetails }: DocumentAuditListProps) => {
  const { toast } = useToast();

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
              onClick={() => onViewDetails(doc.id)}
            >
              <Search className="h-4 w-4" />
            </Button>
          </div>
        </Card>
      ))}
    </div>
  );
};