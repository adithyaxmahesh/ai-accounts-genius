import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

interface GeneratedForm {
  id: string;
  tax_form_templates: {
    form_type: string;
    form_year: number;
    irs_form_number: string;
  };
  created_at: string;
  form_data: any;
}

interface GeneratedFormsListProps {
  forms: GeneratedForm[] | null;
  isLoading: boolean;
  onDownload: (form: GeneratedForm) => void;
}

export const GeneratedFormsList = ({ 
  forms, 
  isLoading, 
  onDownload 
}: GeneratedFormsListProps) => {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold mb-4">Generated Forms</h3>
      <div className="space-y-4">
        {forms?.map((form) => (
          <div
            key={form.id}
            className="flex items-center justify-between p-4 border rounded-lg"
          >
            <div>
              <p className="font-medium">
                {form.tax_form_templates.form_type} ({form.tax_form_templates.form_year})
              </p>
              <p className="text-sm text-muted-foreground">
                Form {form.tax_form_templates.irs_form_number} - Generated on {new Date(form.created_at).toLocaleDateString()}
              </p>
            </div>
            <Button
              variant="outline"
              onClick={() => onDownload(form)}
            >
              Download
            </Button>
          </div>
        ))}
        {!forms?.length && (
          <p className="text-muted-foreground text-center py-4">
            No forms generated yet.
          </p>
        )}
      </div>
    </Card>
  );
};