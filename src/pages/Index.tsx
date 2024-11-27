import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/components/AuthProvider";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { DashboardContent } from "@/components/dashboard/DashboardContent";

const Index = () => {
  const { session } = useAuth();
  const navigate = useNavigate();

  const { data: profile } = useQuery({
    queryKey: ['profile', session?.user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, company_name, role, created_at')
        .eq('id', session?.user?.id)
        .single();
      
      if (error) {
        console.error('Error fetching profile:', error);
        throw error;
      }
      return data;
    },
    enabled: !!session?.user?.id,
  });

  if (!session) {
    return (
      <div className="container mx-auto p-6 text-center">
        <h1 className="text-4xl font-bold mb-4">Welcome to Tax Pro</h1>
        <p className="text-xl text-muted-foreground mb-8">
          Please sign in to access your dashboard
        </p>
        <Button onClick={() => navigate('/auth')}>Sign In</Button>
      </div>
    );
  }

  return (
    <DashboardLayout>
      <DashboardHeader />
      <DashboardContent />
    </DashboardLayout>
  );
};

export default Index;