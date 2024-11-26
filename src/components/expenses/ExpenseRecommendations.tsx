import { Card } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Lightbulb, TrendingDown, AlertCircle } from "lucide-react";

interface ExpenseRecommendationsProps {
  expenses: Array<{
    name: string;
    value: number;
  }>;
  totalExpenses: number;
}

export const ExpenseRecommendations = ({ expenses, totalExpenses }: ExpenseRecommendationsProps) => {
  const generateRecommendations = () => {
    const recommendations = [];
    const avgExpense = totalExpenses / expenses.length;

    // Find categories with high spending
    const highSpendingCategories = expenses.filter(exp => exp.value > avgExpense * 1.5);
    
    if (highSpendingCategories.length > 0) {
      recommendations.push({
        title: "High Spending Alert",
        description: `Consider reviewing expenses in: ${highSpendingCategories.map(c => c.name).join(', ')}`,
        icon: AlertCircle,
        variant: "destructive" as const
      });
    }

    // Find potential savings opportunities
    const potentialSavings = expenses
      .filter(exp => exp.value > avgExpense)
      .reduce((sum, exp) => sum + (exp.value - avgExpense), 0);

    if (potentialSavings > 0) {
      recommendations.push({
        title: "Savings Opportunity",
        description: `Potential savings of $${potentialSavings.toLocaleString()} identified by optimizing high-expense categories`,
        icon: TrendingDown,
        variant: "default" as const
      });
    }

    // Add general recommendations
    recommendations.push({
      title: "Budget Planning",
      description: "Consider setting category-specific budget limits based on historical spending patterns",
      icon: Lightbulb,
      variant: "default" as const
    });

    return recommendations;
  };

  const recommendations = generateRecommendations();

  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold mb-4">Recommendations</h3>
      <div className="space-y-4">
        {recommendations.map((rec, index) => (
          <Alert key={index} variant={rec.variant}>
            <rec.icon className="h-4 w-4" />
            <AlertTitle>{rec.title}</AlertTitle>
            <AlertDescription>{rec.description}</AlertDescription>
          </Alert>
        ))}
      </div>
    </Card>
  );
};