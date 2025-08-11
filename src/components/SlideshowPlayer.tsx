import { useEffect, useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { cn } from "@/lib/utils";
import type { SlideAsset } from "@/types";

interface SlideshowPlayerProps {
  slides: SlideAsset[];
  currentIndex: number;
  onCurrentIndexChange: (i: number) => void;
}

export default function SlideshowPlayer({ slides, currentIndex, onCurrentIndexChange }: SlideshowPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const overlayRef = useRef<HTMLDivElement | null>(null);
  const [overlayPos, setOverlayPos] = useState<{ x: number; y: number } | null>(null);
  const [dragging, setDragging] = useState(false);

  const current = useMemo(() => slides[currentIndex], [slides, currentIndex]);

  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    if (isPlaying) void v.play().catch(() => {});
    else v.pause();
  }, [isPlaying, currentIndex]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") next();
      if (e.key === "ArrowLeft") prev();
      if (e.key === " ") { e.preventDefault(); togglePlay(); }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [currentIndex, isPlaying]);

  useEffect(() => {
    if (!overlayRef.current || overlayPos) return;
    const parent = overlayRef.current.parentElement;
    if (!parent) return;
    const pr = parent.getBoundingClientRect();
    const or = overlayRef.current.getBoundingClientRect();
    setOverlayPos({ x: 16, y: Math.max(16, pr.height - or.height - 16) });
  }, [overlayPos, currentIndex]);

  useEffect(() => {
    function handleResize() {
      if (!overlayRef.current || !overlayPos) return;
      const parent = overlayRef.current.parentElement?.getBoundingClientRect();
      const or = overlayRef.current.getBoundingClientRect();
      if (!parent) return;
      setOverlayPos({
        x: Math.min(Math.max(0, overlayPos.x), parent.width - or.width),
        y: Math.min(Math.max(0, overlayPos.y), parent.height - or.height),
      });
    }
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [overlayPos]);

  function onOverlayPointerDown(e: React.PointerEvent<HTMLDivElement>) {
    const startX = e.clientX;
    const startY = e.clientY;
    const start = overlayPos ?? { x: 16, y: 16 };
    const parentRect = overlayRef.current?.parentElement?.getBoundingClientRect();
    const overlayRect = overlayRef.current?.getBoundingClientRect();
    if (!parentRect || !overlayRect) return;
    setDragging(true);
    const onMove = (ev: PointerEvent) => {
      const dx = ev.clientX - startX;
      const dy = ev.clientY - startY;
      let nx = start.x + dx;
      let ny = start.y + dy;
      nx = Math.max(0, Math.min(nx, parentRect.width - overlayRect.width));
      ny = Math.max(0, Math.min(ny, parentRect.height - overlayRect.height));
      setOverlayPos({ x: nx, y: ny });
    };
    const onUp = () => {
      setDragging(false);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
    };
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
  }

  function togglePlay() {
    setIsPlaying((p) => !p);
  }

  function next() {
    onCurrentIndexChange(Math.min(slides.length - 1, currentIndex + 1));
  }

  function prev() {
    onCurrentIndexChange(Math.max(0, currentIndex - 1));
  }

  return (
    <Card className="relative shadow-elevated">
      <CardContent className="p-0">
        <AspectRatio ratio={16/9} className="relative w-full overflow-hidden rounded-lg">
          <img
            src={current.imageUrl}
            alt={`Slide ${currentIndex + 1}`}
            loading="lazy"
            className="h-full w-full object-contain bg-card"
          />

          <div
            ref={overlayRef}
            onPointerDown={onOverlayPointerDown}
            className="pointer-events-auto absolute z-10 select-none"
            style={{ left: overlayPos?.x ?? 16, top: overlayPos?.y ?? 16, cursor: dragging ? "grabbing" : "grab" }}
          >
            <div className="rounded-md border bg-card/90 backdrop-blur p-2 shadow-md">
              <video
                ref={videoRef}
                src={current.videoUrl}
                onEnded={() => {
                  if (currentIndex < slides.length - 1) onCurrentIndexChange(currentIndex + 1);
                  else setIsPlaying(false);
                }}
                className="h-28 w-40 object-cover rounded"
                playsInline
                controls={false}
                muted={false}
              />
              <div className="mt-2 flex items-center gap-2">
                <Button size="sm" onClick={prev} variant="secondary" disabled={currentIndex === 0}>Prev</Button>
                <Button size="sm" onClick={togglePlay} variant="default">{isPlaying ? "Pause" : "Play"}</Button>
                <Button size="sm" onClick={next} variant="secondary" disabled={currentIndex === slides.length - 1}>Next</Button>
              </div>
            </div>
          </div>

          <div className="absolute inset-x-0 top-0 p-3 flex items-center justify-center">
            <div className="rounded-full bg-background/70 px-3 py-1 text-sm text-foreground border shadow-sm">
              Slide {currentIndex + 1} / {slides.length}
            </div>
          </div>
        </AspectRatio>

        <div className="p-4">
          <div className="flex items-center justify-center gap-3">
            <Button onClick={prev} variant="secondary" disabled={currentIndex === 0}>Previous</Button>
            <Button onClick={togglePlay} variant="default">{isPlaying ? "Pause" : "Start"}</Button>
            <Button onClick={next} variant="secondary" disabled={currentIndex === slides.length - 1}>Next</Button>
          </div>
          <Separator className="my-4" />
          <div className="flex flex-wrap items-center justify-center gap-2">
            {slides.map((_, i) => (
              <button
                key={i}
                aria-label={`Go to slide ${i + 1}`}
                onClick={() => onCurrentIndexChange(i)}
                className={cn(
                  "h-2 w-2 rounded-full border transition-opacity",
                  i === currentIndex ? "bg-primary" : "bg-muted opacity-60 hover:opacity-100"
                )}
              />
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
