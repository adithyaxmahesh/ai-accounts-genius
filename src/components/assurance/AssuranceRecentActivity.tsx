import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tables } from "@/integrations/supabase/types";
import { formatDistanceToNow } from "date-fns";
import { CheckCircle2, Clock, AlertTriangle } from "lucide-react";

type AssuranceEngagement = Tables<"assurance_engagements">;

interface Props {
  engagements: AssuranceEngagement[];
}

export const AssuranceRecentActivity = ({ engagements }: Props) => {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle2 className="h-4 w-4 text-green-500" />;
      case "in_progress":
        return <Clock className="h-4 w-4 text-blue-500" />;
      default:
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
    }
  };

  const recentEngagements = engagements
    .sort((a, b) => {
      const dateA = new Date(a.created_at || "");
      const dateB = new Date(b.created_at || "");
      return dateB.getTime() - dateA.getTime();
    })
    .slice(0, 5);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Activity</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-8">
          {recentEngagements.map((engagement) => (
            <div key={engagement.id} className="flex items-center">
              <div className="space-y-1">
                <p className="text-sm font-medium leading-none">
                  {engagement.client_name}
                </p>
                <p className="text-sm text-muted-foreground">
                  {engagement.engagement_type}
                </p>
              </div>
              <div className="ml-auto flex items-center gap-4">
                {getStatusIcon(engagement.status)}
                <div className="text-sm text-muted-foreground">
                  {formatDistanceToNow(new Date(engagement.created_at || ""), {
                    addSuffix: true,
                  })}
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};