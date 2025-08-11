import { useMemo, useState } from "react";
import UploadSection from "@/components/UploadSection";
import SlideshowPlayer from "@/components/SlideshowPlayer";
import ChatbotDrawer from "@/components/ChatbotDrawer";
import type { SlideAsset } from "@/types";

const Index = () => {
  const [slides, setSlides] = useState<SlideAsset[] | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);

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
        <div className="mx-auto max-w-3xl text-center">
          <h1 className="text-4xl font-bold tracking-tight">Lip-Synced Presentation Video Generator</h1>
          <p className="mt-3 text-lg text-muted-foreground">
            Upload a PDF to generate slide images and a lip-synced avatar. Play your deck automatically, with controls and Q&A.
          </p>
        </div>
      </header>
      <main className="container pb-16">
        {!slides && (
          <section className="mx-auto max-w-2xl">
            <UploadSection onResult={(s) => { setSlides(s); setCurrentIndex(0); }} />
          </section>
        )}

        {slides && (
          <section className="mx-auto max-w-5xl">
            <SlideshowPlayer
              slides={slides}
              currentIndex={currentIndex}
              onCurrentIndexChange={(i) => setCurrentIndex(i)}
            />
            <ChatbotDrawer slides={slides} currentIndex={currentIndex} />
          </section>
        )}
      </main>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} />
    </div>
  );
};

export default Index;
