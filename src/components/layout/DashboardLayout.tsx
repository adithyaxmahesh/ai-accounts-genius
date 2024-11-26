import { Sidebar } from "@/components/navigation/Sidebar";

export const DashboardLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <main className="flex-1 ml-64 p-4">
        {children}
      </main>
    </div>
  );
};