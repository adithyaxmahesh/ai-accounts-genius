import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, FileText, Upload } from "lucide-react";
import { DocumentUpload } from "@/components/DocumentUpload";

const Documents = () => {
  const navigate = useNavigate();

  return (
    <div className="container mx-auto p-6 space-y-6 fade-in">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-4">
          <Button 
            variant="ghost" 
            onClick={() => navigate('/')}
            className="hover-scale"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
          <h1 className="text-3xl font-bold">Document History</h1>
        </div>
      </div>

      <DocumentUpload />
    </div>
  );
};

export default Documents;