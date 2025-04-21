import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { audienceOptions } from "@/lib/utils";
import { Link } from "wouter";

export default function Hero() {
  return (
    <section className="bg-white dark:bg-slate-900 py-12 md:py-24">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-center justify-between">
          <div className="md:w-1/2 space-y-6 mb-10 md:mb-0">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-slate-900 dark:text-white">
              Optimize your AI prompts for better results
            </h1>
            <p className="text-lg md:text-xl text-slate-600 dark:text-slate-400 max-w-xl">
              PromptPal helps you refine your AI prompts for specificity, audience targeting, and effective calls to action using GPT-4.
            </p>
            <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4 pt-4">
              <Button asChild size="lg">
                <Link href="/signup">Get started for free</Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link href="/dashboard">See how it works</Link>
              </Button>
            </div>
          </div>
          <div className="md:w-1/2 flex justify-center">
            <div className="w-full max-w-md bg-slate-100 dark:bg-slate-800 rounded-lg shadow-lg overflow-hidden">
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium text-slate-900 dark:text-white">Try it now</h3>
                  <span className="text-xs px-2 py-1 bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200 rounded-full">Free Demo</span>
                </div>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="demo-prompt" className="mb-1">Your prompt</Label>
                    <Textarea 
                      id="demo-prompt" 
                      placeholder="Write a blog post about AI tools"
                      className="resize-none bg-white dark:bg-slate-950"
                    />
                  </div>
                  <div>
                    <Label htmlFor="demo-audience" className="mb-1">Target audience</Label>
                    <Select defaultValue="general">
                      <SelectTrigger id="demo-audience" className="w-full bg-white dark:bg-slate-950">
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
                  <div>
                    <Label className="mb-1">Optimization focus</Label>
                    <div className="flex flex-wrap gap-2">
                      <Label className="inline-flex items-center px-3 py-1.5 text-sm border border-slate-300 dark:border-slate-700 rounded-md cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800">
                        <Checkbox className="mr-2" defaultChecked />
                        Specificity
                      </Label>
                      <Label className="inline-flex items-center px-3 py-1.5 text-sm border border-slate-300 dark:border-slate-700 rounded-md cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800">
                        <Checkbox className="mr-2" defaultChecked />
                        Clarity
                      </Label>
                      <Label className="inline-flex items-center px-3 py-1.5 text-sm border border-slate-300 dark:border-slate-700 rounded-md cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800">
                        <Checkbox className="mr-2" />
                        CTAs
                      </Label>
                    </div>
                  </div>
                  <Button className="w-full">
                    Optimize Prompt
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
