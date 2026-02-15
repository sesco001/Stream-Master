import { useEffect, useCallback, useState } from "react";
import { X, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";

interface StreamLink {
  provider: string;
  url: string;
  quality: string;
}

interface VideoPlayerModalProps {
  youtubeKey?: string;
  embedUrl?: string;
  streamLinks?: StreamLink[];
  title: string;
  onClose: () => void;
}

export function VideoPlayerModal({ youtubeKey, embedUrl, streamLinks, title, onClose }: VideoPlayerModalProps) {
  const [activeSource, setActiveSource] = useState(0);
  const [showSources, setShowSources] = useState(false);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    },
    [onClose]
  );

  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [handleKeyDown]);

  let iframeSrc = "";
  if (streamLinks && streamLinks.length > 0) {
    iframeSrc = streamLinks[activeSource].url;
  } else if (embedUrl) {
    iframeSrc = embedUrl;
  } else if (youtubeKey) {
    iframeSrc = `https://www.youtube.com/embed/${youtubeKey}?autoplay=1&rel=0&modestbranding=1`;
  }

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center"
      data-testid="modal-video-player"
    >
      <div
        className="absolute inset-0 bg-black/90"
        onClick={onClose}
        data-testid="overlay-video-player"
      />

      <div className="relative w-full max-w-5xl mx-4 z-10">
        <div className="flex items-center justify-between mb-3 gap-2">
          <h3 className="text-white text-lg font-semibold truncate pr-4">{title}</h3>
          <div className="flex items-center gap-2 shrink-0">
            {streamLinks && streamLinks.length > 1 && (
              <div className="relative">
                <Button
                  size="sm"
                  variant="outline"
                  className="bg-white/10 border-white/20 text-white backdrop-blur-sm"
                  onClick={() => setShowSources(!showSources)}
                  data-testid="button-switch-source"
                >
                  {streamLinks[activeSource].provider}
                  <ChevronDown className="w-3 h-3 ml-1" />
                </Button>
                {showSources && (
                  <div className="absolute right-0 top-full mt-1 bg-black/95 border border-white/20 rounded-md overflow-hidden min-w-[160px]">
                    {streamLinks.map((link, i) => (
                      <button
                        key={i}
                        className={`w-full text-left px-3 py-2 text-sm text-white hover-elevate ${i === activeSource ? "bg-white/20" : ""}`}
                        onClick={() => {
                          setActiveSource(i);
                          setShowSources(false);
                        }}
                        data-testid={`button-source-${i}`}
                      >
                        {link.provider} ({link.quality})
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
            <Button
              size="icon"
              variant="ghost"
              className="text-white shrink-0"
              onClick={onClose}
              data-testid="button-close-player"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>
        </div>

        <div className="relative w-full aspect-video rounded-md overflow-hidden bg-black">
          {iframeSrc ? (
            <iframe
              src={iframeSrc}
              title={title}
              className="absolute inset-0 w-full h-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
              allowFullScreen
              referrerPolicy="origin"
              sandbox="allow-same-origin allow-scripts allow-popups allow-forms allow-presentation"
              data-testid="iframe-video-player"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center text-muted-foreground">
              No video source available
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
