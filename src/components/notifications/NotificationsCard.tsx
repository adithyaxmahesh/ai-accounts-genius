import { Card } from "@/components/ui/card";
import { Bell, CheckCircle2 } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/components/AuthProvider";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { format } from "date-fns";

export const NotificationsCard = () => {
  const { session } = useAuth();
  const { toast } = useToast();

  const { data: notifications, refetch } = useQuery({
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

  const markAsRead = async (notificationId: string) => {
    try {
      const { error } = await supabase
        .from('push_notifications')
        .update({ read: true })
        .eq('id', notificationId);

      if (error) throw error;
      
      await refetch();
      
      toast({
        title: "Notification marked as read",
        description: "The notification has been updated",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to mark notification as read",
        variant: "destructive",
      });
    }
  };

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Bell className="h-6 w-6 text-primary" />
          <h2 className="text-xl font-semibold">Notifications</h2>
        </div>
        {notifications?.some(n => !n.read) && (
          <div className="bg-primary/10 text-primary text-sm px-2 py-1 rounded-full">
            New
          </div>
        )}
      </div>

      <div className="space-y-4">
        {notifications?.map((notification) => (
          <div
            key={notification.id}
            className={cn(
              "p-4 rounded-lg relative",
              notification.read ? "bg-muted" : "bg-primary/5"
            )}
          >
            <div className="flex justify-between items-start gap-4">
              <div>
                <h3 className="font-medium mb-1">{notification.title}</h3>
                <p className="text-sm text-muted-foreground">{notification.body}</p>
                <span className="text-xs text-muted-foreground mt-2 block">
                  {format(new Date(notification.created_at), 'MMM d, yyyy h:mm a')}
                </span>
              </div>
              {!notification.read && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => markAsRead(notification.id)}
                  className="shrink-0"
                >
                  <CheckCircle2 className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        ))}

        {!notifications?.length && (
          <div className="text-center text-muted-foreground py-8">
            No new notifications
          </div>
        )}
      </div>
    </Card>
  );
};