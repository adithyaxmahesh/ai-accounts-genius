import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/components/AuthProvider";
import { cn } from "@/lib/utils";
import { WriteOff } from "@/components/types";
import { useToast } from "@/components/ui/use-toast";
import { DollarSign } from "lucide-react";

export const TransactionList = () => {
  const { session } = useAuth();
  const [showAll, setShowAll] = useState(false);
  const { toast } = useToast();

  const { data: writeOffs = [], isError, error } = useQuery({
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
        .order('date', { ascending: false })
        .returns<WriteOff[]>();
      
      if (error) {
        throw error;
      }
      
      return data || [];
    },
    enabled: !!session?.user.id
  });

  if (isError) {
    toast({
      variant: "destructive",
      title: "Error loading write-offs",
      description: error instanceof Error ? error.message : "Failed to load write-offs"
    });
  }

  const displayWriteOffs = showAll ? writeOffs : writeOffs.slice(0, 3);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  const parseDescription = (description: string) => {
    const parts = description.split(',');
    return {
      name: parts[0],
      charges: parts.slice(2).map(Number).filter(n => !isNaN(n))
    };
  };

  // Use only the write-off amount for the total
  const totalDeductions = writeOffs.reduce((sum, writeOff) => sum + Number(writeOff.amount), 0);

  const getChargesBreakdown = (description: string) => {
    const { charges } = parseDescription(description);
    if (charges.length > 0) {
      return charges.map(formatCurrency).join(' + ');
    }
    return '';
  };

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

      <div className="bg-muted/50 p-4 rounded-lg mb-6">
        <div className="flex items-center gap-2">
          <DollarSign className="h-5 w-5 text-primary" />
          <div>
            <p className="text-sm text-muted-foreground">Total Deductions</p>
            <p className="text-2xl font-bold">{formatCurrency(totalDeductions)}</p>
          </div>
        </div>
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
                <div key={writeOff.id} className="flex justify-between items-center p-4 bg-muted rounded-lg hover:bg-muted/80 transition-colors">
                  <div>
                    <p className="font-semibold">{parseDescription(writeOff.description).name}</p>
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
                    <p className="text-sm text-muted-foreground mt-1">
                      {getChargesBreakdown(writeOff.description)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">{formatCurrency(Number(writeOff.amount))}</p>
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