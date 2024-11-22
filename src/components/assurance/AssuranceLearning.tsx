import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tables } from "@/integrations/supabase/types";

type AssuranceLearningMaterial = Tables<"assurance_learning_materials">;

export const AssuranceLearning = () => {
  const { data: materials, isLoading } = useQuery({
    queryKey: ["assurance-learning"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("assurance_learning_materials")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as AssuranceLearningMaterial[];
    },
  });

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="h-32 bg-muted rounded animate-pulse" />
        <div className="h-32 bg-muted rounded animate-pulse" />
        <div className="h-32 bg-muted rounded animate-pulse" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold">Learning Materials</h2>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {materials?.map((material) => (
          <Card key={material.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="text-lg">{material.title}</CardTitle>
              <div className="flex space-x-2">
                <span className="text-xs px-2 py-1 bg-primary/10 rounded-full">
                  {material.category}
                </span>
                <span className="text-xs px-2 py-1 bg-secondary/10 rounded-full">
                  {material.difficulty_level}
                </span>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground line-clamp-3">
                {material.content}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};