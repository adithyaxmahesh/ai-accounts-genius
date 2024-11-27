import { AlertCircle } from "lucide-react";

export const NoAnalysisState = () => {
  return (
    <div className="flex flex-col items-center justify-center py-8 text-center text-muted-foreground">
      <AlertCircle className="h-12 w-12 mb-4" />
      <p>No analysis available yet.</p>
      <p className="text-sm">Run an analysis to see detailed insights.</p>
    </div>
  );
};