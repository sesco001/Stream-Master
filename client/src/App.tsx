import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { ThemeProvider } from "@/components/theme-provider";
import { ThemeToggle } from "@/components/theme-toggle";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, LogOut } from "lucide-react";
import { useState } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import Home from "@/pages/home";
import Browse from "@/pages/browse";
import MovieDetail from "@/pages/movie-detail";
import Admin from "@/pages/admin";
import Landing from "@/pages/landing";
import MyList from "@/pages/my-list";
import MyDownloads from "@/pages/my-downloads";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/browse" component={Browse} />
      <Route path="/movie/:id" component={MovieDetail} />
      <Route path="/admin" component={Admin} />
      <Route path="/my-list" component={MyList} />
      <Route path="/downloads" component={MyDownloads} />
      <Route component={NotFound} />
    </Switch>
  );
}

function SearchBar() {
  const [query, setQuery] = useState("");
  const [, navigate] = useLocation();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      navigate(`/browse?q=${encodeURIComponent(query.trim())}`);
      setQuery("");
    }
  };

  return (
    <form onSubmit={handleSearch} className="relative w-48 sm:w-64">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
      <Input
        type="search"
        placeholder="Search movies..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="pl-9 h-9"
        data-testid="input-header-search"
      />
    </form>
  );
}

function UserMenu() {
  const { user } = useAuth();

  if (!user) return null;

  const initials = `${(user.firstName || "")[0] || ""}${(user.lastName || "")[0] || ""}`.toUpperCase() || "U";

  return (
    <div className="flex items-center gap-2">
      <Avatar className="w-8 h-8">
        <AvatarImage src={user.profileImageUrl || undefined} alt={user.firstName || "User"} />
        <AvatarFallback className="text-xs">{initials}</AvatarFallback>
      </Avatar>
      <a href="/api/logout">
        <Button size="icon" variant="ghost" data-testid="button-logout">
          <LogOut className="w-4 h-4" />
        </Button>
      </a>
    </div>
  );
}

function AppLayout() {
  const style = {
    "--sidebar-width": "14rem",
    "--sidebar-width-icon": "3rem",
  };

  return (
    <SidebarProvider style={style as React.CSSProperties}>
      <div className="flex h-screen w-full">
        <AppSidebar />
        <div className="flex flex-col flex-1 min-w-0">
          <header className="sticky top-0 z-50 flex items-center justify-between gap-4 px-4 h-14 border-b bg-background/80 backdrop-blur-xl">
            <div className="flex items-center gap-2">
              <SidebarTrigger data-testid="button-sidebar-toggle" />
            </div>
            <div className="flex items-center gap-2">
              <SearchBar />
              <ThemeToggle />
              <UserMenu />
            </div>
          </header>
          <main className="flex-1 overflow-y-auto">
            <Router />
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}

function App() {
  const { user, isLoading } = useAuth();

  return (
    <ThemeProvider>
      <TooltipProvider>
        {isLoading ? (
          <div className="flex items-center justify-center min-h-screen">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : user ? (
          <AppLayout />
        ) : (
          <Landing />
        )}
        <Toaster />
      </TooltipProvider>
    </ThemeProvider>
  );
}

function AppWrapper() {
  return (
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>
  );
}

export default AppWrapper;
