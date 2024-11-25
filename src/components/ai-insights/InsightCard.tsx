import { getCategoryIcon, getCategoryColor } from './utils';

interface InsightCardProps {
  insight: {
    id: string;
    category: string;
    insight: string;
    recommendations?: Array<{ description: string }>;
    evidenceValidation?: any;
    created_at?: string;
    confidence_score?: number;
  };
}

export const InsightCard = ({ insight }: InsightCardProps) => {
  return (
    <div 
      key={insight.id} 
      className="p-4 bg-muted/50 rounded-lg hover:bg-muted/60 transition-all duration-300 transform hover:scale-[1.01] hover:shadow-md"
    >
      <div className="flex items-center gap-2 mb-3">
        {getCategoryIcon(insight.category)}
        <span className={`text-sm font-medium px-2 py-1 rounded-full ${getCategoryColor(insight.category)}`}>
          {insight.category}
        </span>
      </div>
      <p className="text-sm text-muted-foreground leading-relaxed">{insight.insight}</p>
      {insight.recommendations && insight.recommendations.length > 0 && (
        <div className="mt-3 space-y-2">
          <p className="text-sm font-medium text-primary">Recommendations:</p>
          <ul className="text-sm text-muted-foreground list-disc list-inside space-y-1">
            {insight.recommendations.map((rec, index) => (
              <li key={index} className="hover:text-primary transition-colors">
                {rec.description}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};