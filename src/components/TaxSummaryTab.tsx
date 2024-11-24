import { useEffect } from "react";
import { TaxSummaryCard } from "./tax-summary/TaxSummaryCard";
import { TaxSummarySelects } from "./tax-summary/TaxSummarySelects";
import { calculateTaxes } from "./tax-summary/TaxCalculationUtils";
import { TaxSummaryHeader } from "./tax-summary/TaxSummaryHeader";
import { TaxSummaryGrid } from "./tax-summary/TaxSummaryGrid";
import { useTaxAnalysis } from "./tax-summary/useTaxAnalysis";
import { useState } from "react";

interface TaxSummaryProps {
  audit?: any;
}

const TaxSummaryTab = ({ audit }: TaxSummaryProps) => {
  const [selectedBusinessType, setSelectedBusinessType] = useState<string>('corporation');
  const [selectedState, setSelectedState] = useState<string>('California');

  const { businessInfo, taxAnalysis, updateTaxAnalysis } = useTaxAnalysis(
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
    // Recalculate taxes whenever business type or state changes
    if (updateTaxAnalysis) {
      updateTaxAnalysis.mutate({ 
        businessType: selectedBusinessType, 
        state: selectedState 
      });
    }
  }, [selectedBusinessType, selectedState]);

  const {
    totalAmount = 0,
    deductions = 0,
    estimatedTax = 0,
    effectiveRate = 0,
    taxableIncome = 0,
    minimumTax = 800
  } = calculateTaxes(taxAnalysis, audit, selectedBusinessType, selectedState) || {};

  return (
    <div className="space-y-6">
      <TaxSummaryHeader
        selectedState={selectedState}
        selectedBusinessType={selectedBusinessType}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <TaxSummarySelects
          selectedBusinessType={selectedBusinessType}
          selectedState={selectedState}
          onBusinessTypeChange={setSelectedBusinessType}
          onStateChange={setSelectedState}
        />

        <TaxSummaryGrid
          totalAmount={totalAmount}
          deductions={deductions}
          taxableIncome={taxableIncome}
          minimumTax={minimumTax}
          estimatedTax={estimatedTax}
          effectiveRate={effectiveRate}
        />
      </div>
    </div>
  );
};

export default TaxSummaryTab;