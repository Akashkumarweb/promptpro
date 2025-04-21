import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Prompt, OptimizePromptData } from "@shared/schema";
import { useToast } from "@/hooks/use-toast.tsx";

// Fetch user's prompt history
export function usePromptHistory() {
  return useQuery({
    queryKey: ["/api/prompts"],
    retry: 1,
  });
}

// Optimize a prompt
export function useOptimizePrompt() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (data: OptimizePromptData) => {
      try {
        const res = await apiRequest("POST", "/api/optimize", data);
        return await res.json();
      } catch (error) {
        let errorMessage = "Failed to optimize prompt";
        
        if (error instanceof Error) {
          // Check if it's a rate limit error
          if (error.message.includes("429")) {
            errorMessage = "Free tier limit reached (10 optimizations/month). Please upgrade to Premium.";
          } else {
            errorMessage = error.message;
          }
        }
        
        throw new Error(errorMessage);
      }
    },
    onSuccess: () => {
      // Invalidate prompt history query to refetch the updated list
      queryClient.invalidateQueries({ queryKey: ["/api/prompts"] });
      
      toast({
        title: "Success!",
        description: "Your prompt has been optimized.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}

// Delete a prompt
export function useDeletePrompt() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (promptId: number) => {
      const res = await apiRequest("DELETE", `/api/prompts/${promptId}`, undefined);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/prompts"] });
      
      toast({
        title: "Deleted",
        description: "Prompt has been deleted from your history.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to delete prompt",
        variant: "destructive",
      });
    },
  });
}
