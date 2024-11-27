import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Auth as SupabaseAuth } from "@supabase/auth-ui-react";
import { ThemeSupa } from "@supabase/auth-ui-shared";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { useAuth } from "@/components/AuthProvider";

const Auth = () => {
  const navigate = useNavigate();
  const { session } = useAuth();

  useEffect(() => {
    if (session) {
      navigate('/dashboard');
    }
  }, [session, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#1A1F2C] to-[#121520]">
      <Card className="w-full max-w-md p-8 glass-card">
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-bold text-white">Welcome Back</h1>
          <p className="text-muted-foreground">Sign in to access your account</p>
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
                  inputText: '#ffffff',
                  inputBackground: 'rgba(255, 255, 255, 0.05)',
                  inputBorder: '#9b87f5',
                  inputBorderFocus: '#7E69AB',
                  inputBorderHover: '#6E59A5',
                }
              }
            },
            style: {
              input: {
                backgroundColor: 'rgba(255, 255, 255, 0.05)',
                color: '#ffffff',
                borderWidth: '2px',
              },
              button: {
                borderWidth: '2px',
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