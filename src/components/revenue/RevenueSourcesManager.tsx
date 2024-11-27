import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { Building2, CreditCard, Landmark } from "lucide-react";
import { ShopifyConnect } from "@/components/shopify/ShopifyConnect";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/components/AuthProvider";
import { RevenueSourcesHelp } from "@/components/revenue/RevenueSourcesHelp";

export const RevenueSourcesManager = () => {
  const { toast } = useToast();
  const { session } = useAuth();
  const [bankDetails, setBankDetails] = useState({
    bankName: "",
    accountNumber: "",
    routingNumber: "",
  });
  const [isConnectingStripe, setIsConnectingStripe] = useState(false);

  const handleBankConnect = async () => {
    try {
      const { error } = await supabase
        .from('bank_connections')
        .insert({
          user_id: session?.user.id,
          bank_name: bankDetails.bankName,
          account_number: bankDetails.accountNumber,
          routing_number: bankDetails.routingNumber,
        });

      if (error) throw error;

      toast({
        title: "Bank Account Connected",
        description: "Your bank account has been successfully connected.",
      });
    } catch (error) {
      console.error('Error connecting bank account:', error);
      toast({
        title: "Error",
        description: "Failed to connect bank account. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleStripeConnect = async () => {
    try {
      setIsConnectingStripe(true);
      const { data, error } = await supabase.functions.invoke('stripe-integration', {
        body: { 
          userId: session?.user.id,
          action: 'create-connect-account'
        }
      });

      if (error) throw error;

      if (data?.url) {
        window.location.href = data.url;
      } else {
        throw new Error('No Stripe Connect URL received');
      }
    } catch (error: any) {
      console.error('Error connecting Stripe:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to connect Stripe account. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsConnectingStripe(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold">Revenue Sources</h2>
        <RevenueSourcesHelp />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-6">
          <Building2 className="h-8 w-8 mb-4 text-primary" />
          <h3 className="text-lg font-semibold mb-2">Shopify Store</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Connect your Shopify store to automatically import sales data.
          </p>
          <ShopifyConnect />
        </Card>

        <Card className="p-6">
          <Landmark className="h-8 w-8 mb-4 text-primary" />
          <h3 className="text-lg font-semibold mb-2">Bank Account</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Connect your business bank account to track revenue and expenses.
          </p>
          <Dialog>
            <DialogTrigger asChild>
              <Button className="w-full">Connect Bank</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Connect Bank Account</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="bankName">Bank Name</Label>
                  <Input
                    id="bankName"
                    value={bankDetails.bankName}
                    onChange={(e) => setBankDetails(prev => ({ ...prev, bankName: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="accountNumber">Account Number</Label>
                  <Input
                    id="accountNumber"
                    type="password"
                    value={bankDetails.accountNumber}
                    onChange={(e) => setBankDetails(prev => ({ ...prev, accountNumber: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="routingNumber">Routing Number</Label>
                  <Input
                    id="routingNumber"
                    value={bankDetails.routingNumber}
                    onChange={(e) => setBankDetails(prev => ({ ...prev, routingNumber: e.target.value }))}
                  />
                </div>
                <Button onClick={handleBankConnect} className="w-full">
                  Connect
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </Card>

        <Card className="p-6">
          <CreditCard className="h-8 w-8 mb-4 text-primary" />
          <h3 className="text-lg font-semibold mb-2">Stripe Account</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Connect your Stripe account to sync payment data.
          </p>
          <Button 
            onClick={handleStripeConnect} 
            disabled={isConnectingStripe}
            className="w-full"
          >
            {isConnectingStripe ? "Connecting..." : "Connect Stripe"}
          </Button>
        </Card>
      </div>
    </div>
  );
};