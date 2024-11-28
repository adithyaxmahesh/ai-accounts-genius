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
import { WriteOffCard } from "./write-offs/WriteOffCard";

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
            expense_category,
            validation_rules,
            documentation_requirements,
            max_deduction_amount
          )
        `)
        .eq('user_id', session?.user.id)
        .order('date', { ascending: false })
        .returns<WriteOff[]>();
      
      if (error) throw error;
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
      payee: parts[0],
      purpose: parts[1] || 'Not specified',
      charges: parts.slice(2).map(Number).filter(n => !isNaN(n))
    };
  };

  const calculateTotalAmount = (writeOff: WriteOff) => {
    const { charges } = parseDescription(writeOff.description);
    if (charges.length > 0) {
      return charges.reduce((sum, n) => sum + n, 0);
    }
    return Number(writeOff.amount) || 0;
  };

  const getChargesBreakdown = (description: string) => {
    const { charges } = parseDescription(description);
    if (charges.length > 0) {
      return charges.map(formatCurrency).join(' + ');
    }
    return '';
  };

  const totalDeductions = writeOffs.reduce((sum, writeOff) => 
    sum + calculateTotalAmount(writeOff), 0
  );

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
                <WriteOffCard
                  key={writeOff.id}
                  writeOff={writeOff}
                  parseDescription={parseDescription}
                  calculateTotalAmount={calculateTotalAmount}
                  getChargesBreakdown={getChargesBreakdown}
                />
              ))
            )}
          </div>
        </ScrollArea>
      </div>
    </Card>
  );
};