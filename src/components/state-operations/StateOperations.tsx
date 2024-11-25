import { Card } from "@/components/ui/card";
import { MapPin } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/components/AuthProvider";

export const StateOperations = () => {
  const { session } = useAuth();

  const { data: operations, isLoading } = useQuery({
    queryKey: ['state-operations', session?.user.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('state_operations')
        .select('*')
        .eq('user_id', session?.user.id);
      
      if (error) throw error;
      return data;
    },
    enabled: !!session?.user.id
  });

  if (isLoading) {
    return (
      <Card className="p-6">
        <div className="flex items-center gap-2 mb-6">
          <MapPin className="h-6 w-6 text-primary" />
          <h2 className="text-xl font-semibold">State Operations</h2>
        </div>
        <div className="text-center text-muted-foreground">
          Loading state operations...
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <div className="flex items-center gap-2 mb-6">
        <MapPin className="h-6 w-6 text-primary" />
        <h2 className="text-xl font-semibold">State Operations</h2>
      </div>

      <div className="space-y-4">
        {operations?.map((operation) => (
          <div
            key={operation.id}
            className="p-4 bg-muted rounded-lg"
          >
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-medium">{operation.state}</h3>
              <span className={`text-sm px-2 py-1 rounded ${
                operation.compliance_status === 'compliant' 
                  ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                  : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
              }`}>
                {operation.compliance_status}
              </span>
            </div>
            <p className="text-sm text-muted-foreground">
              {operation.operation_type}
            </p>
            {operation.tax_implications && (
              <div className="mt-2 text-sm">
                <strong>Tax Implications:</strong>
                <pre className="mt-1 p-2 bg-muted rounded text-xs overflow-auto">
                  {JSON.stringify(operation.tax_implications, null, 2)}
                </pre>
              </div>
            )}
          </div>
        ))}

        {!operations?.length && (
          <div className="text-center text-muted-foreground">
            No state operations found. Add your first state operation to get started.
          </div>
        )}
      </div>
    </Card>
  );
};