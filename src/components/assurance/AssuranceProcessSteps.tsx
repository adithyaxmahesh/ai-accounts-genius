import { ClipboardCheck, FileSpreadsheet, BookOpen, CheckCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

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
      "Resource Allocation",
      "Stakeholder Identification"
    ]
  },
  {
    id: "evidence",
    title: "Evidence Gathering",
    description: "Collection and documentation of evidence",
    icon: <FileSpreadsheet className="h-5 w-5" />,
    content: [
      "Document Inspection",
      "Process Observation",
      "Management Inquiries",
      "External Confirmations",
      "Analytical Procedures"
    ]
  },
  {
    id: "evaluation",
    title: "Evidence Evaluation",
    description: "Analysis and assessment of collected evidence",
    icon: <BookOpen className="h-5 w-5" />,
    content: [
      "Evidence Sufficiency",
      "Evidence Reliability",
      "Finding Documentation",
      "Risk Reassessment",
      "Compliance Verification"
    ]
  },
  {
    id: "conclusion",
    title: "Reporting & Conclusion",
    description: "Final assessment and report preparation",
    icon: <CheckCircle className="h-5 w-5" />,
    content: [
      "Opinion Formulation",
      "Report Drafting",
      "Management Discussion",
      "Recommendations",
      "Final Report Issuance"
    ]
  }
];

export const AssuranceProcessSteps = () => {
  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader>
        <CardTitle className="text-xl">Assurance Process</CardTitle>
        <CardDescription>
          Understanding the key phases in the assurance workflow
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Accordion type="single" collapsible className="w-full">
          {assuranceProcessSteps.map((step) => (
            <AccordionItem key={step.id} value={step.id} className="hover:bg-muted/50 transition-colors">
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
  );
};