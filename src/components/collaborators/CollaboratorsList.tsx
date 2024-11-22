import { Card } from "@/components/ui/card";
import { Users, Plus } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/components/AuthProvider";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { useToast } from "@/components/ui/use-toast";

export const CollaboratorsList = () => {
  const { session } = useAuth();
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [accessLevel, setAccessLevel] = useState("viewer");

  const { data: collaborators, refetch } = useQuery({
    queryKey: ['collaborators', session?.user.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('collaborator_access')
        .select('*')
        .eq('user_id', session?.user.id);
      
      if (error) throw error;
      return data;
    }
  });

  const handleInvite = async () => {
    try {
      const { error } = await supabase
        .from('collaborator_access')
        .insert({
          user_id: session?.user.id,
          collaborator_email: email,
          access_level: accessLevel
        });

      if (error) throw error;

      toast({
        title: "Collaborator invited",
        description: `Invitation sent to ${email}`,
      });

      setEmail("");
      refetch();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to invite collaborator",
        variant: "destructive",
      });
    }
  };

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Users className="h-6 w-6 text-primary" />
          <h2 className="text-xl font-semibold">Collaborators</h2>
        </div>
        
        <Dialog>
          <DialogTrigger asChild>
            <Button size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Invite
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Invite Collaborator</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="accessLevel">Access Level</Label>
                <select
                  id="accessLevel"
                  value={accessLevel}
                  onChange={(e) => setAccessLevel(e.target.value)}
                  className="w-full p-2 border rounded"
                >
                  <option value="viewer">Viewer</option>
                  <option value="editor">Editor</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              <Button onClick={handleInvite} className="w-full">
                Send Invitation
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {collaborators?.length ? (
        <div className="space-y-4">
          {collaborators.map((collaborator) => (
            <div
              key={collaborator.id}
              className="flex items-center justify-between p-3 bg-muted rounded-lg"
            >
              <div>
                <p className="font-medium">{collaborator.collaborator_email}</p>
                <p className="text-sm text-muted-foreground capitalize">
                  {collaborator.access_level}
                </p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center text-muted-foreground">
          No collaborators yet
        </div>
      )}
    </Card>
  );
};