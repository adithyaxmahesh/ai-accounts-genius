import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { InfoIcon } from "lucide-react";

export const AddIncomeStatementEntry = () => {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline">Manual Entry</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Income Statement Entries</DialogTitle>
        </DialogHeader>
        <Alert>
          <InfoIcon className="h-4 w-4" />
          <AlertDescription>
            Income statement entries are now automatically populated from your revenue records and write-offs.
            Manual entries should only be used for special cases.
          </AlertDescription>
        </Alert>
      </DialogContent>
    </Dialog>
  );
};