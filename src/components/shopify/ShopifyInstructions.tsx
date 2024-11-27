import { AlertCircle } from "lucide-react";

export const ShopifyInstructions = () => {
  return (
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
  );
};