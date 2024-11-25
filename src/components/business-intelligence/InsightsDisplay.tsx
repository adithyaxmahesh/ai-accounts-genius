import { TrendingUp, ArrowUpRight, ArrowDownRight } from "lucide-react";

interface InsightsDisplayProps {
  insights: Array<{
    id: string;
    category: string;
    metrics?: Record<string, any>;
    recommendations?: string[];
    priority?: string;
  }>;
}

export const InsightsDisplay = ({ insights }: InsightsDisplayProps) => {
  return (
    <div className="space-y-4">
      {insights.map((insight) => (
        <div 
          key={insight.id} 
          className="p-4 rounded-lg bg-gradient-to-br from-gray-900/50 to-gray-800/30 backdrop-blur-sm"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              <span className="font-medium text-sm">{insight.category}</span>
            </div>
            <span className={`text-xs font-medium px-2 py-1 rounded-full ${
              insight.priority === 'high' ? 'bg-red-500/10 text-red-500' : 
              insight.priority === 'medium' ? 'bg-yellow-500/10 text-yellow-500' : 
              'bg-green-500/10 text-green-500'
            }`}>
              {insight.priority?.toUpperCase()}
            </span>
          </div>

          {insight.metrics && (
            <div className="grid grid-cols-3 gap-4 mb-4">
              {Object.entries(insight.metrics).map(([key, value]) => (
                <div key={key} className="space-y-1">
                  <p className="text-xs text-gray-400">{key}</p>
                  <p className="text-sm font-medium">{value}</p>
                </div>
              ))}
            </div>
          )}

          {insight.recommendations?.map((rec, index) => (
            <div key={index} className="flex items-start gap-2 p-3 bg-gray-900/30 rounded-lg mt-2">
              {rec.includes('increase') || rec.includes('growth') ? (
                <ArrowUpRight className="h-4 w-4 text-green-500 mt-1" />
              ) : (
                <ArrowDownRight className="h-4 w-4 text-red-500 mt-1" />
              )}
              <p className="text-sm text-gray-300">{rec}</p>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
};