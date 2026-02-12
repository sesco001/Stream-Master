import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Film, Play, Download, Heart, Monitor, Shield, Zap } from "lucide-react";
import heroImage from "@assets/landing-hero.png";

export default function Landing() {
  return (
    <div className="min-h-screen bg-background">
      <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 md:px-12 py-4 bg-background/60 backdrop-blur-xl border-b border-border/30">
        <div className="flex items-center gap-2">
          <Film className="w-7 h-7 text-primary" />
          <span className="font-bold text-xl tracking-tight">CineVault</span>
        </div>
        <a href="/api/login" data-testid="button-nav-login">
          <Button>Sign In</Button>
        </a>
      </nav>

      <section className="relative w-full min-h-[90vh] flex items-center" data-testid="section-landing-hero">
        <img
          src={heroImage}
          alt=""
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/70 to-black/40" />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-black/30" />

        <div className="relative z-10 max-w-3xl px-6 md:px-12 lg:px-16 pt-20">
          <p className="text-primary font-semibold text-sm uppercase tracking-widest mb-4">
            Unlimited Movies
          </p>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-tight tracking-tight font-serif mb-6">
            Your Personal Cinema,{" "}
            <span className="text-primary">Anywhere</span>
          </h1>
          <p className="text-gray-300 text-lg md:text-xl leading-relaxed max-w-xl mb-8">
            Stream hundreds of thousands of movies, build your watchlist, and download your favorites. All in one place.
          </p>
          <div className="flex items-center gap-4 flex-wrap">
            <a href="/api/login" data-testid="button-hero-get-started">
              <Button size="lg" className="text-base px-8">
                <Play className="w-5 h-5 mr-2" />
                Get Started Free
              </Button>
            </a>
          </div>
          <div className="flex items-center gap-6 mt-6 text-sm text-gray-400 flex-wrap">
            <span className="flex items-center gap-1.5">
              <Shield className="w-4 h-4" />
              Free forever
            </span>
            <span className="flex items-center gap-1.5">
              <Zap className="w-4 h-4" />
              No credit card required
            </span>
          </div>
        </div>
      </section>

      <section className="py-20 px-6 md:px-12">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-4 font-serif">
            Everything You Need
          </h2>
          <p className="text-muted-foreground text-center max-w-xl mx-auto mb-14 text-lg">
            A complete movie experience built for film lovers
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="p-8 text-center space-y-4">
              <div className="w-14 h-14 rounded-md bg-primary/10 flex items-center justify-center mx-auto">
                <Monitor className="w-7 h-7 text-primary" />
              </div>
              <h3 className="font-semibold text-lg">Stream Instantly</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                Watch trailers and previews right in the app. No redirects, no pop-ups - a true cinema experience.
              </p>
            </Card>

            <Card className="p-8 text-center space-y-4">
              <div className="w-14 h-14 rounded-md bg-primary/10 flex items-center justify-center mx-auto">
                <Heart className="w-7 h-7 text-primary" />
              </div>
              <h3 className="font-semibold text-lg">Build Your Watchlist</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                Save movies you love to your personal watchlist. Never lose track of what you want to watch next.
              </p>
            </Card>

            <Card className="p-8 text-center space-y-4">
              <div className="w-14 h-14 rounded-md bg-primary/10 flex items-center justify-center mx-auto">
                <Download className="w-7 h-7 text-primary" />
              </div>
              <h3 className="font-semibold text-lg">Download Movies</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                Download your favorites for offline viewing. Choose your quality and enjoy movies anywhere.
              </p>
            </Card>
          </div>
        </div>
      </section>

      <footer className="border-t py-8 px-6 md:px-12">
        <div className="max-w-6xl mx-auto flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-2 text-muted-foreground text-sm">
            <Film className="w-4 h-4" />
            <span>CineVault 2026</span>
          </div>
          <p className="text-muted-foreground text-xs">
            Powered by TMDB. This product uses the TMDB API but is not endorsed or certified by TMDB.
          </p>
        </div>
      </footer>
    </div>
  );
}
