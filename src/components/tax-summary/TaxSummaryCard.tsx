import { Card } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";

interface TaxSummaryCardProps {
  icon: LucideIcon;
  title: string;
  value: string | number;
  className?: string;
}

export const TaxSummaryCard = ({ icon: Icon, title, value, className = "" }: TaxSummaryCardProps) => {
  return (
    <Card className="p-6">
      <Icon className={`h-8 w-8 mb-4 ${className}`} />
      <h3 className="text-lg font-semibold">{title}</h3>
      <p className={`text-3xl font-bold ${className}`}>{value}</p>
    </Card>
  );
};