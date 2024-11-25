import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ProfileWidget } from "@/components/ProfileWidget";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { NotificationsCard } from "@/components/notifications/NotificationsCard";

export const DashboardHeader = () => {
  return (
    <div className="flex justify-between items-center mb-2">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="relative">
            <Bell className="h-5 w-5" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-80">
          <NotificationsCard />
        </DropdownMenuContent>
      </DropdownMenu>
      <ProfileWidget />
    </div>
  );
};