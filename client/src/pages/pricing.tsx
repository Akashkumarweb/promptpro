import { useAuth } from "@/hooks/use-auth";
import Layout from "@/components/layout/Layout";
import SubscriptionForm from "@/components/subscription/SubscriptionForm";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Link } from "wouter";

export default function PricingPage() {
  const { user } = useAuth();
  const { toast } = useToast();

  return (
    <Layout>
      <div className="container mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-extrabold leading-tight tracking-tighter mb-4">
            Simple, Transparent Pricing
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Choose the plan that works best for you. Upgrade or downgrade at any time.
          </p>
        </div>

        {user ? (
          <SubscriptionForm />
        ) : (
          <div className="text-center mt-12">
            <p className="text-lg mb-4">
              Please log in to subscribe to a premium plan.
            </p>
            <div className="flex justify-center gap-4">
              <Button asChild>
                <Link href="/login">Log In</Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href="/signup">Sign Up</Link>
              </Button>
            </div>
          </div>
        )}

        <div className="mt-16 bg-muted/50 rounded-lg p-8">
          <h2 className="text-2xl font-bold mb-6">Frequently Asked Questions</h2>
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-lg font-medium mb-2">Can I cancel my subscription?</h3>
              <p className="text-muted-foreground">
                Yes, you can cancel your subscription at any time. Your premium features will remain active until the end of your current billing period.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-medium mb-2">How do promocodes work?</h3>
              <p className="text-muted-foreground">
                Promocodes provide a percentage discount on your subscription. Enter a valid promocode during checkout to receive your discount.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-medium mb-2">What happens if I exceed my free tier limit?</h3>
              <p className="text-muted-foreground">
                Free users are limited to 10 prompt optimizations per month. To continue using the service after reaching this limit, you'll need to upgrade to a premium plan.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-medium mb-2">Do you offer refunds?</h3>
              <p className="text-muted-foreground">
                If you're unsatisfied with our service, please contact our support team within 14 days of your purchase for a full refund.
              </p>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}