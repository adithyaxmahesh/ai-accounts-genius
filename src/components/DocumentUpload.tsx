import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Upload, Loader2, Brain } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { DocumentList } from "./document-management/DocumentList";
import { useDocumentUpload } from "./document-management/useDocumentUpload";

export const DocumentUpload = ({ className }: { className?: string }) => {
  const { toast } = useToast();
  const { 
    uploading, 
    processing, 
    documents, 
    handleFileUpload, 
    analyzeDocument,
    handleDeleteDocument
  } = useDocumentUpload();

  return (
    <Card className={`p-4 glass-card ${className}`}>
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold">Document Processing</h3>
        <div className="relative">
          <input
            type="file"
            id="document-upload"
            name="document-upload"
            className="hidden"
            accept=".pdf,.doc,.docx,.txt,.csv,.xls,.xlsx,.jpg,.jpeg,.png,.gif"
            onChange={handleFileUpload}
            disabled={uploading || processing}
            aria-label="Upload document"
          />
          <label htmlFor="document-upload">
            <Button
              className="hover-scale text-sm px-3 py-1 h-8"
              disabled={uploading || processing}
              asChild
            >
              <div>
                {uploading ? (
                  <Loader2 className="h-3 w-3 mr-2 animate-spin" />
                ) : processing ? (
                  <Brain className="h-3 w-3 mr-2 animate-pulse" />
                ) : (
                  <Upload className="h-3 w-3 mr-2" />
                )}
                {uploading ? "Uploading..." : processing ? "Analyzing..." : "Upload Documents"}
              </div>
            </Button>
          </label>
        </div>
      </div>

      <DocumentList 
        documents={documents}
        processing={processing}
        onAnalyze={analyzeDocument}
        onDelete={handleDeleteDocument}
      />
    </Card>
  );
};