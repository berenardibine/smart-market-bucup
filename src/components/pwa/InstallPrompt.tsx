import { useState, useEffect, useCallback } from 'react';
import { X, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

const INSTALLED_KEY = 'sm-pwa-installed';
const DISMISSED_KEY = 'sm-install-dismissed';
const DISMISS_COOLDOWN = 4 * 60 * 60 * 1000; // 4 hours
const INITIAL_DELAY = 5000; // 5 seconds before showing prompt

const InstallPrompt = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showBanner, setShowBanner] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    const standalone = window.matchMedia('(display-mode: standalone)').matches
      || (window.navigator as any).standalone === true;
    setIsStandalone(standalone);

    if (standalone || localStorage.getItem(INSTALLED_KEY)) return;

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    window.addEventListener('beforeinstallprompt', handler);

    window.addEventListener('appinstalled', () => {
      localStorage.setItem(INSTALLED_KEY, 'true');
      setShowBanner(false);
      setDeferredPrompt(null);
    });

    // Always show banner after 5 seconds for ALL users/guests
    const autoShowTimer = setTimeout(() => {
      const dismissed = localStorage.getItem(DISMISSED_KEY);
      if (!dismissed || Date.now() - parseInt(dismissed) >= DISMISS_COOLDOWN) {
        setShowBanner(true);
      }
    }, INITIAL_DELAY);

    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
      clearTimeout(autoShowTimer);
    };
  }, []);

  // Re-show on every return visit if dismissed and cooldown passed
  useEffect(() => {
    if (isStandalone || localStorage.getItem(INSTALLED_KEY)) return;

    const handleFocus = () => {
      const dismissed = localStorage.getItem(DISMISSED_KEY);
      if (!dismissed || Date.now() - parseInt(dismissed) >= DISMISS_COOLDOWN) {
        setShowBanner(true);
      }
    };

    window.addEventListener('focus', handleFocus);
    const visHandler = () => {
      if (document.visibilityState === 'visible') handleFocus();
    };
    document.addEventListener('visibilitychange', visHandler);

    return () => {
      window.removeEventListener('focus', handleFocus);
      document.removeEventListener('visibilitychange', visHandler);
    };
  }, [isStandalone]);

  const handleInstall = useCallback(async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        localStorage.setItem(INSTALLED_KEY, 'true');
      }
      setDeferredPrompt(null);
      setShowBanner(false);
    } else {
      // Fallback: open PWABuilder so user can install/download APK
      window.open(
        'https://www.pwabuilder.com/reportcard?site=' + encodeURIComponent(window.location.origin),
        '_blank'
      );
    }
  }, [deferredPrompt]);

  const handleDismiss = () => {
    setShowBanner(false);
    localStorage.setItem(DISMISSED_KEY, Date.now().toString());
  };

  if (isStandalone || !showBanner) return null;

  return (
    <div className={cn(
      "fixed bottom-20 left-4 right-4 z-50",
      "bg-card border border-border rounded-2xl p-4 shadow-elevated",
      "animate-slide-up"
    )}>
      <button
        onClick={handleDismiss}
        className="absolute top-3 right-3 p-1 rounded-full hover:bg-muted transition-colors"
        aria-label="Dismiss"
      >
        <X className="h-4 w-4 text-muted-foreground" />
      </button>

      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-xl overflow-hidden shrink-0 bg-primary/10 flex items-center justify-center">
          <img src="/favicon.ico" alt="Smart Market" className="w-10 h-10 object-contain" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-sm text-foreground">Install Smart Market</h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            Get instant product alerts & offers — fast, offline, no browser!
          </p>
        </div>
      </div>

      <div className="flex gap-2 mt-3">
        <Button
          size="sm"
          variant="outline"
          onClick={handleDismiss}
          className="flex-1 text-xs"
        >
          Not now
        </Button>
        <Button
          size="sm"
          onClick={handleInstall}
          className="flex-1 text-xs gap-1"
        >
          <Download className="h-3.5 w-3.5" />
          Install App
        </Button>
      </div>
    </div>
  );
};

export default InstallPrompt;
