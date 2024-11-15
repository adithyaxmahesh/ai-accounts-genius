import { Card } from "@/components/ui/card";

interface BalanceSheetItem {
  id: string;
  name: string;
  amount: number;
  description?: string;
  created_at: string;
}

interface BalanceSheetSectionProps {
  title: string;
  items: BalanceSheetItem[];
  className?: string;
}

export const BalanceSheetSection = ({ title, items, className }: BalanceSheetSectionProps) => {
  return (
    <Card className={`p-6 ${className}`}>
      <h2 className="text-xl font-semibold mb-4">{title}</h2>
      <div className="space-y-4">
        {items.map((item) => (
          <div
            key={item.id}
            className="flex justify-between items-center p-4 bg-white rounded-lg shadow-sm"
          >
            <div>
              <p className="font-semibold">{item.name}</p>
              <p className="text-sm text-muted-foreground">{item.description}</p>
            </div>
            <p className="text-lg font-semibold">${item.amount.toLocaleString()}</p>
          </div>
        ))}
        {items.length === 0 && (
          <p className="text-muted-foreground text-center py-4">No items added yet</p>
        )}
      </div>
    </Card>
  );
};