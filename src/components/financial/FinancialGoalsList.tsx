import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/components/AuthProvider";
import { format } from "date-fns";

export const FinancialGoalsList = () => {
  const { session } = useAuth();

  const { data: goals } = useQuery({
    queryKey: ['financial-goals', session?.user.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('financial_goals')
        .select('*')
        .eq('user_id', session?.user.id)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    }
  });

  return (
    <div className="space-y-4">
      {goals?.map((goal) => (
        <Card key={goal.id} className="p-4">
          <div className="flex justify-between items-start mb-2">
            <div>
              <h4 className="font-semibold">{goal.name}</h4>
              <p className="text-sm text-muted-foreground">
                Target: ${goal.target_amount.toLocaleString()} by {format(new Date(goal.end_date), "PPP")}
              </p>
            </div>
            <span className="text-sm font-medium bg-purple-100 text-purple-800 px-2.5 py-0.5 rounded-full">
              {goal.category}
            </span>
          </div>
          <Progress 
            value={(goal.current_amount / goal.target_amount) * 100} 
            className="h-2 mt-2"
          />
          <p className="text-sm text-muted-foreground mt-2">
            ${goal.current_amount.toLocaleString()} of ${goal.target_amount.toLocaleString()}
            {" "}
            ({((goal.current_amount / goal.target_amount) * 100).toFixed(1)}%)
          </p>
        </Card>
      ))}
    </div>
  );
};