import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { audienceOptions, focusAreaOptions } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { Loader } from "@/components/ui/loader";
import { useOptimizePrompt } from "@/hooks/use-prompt";
import OptimizedPrompt from "./OptimizedPrompt";
import { OptimizePromptData } from "@shared/schema";
import { Badge } from "@/components/ui/badge";
import { 
  CircleUser, Wand2, Sparkles, RefreshCcw, RotateCcw, 
  Lightbulb, Copy, Check, Clock3 
} from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

export default function PromptForm() {
  const { toast } = useToast();
  const [formData, setFormData] = useState<OptimizePromptData>({
    originalPrompt: "",
    audience: "general",
    focusAreas: ["specificity", "clarity"],
  });
  
  const optimizationMutation = useOptimizePrompt();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.originalPrompt.trim()) {
      toast({
        title: "Error",
        description: "Please enter a prompt to optimize",
        variant: "destructive",
      });
      return;
    }
    
    optimizationMutation.mutate(formData);
  };

  const handleFocusAreaChange = (value: string, checked: boolean) => {
    setFormData(prev => {
      const currentAreas = prev.focusAreas || [];
      
      if (checked) {
        return { ...prev, focusAreas: [...currentAreas, value] };
      } else {
        return { ...prev, focusAreas: currentAreas.filter(area => area !== value) };
      }
    });
  };

  const [presetPrompts, setPresetPrompts] = useState([
    { name: "Blog intro", text: "Write an engaging introduction for a blog post about sustainable living" },
    { name: "Product description", text: "Create a compelling product description for an eco-friendly water bottle" },
    { name: "Email template", text: "Write a professional email to request a meeting with a potential client" },
    { name: "Creative story", text: "Write a short story about a character who discovers a hidden talent" }
  ]);
  
  const [charCount, setCharCount] = useState(0);
  const [copyStatus, setCopyStatus] = useState<Record<string, boolean>>({});
  
  useEffect(() => {
    setCharCount(formData.originalPrompt.length);
  }, [formData.originalPrompt]);
  
  useEffect(() => {
    // Reset copy status after 2 seconds
    const timeout = setTimeout(() => {
      if (Object.values(copyStatus).some(status => status)) {
        setCopyStatus({});
      }
    }, 2000);
    
    return () => clearTimeout(timeout);
  }, [copyStatus]);
  
  const handlePresetPrompt = (promptText: string) => {
    setFormData(prev => ({
      ...prev,
      originalPrompt: promptText
    }));
  };
  
  const handleClearPrompt = () => {
    setFormData(prev => ({
      ...prev,
      originalPrompt: ""
    }));
  };
  
  const handleCopyText = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopyStatus(prev => ({ ...prev, [key]: true }));
    
    toast({
      title: "Copied!",
      description: "Text copied to clipboard",
    });
  };

  return (
    <div className="grid gap-8 lg:grid-cols-2">
      <div className="space-y-6">
        <Card className="overflow-hidden border-slate-200 dark:border-slate-800">
          <CardHeader className="space-y-1 bg-slate-50 dark:bg-slate-900/40">
            <div className="flex items-center justify-between">
              <CardTitle className="text-xl flex items-center gap-2">
                <Wand2 className="h-5 w-5 text-indigo-500" />
                Prompt Optimization
              </CardTitle>
              <Badge variant="outline" className="bg-slate-100 dark:bg-slate-800 font-normal">
                <Clock3 className="h-3 w-3 mr-1" /> ~3 sec
              </Badge>
            </div>
            <CardDescription>
              Enter your prompt below and we'll optimize it for better results
            </CardDescription>
          </CardHeader>
          
          <CardContent className="p-0">
            <div className="p-6 space-y-6">
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="prompt" className="text-base font-medium flex items-center">
                      Your prompt
                    </Label>
                    <div className="flex items-center space-x-2 text-sm text-slate-500">
                      <span>{charCount} characters</span>
                      
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="h-7 w-7 p-0" 
                            onClick={handleClearPrompt}
                            disabled={!formData.originalPrompt}
                          >
                            <RotateCcw className="h-3.5 w-3.5" />
                            <span className="sr-only">Clear</span>
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p className="text-xs">Clear prompt</p>
                        </TooltipContent>
                      </Tooltip>
                    </div>
                  </div>
                  
                  <Textarea
                    id="prompt"
                    placeholder="Enter your prompt here or select from the examples below..."
                    className="min-h-[180px] resize-y text-base"
                    value={formData.originalPrompt}
                    onChange={(e) => setFormData({ ...formData, originalPrompt: e.target.value })}
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="audience" className="font-medium flex items-center gap-2">
                      <CircleUser className="h-4 w-4 text-indigo-500" /> 
                      Target audience
                    </Label>
                    <Select 
                      value={formData.audience} 
                      onValueChange={(value) => setFormData({ ...formData, audience: value })}
                    >
                      <SelectTrigger id="audience">
                        <SelectValue placeholder="Select audience" />
                      </SelectTrigger>
                      <SelectContent>
                        {audienceOptions.map(option => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label className="font-medium flex items-center gap-2">
                      <Sparkles className="h-4 w-4 text-indigo-500" /> 
                      Optimization focus
                    </Label>
                    <div className="flex flex-wrap gap-2">
                      {focusAreaOptions.map(option => (
                        <Badge 
                          key={option.value}
                          variant={formData.focusAreas?.includes(option.value) ? "default" : "outline"}
                          className={formData.focusAreas?.includes(option.value) 
                            ? "bg-indigo-100 hover:bg-indigo-200 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300 cursor-pointer" 
                            : "cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800"}
                          onClick={() => 
                            handleFocusAreaChange(
                              option.value, 
                              !formData.focusAreas?.includes(option.value)
                            )
                          }
                        >
                          {option.label}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
                
                <Button 
                  type="submit" 
                  className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
                  size="lg"
                  disabled={!formData.originalPrompt.trim() || optimizationMutation.isPending}
                >
                  {optimizationMutation.isPending ? (
                    <>
                      <RefreshCcw className="h-4 w-4 mr-2 animate-spin" />
                      Optimizing...
                    </>
                  ) : (
                    <>
                      <Wand2 className="h-4 w-4 mr-2" />
                      Optimize Prompt
                    </>
                  )}
                </Button>
              </form>
              
              <div className="space-y-3">
                <Label className="flex items-center gap-2 text-sm font-medium">
                  <Lightbulb className="h-4 w-4 text-amber-500" />
                  Example prompts
                </Label>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {presetPrompts.map((preset, index) => (
                    <Button
                      key={index}
                      variant="outline"
                      className="h-auto py-2 px-3 justify-start font-normal text-left"
                      onClick={() => handlePresetPrompt(preset.text)}
                    >
                      <div>
                        <div className="font-medium">{preset.name}</div>
                        <div className="text-xs text-slate-500 truncate max-w-[200px]">
                          {preset.text}
                        </div>
                      </div>
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <OptimizedPrompt 
        result={optimizationMutation.data} 
        isLoading={optimizationMutation.isPending} 
        onCopy={(text, key) => handleCopyText(text, key)}
        copyStatus={copyStatus}
      />
    </div>
  );
}
