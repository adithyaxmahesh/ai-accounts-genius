import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Audit from "./pages/Audit";
import AuditDetail from "./pages/AuditDetail";
import Revenue from "./pages/Revenue";
import Forecast from "./pages/Forecast";
import WriteOffs from "./pages/WriteOffs";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000,
    },
  },
});

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/audit" element={<Audit />} />
          <Route path="/audit/:id" element={<AuditDetail />} />
          <Route path="/revenue" element={<Revenue />} />
          <Route path="/forecast" element={<Forecast />} />
          <Route path="/write-offs" element={<WriteOffs />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;