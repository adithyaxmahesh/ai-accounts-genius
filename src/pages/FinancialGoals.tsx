import { FinancialGoalDialog } from "@/components/financial/FinancialGoalDialog";
import { FinancialGoalsList } from "@/components/financial/FinancialGoalsList";

const FinancialGoals = () => {
  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Financial Goals</h1>
        <FinancialGoalDialog />
      </div>
      <FinancialGoalsList />
    </div>
  );
};

export default FinancialGoals;