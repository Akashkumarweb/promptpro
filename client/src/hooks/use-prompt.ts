import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Prompt, OptimizePromptData } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";

// --- Fetch user's prompt history
export function usePromptHistory() {
  return useQuery<Prompt[]>({
    queryKey: ["/api/prompts"],
    queryFn: async () => {
      const res = await apiRequest("GET", "/api/prompts");
      return await res.json();
    },
    retry: 1,
  });
}

// --- Optimize a prompt
export function useOptimizePrompt() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (data: OptimizePromptData) => {
      const res = await apiRequest("POST", "/api/optimize", data);
      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(errorText || "Failed to optimize prompt");
      }
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/prompts"] });
      toast({
        title: "Success!",
        description: "Your prompt has been optimized.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Something went wrong while optimizing prompt.",
        variant: "destructive",
      });
    },
  });
}

// --- Delete a prompt
export function useDeletePrompt() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (promptId: number) => {
      const res = await apiRequest("DELETE", `/api/prompts/${promptId}`);
      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(errorText || "Failed to delete prompt");
      }
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/prompts"] });
      toast({
        title: "Deleted",
        description: "Prompt deleted successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Something went wrong while deleting prompt.",
        variant: "destructive",
      });
    },
  });
}
