import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Prompt } from "@shared/schema";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { truncateText, formatDate } from "@/lib/utils";
import { Eye, Trash2 } from "lucide-react";
import { Loader } from "@/components/ui/loader";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogTrigger,
  DialogClose
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useDeletePrompt } from "@/hooks/use-prompt";

interface PromptHistoryProps {
  prompts: Prompt[];
  isLoading: boolean;
}

export default function PromptHistory({ prompts, isLoading }: PromptHistoryProps) {
  const [selectedPrompt, setSelectedPrompt] = useState<Prompt | null>(null);
  const [promptToDelete, setPromptToDelete] = useState<number | null>(null);
  
  const deleteMutation = useDeletePrompt();

  const handleDelete = (id: number) => {
    deleteMutation.mutate(id);
    setPromptToDelete(null);
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Your Prompt History</CardTitle>
        </CardHeader>
        <CardContent className="flex justify-center py-8">
          <Loader />
        </CardContent>
      </Card>
    );
  }

  if (prompts.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Your Prompt History</CardTitle>
        </CardHeader>
        <CardContent className="text-center py-8">
          <p className="text-slate-600 dark:text-slate-400">
            You haven't optimized any prompts yet. Try optimizing a prompt to see it here.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Your Prompt History</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Original Prompt</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Audience</TableHead>
              <TableHead className="w-[100px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {prompts.map((prompt) => (
              <TableRow key={prompt.id}>
                <TableCell className="font-medium">
                  {truncateText(prompt.originalPrompt, 50)}
                </TableCell>
                <TableCell>{formatDate(prompt.createdAt)}</TableCell>
                <TableCell>{prompt.audience}</TableCell>
                <TableCell>
                  <div className="flex space-x-1">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setSelectedPrompt(prompt)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Prompt Details</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4 mt-4">
                          <div>
                            <h3 className="text-sm font-medium mb-1">Original Prompt</h3>
                            <p className="text-sm p-3 bg-slate-50 dark:bg-slate-800 rounded-md">
                              {selectedPrompt?.originalPrompt}
                            </p>
                          </div>
                          <div>
                            <h3 className="text-sm font-medium mb-1">Optimized Prompt</h3>
                            <p className="text-sm p-3 bg-slate-50 dark:bg-slate-800 rounded-md">
                              {selectedPrompt?.optimizedPrompt}
                            </p>
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <h3 className="text-sm font-medium mb-1">Audience</h3>
                              <p className="text-sm">{selectedPrompt?.audience}</p>
                            </div>
                            <div>
                              <h3 className="text-sm font-medium mb-1">Focus Areas</h3>
                              <p className="text-sm">{selectedPrompt?.focusAreas}</p>
                            </div>
                          </div>
                          <div>
                            <h3 className="text-sm font-medium mb-1">Created</h3>
                            <p className="text-sm">
                              {selectedPrompt && formatDate(selectedPrompt.createdAt)}
                            </p>
                          </div>
                        </div>
                        <DialogClose asChild>
                          <Button className="mt-4 w-full">Close</Button>
                        </DialogClose>
                      </DialogContent>
                    </Dialog>

                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setPromptToDelete(prompt.id)}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                          <AlertDialogDescription>
                            This will permanently delete this prompt from your history.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction 
                            onClick={() => handleDelete(prompt.id)}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                          >
                            {deleteMutation.isPending ? (
                              <>
                                <Loader size="sm" className="mr-2" />
                                Deleting...
                              </>
                            ) : "Delete"}
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
