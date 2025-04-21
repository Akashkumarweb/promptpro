import { useEffect } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { CheckCircle } from "lucide-react";
import Layout from "@/components/layout/Layout";

export default function PaymentSuccess() {
  const { user } = useAuth();
  const [, navigate] = useLocation();

  useEffect(() => {
    // If not logged in or redirected here directly, redirect to dashboard
    if (!user) {
      setTimeout(() => {
        navigate("/dashboard");
      }, 3000);
    }
  }, [user, navigate]);

  return (
    <Layout>
      <div className="container mx-auto px-4 py-16 flex items-center justify-center min-h-[60vh]">
        <div className="max-w-lg w-full text-center">
          <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-green-100 mb-6">
            <CheckCircle className="h-10 w-10 text-green-600" />
          </div>
          
          <h1 className="text-3xl font-bold mb-3">Payment Successful!</h1>
          
          <p className="text-lg text-muted-foreground mb-8">
            Thank you for subscribing to PromptPal Premium. Your account has been upgraded and you now have access to all premium features.
          </p>
          
          <Button size="lg" asChild>
            <a href="/dashboard">Go to Dashboard</a>
          </Button>
        </div>
      </div>
    </Layout>
  );
}