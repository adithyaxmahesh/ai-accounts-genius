import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { FileText, Image, FileSpreadsheet, Brain, Download, Receipt } from "lucide-react";
import { ProcessedDocument } from "./types";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { useReceiptAnalysis } from "./document-management/useReceiptAnalysis";

interface DocumentListProps {
  documents: ProcessedDocument[];
  processing: boolean;
  onAnalyze: (documentId: string) => Promise<void>;
  onDelete: (documentId: string) => void;
}

export const DocumentList = ({ documents, processing, onAnalyze, onDelete }: DocumentListProps) => {
  const { toast } = useToast();
  const { analyzing, analyzeReceipt } = useReceiptAnalysis();

  // Sort documents by document date if available, otherwise by upload date
  const sortedDocuments = [...documents].sort((a, b) => {
    const dateA = a.documentDate ? new Date(a.documentDate) : new Date(a.uploadedAt);
    const dateB = b.documentDate ? new Date(b.documentDate) : new Date(b.uploadedAt);
    return dateB.getTime() - dateA.getTime();
  });

  const getFileIcon = (fileName: string) => {
    const ext = fileName.split('.').pop()?.toLowerCase();
    switch (ext) {
      case 'csv':
      case 'xls':
      case 'xlsx':
        return <FileSpreadsheet className="h-4 w-4 mr-2 text-green-500" />;
      case 'jpg':
      case 'jpeg':
      case 'png':
      case 'gif':
        return <Image className="h-4 w-4 mr-2 text-blue-500" />;
      default:
        return <FileText className="h-4 w-4 mr-2 text-muted-foreground" />;
    }
  };

  const isImageFile = (fileName: string) => {
    const ext = fileName.split('.').pop()?.toLowerCase();
    return ['jpg', 'jpeg', 'png', 'gif'].includes(ext || '');
  };

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

  const handleAnalyzeDocument = async (documentId: string) => {
    try {
      await onAnalyze(documentId);
      toast({
        title: "Analysis Complete",
        description: "Document has been analyzed successfully",
      });
    } catch (error) {
      console.error("Analysis error:", error);
      toast({
        title: "Analysis Failed",
        description: "Failed to analyze document. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleAnalyzeReceipt = async (doc: ProcessedDocument) => {
    if (!isImageFile(doc.name)) {
      toast({
        title: "Invalid File Type",
        description: "Only image files can be analyzed as receipts",
        variant: "destructive",
      });
      return;
    }

    try {
      await analyzeReceipt(doc.id);
      toast({
        title: "Receipt Analysis Complete",
        description: "Receipt has been analyzed successfully",
      });
    } catch (error) {
      console.error("Receipt analysis error:", error);
      toast({
        title: "Analysis Failed",
        description: "Failed to analyze receipt. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="overflow-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Document Name</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Confidence</TableHead>
            <TableHead>Document Date</TableHead>
            <TableHead>Upload Date</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sortedDocuments.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="text-center text-muted-foreground">
                No documents uploaded yet
              </TableCell>
            </TableRow>
          ) : (
            sortedDocuments.map((doc) => (
              <TableRow key={doc.id}>
                <TableCell className="font-medium">
                  <div className="flex items-center">
                    {getFileIcon(doc.name)}
                    {doc.name}
                  </div>
                </TableCell>
                <TableCell>
                  <span className={`px-2 py-1 rounded-full text-sm ${
                    doc.status === 'Analyzed' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100' :
                    doc.status === 'Processing' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100' :
                    'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100'
                  }`}>
                    {doc.status}
                  </span>
                </TableCell>
                <TableCell>{doc.confidence ? `${doc.confidence}%` : 'N/A'}</TableCell>
                <TableCell>
                  {doc.documentDate ? new Date(doc.documentDate).toLocaleDateString() : 'N/A'}
                </TableCell>
                <TableCell>
                  {new Date(doc.uploadedAt).toLocaleDateString()}
                </TableCell>
                <TableCell>
                  <div className="flex space-x-2">
                    {isImageFile(doc.name) && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleAnalyzeReceipt(doc)}
                        disabled={analyzing || doc.status === 'Processing'}
                      >
                        <Receipt className={`h-4 w-4 ${analyzing ? 'animate-pulse' : ''}`} />
                      </Button>
                    )}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleAnalyzeDocument(doc.id)}
                      disabled={processing || doc.status === 'Analyzed' || doc.status === 'Processing'}
                    >
                      <Brain className={`h-4 w-4 ${processing ? 'animate-pulse' : ''}`} />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDownload(doc)}
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
};