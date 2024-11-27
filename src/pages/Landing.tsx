import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ShieldCheck, ChevronRight, Zap, BarChart3 } from "lucide-react";

const Landing = () => {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-[#1A1F2C] to-[#121520]">
      <header className="px-4 lg:px-6 h-14 flex items-center">
        <div className="flex items-center justify-center">
          <ShieldCheck className="h-6 w-6 text-primary" />
          <span className="ml-2 text-2xl font-bold text-white">DevAudit</span>
        </div>
        <nav className="ml-auto flex gap-4 sm:gap-6">
          <Button 
            variant="ghost" 
            className="text-sm font-medium text-white hover:text-primary"
            onClick={() => navigate("/auth")}
          >
            Sign In
          </Button>
        </nav>
      </header>
      <main className="flex-1">
        <section className="w-full py-12 md:py-24 lg:py-32 xl:py-48">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center space-y-4 text-center">
              <div className="space-y-2">
                <h1 className="text-3xl font-bold tracking-tighter text-white sm:text-4xl md:text-5xl lg:text-6xl/none">
                  Simplify Your Development Audit Process
                </h1>
                <p className="mx-auto max-w-[700px] text-gray-400 md:text-xl">
                  Streamline your tax processes with AI-powered insights and professional tools.
                </p>
              </div>
              <div className="space-x-4">
                <Button 
                  className="bg-primary hover:bg-primary/90"
                  onClick={() => navigate("/auth")}
                >
                  Get Started
                  <ChevronRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </section>
        <section className="w-full py-12 md:py-24 lg:py-32 bg-black/20">
          <div className="container px-4 md:px-6">
            <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-3">
              <div className="flex flex-col items-center space-y-4 text-center">
                <ShieldCheck className="h-12 w-12 text-primary" />
                <h2 className="text-xl font-bold text-white">Secure Tax Filing</h2>
                <p className="text-gray-400">
                  Advanced security measures to protect your sensitive financial data.
                </p>
              </div>
              <div className="flex flex-col items-center space-y-4 text-center">
                <Zap className="h-12 w-12 text-primary" />
                <h2 className="text-xl font-bold text-white">Real-time Calculations</h2>
                <p className="text-gray-400">
                  Instant tax calculations and updates as you input your data.
                </p>
              </div>
              <div className="flex flex-col items-center space-y-4 text-center">
                <BarChart3 className="h-12 w-12 text-primary" />
                <h2 className="text-xl font-bold text-white">Financial Insights</h2>
                <p className="text-gray-400">
                  Comprehensive analytics and reporting for better financial decisions.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>
      <footer className="flex flex-col gap-2 sm:flex-row py-6 w-full shrink-0 items-center px-4 md:px-6 border-t border-gray-800">
        <p className="text-xs text-gray-400">
          © 2024 Tax Assistant. All rights reserved.
        </p>
      </footer>
    </div>
  );
};

export default Landing;