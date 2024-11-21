import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { TaxCode } from "@/components/types";

export const TaxCodesList = () => {
  const { data: taxCodes } = useQuery<TaxCode[]>({
    queryKey: ['tax-codes'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('tax_codes')
        .select('*')
        .order('code', { ascending: true });

      if (error) throw error;
      return data;
    },
  });

  return (
    <div className="space-y-4">
      {taxCodes?.map((taxCode) => (
        <Card key={taxCode.id} className="p-4">
          <h4 className="font-semibold">{taxCode.code}</h4>
          <p className="text-sm text-muted-foreground">{taxCode.description}</p>
          <span className="text-sm font-medium bg-blue-100 text-blue-800 px-2.5 py-0.5 rounded-full">
            {taxCode.category}
          </span>
        </Card>
      ))}
    </div>
  );
};