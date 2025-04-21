import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Check, Loader2 } from "lucide-react";

export default function SubscriptionForm() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [activePlan, setActivePlan] = useState<"monthly" | "yearly">("monthly");
  const [promocode, setPromocode] = useState("");
  const [discount, setDiscount] = useState(0);
  const [validPromocode, setValidPromocode] = useState(false);
  const [isCheckingPromocode, setIsCheckingPromocode] = useState(false);

  const planPrices = {
    monthly: {
      original: 14.99,
      discounted: 14.99 * (1 - discount / 100)
    },
    yearly: {
      original: 149.90,
      discounted: 149.90 * (1 - discount / 100)
    }
  };

  // Handle promocode validation
  const validatePromocode = async () => {
    if (!promocode.trim()) {
      toast({
        title: "Please enter a valid promocode",
        variant: "destructive",
      });
      return;
    }

    setIsCheckingPromocode(true);
    try {
      const response = await apiRequest("POST", "/api/promocodes/validate", { code: promocode });
      const data = await response.json();
      
      if (response.ok) {
        setDiscount(data.discountPercent);
        setValidPromocode(true);
        toast({
          title: "Promocode applied!",
          description: `You got a ${data.discountPercent}% discount on your subscription.`,
        });
      } else {
        setValidPromocode(false);
        toast({
          title: "Invalid promocode",
          description: data.message || "This promocode is invalid or has expired.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error validating promocode",
        description: "Please try again later.",
        variant: "destructive",
      });
    } finally {
      setIsCheckingPromocode(false);
    }
  };

  // Handle subscription creation
  const handleSubscribe = async () => {
    setIsLoading(true);
    try {
      // Create subscription with the selected plan and promocode
      const response = await apiRequest("POST", "/api/subscriptions", {
        plan: activePlan,
        promocode: validPromocode ? promocode : undefined
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || "Failed to create subscription");
      }
      
      // Set up card payment with Stripe
      // For this example, we'll just show a success message
      toast({
        title: "Subscription initiated",
        description: "Your subscription has been initiated successfully!",
      });
      
      // In a real implementation, we would use Stripe Elements here
      // to collect payment details and confirm the payment
      
    } catch (error: any) {
      toast({
        title: "Subscription failed",
        description: error.message || "An error occurred while processing your subscription.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-3xl mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl">
          {user?.isPremium 
            ? "Manage Your Subscription" 
            : "Upgrade to PromptPal Pro"}
        </CardTitle>
        <CardDescription>
          {user?.isPremium 
            ? "Your current subscription status and options" 
            : "Unlock unlimited prompt optimizations and premium features"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="monthly" className="w-full" onValueChange={(val) => setActivePlan(val as "monthly" | "yearly")}>
          <TabsList className="grid w-full grid-cols-2 mb-8">
            <TabsTrigger value="monthly">Monthly</TabsTrigger>
            <TabsTrigger value="yearly">Yearly (Save 16%)</TabsTrigger>
          </TabsList>
          
          <TabsContent value="monthly" className="space-y-4">
            <div className="p-6 border rounded-lg bg-card">
              <h3 className="text-xl font-bold">Pro Monthly</h3>
              <div className="flex items-baseline mt-2">
                {discount > 0 && (
                  <span className="text-xl line-through text-muted-foreground mr-2">
                    ${planPrices.monthly.original}
                  </span>
                )}
                <span className="text-3xl font-bold">
                  ${planPrices.monthly.discounted.toFixed(2)}
                </span>
                <span className="text-muted-foreground ml-1">/month</span>
              </div>
              <ul className="mt-4 space-y-2">
                <li className="flex items-center">
                  <Check className="h-5 w-5 text-green-500 mr-2" />
                  <span>Unlimited prompt optimizations</span>
                </li>
                <li className="flex items-center">
                  <Check className="h-5 w-5 text-green-500 mr-2" />
                  <span>Advanced customization options</span>
                </li>
                <li className="flex items-center">
                  <Check className="h-5 w-5 text-green-500 mr-2" />
                  <span>Priority support</span>
                </li>
              </ul>
            </div>
          </TabsContent>
          
          <TabsContent value="yearly" className="space-y-4">
            <div className="p-6 border rounded-lg bg-card">
              <h3 className="text-xl font-bold">Pro Yearly</h3>
              <div className="flex items-baseline mt-2">
                {discount > 0 && (
                  <span className="text-xl line-through text-muted-foreground mr-2">
                    ${planPrices.yearly.original}
                  </span>
                )}
                <span className="text-3xl font-bold">
                  ${planPrices.yearly.discounted.toFixed(2)}
                </span>
                <span className="text-muted-foreground ml-1">/year</span>
              </div>
              <ul className="mt-4 space-y-2">
                <li className="flex items-center">
                  <Check className="h-5 w-5 text-green-500 mr-2" />
                  <span>Unlimited prompt optimizations</span>
                </li>
                <li className="flex items-center">
                  <Check className="h-5 w-5 text-green-500 mr-2" />
                  <span>Advanced customization options</span>
                </li>
                <li className="flex items-center">
                  <Check className="h-5 w-5 text-green-500 mr-2" />
                  <span>Priority support</span>
                </li>
                <li className="flex items-center">
                  <Check className="h-5 w-5 text-green-500 mr-2" />
                  <span>Save 16% compared to monthly</span>
                </li>
              </ul>
            </div>
          </TabsContent>
        </Tabs>
        
        {/* Promocode section */}
        <div className="mt-8">
          <h3 className="text-lg font-medium mb-2">Have a promocode?</h3>
          <div className="flex space-x-2">
            <div className="flex-1">
              <Input 
                placeholder="Enter your promocode" 
                value={promocode}
                onChange={(e) => setPromocode(e.target.value)}
                disabled={isCheckingPromocode || validPromocode}
                className={validPromocode ? "border-green-500" : ""}
              />
            </div>
            <Button 
              onClick={validatePromocode} 
              variant={validPromocode ? "outline" : "default"}
              disabled={isCheckingPromocode || validPromocode}
            >
              {isCheckingPromocode ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : validPromocode ? (
                <Check className="h-4 w-4 mr-2" />
              ) : null}
              {validPromocode ? "Applied" : "Apply"}
            </Button>
          </div>
          {validPromocode && (
            <p className="text-sm text-green-600 mt-1">
              {`${discount}% discount applied!`}
            </p>
          )}
        </div>
      </CardContent>
      <CardFooter>
        <Button 
          onClick={handleSubscribe} 
          className="w-full"
          disabled={isLoading}
        >
          {isLoading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
          {user?.isPremium ? "Update Subscription" : "Subscribe Now"}
        </Button>
      </CardFooter>
    </Card>
  );
}