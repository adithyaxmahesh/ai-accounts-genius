import { useEffect, useState } from "react";
import { calculateTaxes } from "./tax-summary/TaxCalculationUtils";
import { TaxSummaryHeader } from "./tax-summary/TaxSummaryHeader";
import { TaxSummarySelects } from "./tax-summary/TaxSummarySelects";
import { useTaxAnalysis } from "./tax-summary/useTaxAnalysis";
import { Card } from "./ui/card";
import { DollarSign, Calculator, PieChart, TrendingUp, ArrowUpRight } from "lucide-react";
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

  const MetricCard = ({ title, value, icon: Icon, className, trend }: { title: string; value: string | number; icon: any; className?: string; trend?: string }) => (
    <Card className={cn("p-6 transition-all hover:shadow-lg backdrop-blur-sm bg-white/10 border-none", className)}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className={cn("p-3 rounded-xl bg-gradient-to-br", className)}>
            <Icon className="w-6 h-6 text-white" />
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <p className="text-2xl font-bold">{value}</p>
          </div>
        </div>
        {trend && (
          <div className="flex items-center gap-1 text-emerald-500">
            <ArrowUpRight className="w-4 h-4" />
            <span className="text-sm font-medium">{trend}</span>
          </div>
        )}
      </div>
    </Card>
  );

  return (
    <div className="max-w-7xl mx-auto space-y-8 p-6 animate-fade-in">
      <div className="flex flex-col gap-6">
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-secondary/20 blur-3xl -z-10" />
          <TaxSummaryHeader
            selectedState={selectedState}
            selectedBusinessType={selectedBusinessType}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="p-6 bg-gradient-to-br from-background via-background to-muted/20 border-none shadow-xl hover:shadow-2xl transition-all duration-300">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-primary" />
              Configuration
            </h3>
            <TaxSummarySelects
              selectedBusinessType={selectedBusinessType}
              selectedState={selectedState}
              onBusinessTypeChange={setSelectedBusinessType}
              onStateChange={setSelectedState}
            />
          </Card>

          <Card className="p-6 bg-gradient-to-br from-background via-background to-muted/20 border-none shadow-xl hover:shadow-2xl transition-all duration-300">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <PieChart className="w-5 h-5 text-primary" />
              Summary
            </h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center p-3 rounded-lg bg-gradient-to-r from-emerald-500/10 to-emerald-500/5">
                <span className="text-muted-foreground">Total Revenue</span>
                <span className="font-semibold text-emerald-500">${taxCalculation.totalAmount.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center p-3 rounded-lg bg-gradient-to-r from-red-500/10 to-red-500/5">
                <span className="text-muted-foreground">Total Expenses</span>
                <span className="font-semibold text-red-500">${taxCalculation.expenses.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center p-3 rounded-lg bg-gradient-to-r from-blue-500/10 to-blue-500/5">
                <span className="text-muted-foreground">Taxable Income</span>
                <span className="font-semibold text-blue-500">${taxCalculation.taxableIncome.toLocaleString()}</span>
              </div>
            </div>
          </Card>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <MetricCard
            title="Federal Tax"
            value={`$${taxCalculation.federalTax.toLocaleString()}`}
            icon={DollarSign}
            className="from-primary/80 to-primary"
            trend="+2.5%"
          />
          
          <MetricCard
            title="State Tax"
            value={`$${taxCalculation.stateTax.toLocaleString()}`}
            icon={Calculator}
            className="from-secondary/80 to-secondary"
            trend="+1.8%"
          />
          
          <MetricCard
            title="Effective Rate"
            value={`${taxCalculation.effectiveRate.toFixed(2)}%`}
            icon={PieChart}
            className="from-accent/80 to-accent"
            trend="-0.5%"
          />
        </div>

        <Card className="p-8 bg-gradient-to-br from-primary/5 via-background to-secondary/5 border-none shadow-xl hover:shadow-2xl transition-all duration-300">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-2xl font-bold mb-2">Total Tax Liability</h3>
              <p className="text-sm text-muted-foreground mb-4">Estimated total tax based on current configuration</p>
              <p className="text-4xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                ${(taxCalculation.federalTax + taxCalculation.stateTax).toLocaleString()}
              </p>
            </div>
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center">
              <DollarSign className="w-8 h-8 text-primary" />
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default TaxSummaryTab;