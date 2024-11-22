import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/components/AuthProvider";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface AddBalanceSheetItemProps {
  onClose: () => void;
  onSuccess: () => void;
}

const ASSET_SUBCATEGORIES = [
  { value: "cash", label: "Cash & Bank" },
  { value: "investments", label: "Investments" },
  { value: "receivables", label: "Accounts Receivable" },
  { value: "inventory", label: "Inventory" },
  { value: "equipment", label: "Equipment & Property" },
];

const LIABILITY_SUBCATEGORIES = [
  { value: "loans", label: "Loans & Mortgages" },
  { value: "payables", label: "Accounts Payable" },
  { value: "taxes", label: "Tax Liabilities" },
];

const EQUITY_SUBCATEGORIES = [
  { value: "retained", label: "Retained Earnings" },
  { value: "capital", label: "Owner's Capital" },
];

export const AddBalanceSheetItem = ({ onClose, onSuccess }: AddBalanceSheetItemProps) => {
  const { session } = useAuth();
  const [name, setName] = useState("");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("");
  const [subcategory, setSubcategory] = useState("");
  const [description, setDescription] = useState("");
  const [selectedTab, setSelectedTab] = useState("asset");

  const getSubcategories = () => {
    switch (selectedTab) {
      case "asset":
        return ASSET_SUBCATEGORIES;
      case "liability":
        return LIABILITY_SUBCATEGORIES;
      case "equity":
        return EQUITY_SUBCATEGORIES;
      default:
        return [];
    }
  };

  const addItem = useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase
        .from("balance_sheet_items")
        .insert([
          {
            name,
            amount: Number(amount),
            category: selectedTab,
            subcategory,
            description,
            user_id: session?.user.id,
          },
        ]);

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      onSuccess();
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addItem.mutate();
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Add Balance Sheet Item</DialogTitle>
        </DialogHeader>
        <Tabs value={selectedTab} onValueChange={setSelectedTab}>
          <TabsList className="grid grid-cols-3 mb-4">
            <TabsTrigger value="asset">Asset</TabsTrigger>
            <TabsTrigger value="liability">Liability</TabsTrigger>
            <TabsTrigger value="equity">Equity</TabsTrigger>
          </TabsList>
        </Tabs>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          <div>
            <Label htmlFor="amount">Amount</Label>
            <Input
              id="amount"
              type="number"
              step="0.01"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
            />
          </div>
          <div>
            <Label htmlFor="subcategory">Subcategory</Label>
            <Select value={subcategory} onValueChange={setSubcategory} required>
              <SelectTrigger>
                <SelectValue placeholder="Select subcategory" />
              </SelectTrigger>
              <SelectContent>
                {getSubcategories().map((sub) => (
                  <SelectItem key={sub.value} value={sub.value}>
                    {sub.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Add any relevant details or notes"
            />
          </div>
          <div className="flex justify-end space-x-2">
            <Button variant="outline" type="button" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={addItem.isPending}>
              {addItem.isPending ? "Adding..." : "Add Item"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};