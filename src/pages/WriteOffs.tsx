import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowLeft, Plus, Calculator } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/components/AuthProvider";
import { WriteOffDialog } from "@/components/write-offs/WriteOffDialog";
import { WriteOffsList } from "@/components/write-offs/WriteOffsList";
import { TaxCodesList } from "@/components/write-offs/TaxCodesList";
import { supabase } from "@/integrations/supabase/client";

const WriteOffs = () => {
  const navigate = useNavigate();
  const { session } = useAuth();
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const { data: totalDeductions } = useQuery({
    queryKey: ['writeOffsTotalDeductions', session?.user.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('write_offs')
        .select('amount')
        .eq('user_id', session?.user.id);
      
      if (error) throw error;
      return data.reduce((sum, record) => sum + Number(record.amount), 0);
    }
  });

  return (
    <div className="container mx-auto p-6 space-y-6 fade-in">
      <div className="flex items-center space-x-4 mb-6">
        <Button 
          variant="ghost" 
          onClick={() => navigate('/')}
          className="hover-scale"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Dashboard
        </Button>
      </div>

      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Tax Write-Offs</h1>
        <Button 
          onClick={() => setIsDialogOpen(true)} 
          className="hover-scale"
        >
          <Plus className="mr-2 h-4 w-4" />
          Add Write-Off
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card className="p-6 glass-card">
          <Calculator className="h-8 w-8 mb-4 text-primary" />
          <h3 className="text-lg font-semibold">Total Deductions</h3>
          <p className="text-3xl font-bold">
            ${totalDeductions?.toLocaleString() ?? 0}
          </p>
          <p className="text-sm text-muted-foreground">Current fiscal year</p>
        </Card>
      </div>

      <TaxCodesList />
      <WriteOffsList userId={session?.user.id ?? ''} />

      <WriteOffDialog
        isOpen={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        onSuccess={() => {
          // Refetch queries will happen automatically due to React Query's cache invalidation
        }}
        userId={session?.user.id ?? ''}
      />
    </div>
  );
};

export default WriteOffs;
