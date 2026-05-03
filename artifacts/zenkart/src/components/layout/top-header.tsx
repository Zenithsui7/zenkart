import { Link, useLocation } from "wouter";
import { Search, ShoppingCart, Bell, User, ChevronDown, Tag, Repeat2, Store, List, Sun, Moon } from "lucide-react";
import { useGetCart, useListNotifications } from "@workspace/api-client-react";
import { useAuth } from "@/context/auth-context";
import { useState, useRef, useEffect } from "react";
import { useTheme } from "@/context/theme-context";
import { cn } from "@/lib/utils";

export function TopHeader() {
  const { user } = useAuth();
  const [location, setLocation] = useLocation();
  const [search, setSearch] = useState("");
  const [showUserMenu, setShowUserMenu] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const { theme, setTheme } = useTheme();

  const { data: cart } = useGetCart({ query: { enabled: !!user } });
  const { data: notifications } = useListNotifications({ query: { enabled: !!user } });

  const unreadCount = notifications?.filter(n => !n.isRead).length || 0;
  const cartCount = cart?.itemCount || 0;

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setShowUserMenu(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (search.trim()) setLocation(`/products?search=${encodeURIComponent(search)}`);
  };

  const navLinks = [
    { label: "Today's Deals", href: "/products?isFlashSale=true", icon: Tag },
    { label: "Used Goods", href: "/listings", icon: List },
    { label: "Reseller", href: "/reseller", icon: Repeat2 },
    { label: "Sell on ZenKart", href: "/seller", icon: Store },
  ];

  return (
    <header className="sticky top-0 z-50 w-full shadow-md">
      {/* Main header row */}
      <div className="bg-primary text-primary-foreground">
        <div className="max-w-screen-2xl mx-auto flex items-center gap-4 h-16 px-4 lg:px-6">
          {/* Logo */}
          <Link href="/" className="font-heading font-bold text-2xl tracking-tight text-white shrink-0 flex items-center gap-1">
            <span className="text-secondary">Zen</span>Kart
          </Link>

          {/* Search bar — prominent on desktop */}
          <form onSubmit={handleSearch} className="flex-1 max-w-3xl hidden sm:block">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground z-10" />
              <input
                type="text"
                placeholder="Search for products, brands, and more..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full bg-white text-foreground rounded-lg h-10 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-secondary border-none"
                data-testid="input-global-search"
              />
              <button
                type="submit"
                className="absolute right-0 top-0 h-10 px-4 bg-secondary text-secondary-foreground rounded-r-lg font-semibold text-sm hover:bg-secondary/90 transition-colors"
              >
                Search
              </button>
            </div>
          </form>

          {/* Right actions */}
          <div className="flex items-center gap-1 lg:gap-2 ml-auto sm:ml-0">
            {/* Theme toggle */}
            <button
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="p-2 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition-colors"
              aria-label="Toggle theme"
            >
              {theme === "dark" ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>

            {/* Notifications */}
            <Link href="/notifications" className="relative p-2 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition-colors">
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 flex items-center justify-center w-4 h-4 text-[9px] font-bold text-white bg-red-500 rounded-full">
                  {unreadCount > 9 ? "9+" : unreadCount}
                </span>
              )}
            </Link>

            {/* Cart */}
            <Link href="/cart" className="relative p-2 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition-colors flex items-center gap-1.5">
              <ShoppingCart className="w-5 h-5" />
              {cartCount > 0 && (
                <span className="absolute top-1 right-1 flex items-center justify-center w-4 h-4 text-[9px] font-bold text-white bg-secondary rounded-full">
                  {cartCount}
                </span>
              )}
              <span className="hidden lg:block text-sm font-medium text-white">
                Cart{cartCount > 0 ? ` (${cartCount})` : ""}
              </span>
            </Link>

            {/* Account */}
            {user ? (
              <div className="relative" ref={userMenuRef}>
                <button
                  onClick={() => setShowUserMenu(v => !v)}
                  className="flex items-center gap-1.5 p-2 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition-colors"
                >
                  <div className="w-7 h-7 rounded-full bg-secondary text-secondary-foreground flex items-center justify-center text-sm font-bold">
                    {user.name.charAt(0)}
                  </div>
                  <span className="hidden lg:block text-sm font-medium text-white max-w-[100px] truncate">{user.name.split(" ")[0]}</span>
                  <ChevronDown className="w-3 h-3 text-white/60 hidden lg:block" />
                </button>
                {showUserMenu && (
                  <div className="absolute right-0 top-full mt-1 w-52 bg-popover border border-border rounded-xl shadow-xl py-2 z-50">
                    <div className="px-4 py-2 border-b border-border mb-1">
                      <p className="font-semibold text-sm">{user.name}</p>
                      <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                    </div>
                    {[
                      { label: "My Profile", href: "/profile" },
                      { label: "My Orders", href: "/orders" },
                      { label: "Wishlist", href: "/wishlist" },
                      { label: "Wallet", href: "/wallet" },
                      { label: "Seller Dashboard", href: "/seller" },
                    ].map(item => (
                      <Link key={item.href} href={item.href} onClick={() => setShowUserMenu(false)}
                        className="block px-4 py-2 text-sm hover:bg-muted transition-colors">
                        {item.label}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <Link href="/login"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-secondary text-secondary-foreground text-sm font-semibold hover:bg-secondary/90 transition-colors">
                <User className="w-4 h-4" />
                <span>Login</span>
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Secondary nav — desktop category bar */}
      <div className="bg-primary/90 border-t border-white/10 hidden md:block">
        <div className="max-w-screen-2xl mx-auto flex items-center gap-1 px-4 lg:px-6 h-10">
          {navLinks.map(({ label, href, icon: Icon }) => {
            const isActive = location === href || location.startsWith(href);
            return (
              <Link key={href} href={href}
                className={cn(
                  "flex items-center gap-1.5 px-3 h-full text-sm font-medium transition-colors rounded-sm",
                  isActive
                    ? "text-secondary bg-white/10"
                    : "text-white/75 hover:text-white hover:bg-white/10"
                )}
              >
                <Icon className="w-3.5 h-3.5" />
                {label}
              </Link>
            );
          })}
          <div className="ml-auto flex items-center gap-4 text-xs text-white/60">
            <span className="flex items-center gap-1">🔒 100% Secure Payments</span>
            <span className="flex items-center gap-1">📦 Free Delivery above ₹499</span>
            <span className="flex items-center gap-1">↩️ 7-Day Returns</span>
          </div>
        </div>
      </div>

      {/* Mobile search row */}
      <div className="bg-primary/95 px-3 pb-2 sm:hidden">
        <form onSubmit={handleSearch}>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search products..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full bg-white text-foreground rounded-lg h-9 pl-9 pr-4 text-sm focus:outline-none"
            />
          </div>
        </form>
      </div>
    </header>
  );
}
