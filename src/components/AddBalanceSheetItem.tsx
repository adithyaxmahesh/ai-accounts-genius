import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/components/AuthProvider";
import { BalanceSheetFormFields } from "./balance-sheet/BalanceSheetFormFields";

interface AddBalanceSheetItemProps {
  onClose: () => void;
  onSuccess: () => void;
}

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
          <BalanceSheetFormFields
            name={name}
            setName={setName}
            amount={amount}
            setAmount={setAmount}
            subcategory={subcategory}
            setSubcategory={setSubcategory}
            description={description}
            setDescription={setDescription}
            selectedTab={selectedTab}
            isTracking={isTracking}
            setIsTracking={setIsTracking}
          />
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