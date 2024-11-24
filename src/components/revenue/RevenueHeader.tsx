import { Button } from "@/components/ui/button";
import { ArrowLeft, Download, Filter, Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";

export const RevenueHeader = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleExportData = () => {
    toast({
      title: "Exporting Revenue Data",
      description: "Your data will be downloaded shortly.",
    });
  };

  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-4">
        <Button 
          variant="outline" 
          onClick={() => navigate('/')}
          className="gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Dashboard
        </Button>
        <h1 className="text-3xl font-bold">Revenue</h1>
      </div>
      <div className="flex gap-2">
        <Button variant="outline" onClick={handleExportData} className="gap-2">
          <Download className="h-4 w-4" />
          Export
        </Button>
        <Button variant="outline" className="gap-2">
          <Filter className="h-4 w-4" />
          Filter
        </Button>
        <Button onClick={() => navigate('/revenue/add')} className="gap-2">
          <Plus className="h-4 w-4" />
          Add Revenue
        </Button>
      </div>
    </div>
  );
};