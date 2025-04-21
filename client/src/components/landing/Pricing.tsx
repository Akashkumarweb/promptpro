import { Button } from "@/components/ui/button";
import { CheckIcon, XIcon } from "lucide-react";
import { Link } from "wouter";

interface PlanFeature {
  name: string;
  included: boolean;
}

interface PricingPlanProps {
  name: string;
  price: string;
  description: string;
  features: PlanFeature[];
  popular?: boolean;
  buttonText: string;
  buttonLink: string;
  buttonVariant?: "default" | "outline";
}

function PricingPlan({
  name,
  price,
  description,
  features,
  popular = false,
  buttonText,
  buttonLink,
  buttonVariant = "default"
}: PricingPlanProps) {
  return (
    <div className={`bg-white dark:bg-slate-800 ${popular ? 'border-2 border-indigo-600 dark:border-indigo-500' : 'border border-slate-200 dark:border-slate-700'} rounded-lg shadow-sm overflow-hidden relative`}>
      {popular && (
        <div className="absolute top-0 w-full bg-indigo-600 text-white text-center py-1 text-xs font-bold">
          MOST POPULAR
        </div>
      )}
      <div className={`p-6 ${popular ? 'pt-9' : ''}`}>
        <h3 className="text-xl font-bold text-slate-900 dark:text-white">{name}</h3>
        <div className="mt-4 flex items-baseline">
          <span className="text-4xl font-extrabold text-slate-900 dark:text-white">{price}</span>
          <span className="ml-1 text-xl font-semibold text-slate-600 dark:text-slate-400">/month</span>
        </div>
        <p className="mt-4 text-sm text-slate-600 dark:text-slate-400">
          {description}
        </p>
        <ul className="mt-6 space-y-3">
          {features.map((feature, index) => (
            <li key={index} className="flex items-start">
              {feature.included ? (
                <CheckIcon className="h-5 w-5 text-green-500 mt-0.5" />
              ) : (
                <XIcon className="h-5 w-5 text-slate-400 mt-0.5" />
              )}
              <span className={`ml-2 text-sm ${feature.included ? 'text-slate-700 dark:text-slate-300' : 'text-slate-500 dark:text-slate-400 line-through'}`}>
                {feature.name}
              </span>
            </li>
          ))}
        </ul>
        <div className="mt-8">
          <Button asChild className="w-full" variant={buttonVariant}>
            <Link href={buttonLink}>{buttonText}</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}

export default function Pricing() {
  const plans = [
    {
      name: "Free",
      price: "$0",
      description: "Perfect for trying out PromptPal or occasional users.",
      features: [
        { name: "10 prompt optimizations per month", included: true },
        { name: "Basic prompt templates", included: true },
        { name: "Prompt history (7 days)", included: true },
        { name: "Team collaboration", included: false },
        { name: "API access", included: false },
      ],
      buttonText: "Get started",
      buttonLink: "/signup",
    },
    {
      name: "Pro",
      price: "$29",
      description: "For professionals who need premium prompt optimization tools.",
      features: [
        { name: "200 prompt optimizations per month", included: true },
        { name: "Advanced prompt templates", included: true },
        { name: "Unlimited prompt history", included: true },
        { name: "Team collaboration (up to 5 users)", included: true },
        { name: "API access", included: false },
      ],
      buttonText: "Subscribe now",
      buttonLink: "/signup?plan=pro",
      popular: true,
    },
    {
      name: "Enterprise",
      price: "$99",
      description: "For organizations that need advanced features and support.",
      features: [
        { name: "Unlimited prompt optimizations", included: true },
        { name: "Custom prompt templates", included: true },
        { name: "Unlimited prompt history & analytics", included: true },
        { name: "Unlimited team members", included: true },
        { name: "Full API access with dedicated support", included: true },
      ],
      buttonText: "Contact sales",
      buttonLink: "/contact-sales",
      buttonVariant: "outline",
    },
  ];

  return (
    <section className="py-12 md:py-24 bg-white dark:bg-slate-900">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-4xl">
            Simple, transparent pricing
          </h2>
          <p className="mt-4 text-lg text-slate-600 dark:text-slate-400">
            Choose the plan that's right for you, whether you're just starting out or scaling up.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {plans.map((plan, index) => (
            <PricingPlan 
              key={index}
              name={plan.name}
              price={plan.price}
              description={plan.description}
              features={plan.features}
              popular={plan.popular}
              buttonText={plan.buttonText}
              buttonLink={plan.buttonLink}
              buttonVariant={plan.buttonVariant}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
