import { useEffect, useCallback } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface VideoPlayerModalProps {
  youtubeKey: string;
  title: string;
  onClose: () => void;
}

export function VideoPlayerModal({ youtubeKey, title, onClose }: VideoPlayerModalProps) {
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
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-white text-lg font-semibold truncate pr-4">{title}</h3>
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

        <div className="relative w-full aspect-video rounded-md overflow-hidden bg-black">
          <iframe
            src={`https://www.youtube.com/embed/${youtubeKey}?autoplay=1&rel=0&modestbranding=1`}
            title={title}
            className="absolute inset-0 w-full h-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            data-testid="iframe-video-player"
          />
        </div>
      </div>
    </div>
  );
}
