import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { useAuth } from "@/components/AuthProvider";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface CreditCardDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const CreditCardDialog = ({ open, onOpenChange }: CreditCardDialogProps) => {
  const { session } = useAuth();
  const { toast } = useToast();
  const [isConnecting, setIsConnecting] = useState(false);
  const [cardName, setCardName] = useState("");
  const [cardLimit, setCardLimit] = useState("");
  const [isTracking, setIsTracking] = useState(true);

  const handleConnect = async () => {
    try {
      setIsConnecting(true);
      
      const { error: balanceError } = await supabase
        .from("balance_sheet_items")
        .insert([
          {
            name: cardName,
            amount: Number(cardLimit),
            category: "asset",
            subcategory: "credit_cards",
            description: "Credit card account",
            user_id: session?.user.id,
          },
        ]);

      if (balanceError) throw balanceError;

      if (isTracking) {
        const { error: trackingError } = await supabase
          .from("expense_patterns")
          .insert([
            {
              user_id: session?.user.id,
              pattern: cardName.toLowerCase(),
              category: "Credit Card",
              is_expense: true,
              confidence: 1,
            },
          ]);

        if (trackingError) {
          toast({
            title: "Warning",
            description: "Credit card added but expense tracking setup failed",
            variant: "destructive",
          });
        }
      }

      toast({
        title: "Success",
        description: "Credit card successfully connected",
      });
      
      onOpenChange(false);
      setCardName("");
      setCardLimit("");
    } catch (error: any) {
      console.error('Error connecting credit card:', error);
      toast({
        title: "Error",
        description: "Failed to connect credit card. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsConnecting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Credit Card</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label htmlFor="cardName">Card Name</Label>
            <Input
              id="cardName"
              value={cardName}
              onChange={(e) => setCardName(e.target.value)}
              placeholder="Enter card name or issuer"
            />
          </div>
          <div>
            <Label htmlFor="cardLimit">Credit Limit</Label>
            <Input
              id="cardLimit"
              type="number"
              value={cardLimit}
              onChange={(e) => setCardLimit(e.target.value)}
              placeholder="Enter credit limit"
            />
          </div>
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
          <Button 
            onClick={handleConnect} 
            disabled={isConnecting || !cardName || !cardLimit}
            className="w-full"
          >
            {isConnecting ? "Adding..." : "Add Card"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};