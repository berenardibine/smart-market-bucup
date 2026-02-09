import { useState, useEffect, useCallback } from 'react';
import { X, Download, Smartphone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

const FIRST_VISIT_KEY = 'sm-first-visit';
const INSTALLED_KEY = 'sm-pwa-installed';
const DISMISSED_KEY = 'sm-install-dismissed';
const DAY_MS = 24 * 60 * 60 * 1000;

const InstallPrompt = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showBanner, setShowBanner] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    // Check if already installed / standalone
    const standalone = window.matchMedia('(display-mode: standalone)').matches
      || (window.navigator as any).standalone === true;
    setIsStandalone(standalone);

    if (standalone || localStorage.getItem(INSTALLED_KEY)) return;

    // Record first visit
    if (!localStorage.getItem(FIRST_VISIT_KEY)) {
      localStorage.setItem(FIRST_VISIT_KEY, Date.now().toString());
    }

    // Listen for beforeinstallprompt
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);

      // Show banner after day 2 (or immediately in dev for testing)
      const firstVisit = parseInt(localStorage.getItem(FIRST_VISIT_KEY) || '0');
      const elapsed = Date.now() - firstVisit;
      const dismissed = localStorage.getItem(DISMISSED_KEY);

      if (elapsed >= DAY_MS && !dismissed) {
        setShowBanner(true);
      }
    };

    window.addEventListener('beforeinstallprompt', handler);

    // Listen for successful install
    window.addEventListener('appinstalled', () => {
      localStorage.setItem(INSTALLED_KEY, 'true');
      setShowBanner(false);
      setDeferredPrompt(null);
    });

    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
    };
  }, []);

  const handleInstall = useCallback(async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      localStorage.setItem(INSTALLED_KEY, 'true');
    }
    setDeferredPrompt(null);
    setShowBanner(false);
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
        <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
          <Smartphone className="h-6 w-6 text-primary" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-sm text-foreground">Install Smart Market</h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            Get the full app experience — fast, offline, no browser UI!
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
