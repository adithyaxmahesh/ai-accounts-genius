import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { Building2, CreditCard, Landmark } from "lucide-react";
import { ShopifyConnect } from "@/components/shopify/ShopifyConnect";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/components/AuthProvider";
import { RevenueSourcesHelp } from "@/components/revenue/RevenueSourcesHelp";
import { usePlaidLink } from "react-plaid-link";

export const RevenueSourcesManager = () => {
  const { toast } = useToast();
  const { session } = useAuth();
  const [isConnectingStripe, setIsConnectingStripe] = useState(false);
  const [isConnectingPlaid, setIsConnectingPlaid] = useState(false);

  // Plaid Link setup
  const { open, ready } = usePlaidLink({
    token: null, // We'll fetch this when needed
    onSuccess: async (public_token, metadata) => {
      try {
        const { error } = await supabase.functions.invoke('plaid-integration', {
          body: {
            action: 'exchange-public-token',
            publicToken: public_token,
            userId: session?.user.id,
          }
        });

        if (error) throw error;

        toast({
          title: "Bank Account Connected",
          description: "Your bank account has been successfully connected via Plaid.",
        });
      } catch (error) {
        console.error('Error connecting bank account:', error);
        toast({
          title: "Error",
          description: "Failed to connect bank account. Please try again.",
          variant: "destructive",
        });
      } finally {
        setIsConnectingPlaid(false);
      }
    },
    onExit: () => {
      setIsConnectingPlaid(false);
    },
  });

  const handlePlaidConnect = async () => {
    try {
      setIsConnectingPlaid(true);
      const { data, error } = await supabase.functions.invoke('plaid-integration', {
        body: {
          action: 'create-link-token',
          userId: session?.user.id,
        }
      });

      if (error) throw error;
      if (!data?.link_token) throw new Error('No link token received');

      open(); // This will open the Plaid Link interface
    } catch (error: any) {
      console.error('Error initiating Plaid connection:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to initiate bank connection. Please try again.",
        variant: "destructive",
      });
      setIsConnectingPlaid(false);
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
          <Button 
            onClick={handlePlaidConnect} 
            disabled={isConnectingPlaid || !ready}
            className="w-full"
          >
            {isConnectingPlaid ? "Connecting..." : "Connect Bank"}
          </Button>
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