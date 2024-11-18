import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useToast } from "@/hooks/use-toast";
import { CalendarIcon, Plus, CheckCircle, AlertTriangle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/components/AuthProvider";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { TaxDeadline } from "@/integrations/supabase/types/tax";

export const TaxDeadlines = () => {
  const { session } = useAuth();
  const { toast } = useToast();
  const [title, setTitle] = useState("");
  const [date, setDate] = useState<Date>();
  const [description, setDescription] = useState("");

  const { data: deadlines, refetch } = useQuery({
    queryKey: ['tax-deadlines', session?.user.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('tax_deadlines')
        .select('*')
        .eq('user_id', session?.user.id)
        .order('due_date', { ascending: true });
      
      if (error) throw error;
      return data as TaxDeadline[];
    }
  });

  const addDeadline = useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase
        .from('tax_deadlines')
        .insert([
          {
            title,
            due_date: date?.toISOString(),
            description,
            user_id: session?.user.id
          }
        ]);

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast({
        title: "Deadline Added",
        description: "Your tax deadline has been saved.",
      });
      setTitle("");
      setDate(undefined);
      setDescription("");
      refetch();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to add deadline. Please try again.",
        variant: "destructive",
      });
    }
  });

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Add Tax Deadline</h3>
        <div className="space-y-4">
          <div>
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Quarterly Tax Payment"
            />
          </div>
          <div>
            <Label>Due Date</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !date && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {date ? format(date, "PPP") : "Pick a date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={setDate}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
          <div>
            <Label htmlFor="description">Description</Label>
            <Input
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Additional details..."
            />
          </div>
          <Button 
            onClick={() => addDeadline.mutate()}
            disabled={!title || !date || addDeadline.isPending}
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Deadline
          </Button>
        </div>
      </Card>

      <div className="space-y-4">
        {deadlines?.map((deadline) => (
          <Card key={deadline.id} className="p-4">
            <div className="flex justify-between items-center">
              <div>
                <h4 className="font-semibold flex items-center">
                  {deadline.status === 'completed' ? (
                    <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                  ) : (
                    <AlertTriangle className="h-4 w-4 text-yellow-500 mr-2" />
                  )}
                  {deadline.title}
                </h4>
                <p className="text-sm text-muted-foreground">
                  Due: {format(new Date(deadline.due_date), "PPP")}
                </p>
                {deadline.description && (
                  <p className="text-sm text-muted-foreground mt-1">
                    {deadline.description}
                  </p>
                )}
              </div>
              <Button
                variant={deadline.status === 'completed' ? "outline" : "default"}
                size="sm"
              >
                {deadline.status === 'completed' ? "Completed" : "Mark Complete"}
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};