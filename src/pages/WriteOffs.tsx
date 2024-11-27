import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Plus } from "lucide-react";
import { useAuth } from "@/components/AuthProvider";
import { WriteOffDialog } from "@/components/write-offs/WriteOffDialog";
import { TransactionList } from "@/components/TransactionList";
import TaxCodesList from "@/components/write-offs/TaxCodesList";
import { useRealtimeSubscription } from "@/hooks/useRealtimeSubscription";

const WriteOffs = () => {
  const navigate = useNavigate();
  const { session } = useAuth();
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Enable real-time updates
  useRealtimeSubscription('write_offs', ['writeOffsTotalDeductions', session?.user.id]);

  return (
    <div className="container mx-auto p-6 space-y-6 fade-in">
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

      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Tax Write-Offs</h1>
        <Button 
          onClick={() => setIsDialogOpen(true)} 
          className="hover-scale"
        >
          <Plus className="mr-2 h-4 w-4" />
          Add Write-Off
        </Button>
      </div>

      <TransactionList />
      <TaxCodesList />

      <WriteOffDialog
        isOpen={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        onSuccess={() => {
          // Refetch queries will happen automatically due to React Query's cache invalidation
        }}
        userId={session?.user.id ?? ''}
      />
    </div>
  );
};

export default WriteOffs;