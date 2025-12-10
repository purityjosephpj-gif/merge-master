import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Download, Smartphone, X } from "lucide-react";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export const InstallPWA = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showBanner, setShowBanner] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // Check if already installed
    if (window.matchMedia("(display-mode: standalone)").matches) {
      setIsInstalled(true);
      return;
    }

    // Check if iOS
    const isIOSDevice = /iPad|iPhone|iPod/.test(navigator.userAgent);
    setIsIOS(isIOSDevice);

    // Listen for beforeinstallprompt
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setShowBanner(true);
    };

    window.addEventListener("beforeinstallprompt", handler);

    // Show banner for iOS after a delay
    if (isIOSDevice) {
      const timer = setTimeout(() => setShowBanner(true), 3000);
      return () => {
        clearTimeout(timer);
        window.removeEventListener("beforeinstallprompt", handler);
      };
    }

    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;

    if (outcome === "accepted") {
      setShowBanner(false);
      setIsInstalled(true);
    }
    setDeferredPrompt(null);
  };

  const handleDismiss = () => {
    setShowBanner(false);
  };

  if (isInstalled || !showBanner) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-96 bg-card border border-border rounded-xl p-4 shadow-elegant z-50 animate-fade-in">
      <button
        onClick={handleDismiss}
        className="absolute top-2 right-2 text-muted-foreground hover:text-foreground transition-colors"
      >
        <X className="h-4 w-4" />
      </button>

      <div className="flex items-start gap-3">
        <div className="p-2 bg-primary/10 rounded-lg">
          <Smartphone className="h-6 w-6 text-primary" />
        </div>
        <div className="flex-1">
          <h3 className="font-serif font-semibold text-foreground mb-1">
            Install Pixel & Prose
          </h3>
          <p className="text-sm text-muted-foreground mb-3">
            {isIOS
              ? "Tap the share button and select 'Add to Home Screen'"
              : "Install our app for a better reading experience"}
          </p>
          {!isIOS && deferredPrompt && (
            <Button onClick={handleInstall} size="sm" className="w-full">
              <Download className="h-4 w-4 mr-2" />
              Install App
            </Button>
          )}
          {isIOS && (
            <div className="text-xs text-muted-foreground bg-muted/50 p-2 rounded-lg">
              <p className="flex items-center gap-1">
                1. Tap <span className="inline-block">⬆️</span> Share button
              </p>
              <p>2. Scroll and tap "Add to Home Screen"</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
