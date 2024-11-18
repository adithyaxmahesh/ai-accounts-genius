import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/components/AuthProvider";
import { ShoppingBag, AlertCircle } from "lucide-react";

export const ShopifyConnect = () => {
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

      // Reset form
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
    <Card className="p-6">
      <div className="flex items-center gap-2 mb-6">
        <ShoppingBag className="h-6 w-6 text-primary" />
        <h2 className="text-xl font-semibold">Connect Shopify Store</h2>
      </div>

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

        <div className="bg-muted p-4 rounded-lg flex items-start gap-2">
          <AlertCircle className="h-5 w-5 text-yellow-500 mt-0.5" />
          <div className="text-sm">
            <p className="font-medium">How to get your access token:</p>
            <ol className="list-decimal ml-4 mt-2 space-y-1">
              <li>Go to your Shopify admin</li>
              <li>Navigate to Settings → Apps and sales channels</li>
              <li>Click "Develop apps"</li>
              <li>Create a new app</li>
              <li>Configure Admin API access scopes (need: read_orders, read_products)</li>
              <li>Install the app and copy the access token</li>
            </ol>
          </div>
        </div>

        <Button 
          onClick={handleConnect} 
          disabled={isConnecting}
          className="w-full"
        >
          {isConnecting ? "Connecting..." : "Connect Store"}
        </Button>
      </div>
    </Card>
  );
};