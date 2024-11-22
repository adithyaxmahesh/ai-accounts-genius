import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { Plus } from "lucide-react";
import { AssuranceEngagementDialog } from "./AssuranceEngagementDialog";
import { Tables } from "@/integrations/supabase/types";
import { useAuth } from "@/components/AuthProvider";
import { useRealtimeSubscription } from "@/hooks/useRealtimeSubscription";

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
                <div className="space-y-2">
                  <p><strong>Type:</strong> {engagement.engagement_type}</p>
                  <p><strong>Status:</strong> {engagement.status}</p>
                  <p><strong>Start Date:</strong> {new Date(engagement.start_date || "").toLocaleDateString()}</p>
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