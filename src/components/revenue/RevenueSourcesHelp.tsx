import {
  HelpCircle,
  CreditCard,
  Building2,
  Landmark,
  ArrowRight
} from "lucide-react";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";

export const RevenueSourcesHelp = () => {
  return (
    <HoverCard>
      <HoverCardTrigger asChild>
        <HelpCircle className="h-5 w-5 text-muted-foreground cursor-pointer" />
      </HoverCardTrigger>
      <HoverCardContent className="w-80">
        <div className="space-y-4">
          <h4 className="text-sm font-semibold">Connect Your Revenue Sources</h4>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Building2 className="h-4 w-4" />
              <span className="text-sm">Shopify: Import all your store sales</span>
            </div>
            <div className="flex items-center gap-2">
              <Landmark className="h-4 w-4" />
              <span className="text-sm">Bank: Track all transactions</span>
            </div>
            <div className="flex items-center gap-2">
              <CreditCard className="h-4 w-4" />
              <span className="text-sm">Stripe: Sync payment data</span>
            </div>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <ArrowRight className="h-4 w-4" />
            <span>Data syncs automatically with Revenue and Write-offs</span>
          </div>
        </div>
      </HoverCardContent>
    </HoverCard>
  );
};