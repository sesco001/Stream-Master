import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Star, Trash2, Play, Download, CheckCircle } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";

interface DownloadItem {
  id: string;
  tmdbId: number;
  title: string;
  posterUrl: string;
  rating: string | null;
  year: string | null;
  quality: string | null;
  status: string | null;
}

export default function MyDownloads() {
  const { toast } = useToast();

  const { data: items, isLoading } = useQuery<DownloadItem[]>({
    queryKey: ["/api/downloads"],
  });

  const removeMutation = useMutation({
    mutationFn: async (tmdbId: number) => {
      await apiRequest("DELETE", `/api/downloads/${tmdbId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/downloads"] });
      toast({ title: "Download removed" });
    },
  });

  return (
    <div className="max-w-[1400px] mx-auto px-4 py-8" data-testid="page-downloads">
      <div className="flex items-center gap-3 mb-8">
        <Download className="w-6 h-6 text-primary" />
        <h1 className="text-2xl font-bold tracking-tight">Downloads</h1>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-24 rounded-md" />
          ))}
        </div>
      ) : !items || items.length === 0 ? (
        <div className="flex flex-col items-center justify-center min-h-[40vh] text-center">
          <Download className="w-16 h-16 text-muted-foreground/30 mb-4" />
          <h2 className="text-xl font-semibold mb-2">No downloads yet</h2>
          <p className="text-muted-foreground mb-6 max-w-sm">
            Download movies from the movie detail page to watch them offline.
          </p>
          <Link href="/browse">
            <Button data-testid="button-browse-movies">Browse Movies</Button>
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {items.map((item) => (
            <Card key={item.id} className="flex items-center gap-4 p-3" data-testid={`card-download-${item.tmdbId}`}>
              <Link href={`/movie/${item.tmdbId}`}>
                <div className="w-16 h-24 rounded-md overflow-hidden shrink-0">
                  <img
                    src={item.posterUrl}
                    alt={item.title}
                    className="w-full h-full object-cover"
                  />
                </div>
              </Link>
              <div className="flex-1 min-w-0">
                <Link href={`/movie/${item.tmdbId}`}>
                  <h3 className="font-medium truncate">{item.title}</h3>
                </Link>
                <div className="flex items-center gap-2 mt-1 flex-wrap">
                  {item.rating && (
                    <span className="flex items-center gap-0.5 text-xs text-muted-foreground">
                      <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                      {item.rating}
                    </span>
                  )}
                  {item.year && <span className="text-xs text-muted-foreground">{item.year}</span>}
                  <Badge variant="secondary" className="text-xs">{item.quality || "HD"}</Badge>
                  <span className="flex items-center gap-1 text-xs text-green-500">
                    <CheckCircle className="w-3 h-3" />
                    Downloaded
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <Link href={`/movie/${item.tmdbId}`}>
                  <Button size="icon" variant="ghost" data-testid={`button-play-download-${item.tmdbId}`}>
                    <Play className="w-4 h-4" />
                  </Button>
                </Link>
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={() => removeMutation.mutate(item.tmdbId)}
                  data-testid={`button-remove-download-${item.tmdbId}`}
                >
                  <Trash2 className="w-4 h-4 text-destructive" />
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
