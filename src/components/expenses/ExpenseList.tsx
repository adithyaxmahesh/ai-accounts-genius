import { ScrollArea } from "@/components/ui/scroll-area";

interface ExpenseListProps {
  expenses: Array<{
    name: string;
    value: number;
    color: string;
  }>;
}

export const ExpenseList = ({ expenses }: ExpenseListProps) => {
  return (
    <ScrollArea className="h-[300px]">
      <div className="space-y-2">
        {expenses.map((category) => (
          <div 
            key={category.name}
            className="flex justify-between items-center p-3 bg-muted rounded-lg hover:bg-muted/80 transition-colors"
          >
            <div className="flex items-center gap-2">
              <div 
                className="w-3 h-3 rounded-full" 
                style={{ backgroundColor: category.color }}
              />
              <span className="font-medium">{category.name}</span>
            </div>
            <span className="font-semibold">
              ${Math.abs(category.value).toLocaleString()}
            </span>
          </div>
        ))}
      </div>
    </ScrollArea>
  );
};