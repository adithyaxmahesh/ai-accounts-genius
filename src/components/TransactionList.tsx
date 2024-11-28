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
import { DollarSign, Building, Calendar, Tag, FileCheck, AlertCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

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

  const totalDeductions = writeOffs.reduce((sum, writeOff) => sum + calculateTotalAmount(writeOff), 0);

  const getChargesBreakdown = (description: string) => {
    const { charges } = parseDescription(description);
    if (charges.length > 0) {
      return charges.map(formatCurrency).join(' + ');
    }
    return '';
  };

  const getValidationStatus = (writeOff: WriteOff) => {
    const rules = writeOff.tax_codes?.validation_rules || [];
    const docs = writeOff.tax_codes?.documentation_requirements || [];
    const hasAllDocs = docs.every(doc => writeOff.description.toLowerCase().includes(doc.toLowerCase()));
    
    return {
      isValid: hasAllDocs && rules.length > 0,
      missingDocs: docs.filter(doc => !writeOff.description.toLowerCase().includes(doc.toLowerCase()))
    };
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
              displayWriteOffs.map((writeOff) => {
                const { payee, purpose } = parseDescription(writeOff.description);
                const validationStatus = getValidationStatus(writeOff);
                
                return (
                  <div key={writeOff.id} className="flex flex-col p-4 bg-muted rounded-lg hover:bg-muted/80 transition-colors">
                    <div className="flex justify-between items-start mb-2">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <Building className="h-4 w-4 text-muted-foreground" />
                          <p className="font-semibold">{payee}</p>
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger>
                                {validationStatus.isValid ? (
                                  <Badge variant="success" className="ml-2">
                                    <FileCheck className="h-3 w-3 mr-1" />
                                    Validated
                                  </Badge>
                                ) : (
                                  <Badge variant="destructive" className="ml-2">
                                    <AlertCircle className="h-3 w-3 mr-1" />
                                    Missing Documentation
                                  </Badge>
                                )}
                              </TooltipTrigger>
                              <TooltipContent>
                                {validationStatus.isValid 
                                  ? "All documentation requirements met"
                                  : `Missing: ${validationStatus.missingDocs.join(", ")}`
                                }
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </div>
                        <div className="flex items-center gap-2">
                          <Tag className="h-4 w-4 text-muted-foreground" />
                          <p className="text-sm text-muted-foreground">{purpose}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">{formatCurrency(calculateTotalAmount(writeOff))}</p>
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <Calendar className="h-3 w-3" />
                          <p>{new Date(writeOff.date).toLocaleDateString()}</p>
                        </div>
                      </div>
                    </div>
                    {writeOff.tax_codes && (
                      <div className="mt-2 pt-2 border-t border-border">
                        <p className="text-sm text-muted-foreground">
                          {writeOff.tax_codes.state} - {writeOff.tax_codes.expense_category}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {writeOff.tax_codes.code} - {writeOff.tax_codes.description}
                        </p>
                        {writeOff.tax_codes.max_deduction_amount && (
                          <p className="text-sm text-muted-foreground">
                            Maximum Deduction: {formatCurrency(writeOff.tax_codes.max_deduction_amount)}
                          </p>
                        )}
                      </div>
                    )}
                    {getChargesBreakdown(writeOff.description) && (
                      <p className="text-sm text-muted-foreground mt-2">
                        Breakdown: {getChargesBreakdown(writeOff.description)}
                      </p>
                    )}
                    <p className="text-sm text-muted-foreground mt-2 capitalize">
                      Status: {writeOff.status || "Pending"}
                    </p>
                  </div>
                );
              })
            )}
          </div>
        </ScrollArea>
      </div>
    </Card>
  );
};
