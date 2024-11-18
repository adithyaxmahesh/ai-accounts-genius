import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Upload, Loader2, Brain } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { DocumentList } from "./DocumentList";
import { useDocumentUpload } from "./useDocumentUpload";
import { cn } from "@/lib/utils";
import { useState } from "react";

export const DocumentUpload = ({ className }: { className?: string }) => {
  const { toast } = useToast();
  const [isDragging, setIsDragging] = useState(false);
  const { 
    uploading, 
    processing, 
    documents, 
    handleFileUpload, 
    analyzeDocument,
    handleDeleteDocument 
  } = useDocumentUpload();

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);

    const file = e.dataTransfer.files[0];
    if (!file) return;

    // Create a new change event
    const event = {
      target: {
        files: [file]
      }
    } as unknown as React.ChangeEvent<HTMLInputElement>;

    handleFileUpload(event);
  };

  return (
    <Card 
      className={cn(
        "p-4 glass-card transition-colors", 
        isDragging && "border-primary border-2 bg-primary/5",
        className
      )}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold">Document Processing</h3>
        <div className="relative">
          <input
            type="file"
            id="file-upload"
            className="hidden"
            accept=".pdf,.doc,.docx,.txt,.csv,.xls,.xlsx,.jpg,.jpeg,.png,.gif"
            onChange={handleFileUpload}
            disabled={uploading || processing}
          />
          <label htmlFor="file-upload">
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

      {isDragging ? (
        <div className="text-center py-12 text-muted-foreground">
          Drop your file here to upload
        </div>
      ) : (
        <DocumentList 
          documents={documents}
          processing={processing}
          onAnalyze={analyzeDocument}
          onDelete={handleDeleteDocument}
        />
      )}
    </Card>
  );
};