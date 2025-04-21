import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { apiRequest } from "@/lib/queryClient";
import { LoaderCircle, Check, X } from "lucide-react";
import type { ApplyPromocodeData } from "@shared/schema";

export default function SubscriptionForm() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [selectedPlan, setSelectedPlan] = useState<"monthly" | "annual">("monthly");
  const [promocode, setPromocode] = useState("");
  const [discount, setDiscount] = useState<number | null>(null);
  const [isApplyingCode, setIsApplyingCode] = useState(false);
  const [isSubscribing, setIsSubscribing] = useState(false);

  const plans = {
    monthly: {
      name: "Monthly",
      price: 9.99,
      discountedPrice: discount ? 9.99 * (1 - discount / 100) : null,
      features: [
        "Unlimited prompt optimizations",
        "Priority support",
        "Advanced optimization features",
        "API access"
      ]
    },
    annual: {
      name: "Annual",
      price: 99.99,
      discountedPrice: discount ? 99.99 * (1 - discount / 100) : null,
      features: [
        "All monthly features",
        "Save 17% compared to monthly",
        "Early access to new features",
        "Downloadable prompt history"
      ]
    }
  };

  const handleApplyPromocode = async () => {
    if (!promocode.trim()) {
      toast({
        title: "Promocode required",
        description: "Please enter a promocode to apply a discount.",
        variant: "destructive"
      });
      return;
    }

    setIsApplyingCode(true);
    
    try {
      const data: ApplyPromocodeData = { code: promocode };
      const response = await apiRequest("POST", "/api/promocodes/apply", data);
      const result = await response.json();
      
      if (response.ok) {
        setDiscount(result.discountPercentage);
        toast({
          title: "Promocode applied!",
          description: `You've received a ${result.discountPercentage}% discount.`,
        });
      } else {
        toast({
          title: "Invalid promocode",
          description: result.message || "The promocode you entered is invalid or expired.",
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to apply promocode. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsApplyingCode(false);
    }
  };

  const handleSubscribe = async () => {
    setIsSubscribing(true);
    
    try {
      const plan = selectedPlan === "monthly" ? "monthly" : "annual";
      const response = await apiRequest("POST", "/api/create-payment-intent", {
        plan,
        amount: discount 
          ? plans[selectedPlan].price * (1 - discount / 100) 
          : plans[selectedPlan].price,
        promocode: discount ? promocode : undefined
      });
      
      const result = await response.json();
      
      if (response.ok && result.clientSecret) {
        // Redirect to checkout page with the client secret
        window.location.href = `/checkout?client_secret=${result.clientSecret}&plan=${plan}`;
      } else {
        toast({
          title: "Subscription error",
          description: result.message || "Failed to create subscription. Please try again.",
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again later.",
        variant: "destructive"
      });
    } finally {
      setIsSubscribing(false);
    }
  };

  if (user?.isPremium) {
    return (
      <div className="max-w-md mx-auto text-center p-6">
        <div className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-green-100 mb-4">
          <Check className="h-6 w-6 text-green-600" />
        </div>
        <h3 className="text-2xl font-bold mb-2">You're a Premium Member!</h3>
        <p className="text-muted-foreground mb-6">
          You already have access to all premium features. Enjoy unlimited prompt optimizations and all our premium features.
        </p>
        <Button asChild>
          <a href="/dashboard">Go to Dashboard</a>
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto">
      <Tabs defaultValue="monthly" className="w-full" onValueChange={(value) => setSelectedPlan(value as "monthly" | "annual")}>
        <TabsList className="grid w-full grid-cols-2 mb-8">
          <TabsTrigger value="monthly">Monthly</TabsTrigger>
          <TabsTrigger value="annual">Annual (Save 17%)</TabsTrigger>
        </TabsList>
        
        <TabsContent value="monthly" className="space-y-4">
          <SubscriptionCard 
            plan={plans.monthly}
            discount={discount}
            promocode={promocode}
            setPromocode={setPromocode}
            isApplyingCode={isApplyingCode}
            handleApplyPromocode={handleApplyPromocode}
            isSubscribing={isSubscribing}
            handleSubscribe={handleSubscribe}
          />
        </TabsContent>
        
        <TabsContent value="annual" className="space-y-4">
          <SubscriptionCard 
            plan={plans.annual}
            discount={discount}
            promocode={promocode}
            setPromocode={setPromocode}
            isApplyingCode={isApplyingCode}
            handleApplyPromocode={handleApplyPromocode}
            isSubscribing={isSubscribing}
            handleSubscribe={handleSubscribe}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}

interface PlanType {
  name: string;
  price: number;
  discountedPrice: number | null;
  features: string[];
}

interface SubscriptionCardProps {
  plan: PlanType;
  discount: number | null;
  promocode: string;
  setPromocode: (code: string) => void;
  isApplyingCode: boolean;
  handleApplyPromocode: () => void;
  isSubscribing: boolean;
  handleSubscribe: () => void;
}

function SubscriptionCard({
  plan,
  discount,
  promocode,
  setPromocode,
  isApplyingCode,
  handleApplyPromocode,
  isSubscribing,
  handleSubscribe
}: SubscriptionCardProps) {
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>{plan.name} Premium Plan</CardTitle>
        <CardDescription>
          Get unlimited access to PromptPal's premium features
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <div className="flex items-baseline">
            {discount ? (
              <>
                <span className="text-3xl font-bold">${plan.discountedPrice?.toFixed(2)}</span>
                <span className="ml-2 text-xl text-muted-foreground line-through">${plan.price.toFixed(2)}</span>
                <span className="ml-2 text-sm font-medium text-green-500">Save {discount}%</span>
              </>
            ) : (
              <span className="text-3xl font-bold">${plan.price.toFixed(2)}</span>
            )}
            <span className="text-muted-foreground ml-2">/{plan.name.toLowerCase()}</span>
          </div>
        </div>
        
        <div>
          <h4 className="text-sm font-medium mb-3">What's included:</h4>
          <ul className="space-y-2">
            {plan.features.map((feature, i) => (
              <li key={i} className="flex items-center">
                <Check className="h-4 w-4 mr-2 text-green-500" />
                <span>{feature}</span>
              </li>
            ))}
          </ul>
        </div>
        
        <div className="space-y-3">
          <div className="grid grid-cols-4 gap-3">
            <div className="col-span-3">
              <Label htmlFor="promocode">Promocode</Label>
              <Input 
                id="promocode" 
                placeholder="Enter promocode" 
                value={promocode}
                onChange={(e) => setPromocode(e.target.value)}
              />
            </div>
            <div className="flex items-end">
              <Button 
                variant="outline" 
                className="w-full" 
                onClick={handleApplyPromocode}
                disabled={isApplyingCode}
              >
                {isApplyingCode ? (
                  <LoaderCircle className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  "Apply"
                )}
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
      <Separator />
      <CardFooter className="pt-6">
        <Button 
          className="w-full" 
          size="lg"
          onClick={handleSubscribe}
          disabled={isSubscribing}
        >
          {isSubscribing ? (
            <>
              <LoaderCircle className="h-4 w-4 mr-2 animate-spin" />
              Processing...
            </>
          ) : (
            <>Subscribe Now</>
          )}
        </Button>
      </CardFooter>
    </Card>
  );
}