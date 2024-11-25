import { AccountsPayable } from "@/components/accounts/AccountsPayable";
import { AccountsReceivable } from "@/components/accounts/AccountsReceivable";
import { AgingReport } from "@/components/accounts/AgingReport";
import { TransactionList } from "@/components/TransactionList";
import { StateOperations } from "@/components/state-operations/StateOperations";

const Index = () => {
  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <AccountsPayable />
        <AccountsReceivable />
      </div>
      <AgingReport />
      <TransactionList />
      <StateOperations />
    </div>
  );
};

export default Index;