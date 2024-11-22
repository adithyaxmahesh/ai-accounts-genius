import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { MapPin, ChevronDown, ChevronUp, Filter, CheckCircle, AlertTriangle, Clock } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/components/AuthProvider";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";

export const StateOperations = () => {
  const { session } = useAuth();
  const { toast } = useToast();
  const [selectedState, setSelectedState] = useState<string | null>(null);
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [expandedIds, setExpandedIds] = useState<string[]>([]);

  const { data: operations } = useQuery({
    queryKey: ['state-operations', session?.user.id, selectedState, selectedType],
    queryFn: async () => {
      let query = supabase
        .from('state_operations')
        .select('*')
        .eq('user_id', session?.user.id);

      if (selectedState) {
        query = query.eq('state', selectedState);
      }
      if (selectedType) {
        query = query.eq('operation_type', selectedType);
      }
      
      const { data, error } = await query.order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    }
  });

  const toggleExpand = (id: string) => {
    setExpandedIds(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'compliant':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'review_needed':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      default:
        return <Clock className="h-4 w-4 text-blue-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'compliant':
        return 'bg-green-100 text-green-800';
      case 'review_needed':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-blue-100 text-blue-800';
    }
  };

  const handleUpdateCompliance = async (id: string) => {
    try {
      const { error } = await supabase
        .from('state_operations')
        .update({ compliance_status: 'compliant' })
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Status Updated",
        description: "Compliance status has been updated successfully.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update compliance status.",
        variant: "destructive",
      });
    }
  };

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <MapPin className="h-6 w-6 text-primary" />
          <h2 className="text-xl font-semibold">State Operations</h2>
        </div>
        
        <div className="flex gap-2">
          <Select onValueChange={(value) => setSelectedState(value)}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by State" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="California">California</SelectItem>
              <SelectItem value="New York">New York</SelectItem>
              <SelectItem value="Texas">Texas</SelectItem>
            </SelectContent>
          </Select>

          <Select onValueChange={(value) => setSelectedType(value)}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Sales">Sales</SelectItem>
              <SelectItem value="Remote Workers">Remote Workers</SelectItem>
              <SelectItem value="Property">Property</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-4">
        {operations?.map((operation) => (
          <Card key={operation.id} className="p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <h3 className="font-semibold">{operation.state}</h3>
                <Badge variant="outline">{operation.operation_type}</Badge>
                <Badge className={getStatusColor(operation.compliance_status)}>
                  <span className="flex items-center gap-1">
                    {getStatusIcon(operation.compliance_status)}
                    {operation.compliance_status.replace('_', ' ')}
                  </span>
                </Badge>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => toggleExpand(operation.id)}
              >
                {expandedIds.includes(operation.id) ? (
                  <ChevronUp className="h-4 w-4" />
                ) : (
                  <ChevronDown className="h-4 w-4" />
                )}
              </Button>
            </div>

            {expandedIds.includes(operation.id) && (
              <div className="mt-4 space-y-4">
                <div className="bg-muted p-4 rounded-lg">
                  <h4 className="font-medium mb-2">Tax Implications</h4>
                  {operation.tax_implications && (
                    <div className="space-y-2">
                      {Object.entries(operation.tax_implications).map(([key, value]) => (
                        <div key={key} className="flex justify-between text-sm">
                          <span className="text-muted-foreground">
                            {key.split('_').map(word => 
                              word.charAt(0).toUpperCase() + word.slice(1)
                            ).join(' ')}
                          </span>
                          <span className="font-medium">
                            {Array.isArray(value) 
                              ? value.join(', ')
                              : typeof value === 'boolean'
                                ? value ? 'Yes' : 'No'
                                : typeof value === 'number'
                                  ? value % 1 === 0 
                                    ? `$${value.toLocaleString()}`
                                    : `${value}%`
                                  : value}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {operation.compliance_status !== 'compliant' && (
                  <div className="flex justify-end">
                    <Button 
                      size="sm"
                      onClick={() => handleUpdateCompliance(operation.id)}
                      className="hover-scale"
                    >
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Mark as Compliant
                    </Button>
                  </div>
                )}
              </div>
            )}
          </Card>
        ))}

        {!operations?.length && (
          <div className="text-center py-8">
            <MapPin className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No State Operations Found</h3>
            <p className="text-sm text-muted-foreground">
              Add your first state operation to track tax implications and compliance status.
            </p>
          </div>
        )}
      </div>
    </Card>
  );
};