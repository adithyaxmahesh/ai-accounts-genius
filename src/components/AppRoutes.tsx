import { Routes, Route } from "react-router-dom";
import Index from "@/pages/Index";
import Auth from "@/pages/Auth";
import Documents from "@/pages/Documents";
import Tax from "@/pages/Tax";
import Audit from "@/pages/Audit";
import AuditDetail from "@/pages/AuditDetail";
import Revenue from "@/pages/Revenue";
import WriteOffs from "@/pages/WriteOffs";
import BalanceSheet from "@/pages/BalanceSheet";
import IncomeStatement from "@/pages/IncomeStatement";
import CashFlow from "@/pages/CashFlow";
import OwnersEquity from "@/pages/OwnersEquity";
import Forecast from "@/pages/Forecast";
import Assurance from "@/pages/Assurance";

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<Index />} />
      <Route path="/auth" element={<Auth />} />
      <Route path="/documents" element={<Documents />} />
      <Route path="/tax" element={<Tax />} />
      <Route path="/audit" element={<Audit />} />
      <Route path="/audit/:id" element={<AuditDetail />} />
      <Route path="/revenue" element={<Revenue />} />
      <Route path="/write-offs" element={<WriteOffs />} />
      <Route path="/balance-sheet" element={<BalanceSheet />} />
      <Route path="/income-statement" element={<IncomeStatement />} />
      <Route path="/cash-flow" element={<CashFlow />} />
      <Route path="/owners-equity" element={<OwnersEquity />} />
      <Route path="/forecast" element={<Forecast />} />
      <Route path="/assurance" element={<Assurance />} />
    </Routes>
  );
};

export default AppRoutes;