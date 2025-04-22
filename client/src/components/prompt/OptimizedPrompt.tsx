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
      <Card>
        <CardHeader>
          <CardTitle>Optimizing your prompt...</CardTitle>
        </CardHeader>
        <CardContent className="h-[300px] flex items-center justify-center">
          <div className="text-center">
            <Loader size="lg" className="mx-auto mb-4" />
            <p className="text-slate-600 dark:text-slate-400">
              Our AI is crafting the perfect prompt for you
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!result?.optimizedPrompt) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Optimized Result</CardTitle>
        </CardHeader>
        <CardContent className="h-[300px] flex items-center justify-center">
          <div className="text-center">
            <p className="text-slate-600 dark:text-slate-400">
              Enter your prompt and click "Optimize" to see the result
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle>Optimized Result</CardTitle>
        <Button
          size="sm"
          variant="outline"
          className="h-8 gap-1"
          onClick={copyToClipboard}
        >
          {copied ? <CheckIcon className="h-4 w-4" /> : <CopyIcon className="h-4 w-4" />}
          {copied ? "Copied" : "Copy"}
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="rounded-md bg-slate-50 dark:bg-slate-800 p-3 text-sm">
          {result.optimizedPrompt}
        </div>
        
        {result.reasoning && (
          <div>
            <h3 className="text-sm font-medium mb-2">Reasoning</h3>
            <p className="text-sm text-slate-600 dark:text-slate-400">{result.reasoning}</p>
          </div>
        )}
        
        {result.improvements && result.improvements.length > 0 && (
          <div>
            <h3 className="text-sm font-medium mb-2">Improvements</h3>
            <ul className="space-y-1">
              {result.improvements.map((improvement, index) => (
                <li key={index} className="text-sm text-slate-600 dark:text-slate-400 flex items-start">
                  <Badge variant="outline" className="mr-2 mt-0.5">
                    {index + 1}
                  </Badge>
                  {improvement}
                </li>
              ))}
            </ul>
          </div>
        )}
        
      </CardContent>
    </Card>
  );
}
