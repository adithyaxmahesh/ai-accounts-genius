import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { useAuth } from "@/components/AuthProvider";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface BankConnectionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const BankConnectionDialog = ({ open, onOpenChange }: BankConnectionDialogProps) => {
  const { session } = useAuth();
  const { toast } = useToast();
  const [isConnecting, setIsConnecting] = useState(false);
  const [bankName, setBankName] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [routingNumber, setRoutingNumber] = useState("");

  const handleConnect = async () => {
    try {
      setIsConnecting(true);
      
      const { error } = await supabase
        .from('bank_connections')
        .insert({
          user_id: session?.user.id,
          bank_name: bankName,
          account_number: accountNumber,
          routing_number: routingNumber
        });

      if (error) throw error;

      toast({
        title: "Bank Account Connected",
        description: "Your bank account has been successfully connected.",
      });
      
      onOpenChange(false);
      setBankName("");
      setAccountNumber("");
      setRoutingNumber("");
    } catch (error: any) {
      console.error('Error connecting bank account:', error);
      toast({
        title: "Error",
        description: "Failed to connect bank account. Please try again.",
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
          <DialogTitle>Connect Bank Account</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label htmlFor="bankName">Bank Name</Label>
            <Input
              id="bankName"
              value={bankName}
              onChange={(e) => setBankName(e.target.value)}
              placeholder="Enter bank name"
            />
          </div>
          <div>
            <Label htmlFor="accountNumber">Account Number</Label>
            <Input
              id="accountNumber"
              value={accountNumber}
              onChange={(e) => setAccountNumber(e.target.value)}
              placeholder="Enter account number"
              type="password"
            />
          </div>
          <div>
            <Label htmlFor="routingNumber">Routing Number</Label>
            <Input
              id="routingNumber"
              value={routingNumber}
              onChange={(e) => setRoutingNumber(e.target.value)}
              placeholder="Enter routing number"
            />
          </div>
          <Button 
            onClick={handleConnect} 
            disabled={isConnecting || !bankName || !accountNumber || !routingNumber}
            className="w-full"
          >
            {isConnecting ? "Connecting..." : "Connect"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};