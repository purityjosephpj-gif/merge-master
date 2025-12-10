import { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Download, Smartphone, Wifi, Bell, BookOpen, Check } from "lucide-react";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

const Install = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isIOS, setIsIOS] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    if (window.matchMedia("(display-mode: standalone)").matches) {
      setIsInstalled(true);
      return;
    }

    const isIOSDevice = /iPad|iPhone|iPod/.test(navigator.userAgent);
    setIsIOS(isIOSDevice);

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === "accepted") {
      setIsInstalled(true);
    }
    setDeferredPrompt(null);
  };

  const features = [
    {
      icon: BookOpen,
      title: "Read Anywhere",
      description: "Access your favorite books offline, anytime"
    },
    {
      icon: Wifi,
      title: "Works Offline",
      description: "Continue reading even without internet"
    },
    {
      icon: Bell,
      title: "Get Notified",
      description: "Stay updated on new chapters and releases"
    },
    {
      icon: Smartphone,
      title: "Native Experience",
      description: "Feels like a native app on your device"
    }
  ];

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />

      <main className="flex-grow">
        <section className="py-16 md:py-24">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-primary/10 rounded-2xl mb-6">
                <Smartphone className="h-10 w-10 text-primary" />
              </div>

              <h1 className="text-4xl md:text-5xl font-serif font-bold text-foreground mb-4">
                Install Pixel & Prose
              </h1>
              <p className="text-xl text-muted-foreground mb-8">
                Get the best reading experience by installing our app on your device
              </p>

              {isInstalled ? (
                <div className="flex items-center justify-center gap-2 text-green-500 mb-8">
                  <Check className="h-6 w-6" />
                  <span className="text-lg font-medium">App is already installed!</span>
                </div>
              ) : isIOS ? (
                <Card className="mb-8">
                  <CardContent className="p-6">
                    <h3 className="font-serif font-semibold text-lg mb-4">
                      Install on iOS
                    </h3>
                    <ol className="text-left space-y-3 text-muted-foreground">
                      <li className="flex items-start gap-3">
                        <span className="flex-shrink-0 w-6 h-6 bg-primary/10 text-primary rounded-full flex items-center justify-center text-sm font-medium">1</span>
                        <span>Tap the <strong>Share</strong> button in Safari's toolbar</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <span className="flex-shrink-0 w-6 h-6 bg-primary/10 text-primary rounded-full flex items-center justify-center text-sm font-medium">2</span>
                        <span>Scroll down and tap <strong>"Add to Home Screen"</strong></span>
                      </li>
                      <li className="flex items-start gap-3">
                        <span className="flex-shrink-0 w-6 h-6 bg-primary/10 text-primary rounded-full flex items-center justify-center text-sm font-medium">3</span>
                        <span>Tap <strong>"Add"</strong> to confirm</span>
                      </li>
                    </ol>
                  </CardContent>
                </Card>
              ) : deferredPrompt ? (
                <Button onClick={handleInstall} size="lg" className="mb-8">
                  <Download className="h-5 w-5 mr-2" />
                  Install App Now
                </Button>
              ) : (
                <p className="text-muted-foreground mb-8">
                  Open this page in Chrome or Edge to install the app
                </p>
              )}

              <div className="grid md:grid-cols-2 gap-4">
                {features.map((feature) => (
                  <Card key={feature.title} className="text-left">
                    <CardContent className="p-4 flex items-start gap-3">
                      <div className="p-2 bg-primary/10 rounded-lg flex-shrink-0">
                        <feature.icon className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-serif font-semibold text-foreground">
                          {feature.title}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          {feature.description}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Install;
