import React from 'react';
import { Building, Calendar, Tag } from "lucide-react";
import { WriteOff } from "@/components/types";
import { ValidationStatus } from "./ValidationStatus";
import { formatCurrency } from "@/lib/utils";

interface WriteOffCardProps {
  writeOff: WriteOff;
  parseDescription: (description: string) => {
    payee: string;
    purpose: string;
    charges: number[];
  };
  calculateTotalAmount: (writeOff: WriteOff) => number;
  getChargesBreakdown: (description: string) => string;
}

export const WriteOffCard = ({ 
  writeOff, 
  parseDescription, 
  calculateTotalAmount,
  getChargesBreakdown 
}: WriteOffCardProps) => {
  const { payee, purpose } = parseDescription(writeOff.description);
  
  return (
    <div className="flex flex-col p-4 bg-muted rounded-lg hover:bg-muted/80 transition-colors">
      <div className="flex justify-between items-start mb-2">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Building className="h-4 w-4 text-muted-foreground" />
            <p className="font-semibold">{payee}</p>
            <ValidationStatus writeOff={writeOff} />
          </div>
          <div className="flex items-center gap-2">
            <Tag className="h-4 w-4 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">{purpose}</p>
          </div>
        </div>
        <div className="text-right">
          <p className="font-semibold">{formatCurrency(calculateTotalAmount(writeOff))}</p>
          <div className="flex items-center gap-1 text-sm text-muted-foreground">
            <Calendar className="h-3 w-3" />
            <p>{new Date(writeOff.date).toLocaleDateString()}</p>
          </div>
        </div>
      </div>
      {writeOff.tax_codes && (
        <div className="mt-2 pt-2 border-t border-border">
          <p className="text-sm text-muted-foreground">
            {writeOff.tax_codes.state} - {writeOff.tax_codes.expense_category}
          </p>
          <p className="text-sm text-muted-foreground">
            {writeOff.tax_codes.code} - {writeOff.tax_codes.description}
          </p>
          {writeOff.tax_codes.max_deduction_amount && (
            <p className="text-sm text-muted-foreground">
              Maximum Deduction: {formatCurrency(writeOff.tax_codes.max_deduction_amount)}
            </p>
          )}
        </div>
      )}
      {getChargesBreakdown(writeOff.description) && (
        <p className="text-sm text-muted-foreground mt-2">
          Breakdown: {getChargesBreakdown(writeOff.description)}
        </p>
      )}
      <p className="text-sm text-muted-foreground mt-2 capitalize">
        Status: {writeOff.status || "Pending"}
      </p>
    </div>
  );
};