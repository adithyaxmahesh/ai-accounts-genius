import { Card } from "@/components/ui/card";
import { AlertTriangle } from "lucide-react";

interface FraudInsight {
  description: string;
  severity: 'high' | 'medium' | 'low';
  amount?: number;
}

interface AuditFraudInsightsProps {
  insights: FraudInsight[];
  isVisible: boolean;
}

const AuditFraudInsights = ({ insights, isVisible }: AuditFraudInsightsProps) => {
  if (!isVisible || !insights.length) return null;

  return (
    <div className="absolute top-full left-0 right-0 mt-2 z-50">
      <Card className="p-4 shadow-lg border-red-200 bg-red-50">
        <h3 className="text-lg font-semibold text-red-700 mb-3 flex items-center gap-2">
          <AlertTriangle className="h-5 w-5" />
          Potential Fraud Alerts
        </h3>
        <div className="space-y-2">
          {insights.map((insight, index) => (
            <div 
              key={index}
              className={`p-3 rounded-md ${
                insight.severity === 'high' ? 'bg-red-100 text-red-800' :
                insight.severity === 'medium' ? 'bg-orange-100 text-orange-800' :
                'bg-yellow-100 text-yellow-800'
              }`}
            >
              <div className="flex justify-between items-start">
                <p className="text-sm">{insight.description}</p>
                {insight.amount && (
                  <span className="text-sm font-semibold">
                    ${insight.amount.toLocaleString()}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};

export default AuditFraudInsights;