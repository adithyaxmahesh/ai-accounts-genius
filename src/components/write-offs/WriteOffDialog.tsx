import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { WriteOffFormFields } from "./WriteOffFormFields";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

interface WriteOffDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
  userId: string;
}

export const WriteOffDialog = ({ isOpen, onOpenChange, onSuccess, userId }: WriteOffDialogProps) => {
  const { toast } = useToast();
  const [selectedState, setSelectedState] = useState<string>("California");
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [newWriteOff, setNewWriteOff] = useState({
    amount: '',
    description: '',
    date: new Date().toISOString().split('T')[0],
    taxCodeId: ''
  });

  // Auto-categorization when description changes
  useEffect(() => {
    const autoCategorize = async () => {
      if (!newWriteOff.description) return;

      try {
        const { data } = await supabase.functions.invoke('categorize-write-off', {
          body: { 
            description: newWriteOff.description,
            amount: parseFloat(newWriteOff.amount) || 0
          }
        });

        if (data?.taxCode) {
          setSelectedCategory(data.taxCode.expense_category);
          setNewWriteOff(prev => ({
            ...prev,
            taxCodeId: data.taxCode.id
          }));
        }
      } catch (error) {
        console.error('Auto-categorization error:', error);
      }
    };

    autoCategorize();
  }, [newWriteOff.description]);

  const { data: states, isLoading: statesLoading, error: statesError } = useQuery({
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

  const { data: categories, isLoading: categoriesLoading, error: categoriesError } = useQuery({
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

  const { data: taxCodes, isLoading: taxCodesLoading, error: taxCodesError } = useQuery({
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

  const isLoading = statesLoading || categoriesLoading || taxCodesLoading;
  const error = statesError || categoriesError || taxCodesError;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add New Write-Off</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 mt-4">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                An error occurred while loading the form. Please try again.
              </AlertDescription>
            </Alert>
          )}
          
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
            isLoading={isLoading}
          />
          
          <Button 
            className="w-full" 
            onClick={addWriteOff}
            disabled={!newWriteOff.amount || !newWriteOff.description || !newWriteOff.taxCodeId || isLoading}
          >
            Add Write-Off
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};