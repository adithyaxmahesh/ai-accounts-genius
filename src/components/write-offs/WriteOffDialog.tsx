import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";

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
        .order('state')
        .distinct();
      
      if (error) throw error;
      return data.map(item => item.state);
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
        .order('expense_category')
        .distinct();
      
      if (error) throw error;
      return data.map(item => item.expense_category);
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
          <div>
            <label className="text-sm font-medium">State</label>
            <Select
              value={selectedState}
              onValueChange={setSelectedState}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select state" />
              </SelectTrigger>
              <SelectContent>
                {states?.map((state) => (
                  <SelectItem key={state} value={state}>
                    {state}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {selectedState && (
            <div>
              <label className="text-sm font-medium">Expense Category</label>
              <Select
                value={selectedCategory}
                onValueChange={setSelectedCategory}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categories?.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {selectedCategory && (
            <div>
              <label className="text-sm font-medium">Tax Code</label>
              <Select
                value={newWriteOff.taxCodeId}
                onValueChange={(value) => setNewWriteOff(prev => ({
                  ...prev,
                  taxCodeId: value
                }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select tax code" />
                </SelectTrigger>
                <SelectContent>
                  {taxCodes?.map((code) => (
                    <SelectItem key={code.id} value={code.id}>
                      {code.code} - {code.description}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div>
            <label className="text-sm font-medium">Amount</label>
            <Input
              type="number"
              placeholder="Enter amount"
              value={newWriteOff.amount}
              onChange={(e) => setNewWriteOff(prev => ({
                ...prev,
                amount: e.target.value
              }))}
            />
          </div>

          <div>
            <label className="text-sm font-medium">Description</label>
            <Input
              placeholder="Enter description"
              value={newWriteOff.description}
              onChange={(e) => setNewWriteOff(prev => ({
                ...prev,
                description: e.target.value
              }))}
            />
          </div>

          <div>
            <label className="text-sm font-medium">Date</label>
            <Input
              type="date"
              value={newWriteOff.date}
              onChange={(e) => setNewWriteOff(prev => ({
                ...prev,
                date: e.target.value
              }))}
            />
          </div>

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