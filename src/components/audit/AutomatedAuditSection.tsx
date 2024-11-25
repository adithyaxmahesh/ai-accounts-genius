import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { AlertTriangle, CheckCircle, Clock, Activity } from "lucide-react";

interface AutomatedAuditSectionProps {
  auditId: string;
  onComplete?: () => void;
}

export const AutomatedAuditSection = ({ auditId, onComplete }: AutomatedAuditSectionProps) => {
  const [isRunning, setIsRunning] = useState(false);
  const [progress, setProgress] = useState(0);
  const { toast } = useToast();

  const startAutomatedAudit = async () => {
    if (!auditId) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Invalid audit ID provided.",
      });
      return;
    }

    setIsRunning(true);
    setProgress(0);
    
    try {
      // Start progress animation
      const interval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 90) {
            clearInterval(interval);
            return 90;
          }
          return prev + 10;
        });
      }, 1000);

      const { data, error } = await supabase.functions.invoke('automated-audit', {
        body: { auditId }
      });

      clearInterval(interval);

      if (error) {
        throw error;
      }

      if (!data?.success) {
        throw new Error(data?.error || 'Failed to complete automated audit');
      }

      setProgress(100);

      toast({
        title: "Automated Audit Complete",
        description: "The audit analysis has been completed successfully.",
      });

      if (onComplete) {
        onComplete();
      }
    } catch (error) {
      console.error('Error running automated audit:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to complete automated audit. Please try again.",
      });
    } finally {
      setIsRunning(false);
      setTimeout(() => setProgress(0), 1000);
    }
  };

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">Automated Audit Analysis</h3>
        <Button 
          onClick={startAutomatedAudit} 
          disabled={isRunning}
          className="hover-scale"
        >
          {isRunning ? (
            <>
              <Activity className="mr-2 h-4 w-4 animate-spin" />
              Running Analysis...
            </>
          ) : (
            <>
              <Clock className="mr-2 h-4 w-4" />
              Start Automated Audit
            </>
          )}
        </Button>
      </div>

      {isRunning && (
        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <Activity className="h-4 w-4 text-muted-foreground animate-spin" />
            <span>Analysis in progress...</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>
      )}
    </Card>
  );
};