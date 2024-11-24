import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/components/AuthProvider";
import { cn } from "@/lib/utils";

export const TransactionList = () => {
  const { session } = useAuth();
  const [showAll, setShowAll] = useState(false);

  const { data: writeOffs = [] } = useQuery({
    queryKey: ['write-offs', session?.user.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('write_offs')
        .select(`
          *,
          tax_codes (
            code,
            description,
            state,
            expense_category
          )
        `)
        .eq('user_id', session?.user.id)
        .order('date', { ascending: false });
      
      if (error) throw error;
      return data || [];
    }
  });

  const displayWriteOffs = showAll ? writeOffs : writeOffs.slice(0, 3);

  return (
    <Card className="glass-card p-6">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-semibold">Recent Write-Offs</h3>
        <Button 
          variant="outline" 
          className="hover-scale"
          onClick={() => setShowAll(!showAll)}
        >
          {showAll ? "Show Less" : "View All"}
        </Button>
      </div>
      <div className={cn(
        "relative",
        showAll ? "h-[400px]" : "h-auto"
      )}>
        <ScrollArea className="h-full w-full">
          <div className="space-y-4">
            {displayWriteOffs.length === 0 ? (
              <div className="text-center text-muted-foreground py-4">
                No write-offs found
              </div>
            ) : (
              displayWriteOffs.map((writeOff) => (
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
                    <p className="font-semibold">${writeOff.amount.toLocaleString()}</p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(writeOff.date).toLocaleDateString()}
                    </p>
                    <p className="text-sm text-muted-foreground capitalize">
                      {writeOff.status || "Pending"}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </ScrollArea>
      </div>
    </Card>
  );
};