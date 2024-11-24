import { useState } from "react";
import { useAuth } from "@/components/AuthProvider";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { Loader2 } from "lucide-react";

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

  const generateForm = useMutation({
    mutationFn: async (templateId: string) => {
      if (!session?.user?.id) return;

      const template = templates?.find(t => t.id === templateId);
      if (!template) throw new Error("Template not found");

      // Combine user data with tax analysis
      const formData = {
        user: {
          id: session.user.id,
          email: session.user.email,
        },
        tax_analysis: taxAnalysis,
        generated_at: new Date().toISOString(),
      };

      const { error } = await supabase
        .from('generated_tax_forms')
        .insert({
          user_id: session.user.id,
          template_id: templateId,
          form_data: formData,
        });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['generated-tax-forms'] });
      toast({
        title: "Tax Form Generated",
        description: "Your tax form has been generated successfully."
      });
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to generate tax form. Please try again."
      });
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

  if (templatesLoading || formsLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Generate New Tax Form</h3>
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {templates?.map((template) => (
              <Button
                key={template.id}
                variant={selectedTemplate === template.id ? "default" : "outline"}
                onClick={() => setSelectedTemplate(template.id)}
                className="justify-start"
              >
                {template.form_type} ({template.form_year})
              </Button>
            ))}
          </div>
          <Button
            onClick={() => selectedTemplate && generateForm.mutate(selectedTemplate)}
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
        <div className="space-y-4">
          {generatedForms?.map((form) => (
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
                onClick={() => {
                  // Download form data as JSON (in production, this would generate a PDF)
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
                }}
              >
                Download
              </Button>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};