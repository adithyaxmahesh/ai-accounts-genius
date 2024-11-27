import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { Building2, CreditCard, Landmark, Plus } from "lucide-react";
import { ShopifyConnect } from "@/components/shopify/ShopifyConnect";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/components/AuthProvider";
import { RevenueSourcesHelp } from "@/components/revenue/RevenueSourcesHelp";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export const RevenueSourcesManager = () => {
  const { toast } = useToast();
  const { session } = useAuth();
  const [isConnectingStripe, setIsConnectingStripe] = useState(false);
  const [isConnectingBank, setIsConnectingBank] = useState(false);
  const [isConnectingCard, setIsConnectingCard] = useState(false);
  const [bankName, setBankName] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [routingNumber, setRoutingNumber] = useState("");
  const [isBankDialogOpen, setIsBankDialogOpen] = useState(false);
  const [isCardDialogOpen, setIsCardDialogOpen] = useState(false);
  const [cardName, setCardName] = useState("");
  const [cardLimit, setCardLimit] = useState("");
  const [isTracking, setIsTracking] = useState(true);

  const handleBankConnect = async () => {
    try {
      setIsConnectingBank(true);
      
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
      
      setIsBankDialogOpen(false);
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
      setIsConnectingBank(false);
    }
  };

  const handleCreditCardConnect = async () => {
    try {
      setIsConnectingCard(true);
      
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
      
      setIsCardDialogOpen(false);
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
      setIsConnectingCard(false);
    }
  };

  const handleStripeConnect = async () => {
    if (!session?.user?.id) {
      toast({
        title: "Error",
        description: "You must be logged in to connect Stripe.",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsConnectingStripe(true);
      
      const { data, error } = await supabase.functions.invoke('stripe-integration', {
        body: { 
          userId: session.user.id,
          action: 'create-connect-account'
        }
      });

      if (error) throw error;

      if (!data?.url) {
        throw new Error('No Stripe Connect URL received');
      }

      window.location.href = data.url;
    } catch (error: any) {
      console.error('Error connecting Stripe:', error);
      toast({
        title: "Connection Failed",
        description: "Could not connect to Stripe. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsConnectingStripe(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold">Financial Connections</h2>
        <RevenueSourcesHelp />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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
          <Dialog open={isBankDialogOpen} onOpenChange={setIsBankDialogOpen}>
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
                  onClick={handleBankConnect} 
                  disabled={isConnectingBank || !bankName || !accountNumber || !routingNumber}
                  className="w-full"
                >
                  {isConnectingBank ? "Connecting..." : "Connect"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </Card>

        <Card className="p-6">
          <CreditCard className="h-8 w-8 mb-4 text-primary" />
          <h3 className="text-lg font-semibold mb-2">Credit Card</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Add your business credit cards to track expenses automatically.
          </p>
          <Dialog open={isCardDialogOpen} onOpenChange={setIsCardDialogOpen}>
            <DialogTrigger asChild>
              <Button className="w-full">
                <Plus className="h-4 w-4 mr-2" />
                Add Credit Card
              </Button>
            </DialogTrigger>
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
                  onClick={handleCreditCardConnect} 
                  disabled={isConnectingCard || !cardName || !cardLimit}
                  className="w-full"
                >
                  {isConnectingCard ? "Adding..." : "Add Card"}
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