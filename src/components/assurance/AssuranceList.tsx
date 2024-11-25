import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { Plus, CheckCircle2, Clock, AlertCircle, ShieldCheck, ClipboardCheck } from "lucide-react";
import { AssuranceEngagementDialog } from "./AssuranceEngagementDialog";
import { Tables } from "@/integrations/supabase/types";
import { useAuth } from "@/components/AuthProvider";
import { useRealtimeSubscription } from "@/hooks/useRealtimeSubscription";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";

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

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
      case "in_progress":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
      default:
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200";
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
        <div className="space-y-1">
          <h2 className="text-2xl font-semibold flex items-center gap-2">
            <ShieldCheck className="h-6 w-6 text-primary" />
            Assurance Engagements
          </h2>
          <p className="text-sm text-muted-foreground">
            Track and manage quality control procedures and assurance tasks
          </p>
        </div>
        <Button onClick={() => setIsDialogOpen(true)} className="hover-scale">
          <Plus className="h-4 w-4 mr-2" />
          New Engagement
        </Button>
      </div>

      {engagements?.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center h-48 text-center">
            <ClipboardCheck className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground mb-4">No assurance engagements found</p>
            <Button onClick={() => setIsDialogOpen(true)} className="hover-scale">
              <Plus className="h-4 w-4 mr-2" />
              Create your first engagement
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {engagements?.map((engagement) => (
            <Card 
              key={engagement.id} 
              className="hover:shadow-lg transition-all duration-200 animate-fade-in"
            >
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className="truncate">{engagement.client_name}</span>
                  <Badge className={getStatusBadgeColor(engagement.status || "")}>
                    {engagement.status}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <p className="text-sm font-medium">Type: {engagement.engagement_type}</p>
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium">Status:</p>
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
                    <p className="text-sm text-muted-foreground">
                      Start Date: {new Date(engagement.start_date || "").toLocaleDateString()}
                    </p>
                    {engagement.objective && (
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        Objective: {engagement.objective}
                      </p>
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