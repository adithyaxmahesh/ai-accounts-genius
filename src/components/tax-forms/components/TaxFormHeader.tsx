import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

interface TaxFormHeaderProps {
  selectedTemplate: string | null;
  onGenerate: () => void;
  isGenerating: boolean;
}

export const TaxFormHeader = ({ 
  selectedTemplate, 
  onGenerate, 
  isGenerating 
}: TaxFormHeaderProps) => {
  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold mb-4">Generate New Tax Form</h3>
      <Button
        onClick={onGenerate}
        disabled={!selectedTemplate || isGenerating}
        className="w-full md:w-auto"
      >
        {isGenerating ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Generating...
          </>
        ) : (
          "Generate Form"
        )}
      </Button>
    </Card>
  );
};