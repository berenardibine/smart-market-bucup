import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { 
  ArrowLeft, Trophy, Target, Star, Gift, Clock, 
  CheckCircle, Zap, TrendingUp, Users 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

const ChallengesPage = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'active' | 'completed'>('active');

  const challenges = [
    {
      id: 1,
      title: "First Purchase",
      description: "Make your first purchase on Smart Market",
      reward: 100,
      progress: 0,
      total: 1,
      icon: Gift,
      color: "from-pink-500 to-rose-500",
      status: "active"
    },
    {
      id: 2,
      title: "Profile Complete",
      description: "Complete your profile with all details",
      reward: 50,
      progress: 3,
      total: 5,
      icon: Star,
      color: "from-amber-500 to-orange-500",
      status: "active"
    },
    {
      id: 3,
      title: "Social Butterfly",
      description: "Connect with 5 sellers",
      reward: 150,
      progress: 2,
      total: 5,
      icon: Users,
      color: "from-blue-500 to-cyan-500",
      status: "active"
    },
    {
      id: 4,
      title: "Explorer",
      description: "View 20 different products",
      reward: 75,
      progress: 20,
      total: 20,
      icon: Target,
      color: "from-green-500 to-emerald-500",
      status: "completed"
    },
  ];

  const activeChallenges = challenges.filter(c => c.status === 'active');
  const completedChallenges = challenges.filter(c => c.status === 'completed');

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <div className="bg-gradient-to-br from-amber-500 via-orange-500 to-primary pt-safe pb-8">
        <div className="flex items-center gap-3 p-4">
          <button 
            onClick={() => navigate(-1)}
            className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center"
          >
            <ArrowLeft className="h-5 w-5 text-white" />
          </button>
          <h1 className="font-semibold text-lg text-white">Smart Challenges</h1>
        </div>

        {/* Stats */}
        <div className="px-4 mt-4">
          <div className="flex items-center gap-4 bg-white/20 backdrop-blur-sm rounded-2xl p-4">
            <div className="w-16 h-16 rounded-xl bg-white/30 flex items-center justify-center">
              <Trophy className="h-8 w-8 text-white" />
            </div>
            <div className="flex-1">
              <p className="text-white/80 text-sm">Total Points Earned</p>
              <p className="text-3xl font-bold text-white">375</p>
            </div>
            <div className="text-right">
              <Badge className="bg-white text-primary">Level 3</Badge>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 p-4 -mt-4">
        <button
          onClick={() => setActiveTab('active')}
          className={cn(
            "flex-1 py-3 rounded-xl font-medium transition-all",
            activeTab === 'active'
              ? "bg-primary text-white shadow-lg"
              : "bg-card border text-muted-foreground"
          )}
        >
          Active ({activeChallenges.length})
        </button>
        <button
          onClick={() => setActiveTab('completed')}
          className={cn(
            "flex-1 py-3 rounded-xl font-medium transition-all",
            activeTab === 'completed'
              ? "bg-primary text-white shadow-lg"
              : "bg-card border text-muted-foreground"
          )}
        >
          Completed ({completedChallenges.length})
        </button>
      </div>

      {/* Challenges List */}
      <div className="px-4 space-y-3">
        {(activeTab === 'active' ? activeChallenges : completedChallenges).map(challenge => (
          <div 
            key={challenge.id} 
            className="bg-card rounded-2xl p-4 border shadow-sm"
          >
            <div className="flex items-start gap-4">
              <div className={cn(
                "w-14 h-14 rounded-xl bg-gradient-to-br flex items-center justify-center",
                challenge.color
              )}>
                <challenge.icon className="h-7 w-7 text-white" />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold">{challenge.title}</h3>
                  <div className="flex items-center gap-1 text-amber-500">
                    <Zap className="h-4 w-4" />
                    <span className="font-bold text-sm">{challenge.reward}</span>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground mt-1">{challenge.description}</p>
                <div className="mt-3">
                  <div className="flex items-center justify-between text-sm mb-1">
                    <span className="text-muted-foreground">Progress</span>
                    <span className="font-medium">{challenge.progress}/{challenge.total}</span>
                  </div>
                  <Progress 
                    value={(challenge.progress / challenge.total) * 100} 
                    className="h-2"
                  />
                </div>
                {challenge.status === 'completed' && (
                  <div className="flex items-center gap-2 mt-3 text-green-600">
                    <CheckCircle className="h-4 w-4" />
                    <span className="text-sm font-medium">Completed!</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ChallengesPage;
