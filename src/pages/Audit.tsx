import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { FileText, AlertTriangle, Check, ArrowLeft } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/components/AuthProvider";

const Audit = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { session } = useAuth();
  const [selectedAudit, setSelectedAudit] = useState(null);

  const { data: audits, isLoading } = useQuery({
    queryKey: ['audits', session?.user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('audit_reports')
        .select('*')
        .eq('user_id', session?.user?.id)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    },
    enabled: !!session?.user?.id
  });

  const startNewAudit = async () => {
    const { data, error } = await supabase
      .from('audit_reports')
      .insert([
        {
          title: `Audit Report ${new Date().toLocaleDateString()}`,
          description: "New audit report",
          status: "pending",
          user_id: session?.user?.id
        }
      ])
      .select()
      .single();

    if (error) {
      toast({
        title: "Error",
        description: "Failed to create new audit",
        variant: "destructive"
      });
      return;
    }

    toast({
      title: "Success",
      description: "New audit created",
    });
    navigate(`/audit/${data.id}`);
  };

  return (
    <div className="container mx-auto p-6 space-y-6 fade-in">
      <div className="flex items-center space-x-4 mb-6">
        <Button 
          variant="ghost" 
          onClick={() => navigate('/')}
          className="hover-scale"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Dashboard
        </Button>
      </div>

      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Audit Reports</h1>
        <Button onClick={startNewAudit} className="hover-scale">
          <FileText className="mr-2 h-4 w-4" />
          Start New Audit
        </Button>
      </div>

      {isLoading ? (
        <div>Loading audits...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {audits?.map((audit) => (
            <Card 
              key={audit.id}
              className="p-6 hover-scale cursor-pointer glass-card"
              onClick={() => navigate(`/audit/${audit.id}`)}
            >
              <div className="flex justify-between items-start mb-4">
                <FileText className="h-8 w-8 text-primary" />
                <div className={`px-2 py-1 rounded-full text-sm ${
                  audit.status === 'completed' ? 'bg-green-100 text-green-800' :
                  audit.status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
                  'bg-yellow-100 text-yellow-800'
                }`}>
                  {audit.status}
                </div>
              </div>
              <h3 className="text-lg font-semibold mb-2">{audit.title}</h3>
              <p className="text-sm text-muted-foreground mb-4">{audit.description}</p>
              <div className="flex justify-between items-center text-sm text-muted-foreground">
                <span>Created: {new Date(audit.created_at).toLocaleDateString()}</span>
                <span className="flex items-center">
                  {audit.risk_level === 'high' ? (
                    <AlertTriangle className="h-4 w-4 text-destructive mr-1" />
                  ) : audit.status === 'completed' ? (
                    <Check className="h-4 w-4 text-green-500 mr-1" />
                  ) : null}
                  {audit.risk_level}
                </span>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default Audit;