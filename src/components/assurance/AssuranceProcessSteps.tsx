import { ClipboardCheck, FileSpreadsheet, BookOpen } from "lucide-react";
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
      "Resource Allocation"
    ]
  },
  {
    id: "fieldwork",
    title: "Fieldwork",
    description: "Evidence gathering and testing procedures",
    icon: <FileSpreadsheet className="h-5 w-5" />,
    content: [
      "Substantive Testing",
      "Control Testing",
      "Documentation Review",
      "Sample Selection"
    ]
  },
  {
    id: "review",
    title: "Quality Review",
    description: "Review of work performed and findings",
    icon: <BookOpen className="h-5 w-5" />,
    content: [
      "Working Paper Review",
      "Finding Evaluation",
      "Evidence Assessment",
      "Quality Control"
    ]
  }
];

export const AssuranceProcessSteps = () => {
  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader>
        <CardTitle className="text-xl">Assurance Workflow</CardTitle>
        <CardDescription>
          Learn about the key phases in the assurance process
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