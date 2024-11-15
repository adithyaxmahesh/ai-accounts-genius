import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { WriteOffFormFields } from "./WriteOffFormFields";

interface WriteOffDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
  userId: string;
}

export const WriteOffDialog = ({ isOpen, onOpenChange, onSuccess, userId }: WriteOffDialogProps) => {
  const { toast } = useToast();
  const [selectedState, setSelectedState] = useState<string>("");
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [newWriteOff, setNewWriteOff] = useState({
    amount: '',
    description: '',
    date: new Date().toISOString().split('T')[0],
    taxCodeId: ''
  });

  const { data: states } = useQuery({
    queryKey: ['states'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('tax_codes')
        .select('state')
        .not('state', 'is', null)
        .order('state');
      
      if (error) throw error;
      return Array.from(new Set(data.map(item => item.state)));
    }
  });

  const { data: categories } = useQuery({
    queryKey: ['categories', selectedState],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('tax_codes')
        .select('expense_category')
        .eq('state', selectedState)
        .not('expense_category', 'is', null)
        .order('expense_category');
      
      if (error) throw error;
      return Array.from(new Set(data.map(item => item.expense_category)));
    },
    enabled: !!selectedState
  });

  const { data: taxCodes } = useQuery({
    queryKey: ['taxCodes', selectedState, selectedCategory],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('tax_codes')
        .select('*')
        .eq('state', selectedState)
        .eq('expense_category', selectedCategory)
        .order('code');
      
      if (error) throw error;
      return data;
    },
    enabled: !!selectedState && !!selectedCategory
  });

  const addWriteOff = async () => {
    try {
      const { error } = await supabase
        .from('write_offs')
        .insert({
          user_id: userId,
          amount: parseFloat(newWriteOff.amount),
          description: newWriteOff.description,
          date: newWriteOff.date,
          tax_code_id: newWriteOff.taxCodeId,
          status: 'pending'
        });

      if (error) throw error;

      toast({
        title: "Write-off Added",
        description: "Your write-off has been recorded successfully.",
      });

      onOpenChange(false);
      setNewWriteOff({
        amount: '',
        description: '',
        date: new Date().toISOString().split('T')[0],
        taxCodeId: ''
      });
      onSuccess();
    } catch (error) {
      console.error("Error adding write-off:", error);
      toast({
        title: "Error",
        description: "Failed to add write-off. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add New Write-Off</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 mt-4">
          <WriteOffFormFields
            states={states}
            categories={categories}
            taxCodes={taxCodes}
            selectedState={selectedState}
            selectedCategory={selectedCategory}
            newWriteOff={newWriteOff}
            setSelectedState={setSelectedState}
            setSelectedCategory={setSelectedCategory}
            setNewWriteOff={setNewWriteOff}
          />
          <Button 
            className="w-full" 
            onClick={addWriteOff}
            disabled={!newWriteOff.amount || !newWriteOff.description || !newWriteOff.taxCodeId}
          >
            Add Write-Off
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};