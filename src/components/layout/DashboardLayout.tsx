import { useState } from "react";
import { Sidebar } from "@/components/navigation/Sidebar";

export const DashboardLayout = ({ children }: { children: React.ReactNode }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar onCollapse={setIsCollapsed} />
      <main className={`flex-1 p-4 transition-all duration-300 ${
        isCollapsed ? 'ml-16' : 'ml-16 md:ml-64'
      }`}>
        {children}
      </main>
    </div>
  );
};