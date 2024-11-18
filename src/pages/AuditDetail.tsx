import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { ArrowLeft, AlertTriangle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import AuditItemCard from "@/components/AuditItemCard";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import TaxSummaryTab from "@/components/TaxSummaryTab";
import AuditDetailsTab from "@/components/AuditDetailsTab";
import { useState } from "react";

const AuditDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);

  // Validate UUID format
  const isValidUUID = (uuid: string | undefined) => {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    return uuid ? uuidRegex.test(uuid) : false;
  };

  const { data: audit, isLoading, error } = useQuery({
    queryKey: ['audit', id],
    queryFn: async () => {
      if (!isValidUUID(id)) {
        throw new Error('Invalid audit ID format');
      }

      const { data, error } = await supabase
        .from('audit_reports')
        .select(`
          *,
          audit_items (*)
        `)
        .eq('id', id)
        .single();
      
      if (error) throw error;
      return data;
    },
    enabled: !!id
  });

  const getFraudInsights = (item: any) => {
    const insights = [];
    
    if (item.status === 'flagged') {
      insights.push({
        description: 'Transaction has been flagged for suspicious activity',
        severity: 'high',
        amount: item.amount
      });
    }

    if (item.amount > 10000) {
      insights.push({
        description: 'Large transaction amount detected',
        severity: 'medium',
        amount: item.amount
      });
    }

    return insights;
  };

  if (error) {
    toast({
      title: "Error",
      description: "Failed to load audit details. Please check the audit ID.",
      variant: "destructive"
    });
    navigate('/audit');
    return null;
  }

  if (isLoading) return <div>Loading audit details...</div>;

  const flaggedItems = audit?.audit_items?.filter(item => item.status === 'flagged') || [];

  return (
    <div className="container mx-auto p-6 space-y-6 fade-in">
      <Button 
        variant="ghost" 
        onClick={() => navigate('/audit')}
        className="mb-4 hover-scale"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Audits
      </Button>

      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">{audit?.title}</h1>
        <div className="space-x-2">
          <Button
            variant="outline"
            onClick={() => updateAuditStatus('in_progress')}
            className="hover-scale"
          >
            Start Review
          </Button>
          <Button
            onClick={() => updateAuditStatus('completed')}
            className="hover-scale"
          >
            Complete Audit
          </Button>
        </div>
      </div>

      {flaggedItems.length > 0 && (
        <div className="p-6 bg-red-50 border-red-200 rounded-lg">
          <h2 className="text-lg font-semibold text-red-700 mb-4 flex items-center">
            <AlertTriangle className="mr-2 h-5 w-5" />
            Flagged Items Requiring Attention ({flaggedItems.length})
          </h2>
          <div className="space-y-4">
            {flaggedItems.map((item) => (
              <AuditItemCard 
                key={item.id}
                item={item}
                insights={getFraudInsights(item)}
                isSelected={selectedItemId === item.id}
                onSelect={() => setSelectedItemId(selectedItemId === item.id ? null : item.id)}
              />
            ))}
          </div>
        </div>
      )}

      <Tabs defaultValue="details" className="w-full">
        <TabsList>
          <TabsTrigger value="details">Audit Details</TabsTrigger>
          <TabsTrigger value="tax">Tax Summary</TabsTrigger>
        </TabsList>
        <TabsContent value="details">
          <AuditDetailsTab 
            audit={audit}
            getStatusExplanation={getStatusExplanation}
            getRiskLevelExplanation={getRiskLevelExplanation}
          />
        </TabsContent>
        <TabsContent value="tax">
          <TaxSummaryTab audit={audit} />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AuditDetail;