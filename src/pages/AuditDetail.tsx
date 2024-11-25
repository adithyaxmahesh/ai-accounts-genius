import { useParams, useNavigate } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { useAuth } from "@/components/AuthProvider";
import AuditDetailHeader from "@/components/audit/AuditDetailHeader";
import AuditDetailTabs from "@/components/audit/AuditDetailTabs";

const AuditDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  const { session } = useAuth();

  // Redirect if not authenticated
  useEffect(() => {
    if (!session) {
      navigate('/auth');
      return;
    }
  }, [session, navigate]);

  // Fetch audit data
  const { data: audit, isLoading, error } = useQuery({
    queryKey: ['audit', id],
    queryFn: async () => {
      if (!id || !session?.user?.id) {
        throw new Error('No audit ID provided or user not authenticated');
      }
      
      const { data, error } = await supabase
        .from('audit_reports')
        .select(`
          *,
          audit_items (*)
        `)
        .eq('id', id)
        .eq('user_id', session.user.id)
        .single();
      
      if (error) {
        throw error;
      }
      
      if (!data) {
        throw new Error('Audit not found');
      }
      
      return data;
    },
    enabled: !!session && !!id,
    retry: 1
  });

  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="h-32 bg-gray-200 rounded"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (error) {
    toast({
      title: "Error",
      description: error instanceof Error ? error.message : 'Failed to load audit details',
      variant: "destructive"
    });
    navigate('/audit');
    return null;
  }

  if (!audit) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center">
          <h2 className="text-2xl font-semibold mb-4">Audit Not Found</h2>
          <button 
            onClick={() => navigate('/audit')}
            className="text-primary hover:underline"
          >
            Return to Audits
          </button>
        </div>
      </div>
    );
  }

  const flaggedItems = audit?.audit_items?.filter(item => item.status === 'flagged') || [];

  return (
    <div className="container mx-auto p-6 space-y-6">
      <AuditDetailHeader 
        audit={audit}
        flaggedItems={flaggedItems}
        selectedItemId={selectedItemId}
        setSelectedItemId={setSelectedItemId}
      />
      <AuditDetailTabs 
        auditId={audit.id} 
        onStatusChange={() => {
          // Refetch audit data when status changes
          window.location.reload();
        }} 
      />
    </div>
  );
};

export default AuditDetail;