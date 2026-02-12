import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Star, Trash2, Play, Heart } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";

interface WatchlistItem {
  id: string;
  tmdbId: number;
  title: string;
  posterUrl: string;
  rating: string | null;
  year: string | null;
}

export default function MyList() {
  const { toast } = useToast();

  const { data: items, isLoading } = useQuery<WatchlistItem[]>({
    queryKey: ["/api/watchlist"],
  });

  const removeMutation = useMutation({
    mutationFn: async (tmdbId: number) => {
      await apiRequest("DELETE", `/api/watchlist/${tmdbId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/watchlist"] });
      toast({ title: "Removed from your list" });
    },
  });

  return (
    <div className="max-w-[1400px] mx-auto px-4 py-8" data-testid="page-my-list">
      <div className="flex items-center gap-3 mb-8">
        <Heart className="w-6 h-6 text-primary" />
        <h1 className="text-2xl font-bold tracking-tight">My List</h1>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          {Array.from({ length: 12 }).map((_, i) => (
            <Skeleton key={i} className="aspect-[3/4] rounded-md" />
          ))}
        </div>
      ) : !items || items.length === 0 ? (
        <div className="flex flex-col items-center justify-center min-h-[40vh] text-center">
          <Heart className="w-16 h-16 text-muted-foreground/30 mb-4" />
          <h2 className="text-xl font-semibold mb-2">Your list is empty</h2>
          <p className="text-muted-foreground mb-6 max-w-sm">
            Browse movies and add them to your list to keep track of what you want to watch.
          </p>
          <Link href="/browse">
            <Button data-testid="button-browse-movies">Browse Movies</Button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          {items.map((item) => (
            <Card key={item.id} className="overflow-hidden group relative" data-testid={`card-watchlist-${item.tmdbId}`}>
              <Link href={`/movie/${item.tmdbId}`}>
                <div className="aspect-[3/4] relative">
                  <img
                    src={item.posterUrl}
                    alt={item.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center">
                    <Play className="w-10 h-10 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                </div>
              </Link>
              <div className="p-3 space-y-1.5">
                <h3 className="font-medium text-sm truncate">{item.title}</h3>
                <div className="flex items-center justify-between flex-wrap gap-1">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    {item.rating && (
                      <span className="flex items-center gap-0.5">
                        <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                        {item.rating}
                      </span>
                    )}
                    {item.year && <span>{item.year}</span>}
                  </div>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-7 w-7"
                    onClick={(e) => {
                      e.preventDefault();
                      removeMutation.mutate(item.tmdbId);
                    }}
                    data-testid={`button-remove-watchlist-${item.tmdbId}`}
                  >
                    <Trash2 className="w-3.5 h-3.5 text-destructive" />
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
