import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, AlertTriangle, Check, ClipboardList, Shield, Search, Trash2, Info } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { getStatusExplanation } from "@/utils/auditUtils";
import { AuditFrequencySelector } from "./AuditFrequencySelector";
import { useState } from "react";

interface AuditListProps {
  audits: any[];
  onDeleteClick: (id: string) => void;
}

const AuditList = ({ audits, onDeleteClick }: AuditListProps) => {
  const navigate = useNavigate();
  const [filteredAudits, setFilteredAudits] = useState(audits);

  const handleFrequencyChange = (frequency: string) => {
    if (frequency === "all") {
      setFilteredAudits(audits);
      return;
    }

    const filtered = audits.filter(audit => {
      const createdAt = new Date(audit.created_at);
      const now = new Date();
      
      if (frequency === "yearly") {
        return createdAt.getFullYear() === now.getFullYear();
      }
      
      if (frequency === "quarterly") {
        const quarter = Math.floor(createdAt.getMonth() / 3);
        const currentQuarter = Math.floor(now.getMonth() / 3);
        return createdAt.getFullYear() === now.getFullYear() && quarter === currentQuarter;
      }
      
      return true;
    });
    
    setFilteredAudits(filtered);
  };

  const handleCustomDatesChange = ({ start, end }: { start?: Date; end?: Date }) => {
    if (!start || !end) {
      setFilteredAudits(audits);
      return;
    }

    const filtered = audits.filter(audit => {
      const createdAt = new Date(audit.created_at);
      return createdAt >= start && createdAt <= end;
    });
    
    setFilteredAudits(filtered);
  };

  const handleYearsChange = (years: number[]) => {
    if (years.length === 0) {
      setFilteredAudits(audits);
      return;
    }

    const filtered = audits.filter(audit => {
      const createdAt = new Date(audit.created_at);
      return years.includes(createdAt.getFullYear());
    });
    
    setFilteredAudits(filtered);
  };

  return (
    <div className="space-y-6">
      <div className="mb-6">
        <AuditFrequencySelector
          onFrequencyChange={handleFrequencyChange}
          onCustomDatesChange={handleCustomDatesChange}
          onYearsChange={handleYearsChange}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredAudits.map((audit) => (
          <Card 
            key={audit.id}
            className="p-6 hover:shadow-lg transition-shadow glass-card cursor-pointer"
            onClick={() => navigate(`/audit/${audit.id}`)}
          >
            <div className="flex justify-between items-start mb-4">
              {getStatusIcon(audit.status)}
              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate(`/audit/${audit.id}`);
                  }}
                  className="hover:bg-secondary"
                >
                  <Search className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteClick(audit.id);
                  }}
                  className="hover:text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
            
            <h3 className="text-lg font-semibold mb-2">{audit.title}</h3>
            <p className="text-sm text-muted-foreground mb-4">
              {audit.description || getStatusExplanation(audit.status)}
            </p>
            <div className="flex justify-between items-center text-sm text-muted-foreground">
              <span className="flex items-center">
                <Info className="h-4 w-4 mr-1" />
                Created: {new Date(audit.created_at).toLocaleDateString()}
              </span>
              <span className="flex items-center">
                {audit.risk_level === 'high' ? (
                  <AlertTriangle className="h-4 w-4 text-destructive mr-1" />
                ) : audit.status === 'completed' ? (
                  <Check className="h-4 w-4 text-green-500 mr-1" />
                ) : null}
                {audit.risk_level}
              </span>
            </div>
            <div className="mt-4 pt-4 border-t">
              <div className="flex justify-between text-sm">
                <span className="flex items-center">
                  <ClipboardList className="h-4 w-4 mr-1" />
                  Items: {audit.audit_items?.length || 0}
                </span>
                <span className={`flex items-center ${
                  audit.risk_level === 'high' ? 'text-red-600' :
                  audit.risk_level === 'medium' ? 'text-yellow-600' :
                  'text-green-600'
                }`}>
                  <Shield className="h-4 w-4 mr-1" />
                  Risk Level: {audit.risk_level}
                </span>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

const getStatusIcon = (status: string) => {
  switch (status) {
    case 'planning':
      return <ClipboardList className="h-8 w-8 text-blue-500" />;
    case 'control_evaluation':
      return <Shield className="h-8 w-8 text-yellow-500" />;
    case 'evidence_gathering':
      return <Search className="h-8 w-8 text-purple-500" />;
    case 'review':
      return <FileText className="h-8 w-8 text-orange-500" />;
    case 'completed':
      return <Check className="h-8 w-8 text-green-500" />;
    default:
      return <FileText className="h-8 w-8 text-gray-500" />;
  }
};

export default AuditList;