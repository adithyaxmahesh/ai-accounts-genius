import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { Building2, CreditCard, Landmark, Plus } from "lucide-react";
import { ShopifyConnect } from "@/components/shopify/ShopifyConnect";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/components/AuthProvider";
import { RevenueSourcesHelp } from "@/components/revenue/RevenueSourcesHelp";
import { CashBalanceCard } from "./CashBalanceCard";
import { BankConnectionDialog } from "./BankConnectionDialog";
import { CreditCardDialog } from "./CreditCardDialog";
import { StripeConnectionCard } from "./StripeConnectionCard";

export const RevenueSourcesManager = () => {
  const { toast } = useToast();
  const { session } = useAuth();
  const [isBankDialogOpen, setIsBankDialogOpen] = useState(false);
  const [isCardDialogOpen, setIsCardDialogOpen] = useState(false);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold">Financial Connections</h2>
        <RevenueSourcesHelp />
      </div>

      <CashBalanceCard />
      
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
          <Button 
            className="w-full"
            onClick={() => setIsBankDialogOpen(true)}
          >
            Connect Bank
          </Button>
        </Card>

        <Card className="p-6">
          <CreditCard className="h-8 w-8 mb-4 text-primary" />
          <h3 className="text-lg font-semibold mb-2">Credit Card</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Add your business credit cards to track expenses automatically.
          </p>
          <Button 
            className="w-full"
            onClick={() => setIsCardDialogOpen(true)}
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Credit Card
          </Button>
        </Card>

        <StripeConnectionCard />
      </div>

      <BankConnectionDialog 
        open={isBankDialogOpen}
        onOpenChange={setIsBankDialogOpen}
      />

      <CreditCardDialog
        open={isCardDialogOpen}
        onOpenChange={setIsCardDialogOpen}
      />
    </div>
  );
};