import { Button } from "@/components/ui/button";
import { Database } from "@/integrations/supabase/types";

type Template = Database['public']['Tables']['tax_form_templates']['Row'];

interface TaxFormTemplateListProps {
  templates: Template[] | null;
  selectedTemplate: string | null;
  onSelectTemplate: (templateId: string) => void;
}

export const TaxFormTemplateList = ({ 
  templates, 
  selectedTemplate, 
  onSelectTemplate 
}: TaxFormTemplateListProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {templates?.map((template) => (
        <Button
          key={template.id}
          variant={selectedTemplate === template.id ? "default" : "outline"}
          onClick={() => onSelectTemplate(template.id)}
          className="justify-start"
        >
          {template.form_type} ({template.form_year})
        </Button>
      ))}
    </div>
  );
};