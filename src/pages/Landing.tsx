import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ChevronRight, ShieldCheck, Zap, BarChart3 } from "lucide-react";
import { Link } from "react-router-dom";

export default function Landing() {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col min-h-screen">
      <header className="px-4 lg:px-6 h-14 flex items-center">
        <Link className="flex items-center justify-center" to="/">
          <ShieldCheck className="h-6 w-6 text-primary" />
          <span className="ml-2 text-2xl font-bold">DevAudit</span>
        </Link>
        <nav className="ml-auto flex gap-4 sm:gap-6">
          <Link className="text-sm font-medium hover:underline underline-offset-4" to="/features">
            Features
          </Link>
          <Link className="text-sm font-medium hover:underline underline-offset-4" to="/pricing">
            Pricing
          </Link>
          <Link className="text-sm font-medium hover:underline underline-offset-4" to="/about">
            About
          </Link>
          <Button variant="outline" onClick={() => navigate("/auth")}>
            Sign In
          </Button>
        </nav>
      </header>
      <main className="flex-1">
        <section className="w-full py-12 md:py-24 lg:py-32 xl:py-48">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center space-y-4 text-center">
              <div className="space-y-2">
                <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl/none">
                  Secure Your Financial Code
                </h1>
                <p className="mx-auto max-w-[700px] text-gray-500 md:text-xl">
                  DevAudit provides cutting-edge security auditing for fintech applications. Protect your code, secure your finances.
                </p>
              </div>
              <div className="space-x-4">
                <Button className="bg-primary hover:bg-primary/90" onClick={() => navigate("/auth")}>
                  Get Started
                  <ChevronRight className="ml-2 h-4 w-4" />
                </Button>
                <Button variant="outline">Learn More</Button>
              </div>
            </div>
          </div>
        </section>
        <section className="w-full py-12 md:py-24 lg:py-32 bg-muted">
          <div className="container px-4 md:px-6">
            <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-3">
              <div className="flex flex-col items-center space-y-4 text-center">
                <ShieldCheck className="h-12 w-12 text-primary" />
                <h2 className="text-xl font-bold">Advanced Security Audits</h2>
                <p className="text-muted-foreground">
                  Our AI-powered tools scan your codebase for vulnerabilities and security risks.
                </p>
              </div>
              <div className="flex flex-col items-center space-y-4 text-center">
                <Zap className="h-12 w-12 text-primary" />
                <h2 className="text-xl font-bold">Real-time Monitoring</h2>
                <p className="text-muted-foreground">
                  Continuous monitoring of your financial applications for immediate threat detection.
                </p>
              </div>
              <div className="flex flex-col items-center space-y-4 text-center">
                <BarChart3 className="h-12 w-12 text-primary" />
                <h2 className="text-xl font-bold">Compliance Reporting</h2>
                <p className="text-muted-foreground">
                  Generate comprehensive reports to ensure compliance with financial regulations.
                </p>
              </div>
            </div>
          </div>
        </section>
        <section className="w-full py-12 md:py-24 lg:py-32">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">
                  Ready to Secure Your Fintech App?
                </h2>
                <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  Join thousands of fintech companies trusting DevAudit for their security needs.
                </p>
              </div>
              <div className="w-full max-w-sm space-y-2">
                <form className="flex space-x-2">
                  <Input
                    className="max-w-lg flex-1"
                    placeholder="Enter your email"
                    type="email"
                  />
                  <Button type="submit" className="bg-primary hover:bg-primary/90">
                    Get Started
                  </Button>
                </form>
                <p className="text-xs text-muted-foreground">
                  Start your free trial. No credit card required.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>
      <footer className="flex flex-col gap-2 sm:flex-row py-6 w-full shrink-0 items-center px-4 md:px-6 border-t">
        <p className="text-xs text-muted-foreground">
          © 2024 DevAudit. All rights reserved.
        </p>
        <nav className="sm:ml-auto flex gap-4 sm:gap-6">
          <Link className="text-xs hover:underline underline-offset-4" to="/terms">
            Terms of Service
          </Link>
          <Link className="text-xs hover:underline underline-offset-4" to="/privacy">
            Privacy
          </Link>
        </nav>
      </footer>
    </div>
  );
}