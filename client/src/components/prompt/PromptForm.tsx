import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { audienceOptions, focusAreaOptions } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { Loader } from "@/components/ui/loader";
import { useOptimizePrompt } from "@/hooks/use-prompt";
import OptimizedPrompt from "./OptimizedPrompt";
import { OptimizePromptData } from "@shared/schema";

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

  return (
    <div className="grid gap-8 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Optimize Your Prompt</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="prompt">Your prompt</Label>
              <Textarea
                id="prompt"
                placeholder="Enter your prompt here..."
                className="min-h-[120px] resize-y"
                value={formData.originalPrompt}
                onChange={(e) => setFormData({ ...formData, originalPrompt: e.target.value })}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="audience">Target audience</Label>
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
              <Label>Optimization focus</Label>
              <div className="flex flex-wrap gap-2">
                {focusAreaOptions.map(option => (
                  <div key={option.value} className="flex items-center space-x-2">
                    <Checkbox 
                      id={`focus-${option.value}`}
                      checked={formData.focusAreas?.includes(option.value)}
                      onCheckedChange={(checked) => 
                        handleFocusAreaChange(option.value, checked as boolean)
                      }
                    />
                    <Label 
                      htmlFor={`focus-${option.value}`}
                      className="text-sm font-normal cursor-pointer"
                    >
                      {option.label}
                    </Label>
                  </div>
                ))}
              </div>
            </div>
            
            <Button 
              type="submit" 
              className="w-full"
              disabled={optimizationMutation.isPending}
            >
              {optimizationMutation.isPending ? (
                <>
                  <Loader size="sm" className="mr-2" />
                  Optimizing...
                </>
              ) : "Optimize Prompt"}
            </Button>
          </form>
        </CardContent>
      </Card>
      
      <OptimizedPrompt result={optimizationMutation.data} isLoading={optimizationMutation.isPending} />
    </div>
  );
}
