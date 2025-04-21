import { Button } from "@/components/ui/button";
import { Link } from "wouter";

export default function CTA() {
  return (
    <section className="py-12 md:py-24 bg-indigo-600">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Ready to optimize your AI prompts?
          </h2>
          <p className="mt-4 text-lg text-indigo-100">
            Start creating better AI content today with our powerful prompt optimization tools.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row justify-center gap-4">
            <Button asChild size="lg" variant="secondary">
              <Link href="/signup">Get started for free</Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="border-indigo-200 text-white hover:bg-indigo-700">
              <Link href="/dashboard">Watch demo</Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
