import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Auth as SupabaseAuth } from "@supabase/auth-ui-react";
import { ThemeSupa } from "@supabase/auth-ui-shared";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { useAuth } from "@/components/AuthProvider";
import { Shield } from "lucide-react";

const Auth = () => {
  const navigate = useNavigate();
  const { session } = useAuth();

  useEffect(() => {
    if (session) {
      navigate('/');
    }
  }, [session, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-background to-background/95 p-4">
      <Card className="w-full max-w-md p-8">
        <div className="mb-8">
          <div className="flex justify-center mb-4">
            <Shield className="h-12 w-12 text-primary" />
          </div>
          <h1 className="text-2xl font-bold text-center">Welcome to DevAudit</h1>
          <p className="text-muted-foreground text-center mt-2">Sign in to access your account</p>
        </div>
        
        <SupabaseAuth
          supabaseClient={supabase}
          appearance={{
            theme: ThemeSupa,
            variables: {
              default: {
                colors: {
                  brand: '#9b87f5',
                  brandAccent: '#7E69AB',
                  inputText: 'white',
                  inputBackground: 'transparent',
                  inputBorder: '#9b87f5',
                  inputBorderFocus: '#7E69AB',
                  inputBorderHover: '#6E59A5',
                }
              }
            },
            style: {
              input: {
                backgroundColor: 'transparent',
                border: '2px solid',
                borderColor: '#9b87f5',
                color: 'white'
              },
              button: {
                border: '2px solid transparent',
                transition: 'transform 0.2s ease',
                transform: 'translateY(0)',
                hover: {
                  transform: 'translateY(-1px)'
                }
              }
            }
          }}
          providers={[]}
        />
      </Card>
    </div>
  );
};

export default Auth;