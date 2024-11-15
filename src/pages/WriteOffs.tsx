import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ArrowLeft, Plus, FileText, Calculator } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/components/AuthProvider";

const WriteOffs = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { session } = useAuth();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newWriteOff, setNewWriteOff] = useState({
    amount: '',
    description: '',
    date: new Date().toISOString().split('T')[0]
  });

  const { data: writeOffs, refetch } = useQuery({
    queryKey: ['writeOffs'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('write_offs')
        .select(`
          *,
          tax_codes (
            code,
            description,
            category,
            deduction_type
          )
        `)
        .order('date', { ascending: false });
      
      if (error) throw error;
      return data;
    }
  });

  const { data: taxCodes } = useQuery({
    queryKey: ['taxCodes'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('tax_codes')
        .select('*')
        .order('code', { ascending: true });
      
      if (error) throw error;
      return data;
    }
  });

  const addWriteOff = async () => {
    try {
      const { error } = await supabase
        .from('write_offs')
        .insert({
          user_id: session?.user.id,
          amount: parseFloat(newWriteOff.amount),
          description: newWriteOff.description,
          date: newWriteOff.date,
          status: 'pending'
        });

      if (error) throw error;

      toast({
        title: "Write-off Added",
        description: "Your write-off has been recorded successfully.",
      });

      setIsDialogOpen(false);
      setNewWriteOff({
        amount: '',
        description: '',
        date: new Date().toISOString().split('T')[0]
      });
      refetch();
    } catch (error) {
      console.error("Error adding write-off:", error);
      toast({
        title: "Error",
        description: "Failed to add write-off. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6 fade-in">
      <div className="flex items-center space-x-4 mb-6">
        <Button 
          variant="ghost" 
          onClick={() => navigate('/')}
          className="hover-scale"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Dashboard
        </Button>
      </div>

      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Tax Write-Offs</h1>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="hover-scale">
              <Plus className="mr-2 h-4 w-4" />
              Add Write-Off
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Write-Off</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 mt-4">
              <div>
                <label className="text-sm font-medium">Amount</label>
                <Input
                  type="number"
                  placeholder="Enter amount"
                  value={newWriteOff.amount}
                  onChange={(e) => setNewWriteOff(prev => ({
                    ...prev,
                    amount: e.target.value
                  }))}
                />
              </div>
              <div>
                <label className="text-sm font-medium">Description</label>
                <Input
                  placeholder="Enter description"
                  value={newWriteOff.description}
                  onChange={(e) => setNewWriteOff(prev => ({
                    ...prev,
                    description: e.target.value
                  }))}
                />
              </div>
              <div>
                <label className="text-sm font-medium">Date</label>
                <Input
                  type="date"
                  value={newWriteOff.date}
                  onChange={(e) => setNewWriteOff(prev => ({
                    ...prev,
                    date: e.target.value
                  }))}
                />
              </div>
              <Button 
                className="w-full" 
                onClick={addWriteOff}
                disabled={!newWriteOff.amount || !newWriteOff.description}
              >
                Add Write-Off
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card className="p-6 glass-card">
          <Calculator className="h-8 w-8 mb-4 text-primary" />
          <h3 className="text-lg font-semibold">Total Deductions</h3>
          <p className="text-3xl font-bold">
            ${writeOffs?.reduce((sum, record) => sum + Number(record.amount), 0).toLocaleString()}
          </p>
          <p className="text-sm text-muted-foreground">Current fiscal year</p>
        </Card>
      </div>

      <Card className="p-6 glass-card">
        <h3 className="text-xl font-semibold mb-4">Available Tax Codes</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {taxCodes?.map((code) => (
            <div key={code.id} className="p-4 bg-muted rounded-lg">
              <p className="font-semibold">Section {code.code}</p>
              <p className="text-sm text-muted-foreground">{code.description}</p>
              <p className="text-sm text-muted-foreground mt-2">
                Category: {code.category}
              </p>
            </div>
          ))}
        </div>
      </Card>

      <Card className="p-6 glass-card">
        <h3 className="text-xl font-semibold mb-4">Recent Write-Offs</h3>
        <div className="space-y-4">
          {writeOffs?.map((writeOff) => (
            <div key={writeOff.id} className="flex justify-between items-center p-4 bg-muted rounded-lg">
              <div>
                <p className="font-semibold">{writeOff.description}</p>
                <p className="text-sm text-muted-foreground">
                  {writeOff.tax_codes?.code && `Section ${writeOff.tax_codes.code}`} 
                  {writeOff.tax_codes?.category && ` - ${writeOff.tax_codes.category}`}
                </p>
              </div>
              <div className="text-right">
                <p className="font-semibold">${Number(writeOff.amount).toLocaleString()}</p>
                <p className="text-sm text-muted-foreground">{new Date(writeOff.date).toLocaleDateString()}</p>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};

export default WriteOffs;