import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { ArrowUp, ArrowDown } from "lucide-react";

interface ExpenseAnalysisProps {
  expenses: Array<{
    name: string;
    value: number;
    color: string;
  }>;
  totalExpenses: number;
}

export const ExpenseAnalysis = ({ expenses, totalExpenses }: ExpenseAnalysisProps) => {
  const sortedExpenses = [...expenses].sort((a, b) => b.value - a.value);
  const topExpenses = sortedExpenses.slice(0, 5);
  const monthlyAverage = totalExpenses / 12; // Assuming yearly data

  return (
    <Card className="p-6 space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-4">Top Expenses</h3>
        <div className="space-y-4">
          {topExpenses.map((expense) => {
            const percentage = (expense.value / totalExpenses) * 100;
            return (
              <div key={expense.name} className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="font-medium">{expense.name}</span>
                  <span>${expense.value.toLocaleString()}</span>
                </div>
                <Progress value={percentage} className="h-2" style={{ backgroundColor: expense.color }} />
                <p className="text-xs text-muted-foreground">{percentage.toFixed(1)}% of total expenses</p>
              </div>
            );
          })}
        </div>
      </div>

      <div className="pt-4 border-t">
        <h3 className="text-lg font-semibold mb-4">Monthly Analysis</h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="p-4 bg-muted rounded-lg">
            <p className="text-sm text-muted-foreground">Monthly Average</p>
            <p className="text-2xl font-bold">${monthlyAverage.toLocaleString()}</p>
          </div>
          <div className="p-4 bg-muted rounded-lg">
            <p className="text-sm text-muted-foreground">Largest Monthly Expense</p>
            <p className="text-2xl font-bold">${Math.max(...expenses.map(e => e.value)).toLocaleString()}</p>
          </div>
        </div>
      </div>
    </Card>
  );
};