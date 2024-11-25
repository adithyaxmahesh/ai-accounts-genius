import { useState } from "react";
import { useAuth } from "@/components/AuthProvider";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { Loader2 } from "lucide-react";
import { TaxFormList } from "./TaxFormList";
import { TaxFormTemplateList } from "./TaxFormTemplateList";

export const TaxFormGenerator = () => {
  const { session } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);

  const { data: templates, isLoading: templatesLoading } = useQuery({
    queryKey: ['tax-form-templates'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('tax_form_templates')
        .select('*');
      
      if (error) throw error;
      return data;
    }
  });

  const { data: businessInfo } = useQuery({
    queryKey: ['business-information', session?.user?.id],
    queryFn: async () => {
      if (!session?.user?.id) return null;
      
      const { data, error } = await supabase
        .from('business_information')
        .select('*')
        .eq('user_id', session.user.id)
        .single();
      
      if (error) throw error;
      return data;
    }
  });

  const { data: taxAnalysis } = useQuery({
    queryKey: ['tax-analysis', session?.user?.id],
    queryFn: async () => {
      if (!session?.user?.id) return null;
      
      const { data, error } = await supabase
        .from('tax_analysis')
        .select('*')
        .eq('user_id', session.user.id)
        .single();
      
      if (error) throw error;
      return data;
    }
  });

  const { data: generatedForms, isLoading: formsLoading } = useQuery({
    queryKey: ['generated-tax-forms', session?.user?.id],
    queryFn: async () => {
      if (!session?.user?.id) return [];
      
      const { data, error } = await supabase
        .from('generated_tax_forms')
        .select(`
          *,
          tax_form_templates (
            form_type,
            form_year
          )
        `)
        .eq('user_id', session.user.id)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    }
  });

  const generateForm = useMutation({
    mutationFn: async () => {
      if (!session?.user?.id || !businessInfo) {
        throw new Error("Please complete your business information first");
      }

      if (!selectedTemplate) {
        throw new Error("Please select a form template");
      }

      // Combine user data with tax analysis and business information
      const formData = {
        user: {
          id: session.user.id,
          email: session.user.email,
        },
        business: businessInfo,
        tax_analysis: taxAnalysis,
        generated_at: new Date().toISOString(),
      };

      const { error } = await supabase
        .from('generated_tax_forms')
        .insert({
          user_id: session.user.id,
          template_id: selectedTemplate,
          form_data: formData,
          status: 'draft'
        });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['generated-tax-forms'] });
      toast({
        title: "Tax Form Generated",
        description: "Your tax form has been generated successfully."
      });
      setSelectedTemplate(null);
    },
    onError: (error: Error) => {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to generate tax form. Please try again."
      });
    }
  });

  const handleDownload = (form: any) => {
    const blob = new Blob([JSON.stringify(form.form_data, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `tax-form-${form.tax_form_templates.form_type}-${form.tax_form_templates.form_year}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (templatesLoading || formsLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!businessInfo) {
    return (
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Generate New Tax Form</h3>
        <p className="text-muted-foreground">
          Please complete your business information in settings before generating tax forms.
        </p>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Generate New Tax Form</h3>
        <div className="space-y-4">
          <TaxFormTemplateList
            templates={templates}
            selectedTemplate={selectedTemplate}
            onSelectTemplate={setSelectedTemplate}
          />
          <Button
            onClick={() => generateForm.mutate()}
            disabled={!selectedTemplate || generateForm.isPending}
            className="w-full md:w-auto"
          >
            {generateForm.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generating...
              </>
            ) : (
              "Generate Form"
            )}
          </Button>
        </div>
      </Card>

      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Generated Forms</h3>
        <TaxFormList 
          generatedForms={generatedForms} 
          onDownload={handleDownload}
        />
      </Card>
    </div>
  );
};

export default TaxFormGenerator;