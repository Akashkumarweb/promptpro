import { useEffect } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth.tsx";
import { usePromptHistory } from "@/hooks/use-prompt.ts";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import PromptForm from "@/components/prompt/PromptForm";
import PromptHistory from "@/components/prompt/PromptHistory";
import { PageLoader } from "@/components/ui/loader";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export default function Dashboard() {
  const { user, isLoading: authLoading } = useAuth();
  const { data: prompts, isLoading: promptsLoading } = usePromptHistory();
  const [, navigate] = useLocation();

  useEffect(() => {
    // Redirect to login if not authenticated
    if (!authLoading && !user) {
      navigate("/login");
    }
  }, [user, authLoading, navigate]);

  if (authLoading) {
    return <PageLoader />;
  }

  if (!user) {
    return null; // Will redirect to login
  }

  const promptsUsed = user.promptsUsed || 0;
  const promptLimit = user.isPremium ? 200 : 10;
  const usagePercentage = (promptsUsed / promptLimit) * 100;

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold mb-8">Dashboard</h1>
        
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Prompt Usage</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <Progress value={usagePercentage} />
              <div className="flex justify-between text-sm text-slate-600 dark:text-slate-400">
                <p>
                  {promptsUsed} / {promptLimit} optimizations used
                </p>
                <p>
                  {user.isPremium ? "Pro Plan" : "Free Plan"}
                </p>
              </div>
              
              {!user.isPremium && promptsUsed >= 8 && (
                <Alert className="mt-4 border border-amber-500 bg-amber-50 dark:bg-amber-950">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Approaching limit</AlertTitle>
                  <AlertDescription>
                    You have {10 - promptsUsed} optimizations left this month. 
                    <a href="/pricing" className="ml-1 text-indigo-600 dark:text-indigo-400 hover:underline">
                      Upgrade to Pro for more.
                    </a>
                  </AlertDescription>
                </Alert>
              )}
            </div>
          </CardContent>
        </Card>
        
        <h2 className="text-2xl font-bold mb-6">Optimize a Prompt</h2>
        <PromptForm />
        
        <h2 className="text-2xl font-bold my-8">Prompt History</h2>
        <PromptHistory prompts={prompts || []} isLoading={promptsLoading} />
      </main>
      <Footer />
    </div>
  );
}
