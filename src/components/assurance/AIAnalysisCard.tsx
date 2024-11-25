import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileCheck, AlertCircle } from "lucide-react";
import { AIAnalysisOutcome } from "./AIAnalysisOutcome";

type AIAnalysisCardProps = {
  aiAnalysisOutcomes: Array<{
    engagementId: string;
    clientName: string;
    riskScore: number;
    confidenceScore: number;
    findings: Array<{ severity: string; description: string }>;
    recommendations: Array<{ priority: string; description: string }>;
  }>;
};

export const AIAnalysisCard = ({ aiAnalysisOutcomes }: AIAnalysisCardProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileCheck className="h-5 w-5 text-primary" />
          AI Analysis Outcomes
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {aiAnalysisOutcomes?.map((outcome) => (
          <AIAnalysisOutcome key={outcome.engagementId} {...outcome} />
        ))}

        {(!aiAnalysisOutcomes || aiAnalysisOutcomes.length === 0) && (
          <div className="flex flex-col items-center justify-center py-8 text-center text-muted-foreground">
            <AlertCircle className="h-12 w-12 mb-4" />
            <p>No AI analysis outcomes available yet.</p>
            <p className="text-sm">Complete some engagements to see AI-powered insights here.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};