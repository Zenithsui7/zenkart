import { Link } from "wouter";
import { Search, ShoppingCart, Bell } from "lucide-react";
import { useGetCart, useListNotifications } from "@workspace/api-client-react";
import { useAuth } from "@/context/auth-context";

export function TopHeader() {
  const { user } = useAuth();
  
  const { data: cart } = useGetCart({
    query: {
      enabled: !!user,
    }
  });

  const { data: notifications } = useListNotifications({
    query: {
      enabled: !!user,
    }
  });

  const unreadCount = notifications?.filter(n => !n.isRead).length || 0;

  return (
    <header className="sticky top-0 z-50 w-full bg-primary text-primary-foreground shadow-md">
      <div className="flex items-center justify-between h-16 px-4 max-w-md mx-auto w-full gap-4">
        <Link href="/" className="font-heading font-bold text-xl tracking-tight text-white" data-testid="link-home-logo">
          ZenKart
        </Link>
        
        <div className="flex-1 max-w-sm">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search products..."
              className="w-full bg-white/10 border-none rounded-full h-9 pl-9 pr-4 text-sm text-white placeholder:text-white/60 focus:outline-none focus:ring-2 focus:ring-secondary"
              data-testid="input-global-search"
            />
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Link href="/notifications" className="relative p-1" data-testid="link-notifications">
            <Bell className="w-5 h-5 text-white" />
            {unreadCount > 0 && (
              <span className="absolute top-0 right-0 flex items-center justify-center w-4 h-4 text-[10px] font-bold text-white bg-destructive rounded-full border-2 border-primary">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </Link>
          <Link href="/cart" className="relative p-1" data-testid="link-cart">
            <ShoppingCart className="w-5 h-5 text-white" />
            {cart && cart.itemCount > 0 && (
              <span className="absolute top-0 right-0 flex items-center justify-center w-4 h-4 text-[10px] font-bold text-white bg-secondary rounded-full border-2 border-primary">
                {cart.itemCount}
              </span>
            )}
          </Link>
        </div>
      </div>
    </header>
  );
}
