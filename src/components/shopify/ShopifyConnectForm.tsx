import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/components/AuthProvider";

export const ShopifyConnectForm = () => {
  const [shop, setShop] = useState("");
  const [accessToken, setAccessToken] = useState("");
  const [isConnecting, setIsConnecting] = useState(false);
  const { toast } = useToast();
  const { session } = useAuth();

  const handleConnect = async () => {
    if (!shop || !accessToken) {
      toast({
        title: "Missing Information",
        description: "Please provide both shop URL and access token",
        variant: "destructive",
      });
      return;
    }

    setIsConnecting(true);
    try {
      const { error } = await supabase.functions.invoke('shopify-integration', {
        body: { 
          shop: shop.replace('https://', '').replace('.myshopify.com', ''),
          accessToken,
          userId: session?.user.id
        }
      });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Shopify store connected successfully",
      });

      setShop("");
      setAccessToken("");
    } catch (error) {
      console.error('Error connecting Shopify:', error);
      toast({
        title: "Error",
        description: "Failed to connect Shopify store. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsConnecting(false);
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <label htmlFor="shop" className="block text-sm font-medium mb-1">
          Shop URL
        </label>
        <Input
          id="shop"
          placeholder="your-store.myshopify.com"
          value={shop}
          onChange={(e) => setShop(e.target.value)}
        />
      </div>

      <div>
        <label htmlFor="accessToken" className="block text-sm font-medium mb-1">
          Access Token
        </label>
        <Input
          id="accessToken"
          type="password"
          placeholder="shpat_xxxxx"
          value={accessToken}
          onChange={(e) => setAccessToken(e.target.value)}
        />
      </div>

      <Button 
        onClick={handleConnect} 
        disabled={isConnecting}
        className="w-full"
      >
        {isConnecting ? "Connecting..." : "Connect Store"}
      </Button>
    </div>
  );
};