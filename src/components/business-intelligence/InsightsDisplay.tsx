import { TrendingUp, ArrowUpRight, ArrowDownRight } from "lucide-react";

interface InsightsDisplayProps {
  insights: any[];
}

export const InsightsDisplay = ({ insights }: InsightsDisplayProps) => {
  return (
    <div className="space-y-6">
      {insights?.map((insight) => (
        <div key={insight.id} className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium">{insight.category}</span>
            </div>
            <span className={`text-xs font-medium ${
              insight.priority === 'high' ? 'text-red-500' : 
              insight.priority === 'medium' ? 'text-yellow-500' : 
              'text-green-500'
            }`}>
              {insight.priority?.toUpperCase()}
            </span>
          </div>

          <div className="space-y-2">
            {insight.recommendations?.map((rec: string, index: number) => (
              <div key={index} className="flex items-start gap-2 p-2 bg-muted rounded-lg">
                {rec.includes('increase') || rec.includes('growth') ? (
                  <ArrowUpRight className="h-3 w-3 text-green-500 mt-1" />
                ) : (
                  <ArrowDownRight className="h-3 w-3 text-red-500 mt-1" />
                )}
                <p className="text-xs">{rec}</p>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};