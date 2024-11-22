import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider, useAuth } from "@/components/AuthProvider";
import { ProfileWidget } from "@/components/ProfileWidget";

// Import your pages
import Auth from "@/pages/Auth";
import Index from "@/pages/Index";
import Revenue from "@/pages/Revenue";
import Tax from "@/pages/Tax";
import WriteOffs from "@/pages/WriteOffs";
import Documents from "@/pages/Documents";
import Audit from "@/pages/Audit";
import AuditDetail from "@/pages/AuditDetail";
import Forecast from "@/pages/Forecast";
import BalanceSheet from "@/pages/BalanceSheet";

const queryClient = new QueryClient();

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { session, loading } = useAuth();

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!session) {
    return <Navigate to="/auth" />;
  }

  return (
    <>
      <ProfileWidget />
      {children}
    </>
  );
};

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <AuthProvider>
          <Routes>
            <Route path="/auth" element={<Auth />} />
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <Index />
                </ProtectedRoute>
              }
            />
            <Route
              path="/revenue"
              element={
                <ProtectedRoute>
                  <Revenue />
                </ProtectedRoute>
              }
            />
            <Route
              path="/tax"
              element={
                <ProtectedRoute>
                  <Tax />
                </ProtectedRoute>
              }
            />
            <Route
              path="/write-offs"
              element={
                <ProtectedRoute>
                  <WriteOffs />
                </ProtectedRoute>
              }
            />
            <Route
              path="/documents"
              element={
                <ProtectedRoute>
                  <Documents />
                </ProtectedRoute>
              }
            />
            <Route
              path="/audit"
              element={
                <ProtectedRoute>
                  <Audit />
                </ProtectedRoute>
              }
            />
            <Route
              path="/audit/:id"
              element={
                <ProtectedRoute>
                  <AuditDetail />
                </ProtectedRoute>
              }
            />
            <Route
              path="/forecast"
              element={
                <ProtectedRoute>
                  <Forecast />
                </ProtectedRoute>
              }
            />
            <Route
              path="/balance-sheet"
              element={
                <ProtectedRoute>
                  <BalanceSheet />
                </ProtectedRoute>
              }
            />
          </Routes>
          <Toaster />
        </AuthProvider>
      </Router>
    </QueryClientProvider>
  );
}

export default App;