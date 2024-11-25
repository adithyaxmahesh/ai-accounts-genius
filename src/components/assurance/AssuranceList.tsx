import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { Plus, CheckCircle2, Clock, AlertCircle } from "lucide-react";
import { AssuranceEngagementDialog } from "./AssuranceEngagementDialog";
import { Tables } from "@/integrations/supabase/types";
import { useAuth } from "@/components/AuthProvider";
import { useRealtimeSubscription } from "@/hooks/useRealtimeSubscription";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

type AssuranceEngagement = Tables<"assurance_engagements">;

export const AssuranceList = () => {
  const { session } = useAuth();
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  useRealtimeSubscription("assurance_engagements", ["assurance-engagements"]);

  const { data: engagements, isLoading } = useQuery({
    queryKey: ["assurance-engagements"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("assurance_engagements")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as AssuranceEngagement[];
    },
  });

  const updateEngagementStatus = async (id: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from("assurance_engagements")
        .update({ status: newStatus })
        .eq("id", id);

      if (error) throw error;

      toast({
        title: "Status Updated",
        description: `Engagement status changed to ${newStatus}`,
      });
    } catch (error) {
      console.error("Error updating status:", error);
      toast({
        title: "Error",
        description: "Failed to update engagement status",
        variant: "destructive",
      });
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle2 className="h-4 w-4 text-green-500" />;
      case "in_progress":
        return <Clock className="h-4 w-4 text-blue-500" />;
      default:
        return <AlertCircle className="h-4 w-4 text-yellow-500" />;
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="h-32 bg-muted rounded animate-pulse" />
        <div className="h-32 bg-muted rounded animate-pulse" />
        <div className="h-32 bg-muted rounded animate-pulse" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold">Assurance Engagements</h2>
        <Button onClick={() => setIsDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          New Engagement
        </Button>
      </div>

      {engagements?.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center h-48 text-center">
            <p className="text-muted-foreground mb-4">No assurance engagements found</p>
            <Button onClick={() => setIsDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Create your first engagement
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {engagements?.map((engagement) => (
            <Card key={engagement.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle>{engagement.client_name}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <p><strong>Type:</strong> {engagement.engagement_type}</p>
                    <div className="flex items-center gap-2">
                      <strong>Status:</strong>
                      <Select
                        value={engagement.status}
                        onValueChange={(value) => updateEngagementStatus(engagement.id, value)}
                      >
                        <SelectTrigger className="w-[180px]">
                          <div className="flex items-center gap-2">
                            {getStatusIcon(engagement.status || "")}
                            <SelectValue />
                          </div>
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="planning">Planning</SelectItem>
                          <SelectItem value="evidence_gathering">Evidence Gathering</SelectItem>
                          <SelectItem value="evaluation">Evaluation</SelectItem>
                          <SelectItem value="reporting">Reporting</SelectItem>
                          <SelectItem value="completed">Completed</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <p><strong>Start Date:</strong> {new Date(engagement.start_date || "").toLocaleDateString()}</p>
                    {engagement.objective && (
                      <p><strong>Objective:</strong> {engagement.objective}</p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <AssuranceEngagementDialog 
        isOpen={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        userId={session?.user.id || ""}
      />
    </div>
  );
};