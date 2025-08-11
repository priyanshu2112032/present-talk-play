import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Drawer, DrawerContent, DrawerFooter, DrawerHeader, DrawerTitle, DrawerTrigger } from "@/components/ui/drawer";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "@/hooks/use-toast";
import { EFFECTIVE_BACKEND_URL } from "@/config";
import type { SlideAsset } from "@/types";

interface ChatbotDrawerProps {
  slides: SlideAsset[];
  currentIndex: number;
}

type Msg = { role: "user" | "assistant"; content: string };

export default function ChatbotDrawer({ slides, currentIndex }: ChatbotDrawerProps) {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Msg[]>([]);
  const [loading, setLoading] = useState(false);
  


  async function ask() {
    const q = input.trim();
    if (!q) return;
    setMessages((m) => [...m, { role: "user", content: q }]);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch(`${EFFECTIVE_BACKEND_URL}/qa`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question: q,
          slideIndex: currentIndex,
          slideImageUrl: slides[currentIndex]?.imageUrl,
        }),
      });
      if (!res.ok) throw new Error(`QA failed (${res.status})`);
      const data = await res.json();
      const answer: string = data?.answer ?? JSON.stringify(data);
      setMessages((m) => [...m, { role: "assistant", content: answer }]);
    } catch (e: any) {
      console.error(e);
      toast({ title: "QA error", description: e?.message ?? "Could not fetch an answer." });
    } finally {
      setLoading(false);
    }
  }

  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <DrawerTrigger asChild>
        <Button className="fixed bottom-6 right-6 z-20" variant="default">Questions</Button>
      </DrawerTrigger>
      <DrawerContent className="max-h-[70vh]">
        <DrawerHeader>
          <DrawerTitle>Ask about this slide</DrawerTitle>
          <p className="text-sm text-muted-foreground">Slide {currentIndex + 1} / {slides.length}</p>
        </DrawerHeader>
        <div className="px-4">
          <ScrollArea className="h-[40vh] rounded-md border p-3">
            <div className="space-y-3">
              {messages.length === 0 && (
                <p className="text-sm text-muted-foreground">Ask any question about the current slide. For example: \"Summarize this slide\" or \"Explain the key takeaway\".</p>
              )}
              {messages.map((m, i) => (
                <div key={i} className={m.role === "user" ? "text-right" : "text-left"}>
                  <div className={m.role === "user" ? "inline-block rounded-md bg-primary text-primary-foreground px-3 py-2" : "inline-block rounded-md bg-secondary text-foreground px-3 py-2"}>
                    {m.content}
                  </div>
                </div>
              ))}
              {loading && <p className="text-sm text-muted-foreground">Thinking…</p>}
            </div>
          </ScrollArea>
        </div>
        <DrawerFooter>
          <div className="flex gap-2">
            <Input
              placeholder="Type your question"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && ask()}
            />
            <Button onClick={ask} disabled={loading}>Ask</Button>
          </div>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}
