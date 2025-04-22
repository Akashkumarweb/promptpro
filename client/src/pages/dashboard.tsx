import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth.tsx";
import { usePromptHistory } from "@/hooks/use-prompt.ts";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import PromptForm from "@/components/prompt/PromptForm";
import PromptHistory from "@/components/prompt/PromptHistory";
import { PageLoader } from "@/components/ui/loader";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { AlertCircle, ChevronRight, Crown, History, Sparkles, Zap, LineChart, Repeat, Settings } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";

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

  const [activeTab, setActiveTab] = useState("optimize");

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-900">
      <Navbar />
      <main className="flex-1 container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-extrabold bg-gradient-to-r from-indigo-600 to-purple-600 text-transparent bg-clip-text mb-2">
              Welcome back, {user.username}
            </h1>
            <p className="text-slate-600 dark:text-slate-400">
              Optimize your prompts for better AI interactions
            </p>
          </div>
          
          <div className="mt-4 md:mt-0 flex items-center">
            <div className="flex items-center mr-4 bg-white dark:bg-slate-800 shadow-sm rounded-lg p-2 border border-slate-200 dark:border-slate-700">
              <div className="p-1.5 rounded-md bg-indigo-100 dark:bg-indigo-900 mr-2">
                <Sparkles className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
              </div>
              <div>
                <p className="text-xs text-slate-500 dark:text-slate-400">Status</p>
                <p className="text-sm font-semibold flex items-center">
                  {user.isPremium ? (
                    <>
                      <Crown className="h-3.5 w-3.5 text-amber-500 mr-1" /> Premium
                    </>
                  ) : "Free Plan"}
                </p>
              </div>
            </div>
            
            {!user.isPremium && (
              <Button size="sm" asChild className="bg-gradient-to-r from-indigo-600 to-purple-600">
                <a href="/pricing">Upgrade Now</a>
              </Button>
            )}
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center">
                <div className="p-2 rounded-md bg-emerald-100 dark:bg-emerald-900 mr-2">
                  <Zap className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                </div>
                Prompt Usage
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <Progress value={usagePercentage} className="h-2" />
                <div className="flex justify-between text-sm">
                  <p className="font-medium">
                    {promptsUsed} / {promptLimit}
                  </p>
                  <p className="text-slate-600 dark:text-slate-400">
                    {Math.floor(usagePercentage)}% used
                  </p>
                </div>
              </div>
            </CardContent>
            {!user.isPremium && promptsUsed >= 8 && (
              <CardFooter className="pt-0">
                <Alert className="w-full border border-amber-500 bg-amber-50 dark:bg-amber-950/30">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription className="text-xs">
                    Only {10 - promptsUsed} optimizations left this month.
                    <a href="/pricing" className="ml-1 font-medium text-indigo-600 dark:text-indigo-400 hover:underline">
                      Upgrade
                    </a>
                  </AlertDescription>
                </Alert>
              </CardFooter>
            )}
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center">
                <div className="p-2 rounded-md bg-blue-100 dark:bg-blue-900 mr-2">
                  <History className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                </div>
                Prompt History
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                {prompts?.length || 0}
              </div>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Total optimized prompts
              </p>
            </CardContent>
            <CardFooter>
              <Button variant="ghost" size="sm" className="text-xs w-full" onClick={() => setActiveTab("history")}>
                View History <ChevronRight className="h-3 w-3 ml-1" />
              </Button>
            </CardFooter>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center">
                <div className="p-2 rounded-md bg-purple-100 dark:bg-purple-900 mr-2">
                  <LineChart className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                </div>
                Analytics
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-4">
                <div>
                  <div className="text-3xl font-bold">
                    {user.isPremium ? "Pro" : "Free"}
                  </div>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    Current plan
                  </p>
                </div>
                
                {!user.isPremium && (
                  <Button size="sm" asChild className="ml-auto">
                    <a href="/pricing">Upgrade</a>
                  </Button>
                )}
              </div>
            </CardContent>
            <CardFooter>
              <Button variant="ghost" size="sm" className="text-xs w-full" asChild>
                <a href="/settings">Account Settings <ChevronRight className="h-3 w-3 ml-1" /></a>
              </Button>
            </CardFooter>
          </Card>
        </div>
        
        <Tabs defaultValue="optimize" value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 md:w-auto">
            <TabsTrigger value="optimize" className="flex items-center gap-2">
              <Repeat className="h-4 w-4" /> Optimize Prompts
            </TabsTrigger>
            <TabsTrigger value="history" className="flex items-center gap-2">
              <History className="h-4 w-4" /> Prompt History
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="optimize" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Optimize Your Prompt</CardTitle>
                <CardDescription>
                  Enter your prompt below to make it more effective for AI systems
                </CardDescription>
              </CardHeader>
              <CardContent>
                <PromptForm />
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="history" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Prompt History</CardTitle>
                <CardDescription>
                  View and reuse your previously optimized prompts
                </CardDescription>
              </CardHeader>
              <CardContent>
                <PromptHistory prompts={prompts || []} isLoading={promptsLoading} />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
        
      </main>
      <Footer />
    </div>
  );
}
