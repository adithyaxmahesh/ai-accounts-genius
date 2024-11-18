import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { HelpCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

export const RevenueSourcesHelp = () => {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" className="hover:bg-transparent">
          <HelpCircle className="h-5 w-5 text-muted-foreground hover:text-primary" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Connecting Revenue Sources</DialogTitle>
        </DialogHeader>
        <div className="space-y-6">
          <div>
            <h3 className="font-semibold mb-2">Shopify Integration</h3>
            <ol className="list-decimal ml-4 space-y-2">
              <li>Go to your Shopify admin panel</li>
              <li>Navigate to Settings → Apps and sales channels</li>
              <li>Click "Develop apps" and create a new app</li>
              <li>Configure Admin API access scopes (need: read_orders, read_products)</li>
              <li>Install the app and copy the access token</li>
              <li>Enter your shop URL and access token in the connection form</li>
            </ol>
          </div>

          <div>
            <h3 className="font-semibold mb-2">Manual Revenue Entry</h3>
            <p>You can manually add revenue entries by:</p>
            <ol className="list-decimal ml-4 space-y-2">
              <li>Click the "Add Revenue" button</li>
              <li>Enter the transaction details including amount, date, and category</li>
              <li>Add any relevant notes or descriptions</li>
              <li>Save the entry to track it in your records</li>
            </ol>
          </div>

          <div>
            <h3 className="font-semibold mb-2">Document Upload</h3>
            <p>Upload revenue-related documents such as:</p>
            <ul className="list-disc ml-4 space-y-1">
              <li>Sales receipts</li>
              <li>Bank statements</li>
              <li>Invoice records</li>
              <li>Payment processor reports</li>
            </ul>
            <p className="mt-2">Our AI will automatically extract and categorize revenue data.</p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};