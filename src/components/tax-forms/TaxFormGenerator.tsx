import { useState } from "react";
import { TaxFormTemplateList } from "./TaxFormTemplateList";
import { TaxFormHeader } from "./components/TaxFormHeader";
import { GeneratedFormsList } from "./components/GeneratedFormsList";
import { useTaxFormGeneration } from "./hooks/useTaxFormGeneration";

export const TaxFormGenerator = () => {
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const {
    templates,
    templatesLoading,
    businessInfo,
    generatedForms,
    formsLoading,
    generateForm
  } = useTaxFormGeneration();

  const handleDownload = (form: any) => {
    const blob = new Blob([JSON.stringify(form.form_data, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `tax-form-${form.tax_form_templates.irs_form_number}-${form.tax_form_templates.form_year}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (!businessInfo) {
    return (
      <div className="space-y-6">
        <TaxFormHeader
          selectedTemplate={selectedTemplate}
          onGenerate={() => {}}
          isGenerating={false}
        />
        <p className="text-muted-foreground text-center p-6">
          Please complete your business information in settings before generating tax forms.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <TaxFormHeader
        selectedTemplate={selectedTemplate}
        onGenerate={() => generateForm.mutate(selectedTemplate!)}
        isGenerating={generateForm.isPending}
      />
      
      <div className="space-y-4">
        <TaxFormTemplateList
          templates={templates}
          selectedTemplate={selectedTemplate}
          onSelectTemplate={setSelectedTemplate}
        />
      </div>

      <GeneratedFormsList
        forms={generatedForms}
        isLoading={formsLoading}
        onDownload={handleDownload}
      />
    </div>
  );
};

export default TaxFormGenerator;