import { Card } from "@/components/ui/card";
import { Bell } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/components/AuthProvider";
import { cn } from "@/lib/utils";

export const NotificationsCard = () => {
  const { session } = useAuth();

  const { data: notifications } = useQuery({
    queryKey: ['notifications', session?.user.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('push_notifications')
        .select('*')
        .eq('user_id', session?.user.id)
        .order('created_at', { ascending: false })
        .limit(5);
      
      if (error) throw error;
      return data;
    }
  });

  return (
    <Card className="p-6">
      <div className="flex items-center gap-2 mb-6">
        <Bell className="h-6 w-6 text-primary" />
        <h2 className="text-xl font-semibold">Notifications</h2>
      </div>

      <div className="space-y-4">
        {notifications?.map((notification) => (
          <div
            key={notification.id}
            className={cn(
              "p-4 rounded-lg",
              notification.read ? "bg-muted" : "bg-primary/5"
            )}
          >
            <h3 className="font-medium mb-1">{notification.title}</h3>
            <p className="text-sm text-muted-foreground">{notification.body}</p>
          </div>
        ))}

        {!notifications?.length && (
          <div className="text-center text-muted-foreground">
            No new notifications
          </div>
        )}
      </div>
    </Card>
  );
};