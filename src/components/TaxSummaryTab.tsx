import { useEffect, useState } from "react";
import { calculateTaxes } from "./tax-summary/TaxCalculationUtils";
import { TaxSummaryHeader } from "./tax-summary/TaxSummaryHeader";
import { TaxSummarySelects } from "./tax-summary/TaxSummarySelects";
import { useTaxAnalysis } from "./tax-summary/useTaxAnalysis";
import { Card } from "./ui/card";
import { DollarSign, Calculator, PieChart } from "lucide-react";
import { cn } from "@/lib/utils";

interface TaxSummaryProps {
  audit?: any;
}

const TaxSummaryTab = ({ audit }: TaxSummaryProps) => {
  const [selectedBusinessType, setSelectedBusinessType] = useState<string>('corporation');
  const [selectedState, setSelectedState] = useState<string>('California');
  const [taxCalculation, setTaxCalculation] = useState({
    totalAmount: 0,
    expenses: 0,
    estimatedTax: 0,
    federalTax: 0,
    stateTax: 0,
    effectiveRate: 0,
    taxableIncome: 0,
    minimumTax: 800
  });

  const { businessInfo, taxAnalysis } = useTaxAnalysis(
    selectedBusinessType,
    selectedState
  );

  useEffect(() => {
    if (businessInfo) {
      setSelectedBusinessType(businessInfo.business_type?.toLowerCase()?.replace(' ', '_') || 'corporation');
      setSelectedState(businessInfo.state || 'California');
    }
  }, [businessInfo]);

  useEffect(() => {
    const updateTaxes = async () => {
      const result = await calculateTaxes(taxAnalysis, audit, selectedBusinessType, selectedState);
      if (result) {
        setTaxCalculation(result);
      }
    };
    
    updateTaxes();
  }, [taxAnalysis, audit, selectedBusinessType, selectedState]);

  const MetricCard = ({ title, value, icon: Icon, className }: { title: string; value: string | number; icon: any; className?: string }) => (
    <Card className={cn("p-6 transition-all hover:shadow-lg", className)}>
      <div className="flex items-center gap-4">
        <div className={cn("p-3 rounded-full", className)}>
          <Icon className="w-6 h-6 text-white" />
        </div>
        <div>
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <p className="text-2xl font-bold">{value}</p>
        </div>
      </div>
    </Card>
  );

  return (
    <div className="max-w-7xl mx-auto space-y-8 p-6">
      <div className="flex flex-col gap-6">
        <TaxSummaryHeader
          selectedState={selectedState}
          selectedBusinessType={selectedBusinessType}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="p-6 bg-gradient-to-br from-muted/50 to-background border-none">
            <h3 className="text-lg font-semibold mb-4">Configuration</h3>
            <TaxSummarySelects
              selectedBusinessType={selectedBusinessType}
              selectedState={selectedState}
              onBusinessTypeChange={setSelectedBusinessType}
              onStateChange={setSelectedState}
            />
          </Card>

          <Card className="p-6 bg-gradient-to-br from-muted/50 to-background border-none">
            <h3 className="text-lg font-semibold mb-4">Summary</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center p-2 rounded bg-muted/30">
                <span className="text-muted-foreground">Total Revenue</span>
                <span className="font-semibold text-green-600">${taxCalculation.totalAmount.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center p-2 rounded bg-muted/30">
                <span className="text-muted-foreground">Total Expenses</span>
                <span className="font-semibold text-red-500">${taxCalculation.expenses.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center p-2 rounded bg-muted/30">
                <span className="text-muted-foreground">Taxable Income</span>
                <span className="font-semibold text-blue-600">${taxCalculation.taxableIncome.toLocaleString()}</span>
              </div>
            </div>
          </Card>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <MetricCard
            title="Federal Tax"
            value={`$${taxCalculation.federalTax.toLocaleString()}`}
            icon={DollarSign}
            className="bg-primary/10 text-primary"
          />
          
          <MetricCard
            title="State Tax"
            value={`$${taxCalculation.stateTax.toLocaleString()}`}
            icon={Calculator}
            className="bg-secondary/10 text-secondary"
          />
          
          <MetricCard
            title="Effective Rate"
            value={`${taxCalculation.effectiveRate.toFixed(2)}%`}
            icon={PieChart}
            className="bg-accent/10 text-accent-foreground"
          />
        </div>

        <Card className="p-6 bg-gradient-to-br from-muted/50 to-background border-none">
          <h3 className="text-lg font-semibold mb-4">Total Tax Liability</h3>
          <div className="flex items-center justify-between p-4 bg-primary/5 rounded-lg">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Estimated Total Tax</p>
              <p className="text-3xl font-bold text-primary">
                ${(taxCalculation.federalTax + taxCalculation.stateTax).toLocaleString()}
              </p>
            </div>
            <DollarSign className="w-12 h-12 text-primary opacity-20" />
          </div>
        </Card>
      </div>
    </div>
  );
};

export default TaxSummaryTab;