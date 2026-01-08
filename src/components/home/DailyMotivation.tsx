import { Quote, Lightbulb, Star } from "lucide-react";

const DailyMotivation = () => {
  return (
    <div className="relative overflow-hidden flex items-start gap-4 p-5 bg-gradient-to-br from-secondary/10 via-purple-500/5 to-pink-500/5 rounded-2xl border border-secondary/20">
      {/* Decorative */}
      <div className="absolute top-2 right-3 opacity-10">
        <Star className="h-12 w-12 text-secondary" />
      </div>
      
      <div className="w-11 h-11 rounded-xl bg-gradient-secondary flex items-center justify-center shrink-0 shadow-blue">
        <Quote className="h-5 w-5 text-white" />
      </div>
      <div className="flex-1 relative">
        <p className="text-foreground text-sm font-medium leading-relaxed pr-8">
          "Your dream shop can start here. Every product you list brings you closer to success!"
        </p>
        <div className="flex items-center gap-2 mt-2.5">
          <Lightbulb className="h-3.5 w-3.5 text-secondary" />
          <p className="text-secondary text-xs font-semibold">Daily Motivation</p>
        </div>
      </div>
    </div>
  );
};

export default DailyMotivation;
