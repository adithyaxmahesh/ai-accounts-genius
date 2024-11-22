import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/components/AuthProvider";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";

export const SubscriptionCard = () => {
  const { toast } = useToast();
  const { session } = useAuth();
  const [discountCode, setDiscountCode] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  const { data: plans } = useQuery({
    queryKey: ['subscription-plans'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('subscription_plans')
        .select('*')
        .order('amount');
      
      if (error) throw error;
      return data;
    }
  });

  const handleSubscribe = async (priceId: string) => {
    if (!session?.user.id) {
      toast({
        title: "Error",
        description: "Please sign in to subscribe",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);
    try {
      const { data, error } = await supabase.functions.invoke('create-checkout', {
        body: { 
          priceId,
          userId: session.user.id,
          discountCode: discountCode.trim() || undefined
        }
      });

      if (error) throw error;
      if (data?.url) {
        window.location.href = data.url;
      }
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: "Error",
        description: "Failed to process subscription. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Card className="p-6">
      <h2 className="text-2xl font-bold mb-6">Choose Your Plan</h2>
      
      <div className="mb-6">
        <label className="text-sm font-medium mb-2 block">
          Have a discount code?
        </label>
        <Input
          value={discountCode}
          onChange={(e) => setDiscountCode(e.target.value)}
          placeholder="Enter discount code"
          className="max-w-xs"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {plans?.map((plan) => (
          <Card key={plan.id} className="p-6 flex flex-col">
            <h3 className="text-xl font-semibold mb-2">{plan.name}</h3>
            <p className="text-muted-foreground mb-4">{plan.description}</p>
            <div className="text-3xl font-bold mb-4">
              ${plan.amount}
              <span className="text-sm font-normal text-muted-foreground">
                /{plan.interval}
              </span>
            </div>
            <Button
              onClick={() => handleSubscribe(plan.price_id)}
              disabled={isProcessing}
              className="mt-auto"
            >
              {isProcessing ? "Processing..." : "Subscribe"}
            </Button>
          </Card>
        ))}
      </div>
    </Card>
  );
};