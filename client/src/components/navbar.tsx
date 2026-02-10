import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Film, Shield, X } from "lucide-react";
import { Link, useLocation } from "wouter";
import { useState } from "react";

export function Navbar() {
  const [location] = useLocation();
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [, navigate] = useLocation();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/browse?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchOpen(false);
      setSearchQuery("");
    }
  };

  const navLinks = [
    { href: "/", label: "Home" },
    { href: "/browse", label: "Browse" },
  ];

  return (
    <nav
      className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur-xl"
      data-testid="nav-main"
    >
      <div className="max-w-[1400px] mx-auto flex items-center justify-between gap-4 px-4 h-14">
        <div className="flex items-center gap-6">
          <Link href="/">
            <span
              className="flex items-center gap-2 cursor-pointer"
              data-testid="link-logo"
            >
              <Film className="w-6 h-6 text-primary" />
              <span className="font-bold text-lg tracking-tight hidden sm:inline">
                CineVault
              </span>
            </span>
          </Link>
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link key={link.href} href={link.href}>
                <Button
                  variant={location === link.href ? "secondary" : "ghost"}
                  size="sm"
                  data-testid={`link-nav-${link.label.toLowerCase()}`}
                >
                  {link.label}
                </Button>
              </Link>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-2">
          {searchOpen ? (
            <form onSubmit={handleSearch} className="flex items-center gap-2">
              <Input
                type="search"
                placeholder="Search movies..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-48 sm:w-64 h-9"
                autoFocus
                data-testid="input-search"
              />
              <Button
                type="button"
                size="icon"
                variant="ghost"
                onClick={() => { setSearchOpen(false); setSearchQuery(""); }}
                data-testid="button-search-close"
              >
                <X className="w-4 h-4" />
              </Button>
            </form>
          ) : (
            <Button
              size="icon"
              variant="ghost"
              onClick={() => setSearchOpen(true)}
              data-testid="button-search-open"
            >
              <Search className="w-4 h-4" />
            </Button>
          )}
          <Link href="/admin">
            <Button
              variant={location.startsWith("/admin") ? "secondary" : "ghost"}
              size="sm"
              data-testid="link-nav-admin"
            >
              <Shield className="w-4 h-4 mr-1" />
              <span className="hidden sm:inline">Admin</span>
            </Button>
          </Link>
        </div>
      </div>
    </nav>
  );
}
