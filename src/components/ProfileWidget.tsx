import { useAuth } from "@/components/AuthProvider";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { UserRound, LogOut } from "lucide-react";

export const ProfileWidget = () => {
  const { session } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate("/auth");
  };

  const email = session?.user?.email;
  const initials = email ? email[0].toUpperCase() : "U";

  return (
    <div className="absolute top-4 right-4 z-[60]">
      <DropdownMenu>
        <DropdownMenuTrigger className="focus:outline-none">
          <Avatar className="h-8 w-8 hover:ring-2 hover:ring-primary transition-all bg-white">
            <AvatarFallback className="bg-primary text-primary-foreground">
              {initials}
            </AvatarFallback>
          </Avatar>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          <DropdownMenuItem className="flex items-center gap-2">
            <UserRound className="h-4 w-4" />
            <span className="truncate">{email}</span>
          </DropdownMenuItem>
          <DropdownMenuItem className="flex items-center gap-2 text-red-500" onClick={handleSignOut}>
            <LogOut className="h-4 w-4" />
            <span>Sign out</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};