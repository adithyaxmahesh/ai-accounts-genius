import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { ExpenseCategoriesCard } from "@/components/ExpenseCategoriesCard";

const Expenses = () => {
  const navigate = useNavigate();

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center space-x-4 mb-6">
        <Button 
          variant="ghost" 
          onClick={() => navigate('/dashboard')}
          className="hover-scale"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Dashboard
        </Button>
      </div>

      <h1 className="text-3xl font-bold mb-6">Expense Categories</h1>
      
      <ExpenseCategoriesCard />
    </div>
  );
};

export default Expenses;