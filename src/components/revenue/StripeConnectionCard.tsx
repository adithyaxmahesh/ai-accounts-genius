import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CreditCard } from "lucide-react";
import { useAuth } from "@/components/AuthProvider";
import { useToast } from "@/components/ui/use-toast";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useSearchParams } from "react-router-dom";

export const StripeConnectionCard = () => {
  const { session } = useAuth();
  const { toast } = useToast();
  const [isConnecting, setIsConnecting] = useState(false);
  const [searchParams] = useSearchParams();

  useEffect(() => {
    // Handle the return from Stripe Connect OAuth
    const success = searchParams.get('success');
    const error = searchParams.get('error');

    if (success) {
      toast({
        title: "Success",
        description: "Your Stripe account has been connected successfully.",
      });
    } else if (error) {
      toast({
        title: "Error",
        description: "There was an error connecting your Stripe account. Please try again.",
        variant: "destructive",
      });
    }
  }, [searchParams, toast]);

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
      setIsConnecting(true);
      
      const { data, error } = await supabase.functions.invoke('stripe-integration', {
        body: { 
          userId: session.user.id,
          action: 'create-connect-account'
        }
      });

      if (error) {
        console.error('Supabase function error:', error);
        throw error;
      }

      if (!data?.url) {
        throw new Error('No Stripe Connect URL received');
      }

      // Store the Stripe account ID in local storage for later use
      if (data.accountId) {
        localStorage.setItem('stripeAccountId', data.accountId);
      }

      // Redirect to Stripe Connect onboarding
      window.location.href = data.url;
    } catch (error: any) {
      console.error('Error connecting Stripe:', error);
      toast({
        title: "Connection Failed",
        description: error.message || "Could not connect to Stripe. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsConnecting(false);
    }
  };

  return (
    <Card className="p-6">
      <CreditCard className="h-8 w-8 mb-4 text-primary" />
      <h3 className="text-lg font-semibold mb-2">Stripe Account</h3>
      <p className="text-sm text-muted-foreground mb-4">
        Connect your Stripe account to sync payment data and bank transactions.
      </p>
      <Button 
        onClick={handleStripeConnect} 
        disabled={isConnecting}
        className="w-full"
      >
        {isConnecting ? "Connecting..." : "Connect Stripe"}
      </Button>
    </Card>
  );
};