import { Routes, Route } from "react-router-dom";
import Landing from "@/pages/Landing";
import Index from "@/pages/Index";
import Auth from "@/pages/Auth";
import WriteOffs from "@/pages/WriteOffs";
import Documents from "@/pages/Documents";
import Tax from "@/pages/Tax";
import Revenue from "@/pages/Revenue";
import BalanceSheet from "@/pages/BalanceSheet";
import CashFlow from "@/pages/CashFlow";
import IncomeStatement from "@/pages/IncomeStatement";
import OwnersEquity from "@/pages/OwnersEquity";
import Forecast from "@/pages/Forecast";
import Audit from "@/pages/Audit";
import AuditDetail from "@/pages/AuditDetail";
import Assurance from "@/pages/Assurance";
import FinancialStatements from "@/pages/FinancialStatements";
import Expenses from "@/pages/Expenses";

export const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/dashboard" element={<Index />} />
      <Route path="/auth" element={<Auth />} />
      <Route path="/write-offs" element={<WriteOffs />} />
      <Route path="/documents" element={<Documents />} />
      <Route path="/tax" element={<Tax />} />
      <Route path="/revenue" element={<Revenue />} />
      <Route path="/balance-sheet" element={<BalanceSheet />} />
      <Route path="/cash-flow" element={<CashFlow />} />
      <Route path="/income-statement" element={<IncomeStatement />} />
      <Route path="/owners-equity" element={<OwnersEquity />} />
      <Route path="/forecast" element={<Forecast />} />
      <Route path="/audit" element={<Audit />} />
      <Route path="/audit/:id" element={<AuditDetail />} />
      <Route path="/assurance" element={<Assurance />} />
      <Route path="/financial-statements" element={<FinancialStatements />} />
      <Route path="/expenses" element={<Expenses />} />
    </Routes>
  );
};