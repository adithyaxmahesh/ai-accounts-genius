import React from 'react';
import { AlertCircle, CheckCircle2, Clock, FileSearch, AlertTriangle } from "lucide-react";

interface StatusIconProps {
  status: string;
}

export const StatusIcon: React.FC<StatusIconProps> = ({ status }) => {
  switch (status) {
    case 'completed':
      return <CheckCircle2 className="h-6 w-6 text-green-500" />;
    case 'in_progress':
      return <Clock className="h-6 w-6 text-blue-500" />;
    case 'review':
      return <FileSearch className="h-6 w-6 text-yellow-500" />;
    case 'flagged':
      return <AlertTriangle className="h-6 w-6 text-red-500" />;
    default:
      return <AlertCircle className="h-6 w-6 text-gray-500" />;
  }
};

export default StatusIcon;