import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export const TransactionList = () => {
  const transactions = [
    {
      id: 1,
      description: "Office Supplies",
      amount: 234.56,
      date: "2024-03-15",
      category: "Expenses",
    },
    {
      id: 2,
      description: "Client Payment",
      amount: 1500.00,
      date: "2024-03-14",
      category: "Income",
    },
    {
      id: 3,
      description: "Software License",
      amount: 99.99,
      date: "2024-03-13",
      category: "Expenses",
    },
  ];

  return (
    <Card className="glass-card p-6">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-semibold">Recent Transactions</h3>
        <Button variant="outline" className="hover-scale">View All</Button>
      </div>
      <div className="space-y-4">
        {transactions.map((transaction) => (
          <div key={transaction.id} className="flex justify-between items-center p-4 bg-muted rounded-lg">
            <div>
              <p className="font-semibold">{transaction.description}</p>
              <p className="text-sm text-muted-foreground">Category: {transaction.category}</p>
            </div>
            <div className="text-right">
              <p className="font-semibold">${transaction.amount.toFixed(2)}</p>
              <p className="text-sm text-muted-foreground">{transaction.date}</p>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
};