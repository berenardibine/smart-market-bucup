import { Sparkles } from "lucide-react";

const AIGreeting = () => {
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 17) return "Good afternoon";
    return "Good evening";
  };

  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-primary p-4 shadow-orange">
      {/* Decorative circles */}
      <div className="absolute -top-8 -right-8 w-24 h-24 rounded-full bg-white/10" />
      <div className="absolute -bottom-4 -left-4 w-16 h-16 rounded-full bg-white/10" />
      
      <div className="relative flex items-start gap-3">
        <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center shrink-0">
          <Sparkles className="h-5 w-5 text-primary-foreground" />
        </div>
        <div>
          <h2 className="text-primary-foreground font-bold text-lg mb-1">
            {getGreeting()}, Berenard 👋
          </h2>
          <p className="text-primary-foreground/90 text-sm leading-relaxed">
            Your market in <span className="font-semibold">Kivu Sector</span> is ready for you! 
            Discover fresh products from local sellers.
          </p>
        </div>
      </div>
    </div>
  );
};

export default AIGreeting;
