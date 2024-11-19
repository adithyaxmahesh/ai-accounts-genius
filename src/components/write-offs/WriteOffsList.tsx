import { Card } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { WriteOff } from "@/components/types";

interface WriteOffsListProps {
  userId: string;
}

export const WriteOffsList = ({ userId }: WriteOffsListProps) => {
  const { data: writeOffs, isLoading, error } = useQuery({
    queryKey: ['writeOffs', userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('write_offs')
        .select(`
          *,
          tax_codes:tax_codes!write_offs_tax_code_id_fkey!inner (
            id,
            code,
            description,
            category,
            deduction_type,
            created_at,
            state,
            expense_category
          )
        `)
        .eq('user_id', userId)
        .order('date', { ascending: false })
        .returns<WriteOff[]>();
      
      if (error) throw error;
      
      return data;
    },
    enabled: !!userId
  });

  if (isLoading) {
    return (
      <Card className="p-6 glass-card">
        <h3 className="text-xl font-semibold mb-4">Recent Write-Offs</h3>
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex justify-between items-center p-4 bg-muted rounded-lg">
              <div className="space-y-2">
                <Skeleton className="h-4 w-48" />
                <Skeleton className="h-3 w-32" />
                <Skeleton className="h-3 w-40" />
              </div>
              <div className="text-right space-y-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-3 w-20" />
                <Skeleton className="h-3 w-16" />
              </div>
            </div>
          ))}
        </div>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="p-6 glass-card">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Failed to load write-offs. Please try again later.
          </AlertDescription>
        </Alert>
      </Card>
    );
  }

  if (!writeOffs?.length) {
    return (
      <Card className="p-6 glass-card">
        <h3 className="text-xl font-semibold mb-4">Recent Write-Offs</h3>
        <p className="text-muted-foreground">No write-offs found. Add your first write-off to get started.</p>
      </Card>
    );
  }

  return (
    <Card className="p-6 glass-card">
      <h3 className="text-xl font-semibold mb-4">Recent Write-Offs</h3>
      <div className="space-y-4">
        {writeOffs.map((writeOff) => (
          <div key={writeOff.id} className="flex justify-between items-center p-4 bg-muted rounded-lg">
            <div>
              <p className="font-semibold">{writeOff.description}</p>
              {writeOff.tax_codes && (
                <>
                  <p className="text-sm text-muted-foreground">
                    {writeOff.tax_codes.state} - {writeOff.tax_codes.expense_category}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {writeOff.tax_codes.code} - {writeOff.tax_codes.description}
                  </p>
                </>
              )}
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