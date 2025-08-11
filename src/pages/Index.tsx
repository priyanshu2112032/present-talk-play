import { useMemo, useState } from "react";
import UploadSection from "@/components/UploadSection";
import SlideshowPlayer from "@/components/SlideshowPlayer";
import ChatbotDrawer from "@/components/ChatbotDrawer";
import type { SlideAsset } from "@/types";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { EFFECTIVE_BACKEND_URL } from "@/config";

const Index = () => {
  const [slides, setSlides] = useState<SlideAsset[] | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [backendUrl, setBackendUrl] = useState(EFFECTIVE_BACKEND_URL);

  const structuredData = useMemo(() => ({
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "Lip-Synced Presentation Video Generator",
    applicationCategory: "Multimedia",
    description: "Upload a PDF and get a synchronized slideshow with embedded lip-synced avatar video.",
    operatingSystem: "Web",
  }), []);

  return (
    <div>
      <header className="container py-10">
        <div className="mx-auto max-w-3xl text-center rounded-xl bg-gradient-hero p-8 text-primary-foreground shadow-elevated transition-smooth">
          <h1 className="text-4xl font-bold tracking-tight">Lip-Synced Presentation Video Generator</h1>
          <p className="mt-3 text-lg opacity-90">
            Upload a PDF to generate slide images and a lip-synced avatar. Play your deck automatically, with controls and Q&A.
          </p>
        </div>
        <div className="mx-auto max-w-3xl mt-6">
          <div className="rounded-xl bg-card border p-4 shadow-elevated">
            <div className="grid gap-2 sm:grid-cols-[1fr_auto] items-end">
              <div className="grid gap-1">
                <Label htmlFor="backendUrl">Backend URL</Label>
                <Input id="backendUrl" value={backendUrl} onChange={(e) => setBackendUrl(e.target.value)} placeholder="http://localhost:8000" />
              </div>
              <Button
                onClick={() => {
                  (window as any).BACKEND_URL = backendUrl;
                  toast({ title: "Backend updated", description: backendUrl });
                }}
              >
                Apply
              </Button>
            </div>
          </div>
        </div>
      </header>
      <main className="container pb-16">
        {!slides && (
          <section className="mx-auto max-w-2xl">
            <UploadSection backendUrl={backendUrl} onResult={(s) => { setSlides(s); setCurrentIndex(0); }} />
          </section>
        )}

        {slides && (
          <section className="mx-auto max-w-5xl">
            <SlideshowPlayer
              slides={slides}
              currentIndex={currentIndex}
              onCurrentIndexChange={(i) => setCurrentIndex(i)}
            />
            <ChatbotDrawer backendUrl={backendUrl} slides={slides} currentIndex={currentIndex} />
          </section>
        )}
      </main>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} />
    </div>
  );
};

export default Index;
