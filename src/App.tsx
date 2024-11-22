import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Tax from "./pages/Tax";
import Audit from "./pages/Audit";
import AuditDetail from "./pages/AuditDetail";
import Documents from "./pages/Documents";
import Revenue from "./pages/Revenue";
import WriteOffs from "./pages/WriteOffs";
import BalanceSheet from "./pages/BalanceSheet";
import Forecast from "./pages/Forecast";
import Assurance from "./pages/Assurance";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/auth" element={<Auth />} />
        <Route path="/tax" element={<Tax />} />
        <Route path="/audit" element={<Audit />} />
        <Route path="/audit/:id" element={<AuditDetail />} />
        <Route path="/documents" element={<Documents />} />
        <Route path="/revenue" element={<Revenue />} />
        <Route path="/write-offs" element={<WriteOffs />} />
        <Route path="/balance-sheet" element={<BalanceSheet />} />
        <Route path="/forecast" element={<Forecast />} />
        <Route path="/assurance" element={<Assurance />} />
      </Routes>
    </Router>
  );
}

export default App;