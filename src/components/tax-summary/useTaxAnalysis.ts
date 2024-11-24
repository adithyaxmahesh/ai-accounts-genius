import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/components/AuthProvider";

export const useTaxAnalysis = (selectedBusinessType: string, selectedState: string) => {
  const { session } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: businessInfo } = useQuery({
    queryKey: ['business-info', session?.user?.id],
    queryFn: async () => {
      if (!session?.user?.id) return null;
      
      const { data, error } = await supabase
        .from('business_information')
        .select('*')
        .eq('user_id', session.user.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        toast({
          variant: "destructive",
          title: "Error fetching business information",
          description: error.message
        });
        return null;
      }
      return data;
    }
  });

  const { data: taxAnalysis } = useQuery({
    queryKey: ['tax-analysis', session?.user?.id, selectedBusinessType, selectedState],
    queryFn: async () => {
      if (!session?.user?.id) return null;
      
      try {
        const { data, error } = await supabase
          .from('tax_analysis')
          .select('*')
          .eq('user_id', session.user.id)
          .eq('analysis_type', 'summary')
          .order('created_at', { ascending: false })
          .limit(1)
          .single();

        if (error) {
          if (error.code === 'PGRST116') {
            return null;
          }
          toast({
            variant: "destructive",
            title: "Error fetching tax analysis",
            description: error.message
          });
          return null;
        }
        return data;
      } catch (error: any) {
        toast({
          variant: "destructive",
          title: "Error fetching tax analysis",
          description: error.message
        });
        return null;
      }
    },
    initialData: null
  });

  const updateTaxAnalysis = useMutation({
    mutationFn: async (values: { businessType: string; state: string }) => {
      if (!session?.user?.id) return;
      
      try {
        const { error } = await supabase
          .from('tax_analysis')
          .upsert({
            user_id: session.user.id,
            analysis_type: 'summary',
            jurisdiction: values.state,
            recommendations: {
              business_type: values.businessType,
              state: values.state
            }
          });

        if (error) throw error;
      } catch (error: any) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to update settings. Please try again."
        });
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ 
        queryKey: ['tax-analysis', session?.user?.id, selectedBusinessType, selectedState] 
      });
      toast({
        title: "Settings Updated",
        description: "Your tax analysis settings have been saved."
      });
    }
  });

  return {
    businessInfo,
    taxAnalysis,
    updateTaxAnalysis
  };
};