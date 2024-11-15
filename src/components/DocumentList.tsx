import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { FileText, Image, FileSpreadsheet, Brain } from "lucide-react";
import { ProcessedDocument } from "./types";

interface DocumentListProps {
  documents: ProcessedDocument[];
  processing: boolean;
  onAnalyze: (documentId: string) => void;
}

export const DocumentList = ({ documents, processing, onAnalyze }: DocumentListProps) => {
  const getFileIcon = (fileName: string) => {
    const ext = fileName.split('.').pop()?.toLowerCase();
    switch (ext) {
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

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Document Name</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Confidence</TableHead>
          <TableHead>Upload Date</TableHead>
          <TableHead>Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {documents.map((doc) => (
          <TableRow key={doc.id}>
            <TableCell className="font-medium">
              <div className="flex items-center">
                {getFileIcon(doc.name)}
                {doc.name}
              </div>
            </TableCell>
            <TableCell>{doc.status}</TableCell>
            <TableCell>{doc.confidence}%</TableCell>
            <TableCell>
              {new Date(doc.uploadedAt).toLocaleDateString()}
            </TableCell>
            <TableCell>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onAnalyze(doc.id)}
                disabled={processing || doc.status === 'Analyzed'}
              >
                {processing ? (
                  <Brain className="h-4 w-4 animate-pulse" />
                ) : (
                  <Brain className="h-4 w-4" />
                )}
              </Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};