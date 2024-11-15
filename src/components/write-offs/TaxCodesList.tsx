import { Card } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const TaxCodesList = () => {
  const { data: taxCodes } = useQuery({
    queryKey: ['taxCodes'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('tax_codes')
        .select('*')
        .order('state', { ascending: true })
        .order('code', { ascending: true });
      
      if (error) throw error;
      return data;
    }
  });

  // Group tax codes by state
  const groupedTaxCodes = taxCodes?.reduce((acc, code) => {
    if (!acc[code.state]) {
      acc[code.state] = [];
    }
    acc[code.state].push(code);
    return acc;
  }, {} as Record<string, typeof taxCodes>);

  return (
    <Card className="p-6 glass-card">
      <h3 className="text-xl font-semibold mb-4">Available Tax Codes by State</h3>
      <div className="space-y-6">
        {groupedTaxCodes && Object.entries(groupedTaxCodes).map(([state, codes]) => (
          <div key={state} className="space-y-2">
            <h4 className="text-lg font-semibold">{state}</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {codes.map((code) => (
                <div key={code.id} className="p-4 bg-muted rounded-lg">
                  <p className="font-semibold">{code.code}</p>
                  <p className="text-sm text-muted-foreground">{code.description}</p>
                  <p className="text-sm text-muted-foreground mt-2">
                    Category: {code.expense_category}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Type: {code.deduction_type}
                  </p>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
};