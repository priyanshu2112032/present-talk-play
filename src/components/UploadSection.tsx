import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { toast } from "@/hooks/use-toast";
import type { SlideAsset } from "@/types";

interface UploadSectionProps {
  onResult: (slides: SlideAsset[]) => void;
  backendUrl: string;
}

export default function UploadSection({ onResult, backendUrl }: UploadSectionProps) {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0] || null;
    if (f && f.type !== "application/pdf") {
      toast({ title: "Unsupported file", description: "Please select a PDF file." });
      e.target.value = "";
      return;
    }
    setFile(f);
  };

  async function handleUpload() {
    if (!file) {
      toast({ title: "No file selected", description: "Choose a PDF to upload." });
      return;
    }

    try {
      setUploading(true);
      setProgress(10);

      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch(`${backendUrl}/generate`, {
        method: "POST",
        body: formData,
      });

      setProgress(60);

      if (!response.ok) {
        throw new Error(`Upload failed (${response.status})`);
      }

      const data = await response.json();
      const slides = mapResponseToSlides(data);
      if (!slides.length) throw new Error("No slides returned by backend");

      setProgress(100);
      toast({ title: "Slides ready", description: `${slides.length} slides generated.` });
      onResult(slides);
    } catch (err: any) {
      console.error(err);
      toast({ title: "Error", description: err?.message ?? "Failed to process presentation." });
    } finally {
      setUploading(false);
      setTimeout(() => setProgress(0), 800);
    }
  }

  function mapResponseToSlides(data: any): SlideAsset[] {
    // Accepts a couple of shapes for resilience.
    // Preferred: { slides: [{ image_url, video_url } | { imageUrl, videoUrl }] }
    if (Array.isArray(data?.slides)) {
      return data.slides
        .map((s: any) => ({
          imageUrl: s.imageUrl ?? s.image_url,
          videoUrl: s.videoUrl ?? s.video_url,
        }))
        .filter((s: SlideAsset) => !!s.imageUrl && !!s.videoUrl);
    }

    // Alternate: { images: string[], videos: string[] }
    if (Array.isArray(data?.images) && Array.isArray(data?.videos)) {
      const len = Math.min(data.images.length, data.videos.length);
      return Array.from({ length: len }, (_, i) => ({ imageUrl: data.images[i], videoUrl: data.videos[i] }));
    }

    return [];
  }

  return (
    <Card className="shadow-elevated">
      <CardHeader>
        <CardTitle>Upload presentation</CardTitle>
        <CardDescription>Provide a PDF deck to generate lip-synced videos and slides.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-4">
          <div className="grid gap-2">
            <Label htmlFor="pdf">PDF file</Label>
            <Input id="pdf" type="file" accept="application/pdf" onChange={handleFileChange} />
          </div>
          {uploading && (
            <div className="grid gap-2">
              <Progress value={progress} />
              <p className="text-sm text-muted-foreground">Processing… this can take a moment.</p>
            </div>
          )}
          <div className="flex gap-3">
            <Button onClick={handleUpload} disabled={!file || uploading} variant="default">
              Generate lip-synced slideshow
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">
            Backend: <code className="font-mono">{backendUrl}/generate</code>
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
