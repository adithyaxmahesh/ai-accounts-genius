import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Plus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { startNewAudit } from "@/utils/auditUtils";
import { DeleteConfirmDialog } from "@/components/DeleteConfirmDialog";
import { AuditList } from "@/components/audit/AuditList";
import { useAuth } from "@/components/AuthProvider";

const Audit = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isCreating, setIsCreating] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [auditToDelete, setAuditToDelete] = useState<string | null>(null);
  const { session } = useAuth();

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
    },
    enabled: !!session
  });

  const handleNewAudit = async () => {
    try {
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

  const handleDeleteClick = (auditId: string) => {
    setAuditToDelete(auditId);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!auditToDelete) return;

    try {
      const { error: itemsError } = await supabase
        .from('audit_items')
        .delete()
        .eq('audit_id', auditToDelete);

      if (itemsError) throw itemsError;

      const { error: auditError } = await supabase
        .from('audit_reports')
        .delete()
        .eq('id', auditToDelete);

      if (auditError) throw auditError;

      await refetch();
      toast({
        title: "Success",
        description: "Audit deleted successfully",
      });
    } catch (error) {
      console.error('Error deleting audit:', error);
      toast({
        title: "Error",
        description: "Failed to delete audit",
        variant: "destructive"
      });
    } finally {
      setDeleteDialogOpen(false);
      setAuditToDelete(null);
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

      <AuditList 
        audits={audits || []}
        isLoading={isLoading}
        onNewAudit={handleNewAudit}
        onDeleteClick={handleDeleteClick}
      />

      <DeleteConfirmDialog
        isOpen={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Delete Audit"
        description="Are you sure you want to delete this audit? This action cannot be undone and all associated data will be permanently deleted."
      />
    </div>
  );
};

export default Audit;