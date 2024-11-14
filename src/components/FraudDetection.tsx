import { Card } from "@/components/ui/card";
import { AlertTriangle } from "lucide-react";

export const FraudDetection = () => {
  const alerts = [
    {
      id: 1,
      type: "Unusual Transaction",
      description: "Large transaction outside normal patterns",
      risk: "High",
    },
    {
      id: 2,
      type: "Duplicate Payment",
      description: "Potential duplicate invoice payment detected",
      risk: "Medium",
    },
  ];

  return (
    <Card className="glass-card p-6">
      <div className="flex items-center mb-6">
        <AlertTriangle className="h-6 w-6 text-destructive mr-2" />
        <h3 className="text-xl font-semibold">Fraud Detection Alerts</h3>
      </div>
      <div className="space-y-4">
        {alerts.map((alert) => (
          <div key={alert.id} className="p-4 bg-muted rounded-lg">
            <div className="flex justify-between items-start">
              <div>
                <p className="font-semibold">{alert.type}</p>
                <p className="text-sm text-muted-foreground">{alert.description}</p>
              </div>
              <span className={`px-2 py-1 rounded text-sm ${
                alert.risk === "High" ? "bg-destructive text-white" : "bg-yellow-100 text-yellow-800"
              }`}>
                {alert.risk} Risk
              </span>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
};