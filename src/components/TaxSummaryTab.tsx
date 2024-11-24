import { useEffect, useState } from "react";
import { TaxSummaryCard } from "./tax-summary/TaxSummaryCard";
import { TaxSummarySelects } from "./tax-summary/TaxSummarySelects";
import { calculateTaxes } from "./tax-summary/TaxCalculationUtils";
import { TaxSummaryHeader } from "./tax-summary/TaxSummaryHeader";
import { TaxSummaryGrid } from "./tax-summary/TaxSummaryGrid";
import { useTaxAnalysis } from "./tax-summary/useTaxAnalysis";
import { Card } from "./ui/card";

interface TaxSummaryProps {
  audit?: any;
}

const TaxSummaryTab = ({ audit }: TaxSummaryProps) => {
  const [selectedBusinessType, setSelectedBusinessType] = useState<string>('corporation');
  const [selectedState, setSelectedState] = useState<string>('California');
  const [taxCalculation, setTaxCalculation] = useState({
    totalAmount: 0,
    deductions: 0,
    estimatedTax: 0,
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

  return (
    <div className="max-w-7xl mx-auto">
      <Card className="bg-card shadow-md border-0">
        <div className="p-6 space-y-8">
          <TaxSummaryHeader
            selectedState={selectedState}
            selectedBusinessType={selectedBusinessType}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <Card className="p-6 bg-muted/30">
              <h3 className="text-lg font-semibold mb-4">Configuration</h3>
              <TaxSummarySelects
                selectedBusinessType={selectedBusinessType}
                selectedState={selectedState}
                onBusinessTypeChange={setSelectedBusinessType}
                onStateChange={setSelectedState}
              />
            </Card>

            <Card className="p-6 bg-muted/30">
              <h3 className="text-lg font-semibold mb-4">Summary</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Total Revenue:</span>
                  <span className="font-semibold">${taxCalculation.totalAmount.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Total Deductions:</span>
                  <span className="font-semibold text-green-600">${taxCalculation.deductions.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Taxable Income:</span>
                  <span className="font-semibold text-yellow-600">${taxCalculation.taxableIncome.toLocaleString()}</span>
                </div>
              </div>
            </Card>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-4">Tax Breakdown</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="p-6 bg-primary/5 border-primary/20">
                <h4 className="text-sm font-medium text-muted-foreground mb-2">Minimum Tax</h4>
                <p className="text-2xl font-bold text-primary">${taxCalculation.minimumTax.toLocaleString()}</p>
              </Card>
              
              <Card className="p-6 bg-secondary/5 border-secondary/20">
                <h4 className="text-sm font-medium text-muted-foreground mb-2">Estimated Tax</h4>
                <p className="text-2xl font-bold text-secondary">${taxCalculation.estimatedTax.toLocaleString()}</p>
              </Card>
              
              <Card className="p-6 bg-accent/5 border-accent/20">
                <h4 className="text-sm font-medium text-muted-foreground mb-2">Effective Rate</h4>
                <p className="text-2xl font-bold text-accent-foreground">{taxCalculation.effectiveRate.toFixed(2)}%</p>
              </Card>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default TaxSummaryTab;