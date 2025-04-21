import { useStripe, Elements, PaymentElement, useElements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { useEffect, useState } from 'react';
import { useLocation } from 'wouter';
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { LoaderCircle, CheckCircle, AlertCircle } from "lucide-react";
import Layout from "@/components/layout/Layout";

// Make sure to call `loadStripe` outside of a component's render to avoid
// recreating the `Stripe` object on every render.
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY);

const CheckoutForm = () => {
  const stripe = useStripe();
  const elements = useElements();
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [paymentError, setPaymentError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!stripe || !elements) {
      return;
    }
    
    setIsSubmitting(true);
    setPaymentError(null);

    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: window.location.origin + "/payment-success",
      },
      redirect: "if_required"
    });

    if (error) {
      setPaymentError(error.message || "An unexpected error occurred");
      toast({
        title: "Payment failed",
        description: error.message || "Your payment could not be processed. Please try again.",
        variant: "destructive",
      });
      setIsSubmitting(false);
    } else {
      // If no immediate error, the payment may have succeeded or requires additional authentication
      toast({
        title: "Payment successful",
        description: "Thank you for your subscription! You now have access to premium features.",
      });
      navigate("/dashboard");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <PaymentElement />
      
      {paymentError && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md flex items-start">
          <AlertCircle className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" />
          <p>{paymentError}</p>
        </div>
      )}
      
      <Button 
        type="submit" 
        className="w-full" 
        size="lg"
        disabled={!stripe || !elements || isSubmitting}
      >
        {isSubmitting ? (
          <>
            <LoaderCircle className="h-4 w-4 mr-2 animate-spin" />
            Processing...
          </>
        ) : (
          "Complete Payment"
        )}
      </Button>
    </form>
  );
};

export default function Checkout() {
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const [location] = useLocation();
  const [, params] = location.split('?')[1]?.match(/client_secret=([^&]*)/) || [];
  const [, plan] = location.split('?')[1]?.match(/plan=([^&]*)/) || [];

  useEffect(() => {
    if (!params) {
      setError("Missing payment information. Please return to the pricing page.");
      setIsLoading(false);
      return;
    }
    
    setClientSecret(params);
    setIsLoading(false);
  }, [params]);

  if (isLoading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-16 flex items-center justify-center min-h-[60vh]">
          <div className="flex flex-col items-center">
            <LoaderCircle className="h-8 w-8 animate-spin text-primary mb-4" />
            <p className="text-lg">Preparing checkout...</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (error || !clientSecret) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-16">
          <Card className="max-w-md mx-auto">
            <CardHeader>
              <CardTitle className="text-center text-red-600">
                <AlertCircle className="h-8 w-8 mx-auto mb-2" />
                Checkout Error
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-center mb-4">{error || "Unable to load checkout. Please try again."}</p>
              <Button 
                onClick={() => window.location.href = "/pricing"} 
                className="w-full"
              >
                Return to Pricing
              </Button>
            </CardContent>
          </Card>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-md mx-auto">
          <Card>
            <CardHeader>
              <CardTitle>Complete your {plan === "annual" ? "Annual" : "Monthly"} Subscription</CardTitle>
              <CardDescription>Please enter your payment details to continue</CardDescription>
            </CardHeader>
            <CardContent>
              <Elements stripe={stripePromise} options={{ clientSecret }}>
                <CheckoutForm />
              </Elements>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
}