import { TrendingUp, Lightbulb, Shield, AlertTriangle } from 'lucide-react';

export const getCategoryIcon = (category: string) => {
  switch (category) {
    case 'trend':
      return <TrendingUp className="h-5 w-5 text-blue-500" />;
    case 'optimization':
      return <Lightbulb className="h-5 w-5 text-yellow-500" />;
    case 'assurance':
      return <Shield className="h-5 w-5 text-green-500" />;
    default:
      return <AlertTriangle className="h-5 w-5 text-red-500" />;
  }
};

export const getCategoryColor = (category: string) => {
  switch (category) {
    case 'trend':
      return 'bg-blue-500/10 text-blue-500';
    case 'optimization':
      return 'bg-yellow-500/10 text-yellow-500';
    case 'assurance':
      return 'bg-green-500/10 text-green-500';
    default:
      return 'bg-red-500/10 text-red-500';
  }
};