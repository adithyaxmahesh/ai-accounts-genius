import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/components/AuthProvider";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { DashboardContent } from "@/components/dashboard/DashboardContent";
import { ArrowRight, Shield, Zap, Code } from "lucide-react";

const Index = () => {
  const { session } = useAuth();
  const navigate = useNavigate();

  const { data: profile } = useQuery({
    queryKey: ['profile'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session?.user.id)
        .single();
      
      if (error) throw error;
      return data;
    },
    enabled: !!session?.user.id,
  });

  if (!session) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-background/95">
        {/* Navigation */}
        <nav className="container mx-auto p-6">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-2">
              <Shield className="h-8 w-8 text-primary" />
              <span className="text-2xl font-bold">DevAudit</span>
            </div>
            <Button onClick={() => navigate('/auth')} variant="secondary">
              Sign In
            </Button>
          </div>
        </nav>

        {/* Hero Section */}
        <div className="container mx-auto px-6 py-20">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-12">
            <div className="lg:w-1/2 space-y-8">
              <h1 className="text-5xl font-bold leading-tight">
                Streamline Your Development Audit Process
              </h1>
              <p className="text-xl text-muted-foreground">
                DevAudit helps teams automate code analysis, track compliance, and maintain high-quality standards throughout the development lifecycle.
              </p>
              <div className="flex gap-4">
                <Button onClick={() => navigate('/auth')} size="lg" className="gap-2">
                  Get Started <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <div className="lg:w-1/2">
              <div className="relative">
                <div className="absolute -inset-1 rounded-lg bg-gradient-to-r from-primary to-secondary blur-lg opacity-30"></div>
                <div className="relative bg-card rounded-lg p-8 shadow-2xl">
                  <img 
                    src="https://images.unsplash.com/photo-1488590528505-98d2b5aba04b" 
                    alt="Platform Preview" 
                    className="rounded-lg w-full"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Features Section */}
        <div className="container mx-auto px-6 py-20">
          <h2 className="text-3xl font-bold text-center mb-12">Key Features</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-card p-6 rounded-lg">
              <div className="h-12 w-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                <Shield className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Secure Auditing</h3>
              <p className="text-muted-foreground">
                Enterprise-grade security features to protect your audit data and compliance records.
              </p>
            </div>
            <div className="bg-card p-6 rounded-lg">
              <div className="h-12 w-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                <Zap className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Real-time Analysis</h3>
              <p className="text-muted-foreground">
                Get instant insights with our powerful real-time code analysis engine.
              </p>
            </div>
            <div className="bg-card p-6 rounded-lg">
              <div className="h-12 w-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                <Code className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Code Quality</h3>
              <p className="text-muted-foreground">
                Maintain high code quality standards with automated checks and balances.
              </p>
            </div>
          </div>
        </div>
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