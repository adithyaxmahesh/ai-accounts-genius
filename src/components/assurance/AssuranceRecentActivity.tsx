import { Users } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import type { Tables } from "@/integrations/supabase/types";

type AssuranceEngagement = Tables<"assurance_engagements">;

interface RecentActivityProps {
  engagements: AssuranceEngagement[];
}

export const AssuranceRecentActivity = ({ engagements }: RecentActivityProps) => {
  return (
    <Card className="hover:shadow-lg transition-shadow cursor-pointer">
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <Users className="h-5 w-5 text-primary" />
          Recent Activity
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {engagements?.slice(0, 5).map((engagement) => (
            <div 
              key={engagement.id} 
              className="flex items-center justify-between border-b pb-2 hover:bg-muted/50 transition-colors rounded p-2"
            >
              <div>
                <p className="font-medium">{engagement.client_name}</p>
                <p className="text-sm text-muted-foreground">{engagement.engagement_type}</p>
              </div>
              <div className="flex items-center gap-2">
                <span className={`px-2 py-1 rounded-full text-xs ${
                  engagement.status === 'completed' ? 'bg-green-100 text-green-800' :
                  engagement.status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {engagement.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};