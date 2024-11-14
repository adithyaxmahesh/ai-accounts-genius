import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tooltip } from "@/components/ui/tooltip";
import { useToast } from "@/components/ui/use-toast";
import { ArrowLeft, AlertTriangle, CheckCircle, Clock } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { AuditReport } from "@/types/audit";

const AuditDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();

  // Validate UUID format
  const isValidUUID = (uuid: string): boolean => {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    return uuidRegex.test(uuid);
  };

  const { data: audit, isLoading, error } = useQuery({
    queryKey: ['audit', id],
    queryFn: async (): Promise<AuditReport | null> => {
      if (!id || !isValidUUID(id)) {
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

  if (error) {
    toast({
      title: "Error",
      description: "Failed to load audit details. Please check the audit ID.",
      variant: "destructive"
    });
    navigate('/audit');
    return null;
  }

  const updateAuditStatus = async (status: string): Promise<void> => {
    if (!id || !isValidUUID(id)) {
      toast({
        title: "Error",
        description: "Invalid audit ID format",
        variant: "destructive"
      });
      return;
    }

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
      description: "Audit status updated successfully"
    });
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center mb-4">
        <Button variant="ghost" onClick={() => navigate('/audit')}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Audits
        </Button>
      </div>
      {isLoading && <div>Loading...</div>}
      {audit && (
        <Card>
          <h2 className="text-2xl font-semibold">{audit.title}</h2>
          <p>{audit.description}</p>
          <Badge>{audit.status}</Badge>
          <div className="mt-4">
            <Button onClick={() => updateAuditStatus('approved')}>Approve</Button>
            <Button onClick={() => updateAuditStatus('flagged')}>Flag</Button>
          </div>
          <div className="mt-6">
            <h3 className="text-lg font-semibold">Audit Items</h3>
            <ul>
              {audit.audit_items.map((item) => (
                <li key={item.id} className="flex justify-between">
                  <span>{item.description}</span>
                  <span>${item.amount}</span>
                </li>
              ))}
            </ul>
          </div>
        </Card>
      )}
    </div>
  );
};

export default AuditDetail;
