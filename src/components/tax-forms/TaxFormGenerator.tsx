import { useState } from "react";
import { TaxFormTemplateList } from "./TaxFormTemplateList";
import { TaxFormHeader } from "./components/TaxFormHeader";
import { GeneratedFormsList } from "./components/GeneratedFormsList";
import { useTaxFormGeneration } from "./hooks/useTaxFormGeneration";
import { jsPDF } from "jspdf";

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
    const doc = new jsPDF();
    
    // Add form header
    doc.setFontSize(16);
    doc.text(`${form.tax_form_templates.form_type} (${form.tax_form_templates.form_year})`, 20, 20);
    doc.text(`Form ${form.tax_form_templates.irs_form_number}`, 20, 30);
    
    // Add form data
    doc.setFontSize(12);
    let yPosition = 50;
    
    Object.entries(form.form_data).forEach(([key, value]: [string, any]) => {
      if (typeof value === 'object') {
        doc.text(`${key}:`, 20, yPosition);
        yPosition += 10;
        Object.entries(value).forEach(([subKey, subValue]) => {
          doc.text(`  ${subKey}: ${subValue}`, 30, yPosition);
          yPosition += 10;
        });
      } else {
        doc.text(`${key}: ${value}`, 20, yPosition);
        yPosition += 10;
      }
    });

    // Save the PDF
    doc.save(`tax-form-${form.tax_form_templates.irs_form_number}-${form.tax_form_templates.form_year}.pdf`);
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