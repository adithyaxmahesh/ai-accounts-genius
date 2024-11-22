import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { Tables } from "@/integrations/supabase/types";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/components/AuthProvider";
import { PlusCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";

type AssuranceReport = Tables<"assurance_reports">;

export const AssuranceList = () => {
  const { session } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const { data: reports, isLoading } = useQuery({
    queryKey: ['assurance-reports'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('assurance_reports')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        toast({
          title: "Error",
          description: "Failed to load assurance reports",
          variant: "destructive",
        });
        throw error;
      }

      return data as AssuranceReport[];
    },
  });

  if (isLoading) {
    return <div className="space-y-4">
      <div className="h-32 bg-muted animate-pulse rounded-lg" />
      <div className="h-32 bg-muted animate-pulse rounded-lg" />
      <div className="h-32 bg-muted animate-pulse rounded-lg" />
    </div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Assurance Reports</h2>
        <Button onClick={() => navigate('/assurance/new')}>
          <PlusCircle className="h-4 w-4 mr-2" />
          New Report
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {reports?.map((report) => (
          <Card key={report.id} className="cursor-pointer hover:bg-muted/50 transition-colors"
                onClick={() => navigate(`/assurance/${report.id}`)}>
            <CardHeader>
              <CardTitle>{report.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">{report.description}</p>
              <div className="mt-4 flex justify-between items-center">
                <span className="text-sm capitalize px-2 py-1 rounded-full bg-primary/10 text-primary">
                  {report.status}
                </span>
                <span className="text-sm text-muted-foreground">
                  {new Date(report.created_at).toLocaleDateString()}
                </span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {reports?.length === 0 && (
        <div className="text-center py-8">
          <h3 className="text-lg font-medium">No assurance reports yet</h3>
          <p className="text-sm text-muted-foreground mt-1">
            Create your first assurance report to get started
          </p>
        </div>
      )}
    </div>
  );
};