import { 
  FileTextIcon, 
  CirclePlusIcon, 
  ThumbsUpIcon, 
  ClockIcon, 
  UsersIcon, 
  PuzzleIcon 
} from "lucide-react";

interface FeatureProps {
  icon: React.ReactNode;
  title: string;
  description: string;
}

function Feature({ icon, title, description }: FeatureProps) {
  return (
    <div className="bg-white dark:bg-slate-900 p-6 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700">
      <div className="w-12 h-12 bg-indigo-100 dark:bg-indigo-900 rounded-full flex items-center justify-center mb-4">
        {icon}
      </div>
      <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">{title}</h3>
      <p className="text-slate-600 dark:text-slate-400">
        {description}
      </p>
    </div>
  );
}

export default function Features() {
  const features = [
    {
      icon: <FileTextIcon className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />,
      title: "Prompt Templates",
      description: "Start with industry-specific templates to save time and get better results from the beginning."
    },
    {
      icon: <CirclePlusIcon className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />,
      title: "Audience Targeting",
      description: "Customize prompts for specific audiences to get content that resonates with your target users."
    },
    {
      icon: <ThumbsUpIcon className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />,
      title: "AI-Powered Improvements",
      description: "Leverage GPT-4 to analyze and enhance your prompts for clarity, specificity, and effectiveness."
    },
    {
      icon: <ClockIcon className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />,
      title: "Prompt History",
      description: "Save and organize your prompts for easy access and reuse in future projects."
    },
    {
      icon: <UsersIcon className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />,
      title: "Team Collaboration",
      description: "Share and collaborate on prompts with team members to maintain consistency across your organization."
    },
    {
      icon: <PuzzleIcon className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />,
      title: "API Integration",
      description: "Connect directly to your applications with our robust API for seamless prompt optimization."
    }
  ];

  return (
    <section className="py-12 md:py-24 bg-slate-50 dark:bg-slate-800">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-4xl">
            Powerful features for perfect prompts
          </h2>
          <p className="mt-4 text-lg text-slate-600 dark:text-slate-400">
            Our intelligent system helps you craft the perfect prompts to get exactly what you need from AI tools.
          </p>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <Feature 
              key={index}
              icon={feature.icon}
              title={feature.title}
              description={feature.description}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
