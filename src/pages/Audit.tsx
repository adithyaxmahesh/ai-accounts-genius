import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { 
  FileText, 
  AlertTriangle, 
  Check, 
  ArrowLeft,
  ClipboardList,
  Shield,
  Search,
  FileCheck,
  Plus,
  Info
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { startNewAudit, getStatusExplanation } from "@/utils/auditUtils";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const getStatusIcon = (status: string) => {
  switch (status) {
    case 'planning':
      return <ClipboardList className="h-8 w-8 text-blue-500" />;
    case 'control_evaluation':
      return <Shield className="h-8 w-8 text-yellow-500" />;
    case 'evidence_gathering':
      return <Search className="h-8 w-8 text-purple-500" />;
    case 'review':
      return <FileCheck className="h-8 w-8 text-orange-500" />;
    case 'completed':
      return <Check className="h-8 w-8 text-green-500" />;
    default:
      return <FileText className="h-8 w-8 text-gray-500" />;
  }
};

const Audit = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isCreating, setIsCreating] = useState(false);

  const { data: audits, isLoading, refetch } = useQuery({
    queryKey: ['audits'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: "Error",
          description: "Please sign in to view audits",
          variant: "destructive"
        });
        navigate("/auth");
        throw new Error("Not authenticated");
      }

      const { data, error } = await supabase
        .from('audit_reports')
        .select('*, audit_items(*)')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    }
  });

  const handleNewAudit = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: "Error",
          description: "Please sign in to create an audit",
          variant: "destructive"
        });
        navigate("/auth");
        return;
      }

      setIsCreating(true);
      const title = `Audit Report ${new Date().toLocaleDateString()}`;
      
      const newAudit = await startNewAudit(title);
      
      if (!newAudit || !newAudit.id) {
        throw new Error("Failed to create audit: No audit data returned");
      }
      
      await refetch();
      
      toast({
        title: "Success",
        description: "New audit created and planning phase initiated",
      });
      
      navigate(`/audit/${newAudit.id}`);
    } catch (error) {
      console.error('Error creating audit:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create new audit. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6 fade-in">
      <div className="flex items-center space-x-4 mb-6">
        <Button 
          variant="ghost" 
          onClick={() => navigate('/')}
          className="hover:bg-gray-100 transition-colors"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Dashboard
        </Button>
      </div>

      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Audit Reports</h1>
          <p className="text-muted-foreground mt-2">
            Conduct structured audits following professional standards
          </p>
        </div>
        <Button 
          onClick={handleNewAudit} 
          className="hover:bg-primary/90 transition-colors"
          disabled={isCreating}
        >
          <Plus className="mr-2 h-4 w-4" />
          {isCreating ? 'Creating...' : 'Start New Audit'}
        </Button>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center p-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      ) : !audits?.length ? (
        <Card className="p-8 text-center">
          <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-lg font-semibold mb-2">No Audits Yet</h3>
          <p className="text-muted-foreground mb-4">
            Start your first audit to track and manage your financial reviews
          </p>
          <Button onClick={handleNewAudit} disabled={isCreating}>
            <Plus className="mr-2 h-4 w-4" />
            Create Your First Audit
          </Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {audits.map((audit) => (
            <Card 
              key={audit.id}
              className="p-6 hover:shadow-lg transition-shadow cursor-pointer glass-card"
              onClick={() => navigate(`/audit/${audit.id}`)}
            >
              <div className="flex justify-between items-start mb-4">
                {getStatusIcon(audit.status)}
                <Tooltip>
                  <TooltipTrigger>
                    <div className={`px-3 py-1 rounded-full text-sm ${
                      audit.status === 'completed' ? 'bg-green-100 text-green-800' :
                      audit.status === 'review' ? 'bg-orange-100 text-orange-800' :
                      audit.status === 'evidence_gathering' ? 'bg-purple-100 text-purple-800' :
                      audit.status === 'control_evaluation' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-blue-100 text-blue-800'
                    }`}>
                      {audit.status.replace('_', ' ')}
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{getStatusExplanation(audit.status)}</p>
                  </TooltipContent>
                </Tooltip>
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
      )}
    </div>
  );
};

export default Audit;