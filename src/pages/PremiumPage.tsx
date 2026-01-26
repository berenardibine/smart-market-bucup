import { useNavigate } from "react-router-dom";
import { 
  ArrowLeft, Crown, Check, Zap, Star, Shield, 
  Rocket, Gift, BadgeCheck, Sparkles 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const PremiumPage = () => {
  const navigate = useNavigate();

  const features = [
    { icon: Rocket, text: "Priority listing in search results" },
    { icon: Shield, text: "Verified seller badge" },
    { icon: Star, text: "Unlimited product posts" },
    { icon: Zap, text: "Advanced analytics dashboard" },
    { icon: Gift, text: "Exclusive promotions & deals" },
    { icon: BadgeCheck, text: "Priority customer support" },
  ];

  const plans = [
    {
      name: "Monthly",
      price: 5000,
      period: "month",
      popular: false
    },
    {
      name: "Yearly",
      price: 45000,
      period: "year",
      popular: true,
      savings: "25%"
    }
  ];

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <div className="bg-gradient-to-br from-amber-400 via-orange-500 to-primary pt-safe pb-12 relative overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute top-10 right-10 w-32 h-32 rounded-full bg-white/10 blur-2xl" />
        <div className="absolute bottom-0 left-10 w-24 h-24 rounded-full bg-white/10 blur-xl" />
        
        <div className="flex items-center gap-3 p-4 relative">
          <button 
            onClick={() => navigate(-1)}
            className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center"
          >
            <ArrowLeft className="h-5 w-5 text-white" />
          </button>
          <h1 className="font-semibold text-lg text-white">Premium</h1>
        </div>

        <div className="text-center mt-6 px-4 relative">
          <div className="w-20 h-20 rounded-3xl bg-white/20 backdrop-blur-sm mx-auto flex items-center justify-center mb-4">
            <Crown className="h-10 w-10 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-white">Go Premium</h2>
          <p className="text-white/80 mt-2">Unlock exclusive features and grow your business</p>
        </div>
      </div>

      {/* Features */}
      <div className="px-4 -mt-6 relative z-10">
        <div className="bg-card rounded-2xl p-5 border shadow-lg">
          <h3 className="font-semibold flex items-center gap-2 mb-4">
            <Sparkles className="h-5 w-5 text-amber-500" />
            Premium Features
          </h3>
          <div className="space-y-3">
            {features.map((feature, index) => (
              <div key={index} className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center">
                  <feature.icon className="h-4 w-4 text-white" />
                </div>
                <span className="text-sm">{feature.text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Plans */}
      <div className="p-4 space-y-3 mt-4">
        <h3 className="font-semibold">Choose Your Plan</h3>
        {plans.map((plan, index) => (
          <button
            key={index}
            className={cn(
              "w-full p-4 rounded-2xl border-2 text-left transition-all relative overflow-hidden",
              plan.popular 
                ? "border-primary bg-primary/5" 
                : "border-border bg-card hover:border-primary/50"
            )}
          >
            {plan.popular && (
              <Badge className="absolute top-3 right-3 bg-primary">
                Save {plan.savings}
              </Badge>
            )}
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-bold">RWF {plan.price.toLocaleString()}</span>
              <span className="text-muted-foreground">/{plan.period}</span>
            </div>
            <p className="text-sm text-muted-foreground mt-1">{plan.name} subscription</p>
          </button>
        ))}
      </div>

      {/* CTA */}
      <div className="px-4 mt-4">
        <Button className="w-full h-14 rounded-2xl text-lg font-semibold bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 shadow-lg gap-2">
          <Crown className="h-5 w-5" />
          Upgrade to Premium
        </Button>
        <p className="text-center text-xs text-muted-foreground mt-3">
          Cancel anytime • 7-day money back guarantee
        </p>
      </div>
    </div>
  );
};

export default PremiumPage;
