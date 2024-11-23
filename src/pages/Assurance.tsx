import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft } from "lucide-react";
import { AssuranceList } from "@/components/assurance/AssuranceList";
import { AssuranceAnalytics } from "@/components/assurance/AssuranceAnalytics";

const Assurance = () => {
  const navigate = useNavigate();

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center space-x-4 mb-6">
        <Button 
          variant="ghost" 
          onClick={() => navigate('/')}
          className="hover:scale-105 transition-transform"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Dashboard
        </Button>
      </div>

      <h1 className="text-3xl font-bold">Assurance Services</h1>

      <Tabs defaultValue="engagements" className="space-y-6">
        <TabsList className="grid grid-cols-2 gap-4 bg-muted p-1">
          <TabsTrigger value="engagements">Engagements</TabsTrigger>
          <TabsTrigger value="analytics">Analytics & Process</TabsTrigger>
        </TabsList>

        <TabsContent value="engagements" className="space-y-6">
          <AssuranceList />
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <AssuranceAnalytics />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Assurance;