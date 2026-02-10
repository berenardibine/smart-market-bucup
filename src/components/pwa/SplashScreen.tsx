import { useState, useEffect } from 'react';
import splashIcon from '/og-image-v3.png';

const SplashScreen = ({ onComplete }: { onComplete: () => void }) => {
  const [phase, setPhase] = useState<'zoom' | 'fade-out' | 'done'>('zoom');

  useEffect(() => {
    // Check if splash already shown this session
    if (sessionStorage.getItem('sm-splash-shown')) {
      onComplete();
      return;
    }

    const zoomTimer = setTimeout(() => setPhase('fade-out'), 5000);
    const completeTimer = setTimeout(() => {
      sessionStorage.setItem('sm-splash-shown', 'true');
      setPhase('done');
      onComplete();
    }, 5000);

    return () => {
      clearTimeout(zoomTimer);
      clearTimeout(completeTimer);
    };
  }, [onComplete]);

  if (phase === 'done') return null;

  return (
    <div
      className="fixed inset-0 z-[9999] flex flex-col items-center justify-center"
      style={{
        background: 'linear-gradient(135deg, #F97316 0%, #EA580C 50%, #DC2626 100%)',
        opacity: phase === 'fade-out' ? 0 : 1,
        transition: 'opacity 0.4s ease-out',
      }}
    >
      {/* Logo with zoom animation */}
      <div
        className="flex flex-col items-center"
        style={{
          animation: 'splashZoom 1.8s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        }}
      >
        <img
          src={splashIcon}
          alt="Smart Market"
          className="w-28 h-28 rounded-[28px] shadow-2xl mb-6"
          style={{
            boxShadow: '0 20px 60px -12px rgba(0,0,0,0.4)',
          }}
        />
        <h1
          className="text-3xl font-bold tracking-tight mb-2"
          style={{ color: 'white' }}
        >
          Smart Market
        </h1>
        <p className="text-sm font-medium" style={{ color: 'rgba(255,255,255,0.75)' }}>
          Trade Smart Way
        </p>
      </div>

      {/* Developer credit */}
      <div
        className="absolute bottom-12 text-center"
        style={{
          animation: 'fadeInUp 0.8s ease-out 0.5s both',
        }}
      >
        <p className="text-xs font-medium" style={{ color: 'rgba(255,255,255,0.6)' }}>
          Developed by
        </p>
        <p
          className="text-sm font-bold mt-0.5"
          style={{
            background: 'linear-gradient(90deg, #FBBF24, #F9FAFB, #60A5FA)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}
        >
          Smart Technology
        </p>
      </div>

      <style>{`
        @keyframes splashZoom {
          0% { opacity: 0; transform: scale(0.3); }
          50% { opacity: 1; transform: scale(1.05); }
          100% { opacity: 1; transform: scale(1); }
        }
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(12px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
};

export default SplashScreen;
