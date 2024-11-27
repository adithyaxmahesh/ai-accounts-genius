import { Card } from "@/components/ui/card";
import { ShoppingBag } from "lucide-react";
import { ShopifyConnectForm } from "./ShopifyConnectForm";
import { ShopifyInstructions } from "./ShopifyInstructions";

export const ShopifyConnect = () => {
  return (
    <Card className="p-6">
      <div className="flex items-center gap-2 mb-6">
        <ShoppingBag className="h-6 w-6 text-primary" />
        <h2 className="text-xl font-semibold">Connect Shopify Store</h2>
      </div>

      <div className="space-y-4">
        <ShopifyConnectForm />
        <ShopifyInstructions />
      </div>
    </Card>
  );
};