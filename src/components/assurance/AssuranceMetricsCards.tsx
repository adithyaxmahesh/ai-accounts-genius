import { useState } from "react";
import { Card } from "@/components/ui/card";
import { MetricsDialog } from "./MetricsDialog";
import { MetricsProps } from "./types";
import { getDetailedContent } from "./utils";
import { BarChart3, CheckCircle2, Clock, AlertTriangle, ShieldCheck } from "lucide-react";

export const AssuranceMetricsCards = ({
  totalEngagements,
  completedEngagements,
  inProgressEngagements,
  complianceRate,
  highRiskEngagements,
}: MetricsProps) => {
  const [selectedMetric, setSelectedMetric] = useState<string | null>(null);

  const metrics = [
    {
      id: "overview",
      title: "Total Engagements",
      value: totalEngagements,
      description: `${completedEngagements} completed, ${inProgressEngagements} in progress`,
      icon: BarChart3,
      color: "text-blue-500",
      bgColor: "bg-blue-50",
    },
    {
      id: "status",
      title: "Completion Rate",
      value: `${((completedEngagements / totalEngagements) * 100).toFixed(1)}%`,
      description: `${completedEngagements} out of ${totalEngagements} engagements`,
      icon: CheckCircle2,
      color: "text-green-500",
      bgColor: "bg-green-50",
    },
    {
      id: "progress",
      title: "In Progress",
      value: inProgressEngagements,
      description: "Active engagements",
      icon: Clock,
      color: "text-yellow-500",
      bgColor: "bg-yellow-50",
    },
    {
      id: "compliance",
      title: "Compliance Rate",
      value: `${Math.round(complianceRate)}%`,
      description: `${highRiskEngagements} high risk items identified`,
      icon: AlertTriangle,
      color: "text-red-500",
      bgColor: "bg-red-50",
    },
  ];

  return (
    <div>
      <div className="flex items-center gap-2 mb-6">
        <ShieldCheck className="h-6 w-6 text-primary" />
        <h2 className="text-2xl font-semibold">Assurance Metrics</h2>
      </div>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {metrics.map((metric) => {
          const Icon = metric.icon;
          return (
            <Card
              key={metric.id}
              className="p-6 hover:shadow-lg transition-all duration-200 cursor-pointer animate-fade-in"
              onClick={() => setSelectedMetric(metric.id)}
            >
              <div className="flex items-center gap-4">
                <div className={`${metric.bgColor} p-3 rounded-lg`}>
                  <Icon className={`h-8 w-8 ${metric.color}`} />
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    {metric.title}
                  </p>
                  <h3 className="text-2xl font-bold">{metric.value}</h3>
                  <p className="text-sm text-muted-foreground">
                    {metric.description}
                  </p>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      <MetricsDialog
        content={getDetailedContent(selectedMetric || "", {
          totalEngagements,
          completedEngagements,
          inProgressEngagements,
          complianceRate,
          highRiskEngagements,
        })}
        open={!!selectedMetric}
        onOpenChange={() => setSelectedMetric(null)}
      />
    </div>
  );
};