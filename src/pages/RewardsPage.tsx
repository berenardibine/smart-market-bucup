import { useNavigate } from "react-router-dom";
import { 
  ArrowLeft, Gift, Star, Zap, Ticket, ShoppingBag, 
  Percent, Clock, ChevronRight 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";

const RewardsPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  if (!user) {
    navigate('/auth');
    return null;
  }

  const rewards = [
    {
      id: 1,
      title: "10% Off First Purchase",
      description: "Get 10% discount on your first order",
      points: 200,
      icon: Percent,
      color: "from-green-500 to-emerald-500",
      available: true
    },
    {
      id: 2,
      title: "Free Delivery",
      description: "Free delivery on any order",
      points: 350,
      icon: ShoppingBag,
      color: "from-blue-500 to-cyan-500",
      available: true
    },
    {
      id: 3,
      title: "VIP Badge",
      description: "Exclusive VIP member badge",
      points: 500,
      icon: Star,
      color: "from-amber-500 to-orange-500",
      available: false
    },
    {
      id: 4,
      title: "Premium for 1 Month",
      description: "Unlock premium features for 30 days",
      points: 1000,
      icon: Ticket,
      color: "from-purple-500 to-pink-500",
      available: false
    },
  ];

  const currentPoints = 375;
  const nextLevel = 500;

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <div className="bg-gradient-to-br from-orange-500 via-primary to-rose-500 pt-safe pb-8">
        <div className="flex items-center gap-3 p-4">
          <button 
            onClick={() => navigate(-1)}
            className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center"
          >
            <ArrowLeft className="h-5 w-5 text-white" />
          </button>
          <h1 className="font-semibold text-lg text-white">My Rewards</h1>
        </div>

        {/* Points Card */}
        <div className="px-4 mt-4">
          <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-5">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-white/30 flex items-center justify-center">
                <Gift className="h-8 w-8 text-white" />
              </div>
              <div className="flex-1">
                <p className="text-white/80 text-sm">Available Points</p>
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl font-bold text-white">{currentPoints}</span>
                  <Zap className="h-5 w-5 text-yellow-300" />
                </div>
              </div>
            </div>

            <div className="mt-5">
              <div className="flex items-center justify-between text-sm text-white/80 mb-2">
                <span>Progress to next level</span>
                <span>{currentPoints}/{nextLevel}</span>
              </div>
              <Progress value={(currentPoints / nextLevel) * 100} className="h-2 bg-white/30" />
            </div>
          </div>
        </div>
      </div>

      {/* How to Earn */}
      <div className="p-4">
        <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-2xl p-4 border border-amber-100">
          <h3 className="font-semibold flex items-center gap-2">
            <Zap className="h-5 w-5 text-amber-500" />
            How to Earn Points
          </h3>
          <div className="mt-3 grid grid-cols-2 gap-3 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-amber-500 text-white flex items-center justify-center text-xs font-bold">+5</div>
              <span className="text-muted-foreground">Daily Login</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-green-500 text-white flex items-center justify-center text-xs font-bold">+50</div>
              <span className="text-muted-foreground">First Purchase</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-blue-500 text-white flex items-center justify-center text-xs font-bold">+10</div>
              <span className="text-muted-foreground">Share Product</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-purple-500 text-white flex items-center justify-center text-xs font-bold">+25</div>
              <span className="text-muted-foreground">Leave Review</span>
            </div>
          </div>
        </div>
      </div>

      {/* Available Rewards */}
      <div className="px-4">
        <h3 className="font-semibold mb-3">Redeem Rewards</h3>
        <div className="space-y-3">
          {rewards.map(reward => (
            <div 
              key={reward.id}
              className={cn(
                "bg-card rounded-2xl p-4 border flex items-center gap-4 transition-all",
                !reward.available && "opacity-50"
              )}
            >
              <div className={cn(
                "w-14 h-14 rounded-xl bg-gradient-to-br flex items-center justify-center",
                reward.color
              )}>
                <reward.icon className="h-7 w-7 text-white" />
              </div>
              <div className="flex-1">
                <h4 className="font-semibold">{reward.title}</h4>
                <p className="text-sm text-muted-foreground">{reward.description}</p>
                <div className="flex items-center gap-1 mt-1 text-primary">
                  <Zap className="h-3.5 w-3.5" />
                  <span className="text-sm font-medium">{reward.points} points</span>
                </div>
              </div>
              <Button 
                size="sm" 
                disabled={!reward.available || currentPoints < reward.points}
                className="rounded-xl"
              >
                Redeem
              </Button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default RewardsPage;
