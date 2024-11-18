import { Card } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface WriteOffsListProps {
  userId: string;
}

type WriteOff = {
  id: string;
  description: string;
  amount: number;
  date: string;
  status: string;
  tax_codes: {
    code: string;
    description: string;
    category: string;
    deduction_type: string;
    state: string | null;
    expense_category: string | null;
  }[];
}

export const WriteOffsList = ({ userId }: WriteOffsListProps) => {
  const { data: writeOffs } = useQuery({
    queryKey: ['writeOffs', userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('write_offs')
        .select(`
          *,
          tax_codes (
            code,
            description,
            category,
            deduction_type,
            state,
            expense_category
          )
        `)
        .eq('user_id', userId)
        .order('date', { ascending: false });
      
      if (error) throw error;
      return data as WriteOff[];
    }
  });

  return (
    <Card className="p-6 glass-card">
      <h3 className="text-xl font-semibold mb-4">Recent Write-Offs</h3>
      <div className="space-y-4">
        {writeOffs?.map((writeOff) => (
          <div key={writeOff.id} className="flex justify-between items-center p-4 bg-muted rounded-lg">
            <div>
              <p className="font-semibold">{writeOff.description}</p>
              <p className="text-sm text-muted-foreground">
                {writeOff.tax_codes[0]?.state} - {writeOff.tax_codes[0]?.expense_category}
              </p>
              <p className="text-sm text-muted-foreground">
                {writeOff.tax_codes[0]?.code} - {writeOff.tax_codes[0]?.description}
              </p>
            </div>
            <div className="text-right">
              <p className="font-semibold">${Number(writeOff.amount).toLocaleString()}</p>
              <p className="text-sm text-muted-foreground">{new Date(writeOff.date).toLocaleDateString()}</p>
              <p className="text-sm text-muted-foreground capitalize">{writeOff.status}</p>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
};