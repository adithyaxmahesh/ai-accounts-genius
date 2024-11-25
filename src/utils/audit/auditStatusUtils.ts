export const getStatusExplanation = (status: string) => {
  switch (status) {
    case 'planning':
      return "Initial phase: Defining audit scope, objectives, and materiality thresholds";
    case 'control_evaluation':
      return "Evaluating internal controls and assessing their effectiveness";
    case 'evidence_gathering':
      return "Collecting and analyzing financial data, documentation, and conducting tests";
    case 'review':
      return "Evaluating findings, preparing draft conclusions, and formulating audit opinion";
    case 'completed':
      return "Audit completed with final opinion issued and recommendations provided";
    default:
      return "Status pending or unknown";
  }
};

export const getRiskLevelExplanation = (level: string) => {
  switch (level) {
    case 'high':
      return "Significant issues identified requiring immediate attention";
    case 'medium':
      return "Notable concerns that should be addressed";
    case 'low':
      return "Minor or no issues identified";
    default:
      return "Risk level not assessed";
  }
};