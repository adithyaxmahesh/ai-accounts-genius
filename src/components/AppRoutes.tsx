import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "@/components/AuthProvider";
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
import FinancialStreams from "@/pages/FinancialStreams";

export const AppRoutes = () => {
  const { session } = useAuth();

  // Protected route wrapper
  const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
    if (!session) {
      return <Navigate to="/" replace />;
    }
    return <>{children}</>;
  };

  // Public route wrapper - redirects to dashboard if authenticated
  const PublicRoute = ({ children }: { children: React.ReactNode }) => {
    if (session) {
      return <Navigate to="/dashboard" replace />;
    }
    return <>{children}</>;
  };

  return (
    <Routes>
      {/* Public routes */}
      <Route path="/" element={<PublicRoute><Landing /></PublicRoute>} />
      <Route path="/auth" element={<PublicRoute><Auth /></PublicRoute>} />

      {/* Protected routes */}
      <Route path="/dashboard" element={<ProtectedRoute><Index /></ProtectedRoute>} />
      <Route path="/write-offs" element={<ProtectedRoute><WriteOffs /></ProtectedRoute>} />
      <Route path="/documents" element={<ProtectedRoute><Documents /></ProtectedRoute>} />
      <Route path="/tax" element={<ProtectedRoute><Tax /></ProtectedRoute>} />
      <Route path="/revenue" element={<ProtectedRoute><Revenue /></ProtectedRoute>} />
      <Route path="/balance-sheet" element={<ProtectedRoute><BalanceSheet /></ProtectedRoute>} />
      <Route path="/cash-flow" element={<ProtectedRoute><CashFlow /></ProtectedRoute>} />
      <Route path="/income-statement" element={<ProtectedRoute><IncomeStatement /></ProtectedRoute>} />
      <Route path="/owners-equity" element={<ProtectedRoute><OwnersEquity /></ProtectedRoute>} />
      <Route path="/forecast" element={<ProtectedRoute><Forecast /></ProtectedRoute>} />
      <Route path="/audit" element={<ProtectedRoute><Audit /></ProtectedRoute>} />
      <Route path="/audit/:id" element={<ProtectedRoute><AuditDetail /></ProtectedRoute>} />
      <Route path="/assurance" element={<ProtectedRoute><Assurance /></ProtectedRoute>} />
      <Route path="/financial-statements" element={<ProtectedRoute><FinancialStatements /></ProtectedRoute>} />
      <Route path="/expenses" element={<ProtectedRoute><Expenses /></ProtectedRoute>} />
      <Route path="/financial-streams" element={<ProtectedRoute><FinancialStreams /></ProtectedRoute>} />
    </Routes>
  );
};