import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { useFinancialStreams } from "@/hooks/useFinancialStreams";

interface WriteOffsListProps {
  userId: string;
}

export const WriteOffsList = ({ userId }: WriteOffsListProps) => {
  const { data: streams, isLoading, error } = useFinancialStreams();
  
  const writeOffs = streams?.filter(stream => stream.type === 'write_off');

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  if (isLoading) {
    return (
      <Card className="p-6 glass-card">
        <h3 className="text-xl font-semibold mb-4">Recent Write-Offs</h3>
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex justify-between items-center p-4 bg-muted rounded-lg">
              <div className="space-y-2">
                <Skeleton className="h-4 w-48" />
                <Skeleton className="h-3 w-32" />
                <Skeleton className="h-3 w-40" />
              </div>
              <div className="text-right space-y-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-3 w-20" />
                <Skeleton className="h-3 w-16" />
              </div>
            </div>
          ))}
        </div>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="p-6 glass-card">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Failed to load write-offs. Please try again later.
          </AlertDescription>
        </Alert>
      </Card>
    );
  }

  if (!writeOffs?.length) {
    return (
      <Card className="p-6 glass-card">
        <h3 className="text-xl font-semibold mb-4">Recent Write-Offs</h3>
        <p className="text-muted-foreground">No write-offs found. Add your first write-off to get started.</p>
      </Card>
    );
  }

  return (
    <Card className="p-6 glass-card">
      <h3 className="text-xl font-semibold mb-4">Recent Write-Offs</h3>
      <div className="space-y-4">
        {writeOffs.map((writeOff) => (
          <div key={writeOff.id} className="flex justify-between items-center p-4 bg-muted rounded-lg">
            <div>
              <p className="font-semibold">{writeOff.description}</p>
              <p className="text-sm text-muted-foreground">
                {writeOff.category}
              </p>
            </div>
            <div className="text-right">
              <p className="font-semibold">{formatCurrency(writeOff.amount)}</p>
              <p className="text-sm text-muted-foreground">{new Date(writeOff.date).toLocaleDateString()}</p>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
};