import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Upload } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

export const DocumentUpload = () => {
  const { toast } = useToast();

  const handleUpload = () => {
    toast({
      title: "Document Upload Started",
      description: "Processing your documents with AI OCR...",
    });
  };

  return (
    <Card className="glass-card p-6">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-semibold">Document Processing</h3>
        <Button onClick={handleUpload} className="hover-scale">
          <Upload className="h-4 w-4 mr-2" />
          Upload Documents
        </Button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="p-4 bg-muted rounded-lg">
            <p className="font-semibold">Invoice #{i}</p>
            <p className="text-sm text-muted-foreground">Status: Processed</p>
            <p className="text-sm text-muted-foreground">Confidence: 98%</p>
          </div>
        ))}
      </div>
    </Card>
  );
};