import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  BarChart, 
  PieChart, 
  TrendingUp, 
  Shield, 
  FileCheck, 
  AlertCircle,
  CheckCircle2,
  Clock,
  Users,
  BookOpen,
  ClipboardCheck,
  FileSpreadsheet
} from "lucide-react";
import { Tables } from "@/integrations/supabase/types";
import { Progress } from "@/components/ui/progress";
import { useState } from "react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

type AssuranceEngagement = Tables<"assurance_engagements">;

export const AssuranceAnalytics = () => {
  const [selectedProcess, setSelectedProcess] = useState<string | null>(null);

  const { data: engagements, isLoading } = useQuery({
    queryKey: ["assurance-analytics"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("assurance_engagements")
        .select("*, assurance_procedures(*)")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as AssuranceEngagement[];
    },
  });

  const assuranceProcessSteps = [
    {
      id: "planning",
      title: "Planning Phase",
      description: "Initial assessment and engagement planning",
      icon: <ClipboardCheck className="h-5 w-5" />,
      content: [
        "Risk Assessment",
        "Materiality Determination",
        "Engagement Timeline",
        "Resource Allocation"
      ]
    },
    {
      id: "fieldwork",
      title: "Fieldwork",
      description: "Evidence gathering and testing procedures",
      icon: <FileSpreadsheet className="h-5 w-5" />,
      content: [
        "Substantive Testing",
        "Control Testing",
        "Documentation Review",
        "Sample Selection"
      ]
    },
    {
      id: "review",
      title: "Quality Review",
      description: "Review of work performed and findings",
      icon: <BookOpen className="h-5 w-5" />,
      content: [
        "Working Paper Review",
        "Finding Evaluation",
        "Evidence Assessment",
        "Quality Control"
      ]
    }
  ];

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="h-32 bg-muted rounded animate-pulse" />
        <div className="h-32 bg-muted rounded animate-pulse" />
        <div className="h-32 bg-muted rounded animate-pulse" />
      </div>
    );
  }

  // Calculate analytics
  const totalEngagements = engagements?.length || 0;
  const completedEngagements = engagements?.filter(e => e.status === 'completed').length || 0;
  const inProgressEngagements = engagements?.filter(e => e.status === 'in_progress').length || 0;
  
  const highRiskEngagements = engagements?.filter(e => 
    e.risk_assessment && (e.risk_assessment as any).level === 'high'
  ).length || 0;
  
  const compliantEngagements = engagements?.filter(e => 
    e.findings && (e.findings as any[]).length === 0
  ).length || 0;
  
  const complianceRate = totalEngagements ? (compliantEngagements / totalEngagements) * 100 : 0;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-semibold">Assurance Process & Analytics</h2>
          <p className="text-muted-foreground">Understanding the assurance workflow and engagement metrics</p>
        </div>
      </div>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-xl">Assurance Workflow</CardTitle>
            <CardDescription>
              Learn about the key phases in the assurance process
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Accordion type="single" collapsible>
              {assuranceProcessSteps.map((step) => (
                <AccordionItem key={step.id} value={step.id}>
                  <AccordionTrigger className="hover:no-underline">
                    <div className="flex items-center gap-2">
                      {step.icon}
                      <div className="text-left">
                        <div className="font-medium">{step.title}</div>
                        <div className="text-sm text-muted-foreground">{step.description}</div>
                      </div>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="pl-7 pt-2">
                      <ul className="list-disc space-y-2">
                        {step.content.map((item, index) => (
                          <li key={index} className="text-muted-foreground">{item}</li>
                        ))}
                      </ul>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </CardContent>
        </Card>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Shield className="h-5 w-5 text-primary" />
                Assurance Overview
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Total Engagements</span>
                <span className="text-2xl font-bold">{totalEngagements}</span>
              </div>
              <Progress value={completedEngagements / totalEngagements * 100} className="h-2" />
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <FileCheck className="h-5 w-5 text-primary" />
                Compliance Status
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{Math.round(complianceRate)}%</p>
              <p className="text-sm text-muted-foreground mt-2">
                Overall compliance rate
              </p>
              <div className="mt-4 flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-yellow-500" />
                <span className="text-sm">{highRiskEngagements} high-risk items</span>
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-primary" />
                Engagement Status
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                    <span>Completed</span>
                  </div>
                  <span>{completedEngagements}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-blue-500" />
                    <span>In Progress</span>
                  </div>
                  <span>{inProgressEngagements}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Users className="h-5 w-5 text-primary" />
              Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {engagements?.slice(0, 5).map((engagement) => (
                <div key={engagement.id} className="flex items-center justify-between border-b pb-2">
                  <div>
                    <p className="font-medium">{engagement.client_name}</p>
                    <p className="text-sm text-muted-foreground">{engagement.engagement_type}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      engagement.status === 'completed' ? 'bg-green-100 text-green-800' :
                      engagement.status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {engagement.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};