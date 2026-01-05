import { Quote } from "lucide-react";

const DailyMotivation = () => {
  return (
    <div className="flex items-start gap-3 p-4 bg-secondary/10 rounded-2xl border border-secondary/20">
      <div className="w-8 h-8 rounded-full bg-secondary/20 flex items-center justify-center shrink-0">
        <Quote className="h-4 w-4 text-secondary" />
      </div>
      <div>
        <p className="text-foreground text-sm font-medium leading-relaxed">
          "Your dream shop can start here. Keep going, every listing counts!"
        </p>
        <p className="text-muted-foreground text-xs mt-1">— Daily Motivation</p>
      </div>
    </div>
  );
};

export default DailyMotivation;
