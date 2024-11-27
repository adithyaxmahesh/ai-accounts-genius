import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Upload, Loader2, Brain } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { DocumentList } from "./document-management/DocumentList";
import { useDocumentUpload } from "./document-management/useDocumentUpload";
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
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX;
    const y = e.clientY;
    
    if (
      x <= rect.left ||
      x >= rect.right ||
      y <= rect.top ||
      y >= rect.bottom
    ) {
      setIsDragging(false);
    }
  };

  const handleDrop = async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = Array.from(e.dataTransfer.files);
    if (files.length === 0) return;

    const file = files[0];

    const syntheticEvent = {
      target: {
        files: [file],
        value: ''  
      }
    } as unknown as React.ChangeEvent<HTMLInputElement>;

    await handleFileUpload(syntheticEvent);
  };

  return (
    <Card 
      className={cn(
        "p-4 glass-card transition-colors relative min-h-[200px]", 
        isDragging && "border-primary border-2 bg-primary/5",
        className
      )}
      onDragOver={handleDragOver}
      onDragEnter={handleDragEnter}
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
        <div className="absolute inset-0 flex items-center justify-center bg-primary/5 rounded-lg border-2 border-dashed border-primary">
          <div className="text-center text-muted-foreground">
            <Upload className="h-8 w-8 mx-auto mb-2 text-primary" />
            Drop your file here to upload
          </div>
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
