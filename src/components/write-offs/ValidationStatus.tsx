import React from 'react';
import { Badge } from "@/components/ui/badge";
import { FileCheck, AlertCircle } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { WriteOff } from "@/components/types";

interface ValidationStatusProps {
  writeOff: WriteOff;
}

export const ValidationStatus = ({ writeOff }: ValidationStatusProps) => {
  const getValidationStatus = (writeOff: WriteOff) => {
    const rules = writeOff.tax_codes?.validation_rules || [];
    const docs = writeOff.tax_codes?.documentation_requirements || [];
    const hasAllDocs = docs.every(doc => 
      writeOff.description.toLowerCase().includes(doc.toLowerCase())
    );
    
    return {
      isValid: hasAllDocs && rules.length > 0,
      missingDocs: docs.filter(doc => 
        !writeOff.description.toLowerCase().includes(doc.toLowerCase())
      )
    };
  };

  const validationStatus = getValidationStatus(writeOff);

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger>
          {validationStatus.isValid ? (
            <Badge variant="success" className="ml-2">
              <FileCheck className="h-3 w-3 mr-1" />
              Validated
            </Badge>
          ) : (
            <Badge variant="destructive" className="ml-2">
              <AlertCircle className="h-3 w-3 mr-1" />
              Missing Documentation
            </Badge>
          )}
        </TooltipTrigger>
        <TooltipContent>
          {validationStatus.isValid 
            ? "All documentation requirements met"
            : `Missing: ${validationStatus.missingDocs.join(", ")}`
          }
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};