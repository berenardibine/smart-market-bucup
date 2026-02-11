import { useState, useEffect, useCallback } from 'react';
import { X, Download, Share, MoreVertical } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

const INSTALLED_KEY = 'sm-pwa-installed';
const DISMISSED_KEY = 'sm-install-dismissed';
const DISMISS_COOLDOWN = 4 * 60 * 60 * 1000;
const INITIAL_DELAY = 5000;

const getDeviceInfo = () => {
  const ua = navigator.userAgent;
  const isIOS = /iPad|iPhone|iPod/.test(ua);
  const isSafari = /Safari/.test(ua) && !/Chrome/.test(ua);
  const isChrome = /Chrome/.test(ua) && !/Edge/.test(ua);
  const isFirefox = /Firefox/.test(ua);
  const isSamsung = /SamsungBrowser/.test(ua);
  return { isIOS, isSafari, isChrome, isFirefox, isSamsung };
};

const InstallPrompt = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(
    () => (window as any).__pwaInstallPrompt || null
  );
  const [showBanner, setShowBanner] = useState(false);
  const [showInstructions, setShowInstructions] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    const standalone = window.matchMedia('(display-mode: standalone)').matches
      || (window.navigator as any).standalone === true;
    setIsStandalone(standalone);

    if (standalone || localStorage.getItem(INSTALLED_KEY)) return;

    const handler = (e: Event) => {
      e.preventDefault();
      (window as any).__pwaInstallPrompt = e;
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    window.addEventListener('beforeinstallprompt', handler);

    window.addEventListener('appinstalled', () => {
      localStorage.setItem(INSTALLED_KEY, 'true');
      setShowBanner(false);
      setDeferredPrompt(null);
      (window as any).__pwaInstallPrompt = null;
    });

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
      setShowInstructions(true);
    }
  }, [deferredPrompt]);

  const handleDismiss = () => {
    setShowBanner(false);
    setShowInstructions(false);
    localStorage.setItem(DISMISSED_KEY, Date.now().toString());
  };

  if (isStandalone || !showBanner) return null;

  const { isIOS, isChrome, isSamsung } = getDeviceInfo();

  return (
    <>
      {/* Install Banner */}
      {!showInstructions && (
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
            <Button size="sm" variant="outline" onClick={handleDismiss} className="flex-1 text-xs">
              Not now
            </Button>
            <Button size="sm" onClick={handleInstall} className="flex-1 text-xs gap-1">
              <Download className="h-3.5 w-3.5" />
              Install App
            </Button>
          </div>
        </div>
      )}

      {/* Fallback Instructions Modal */}
      {showInstructions && (
        <div className="fixed inset-0 z-[9999] flex items-end justify-center bg-black/50 animate-in fade-in">
          <div className={cn(
            "w-full max-w-md bg-card border-t border-border rounded-t-2xl p-5 pb-8",
            "animate-slide-up"
          )}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-base text-foreground">Install Smart Market</h3>
              <button onClick={handleDismiss} className="p-1 rounded-full hover:bg-muted">
                <X className="h-5 w-5 text-muted-foreground" />
              </button>
            </div>

            <div className="flex items-center gap-3 mb-4 p-3 bg-muted/50 rounded-xl">
              <img src="/favicon.ico" alt="Smart Market" className="w-12 h-12 rounded-xl" />
              <div>
                <p className="font-medium text-sm text-foreground">Smart Market</p>
                <p className="text-xs text-muted-foreground">Trade Smart Way</p>
              </div>
            </div>

            <p className="text-sm text-muted-foreground mb-3">
              Follow these steps to install:
            </p>

            {isIOS ? (
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                    <span className="text-xs font-bold text-primary">1</span>
                  </div>
                  <p className="text-sm text-foreground">
                    Tap the <Share className="inline h-4 w-4 text-primary" /> <strong>Share</strong> button in Safari's toolbar
                  </p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                    <span className="text-xs font-bold text-primary">2</span>
                  </div>
                  <p className="text-sm text-foreground">
                    Scroll down and tap <strong>"Add to Home Screen"</strong>
                  </p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                    <span className="text-xs font-bold text-primary">3</span>
                  </div>
                  <p className="text-sm text-foreground">
                    Tap <strong>"Add"</strong> to install the app
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                    <span className="text-xs font-bold text-primary">1</span>
                  </div>
                  <p className="text-sm text-foreground">
                    Tap the <MoreVertical className="inline h-4 w-4 text-primary" /> <strong>menu</strong> button in {isChrome ? 'Chrome' : isSamsung ? 'Samsung Browser' : 'your browser'}
                  </p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                    <span className="text-xs font-bold text-primary">2</span>
                  </div>
                  <p className="text-sm text-foreground">
                    Tap <strong>"{isChrome ? 'Install app' : 'Add to Home screen'}"</strong>
                  </p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                    <span className="text-xs font-bold text-primary">3</span>
                  </div>
                  <p className="text-sm text-foreground">
                    Tap <strong>"Install"</strong> to confirm
                  </p>
                </div>
              </div>
            )}

            <Button onClick={handleDismiss} className="w-full mt-5 text-sm">
              Got it
            </Button>
          </div>
        </div>
      )}
    </>
  );
};

export default InstallPrompt;
