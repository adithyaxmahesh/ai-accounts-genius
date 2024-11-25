import { BrowserRouter as Router } from "react-router-dom";
import { Toaster } from "@/components/ui/toaster";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider } from "@/components/AuthProvider";
import { AppRoutes } from "@/components/AppRoutes";

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <div className="dark">
          <AuthProvider>
            <AppRoutes />
            <Toaster />
          </AuthProvider>
        </div>
      </Router>
    </QueryClientProvider>
  );
}

export default App;