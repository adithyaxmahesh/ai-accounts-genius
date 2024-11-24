import { useState } from "react";
import { useAuth } from "@/components/AuthProvider";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useQueryClient } from "@tanstack/react-query";

export const AddIncomeStatementEntry = () => {
  const { session } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    amount: "",
    type: "revenue",
    category: "sales",
    description: ""
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session?.user?.id) return;

    setLoading(true);
    try {
      const { error } = await supabase
        .from('income_statements')
        .insert({
          user_id: session.user.id,
          name: formData.name,
          amount: parseFloat(formData.amount),
          type: formData.type,
          category: formData.category,
          description: formData.description || null
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Entry added successfully"
      });
      
      queryClient.invalidateQueries({ queryKey: ['income-statements'] });
      setOpen(false);
      setFormData({
        name: "",
        amount: "",
        type: "revenue",
        category: "sales",
        description: ""
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>Add Entry</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Income Statement Entry</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            placeholder="Entry Name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
          />
          <Input
            type="number"
            step="0.01"
            placeholder="Amount"
            value={formData.amount}
            onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
            required
          />
          <Select
            value={formData.type}
            onValueChange={(value) => setFormData({ ...formData, type: value })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="revenue">Revenue</SelectItem>
              <SelectItem value="expense">Expense</SelectItem>
            </SelectContent>
          </Select>
          <Select
            value={formData.category}
            onValueChange={(value) => setFormData({ ...formData, category: value })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="sales">Sales</SelectItem>
              <SelectItem value="service_revenue">Service Revenue</SelectItem>
              <SelectItem value="cost_of_goods_sold">Cost of Goods Sold</SelectItem>
              <SelectItem value="operating_expense">Operating Expense</SelectItem>
              <SelectItem value="interest_income">Interest Income</SelectItem>
              <SelectItem value="interest_expense">Interest Expense</SelectItem>
              <SelectItem value="other_income">Other Income</SelectItem>
              <SelectItem value="other_expense">Other Expense</SelectItem>
            </SelectContent>
          </Select>
          <Input
            placeholder="Description (optional)"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          />
          <Button type="submit" disabled={loading}>
            {loading ? "Adding..." : "Add Entry"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};