import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
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
import { useToast } from "@/components/ui/use-toast";

interface AddBalanceSheetItemProps {
  onClose: () => void;
  onSuccess: () => void;
}

const ASSET_SUBCATEGORIES = [
  { value: "cash", label: "Cash & Bank" },
  { value: "credit_cards", label: "Credit Cards" },
  { value: "investments", label: "Investments" },
  { value: "receivables", label: "Accounts Receivable" },
  { value: "inventory", label: "Inventory" },
  { value: "equipment", label: "Equipment & Property" },
];

const LIABILITY_SUBCATEGORIES = [
  { value: "loans", label: "Loans & Mortgages" },
  { value: "credit_card_debt", label: "Credit Card Debt" },
  { value: "payables", label: "Accounts Payable" },
  { value: "taxes", label: "Tax Liabilities" },
];

const EQUITY_SUBCATEGORIES = [
  { value: "retained", label: "Retained Earnings" },
  { value: "capital", label: "Owner's Capital" },
];

export const AddBalanceSheetItem = ({ onClose, onSuccess }: AddBalanceSheetItemProps) => {
  const { session } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [name, setName] = useState("");
  const [amount, setAmount] = useState("");
  const [subcategory, setSubcategory] = useState("");
  const [description, setDescription] = useState("");
  const [selectedTab, setSelectedTab] = useState("asset");
  const [isTracking, setIsTracking] = useState(false);

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
      // Add the balance sheet item
      const { data: balanceSheetItem, error: balanceError } = await supabase
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
        ])
        .select()
        .single();

      if (balanceError) throw balanceError;

      // If it's a credit card and tracking is enabled, set up expense tracking
      if (subcategory === "credit_cards" && isTracking) {
        const { error: trackingError } = await supabase
          .from("expense_patterns")
          .insert([
            {
              user_id: session?.user.id,
              pattern: name.toLowerCase(),
              category: "Credit Card",
              is_expense: true,
              confidence: 1,
            },
          ]);

        if (trackingError) {
          toast({
            title: "Warning",
            description: "Balance sheet item added but expense tracking setup failed",
            variant: "destructive",
          });
        }
      }

      return balanceSheetItem;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["balanceSheetItems"] });
      onSuccess();
      onClose();
      toast({
        title: "Success",
        description: "Balance sheet item added successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !amount || !subcategory) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }
    addItem.mutate();
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] bg-background">
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
              className="bg-background"
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
              className="bg-background"
            />
          </div>
          <div>
            <Label htmlFor="subcategory">Subcategory</Label>
            <Select 
              value={subcategory} 
              onValueChange={setSubcategory}
              required
            >
              <SelectTrigger className="bg-background">
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
          {(subcategory === "credit_cards" || subcategory === "credit_card_debt") && (
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="tracking"
                checked={isTracking}
                onChange={(e) => setIsTracking(e.target.checked)}
                className="rounded border-gray-300"
              />
              <Label htmlFor="tracking">Enable automatic expense tracking for this credit card</Label>
            </div>
          )}
          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Add any relevant details or notes"
              className="bg-background"
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