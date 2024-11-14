import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { ArrowLeft, FileText, AlertTriangle, Check, Info } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

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

  const getStatusExplanation = (status) => {
    switch (status) {
      case 'pending':
        return "Audit has been created but review hasn't started yet";
      case 'in_progress':
        return "Currently under review by the auditor";
      case 'completed':
        return "All items have been reviewed and findings documented";
      default:
        return "Status unknown";
    }
  };

  const getRiskLevelExplanation = (level) => {
    switch (level) {
      case 'low':
        return "Minor issues that need attention but don't pose immediate risks";
      case 'medium':
        return "Significant issues that should be addressed in the near term";
      case 'high':
        return "Critical issues requiring immediate attention";
      default:
        return "Risk level not assessed";
    }
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
            <div className="flex items-center gap-2">
              <p className="text-muted-foreground">Status</p>
              <Tooltip>
                <TooltipTrigger>
                  <Info className="h-4 w-4 text-muted-foreground" />
                </TooltipTrigger>
                <TooltipContent>
                  <p>{getStatusExplanation(audit?.status)}</p>
                </TooltipContent>
              </Tooltip>
            </div>
            <div className={`mt-1 px-3 py-1 rounded-full text-sm inline-block ${
              audit?.status === 'completed' ? 'bg-green-100 text-green-800' :
              audit?.status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
              'bg-yellow-100 text-yellow-800'
            }`}>
              {audit?.status}
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <p className="text-muted-foreground">Risk Level</p>
              <Tooltip>
                <TooltipTrigger>
                  <Info className="h-4 w-4 text-muted-foreground" />
                </TooltipTrigger>
                <TooltipContent>
                  <p>{getRiskLevelExplanation(audit?.risk_level)}</p>
                </TooltipContent>
              </Tooltip>
            </div>
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
            <div className="flex items-center gap-2 mb-2">
              <h3 className="text-lg font-semibold">Description</h3>
              <Tooltip>
                <TooltipTrigger>
                  <Info className="h-4 w-4 text-muted-foreground" />
                </TooltipTrigger>
                <TooltipContent>
                  <p>Detailed explanation of the audit's purpose and scope</p>
                </TooltipContent>
              </Tooltip>
            </div>
            <p className="text-muted-foreground">{audit?.description}</p>
          </div>

          <div>
            <div className="flex items-center gap-2 mb-2">
              <h3 className="text-lg font-semibold">Audit Items</h3>
              <Tooltip>
                <TooltipTrigger>
                  <Info className="h-4 w-4 text-muted-foreground" />
                </TooltipTrigger>
                <TooltipContent>
                  <p>Individual transactions or records being reviewed</p>
                </TooltipContent>
              </Tooltip>
            </div>
            <div className="space-y-4">
              {audit?.audit_items?.map((item) => (
                <Card key={item.id} className="p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-semibold">{item.category}</p>
                        <Tooltip>
                          <TooltipTrigger>
                            <Info className="h-4 w-4 text-muted-foreground" />
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Category helps classify the type of transaction or record</p>
                          </TooltipContent>
                        </Tooltip>
                      </div>
                      <p className="text-sm text-muted-foreground">{item.description}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">${item.amount?.toLocaleString()}</p>
                      <p className={`text-sm ${
                        item.status === 'approved' ? 'text-green-600' :
                        item.status === 'flagged' ? 'text-red-600' :
                        'text-muted-foreground'
                      }`}>
                        {item.status}
                      </p>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>

          {audit?.recommendations?.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-2">
                <h3 className="text-lg font-semibold">Recommendations</h3>
                <Tooltip>
                  <TooltipTrigger>
                    <Info className="h-4 w-4 text-muted-foreground" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Suggested actions to address findings and improve processes</p>
                  </TooltipContent>
                </Tooltip>
              </div>
              <ul className="list-disc pl-5 space-y-2">
                {audit.recommendations.map((rec, index) => (
                  <li key={index} className="text-muted-foreground">{rec}</li>
                ))}
              </ul>
            </div>
          )}

          <div className="mt-6 p-4 bg-muted rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <h3 className="text-lg font-semibold">Audit Timeline</h3>
              <Tooltip>
                <TooltipTrigger>
                  <Info className="h-4 w-4 text-muted-foreground" />
                </TooltipTrigger>
                <TooltipContent>
                  <p>Key dates and milestones in the audit process</p>
                </TooltipContent>
              </Tooltip>
            </div>
            <div className="space-y-2">
              <p className="text-sm">
                <span className="font-semibold">Created:</span>{" "}
                {new Date(audit?.created_at).toLocaleDateString()}
              </p>
              <p className="text-sm">
                <span className="font-semibold">Last Updated:</span>{" "}
                {new Date(audit?.created_at).toLocaleDateString()}
              </p>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default AuditDetail;