import { Star } from "lucide-react";

interface TestimonialProps {
  quote: string;
  author: string;
  role: string;
  initials: string;
}

function Testimonial({ quote, author, role, initials }: TestimonialProps) {
  return (
    <div className="bg-white dark:bg-slate-900 p-6 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700">
      <div className="flex items-center mb-4">
        <div className="flex text-yellow-400">
          {[...Array(5)].map((_, i) => (
            <Star key={i} className="w-5 h-5 fill-current" />
          ))}
        </div>
      </div>
      <blockquote className="text-slate-600 dark:text-slate-400 mb-4">
        "{quote}"
      </blockquote>
      <div className="flex items-center">
        <div className="h-10 w-10 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-slate-500 dark:text-slate-300 font-medium">
          {initials}
        </div>
        <div className="ml-3">
          <p className="text-sm font-medium text-slate-900 dark:text-white">{author}</p>
          <p className="text-sm text-slate-500 dark:text-slate-400">{role}</p>
        </div>
      </div>
    </div>
  );
}

export default function Testimonials() {
  const testimonials = [
    {
      quote: "PromptPal has revolutionized my content writing process. My AI outputs are 10x better now that I've learned how to create more specific prompts. Worth every penny!",
      author: "Sarah Miller",
      role: "Content Creator",
      initials: "SM"
    },
    {
      quote: "Our marketing team relies on PromptPal daily. The audience-specific templates save us hours and the results are consistently high quality. The collaboration features make it easy to share our best prompts.",
      author: "James Thompson",
      role: "Marketing Director",
      initials: "JT"
    },
    {
      quote: "As a developer, I integrated PromptPal's API into our application and it's been a game-changer. Our users can now generate much more relevant content with AI, and the rate limiting keeps our costs predictable.",
      author: "Alex Kumar",
      role: "Software Engineer",
      initials: "AK"
    }
  ];

  return (
    <section className="py-12 md:py-24 bg-slate-50 dark:bg-slate-800">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-4xl">
            Trusted by content creators and AI enthusiasts
          </h2>
          <p className="mt-4 text-lg text-slate-600 dark:text-slate-400">
            See what our customers are saying about how PromptPal has improved their AI workflow.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <Testimonial 
              key={index}
              quote={testimonial.quote}
              author={testimonial.author}
              role={testimonial.role}
              initials={testimonial.initials}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
