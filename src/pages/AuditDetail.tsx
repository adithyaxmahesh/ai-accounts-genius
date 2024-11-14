import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { ArrowLeft, FileText, AlertTriangle, Check } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";

const AuditDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();

  const { data: audit, isLoading } = useQuery({
    queryKey: ['audit', id],
    queryFn: async () => {
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
    }
  });

  const updateAuditStatus = async (status) => {
    const { error } = await supabase
      .from('audit_reports')
      .update({ status })
      .eq('id', id);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to update audit status",
        variant: "destructive"
      });
      return;
    }

    toast({
      title: "Success",
      description: "Audit status updated",
    });
  };

  if (isLoading) return <div>Loading audit details...</div>;

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

      <Card className="p-6 glass-card">
        <div className="flex justify-between items-start mb-6">
          <div>
            <p className="text-muted-foreground">Status</p>
            <div className={`mt-1 px-3 py-1 rounded-full text-sm inline-block ${
              audit?.status === 'completed' ? 'bg-green-100 text-green-800' :
              audit?.status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
              'bg-yellow-100 text-yellow-800'
            }`}>
              {audit?.status}
            </div>
          </div>
          <div>
            <p className="text-muted-foreground">Risk Level</p>
            <div className="mt-1 flex items-center">
              {audit?.risk_level === 'high' ? (
                <AlertTriangle className="h-4 w-4 text-destructive mr-1" />
              ) : audit?.status === 'completed' ? (
                <Check className="h-4 w-4 text-green-500 mr-1" />
              ) : null}
              {audit?.risk_level}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold mb-2">Description</h3>
            <p className="text-muted-foreground">{audit?.description}</p>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-2">Audit Items</h3>
            <div className="space-y-4">
              {audit?.audit_items?.map((item) => (
                <Card key={item.id} className="p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-semibold">{item.category}</p>
                      <p className="text-sm text-muted-foreground">{item.description}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">${item.amount}</p>
                      <p className="text-sm text-muted-foreground">{item.status}</p>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>

          {audit?.recommendations?.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold mb-2">Recommendations</h3>
              <ul className="list-disc pl-5 space-y-2">
                {audit.recommendations.map((rec, index) => (
                  <li key={index} className="text-muted-foreground">{rec}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
};

export default AuditDetail;