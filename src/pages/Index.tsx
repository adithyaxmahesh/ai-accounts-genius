import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/components/AuthProvider";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { 
  BarChart, 
  FileText, 
  DollarSign, 
  Receipt, 
  ScrollText,
  TrendingUp,
  Shield
} from "lucide-react";

const Index = () => {
  const { session } = useAuth();

  const { data: writeOffs } = useQuery({
    queryKey: ['write-offs-count'],
    queryFn: async () => {
      const { count, error } = await supabase
        .from('write_offs')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', session?.user.id);
      
      if (error) throw error;
      return count;
    }
  });

  const { data: documents } = useQuery({
    queryKey: ['documents-count'],
    queryFn: async () => {
      const { count, error } = await supabase
        .from('processed_documents')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', session?.user.id);
      
      if (error) throw error;
      return count;
    }
  });

  return (
    <div className="container mx-auto p-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card className="hover:bg-muted/50 transition-colors">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tax Analysis</CardTitle>
            <BarChart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <Link to="/tax">
              <Button className="w-full">View Tax Analysis</Button>
            </Link>
          </CardContent>
        </Card>

        <Card className="hover:bg-muted/50 transition-colors">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Documents</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold mb-2">{documents || 0}</div>
            <Link to="/documents">
              <Button className="w-full">Manage Documents</Button>
            </Link>
          </CardContent>
        </Card>

        <Card className="hover:bg-muted/50 transition-colors">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <Link to="/revenue">
              <Button className="w-full">Track Revenue</Button>
            </Link>
          </CardContent>
        </Card>

        <Card className="hover:bg-muted/50 transition-colors">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Write-offs</CardTitle>
            <Receipt className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold mb-2">{writeOffs || 0}</div>
            <Link to="/write-offs">
              <Button className="w-full">Manage Write-offs</Button>
            </Link>
          </CardContent>
        </Card>

        <Card className="hover:bg-muted/50 transition-colors">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Balance Sheet</CardTitle>
            <ScrollText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <Link to="/balance-sheet">
              <Button className="w-full">View Balance Sheet</Button>
            </Link>
          </CardContent>
        </Card>

        <Card className="hover:bg-muted/50 transition-colors">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Forecast</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <Link to="/forecast">
              <Button className="w-full">View Forecast</Button>
            </Link>
          </CardContent>
        </Card>

        <Card className="hover:bg-muted/50 transition-colors">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Assurance</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <Link to="/assurance">
              <Button className="w-full">View Assurance Reports</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Index;