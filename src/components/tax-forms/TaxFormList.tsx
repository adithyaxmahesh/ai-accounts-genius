import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Database } from "@/integrations/supabase/types";

type GeneratedForm = Database['public']['Tables']['generated_tax_forms']['Row'] & {
  tax_form_templates: Database['public']['Tables']['tax_form_templates']['Row'];
};

interface TaxFormListProps {
  generatedForms: GeneratedForm[] | null;
  onDownload: (form: GeneratedForm) => void;
}

export const TaxFormList = ({ generatedForms, onDownload }: TaxFormListProps) => {
  if (!generatedForms?.length) {
    return (
      <p className="text-muted-foreground">No forms generated yet.</p>
    );
  }

  return (
    <div className="space-y-4">
      {generatedForms.map((form) => (
        <div
          key={form.id}
          className="flex items-center justify-between p-4 border rounded-lg"
        >
          <div>
            <p className="font-medium">
              {form.tax_form_templates.form_type} ({form.tax_form_templates.form_year})
            </p>
            <p className="text-sm text-muted-foreground">
              Generated on {new Date(form.created_at).toLocaleDateString()}
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
    </div>
  );
};