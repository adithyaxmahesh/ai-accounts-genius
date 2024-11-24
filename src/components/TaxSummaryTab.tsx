import { useToast } from "@/components/ui/use-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/components/AuthProvider";
import { TaxSummaryCard } from "./tax-summary/TaxSummaryCard";
import { TaxSummarySelects } from "./tax-summary/TaxSummarySelects";
import { calculateTaxes } from "./tax-summary/TaxCalculationUtils";
import { DollarSign, Calculator, Building, MapPin } from "lucide-react";
import { Card } from "@/components/ui/card";
import { useState, useEffect } from "react";

interface TaxSummaryProps {
  audit?: any;
}

const TaxSummaryTab = ({ audit }: TaxSummaryProps) => {
  const { session } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedBusinessType, setSelectedBusinessType] = useState<string>('corporation');
  const [selectedState, setSelectedState] = useState<string>('California');

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

  useEffect(() => {
    if (businessInfo) {
      setSelectedBusinessType(businessInfo.business_type?.toLowerCase()?.replace(' ', '_') || 'corporation');
      setSelectedState(businessInfo.state || 'California');
    }
  }, [businessInfo]);

  const { data: taxAnalysis, isError } = useQuery({
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

  useEffect(() => {
    // Recalculate taxes whenever business type or state changes
    if (session?.user?.id) {
      updateTaxAnalysis.mutate({ 
        businessType: selectedBusinessType, 
        state: selectedState 
      });
    }
  }, [selectedBusinessType, selectedState]);

  const handleBusinessTypeChange = (value: string) => {
    setSelectedBusinessType(value);
  };

  const handleStateChange = (value: string) => {
    setSelectedState(value);
  };

  const {
    totalAmount = 0,
    deductions = 0,
    estimatedTax = 0,
    effectiveRate = 0,
    taxableIncome = 0,
    minimumTax = 800
  } = calculateTaxes(taxAnalysis, audit, selectedBusinessType, selectedState) || {};

  return (
    <div className="space-y-6">
      {/* Current Tax Configuration */}
      <Card className="p-4 bg-muted/50">
        <h3 className="text-lg font-semibold mb-4">Current Tax Configuration</h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">State:</span>
            <span className="font-medium">{selectedState}</span>
          </div>
          <div className="flex items-center gap-2">
            <Building className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">Business Type:</span>
            <span className="font-medium">{selectedBusinessType.replace('_', ' ')}</span>
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <TaxSummarySelects
          selectedBusinessType={selectedBusinessType}
          selectedState={selectedState}
          onBusinessTypeChange={handleBusinessTypeChange}
          onStateChange={handleStateChange}
        />

        <TaxSummaryCard
          icon={DollarSign}
          title="Total Revenue"
          value={`$${totalAmount.toLocaleString()}`}
          className="text-primary"
        />

        <TaxSummaryCard
          icon={DollarSign}
          title="Deductions"
          value={`$${deductions.toLocaleString()}`}
          className="text-green-500"
        />

        <TaxSummaryCard
          icon={DollarSign}
          title="Taxable Income"
          value={`$${taxableIncome.toLocaleString()}`}
          className="text-yellow-500"
        />

        <TaxSummaryCard
          icon={Calculator}
          title="Minimum Tax"
          value={`$${minimumTax.toLocaleString()}`}
          className="text-purple-500"
        />

        <TaxSummaryCard
          icon={DollarSign}
          title="Estimated Tax"
          value={`$${estimatedTax.toLocaleString()}`}
          className="text-red-500"
        />

        <TaxSummaryCard
          icon={DollarSign}
          title="Effective Rate"
          value={`${effectiveRate.toFixed(2)}%`}
          className="text-indigo-500"
        />
      </div>
    </div>
  );
};

export default TaxSummaryTab;
