import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/components/AuthProvider";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export const useTaxFormGeneration = () => {
  const { session } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: templates, isLoading: templatesLoading } = useQuery({
    queryKey: ['tax-form-templates'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('tax_form_templates')
        .select('*')
        .order('form_type');
      
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
            form_year,
            irs_form_number,
            filing_requirements
          )
        `)
        .eq('user_id', session.user.id)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    }
  });

  const generateForm = useMutation({
    mutationFn: async (templateId: string) => {
      if (!session?.user?.id || !businessInfo) {
        throw new Error("Please complete your business information first");
      }

      const formData = {
        user: {
          id: session.user.id,
          email: session.user.email,
        },
        business: businessInfo,
        generated_at: new Date().toISOString(),
      };

      const { error } = await supabase
        .from('generated_tax_forms')
        .insert({
          user_id: session.user.id,
          template_id: templateId,
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
    },
    onError: (error: Error) => {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to generate tax form. Please try again."
      });
    }
  });

  return {
    templates,
    templatesLoading,
    businessInfo,
    generatedForms,
    formsLoading,
    generateForm
  };
};