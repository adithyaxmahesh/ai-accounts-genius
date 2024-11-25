import { useNavigate } from "react-router-dom";
import { useAuth } from "@/components/AuthProvider";
import { Button } from "@/components/ui/button";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { NavigationGrid } from "@/components/dashboard/NavigationGrid";
import { DashboardMetrics } from "@/components/dashboard/DashboardMetrics";
import { DashboardFeatures } from "@/components/dashboard/DashboardFeatures";

const Index = () => {
  const { session } = useAuth();
  const navigate = useNavigate();

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
    <div className="container mx-auto p-4 space-y-4">
      <DashboardHeader />
      <DashboardMetrics />
      <NavigationGrid />
      <DashboardFeatures />
    </div>
  );
};

export default Index;