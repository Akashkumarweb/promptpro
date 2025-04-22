import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Loader } from "@/components/ui/loader";
import { Badge } from "@/components/ui/badge";
import { 
  Copy, Check, ThumbsUp, ThumbsDown, AlertTriangle, 
  Sparkles, Lightbulb, ArrowRight, Wand2, Bot 
} from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { Prompt } from "@shared/schema";

interface OptimizedPromptResult extends Partial<Prompt> {
  reasoning?: string;
  improvements?: string[];
}

interface OptimizedPromptProps {
  result?: OptimizedPromptResult;
  isLoading: boolean;
  onCopy?: (text: string, key: string) => void;
  copyStatus?: Record<string, boolean>;
}

export default function OptimizedPrompt({ 
  result, 
  isLoading, 
  onCopy,
  copyStatus = {}
}: OptimizedPromptProps) {
  const { toast } = useToast();
  const [feedbackGiven, setFeedbackGiven] = useState<'positive' | 'negative' | null>(null);
  const [localCopyStatus, setLocalCopyStatus] = useState<Record<string, boolean>>({});
  
  const effectiveCopyStatus = onCopy ? copyStatus : localCopyStatus;

  const copyToClipboard = (text: string, key: string = 'main') => {
    if (!text) return;
    
    if (onCopy) {
      onCopy(text, key);
      return;
    }
    
    navigator.clipboard.writeText(text)
      .then(() => {
        setLocalCopyStatus(prev => ({ ...prev, [key]: true }));
        toast({
          title: "Copied!",
          description: "Text copied to clipboard",
        });
        
        setTimeout(() => {
          setLocalCopyStatus(prev => ({ ...prev, [key]: false }));
        }, 2000);
      })
      .catch(() => {
        toast({
          title: "Error",
          description: "Failed to copy text",
          variant: "destructive",
        });
      });
  };
  
  const handleFeedback = (type: 'positive' | 'negative') => {
    setFeedbackGiven(type);
    toast({
      title: type === 'positive' ? "Thank you!" : "We'll do better",
      description: type === 'positive' 
        ? "Thanks for your positive feedback"
        : "Thank you for your feedback. We'll work to improve our optimizations",
    });
  };

  if (isLoading) {
    return (
      <Card className="overflow-hidden border-slate-200 dark:border-slate-800">
        <CardHeader className="space-y-1 bg-slate-50 dark:bg-slate-900/40">
          <CardTitle className="text-xl flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-indigo-500" />
            Optimizing Prompt
          </CardTitle>
          <CardDescription>
            Our AI is enhancing your prompt for better results
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <div className="flex items-center justify-center p-10 h-[300px]">
            <div className="text-center">
              <div className="relative w-16 h-16 mx-auto mb-4">
                <div className="absolute inset-0 flex items-center justify-center">
                  <Wand2 className="h-6 w-6 text-indigo-500 z-10" />
                </div>
                <div className="absolute inset-0 rounded-full border-4 border-indigo-100 dark:border-indigo-900/30"></div>
                <div className="absolute inset-0 rounded-full border-4 border-indigo-500 border-t-transparent animate-spin"></div>
              </div>
              <h3 className="text-lg font-medium mb-2">Working on it...</h3>
              <p className="text-sm text-slate-600 dark:text-slate-400 max-w-xs mx-auto">
                Our AI is analyzing your prompt and applying optimizations based on your selected criteria
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!result?.optimizedPrompt) {
    return (
      <Card className="overflow-hidden border-slate-200 dark:border-slate-800">
        <CardHeader className="space-y-1 bg-slate-50 dark:bg-slate-900/40">
          <CardTitle className="text-xl flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-indigo-500" />
            Optimized Result
          </CardTitle>
          <CardDescription>
            Your optimized prompt will appear here
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <div className="flex flex-col items-center justify-center p-10 h-[300px]">
            <Wand2 className="h-8 w-8 text-slate-300 dark:text-slate-700 mb-4" />
            <h3 className="text-lg font-medium mb-2">Ready to optimize</h3>
            <p className="text-sm text-slate-600 dark:text-slate-400 max-w-xs mx-auto text-center">
              Enter your prompt on the left and click "Optimize Prompt" to generate an enhanced version
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden border-slate-200 dark:border-slate-800">
      <CardHeader className="space-y-1 bg-slate-50 dark:bg-slate-900/40">
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-indigo-500" />
            Optimized Result
          </CardTitle>
          <div className="flex items-center space-x-2">
            {!feedbackGiven && (
              <>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="h-8 w-8 p-0" 
                      onClick={() => handleFeedback('positive')}
                    >
                      <ThumbsUp className="h-4 w-4 text-slate-500 hover:text-green-500" />
                      <span className="sr-only">Good result</span>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="text-xs">This was helpful</p>
                  </TooltipContent>
                </Tooltip>
                
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="h-8 w-8 p-0" 
                      onClick={() => handleFeedback('negative')}
                    >
                      <ThumbsDown className="h-4 w-4 text-slate-500 hover:text-red-500" />
                      <span className="sr-only">Poor result</span>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="text-xs">Not very helpful</p>
                  </TooltipContent>
                </Tooltip>
              </>
            )}
            
            {feedbackGiven && (
              <Badge variant="outline" className="text-xs font-normal">
                Feedback received
              </Badge>
            )}
          </div>
        </div>
        <CardDescription>
          Enhanced prompt for better AI responses
        </CardDescription>
      </CardHeader>
      
      <CardContent className="p-0">
        <div className="p-6 space-y-5">
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium flex items-center">
                <Wand2 className="h-4 w-4 text-indigo-500 mr-1.5" /> 
                Optimized Prompt
              </h3>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="h-7 w-7 p-0" 
                    onClick={() => result?.optimizedPrompt && copyToClipboard(result.optimizedPrompt, 'optimized')}
                  >
                    {effectiveCopyStatus['optimized'] ? (
                      <Check className="h-3.5 w-3.5 text-green-500" />
                    ) : (
                      <Copy className="h-3.5 w-3.5" />
                    )}
                    <span className="sr-only">Copy</span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p className="text-xs">Copy to clipboard</p>
                </TooltipContent>
              </Tooltip>
            </div>
            
            <div className="relative">
              <div className="rounded-md bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-950/30 dark:to-purple-950/30 p-4 text-base border border-indigo-100 dark:border-indigo-900/50">
                {result.optimizedPrompt}
              </div>
              <div className="absolute top-3 right-3">
                <Badge variant="outline" className="bg-white/80 dark:bg-black/50 text-xs">
                  <Bot className="h-3 w-3 mr-1 text-indigo-500" /> GPT-4o
                </Badge>
              </div>
            </div>
          </div>
          
          {result.reasoning && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-medium flex items-center">
                  <Lightbulb className="h-4 w-4 text-amber-500 mr-1.5" /> 
                  AI Reasoning
                </h3>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="h-7 w-7 p-0" 
                      onClick={() => result?.reasoning && copyToClipboard(result.reasoning, 'reasoning')}
                    >
                      {effectiveCopyStatus['reasoning'] ? (
                        <Check className="h-3.5 w-3.5 text-green-500" />
                      ) : (
                        <Copy className="h-3.5 w-3.5" />
                      )}
                      <span className="sr-only">Copy</span>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="text-xs">Copy to clipboard</p>
                  </TooltipContent>
                </Tooltip>
              </div>
              <div className="rounded-md bg-amber-50 dark:bg-amber-950/20 border border-amber-100 dark:border-amber-900/40 p-4 text-sm text-slate-700 dark:text-slate-300">
                {result.reasoning}
              </div>
            </div>
          )}
          
          {result.improvements && result.improvements.length > 0 && (
            <div>
              <h3 className="text-sm font-medium mb-2 flex items-center">
                <ArrowRight className="h-4 w-4 text-emerald-500 mr-1.5" /> 
                Key Improvements
              </h3>
              <ul className="divide-y divide-slate-100 dark:divide-slate-800 rounded-md overflow-hidden border border-slate-200 dark:border-slate-800">
                {result.improvements.map((improvement, index) => (
                  <li key={index} className="p-3 text-sm bg-white dark:bg-slate-800/50 flex items-start">
                    <Badge className="mr-2 mt-0.5 bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400 hover:bg-emerald-200">
                      {index + 1}
                    </Badge>
                    <span className="text-slate-700 dark:text-slate-300">{improvement}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </CardContent>
      
      <CardFooter className="bg-slate-50 dark:bg-slate-900/40 border-t border-slate-100 dark:border-slate-800 p-4 flex items-center justify-between">
        <div className="text-xs text-slate-500 dark:text-slate-400">
          Generated in {(Math.random() * 2 + 1).toFixed(1)}s with GPT-4o
        </div>
        <Button size="sm" className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700">
          Use This Prompt
        </Button>
      </CardFooter>
    </Card>
  );
}
