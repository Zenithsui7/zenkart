import { Link, useLocation } from "wouter";
import { Home, Grid, PlusCircle, ShoppingBag, User } from "lucide-react";
import { cn } from "@/lib/utils";

export function BottomNav() {
  const [location] = useLocation();

  const navItems = [
    { name: "Home", path: "/", icon: Home },
    { name: "Categories", path: "/categories", icon: Grid },
    { name: "Sell", path: "/listings/new", icon: PlusCircle },
    { name: "Orders", path: "/orders", icon: ShoppingBag },
    { name: "Profile", path: "/profile", icon: User },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-background border-t border-border pb-safe md:hidden">
      <nav className="flex justify-around items-center h-16 max-w-md mx-auto md:max-w-none">
        {navItems.map((item) => {
          const isActive = location === item.path || (item.path !== "/" && location.startsWith(item.path));
          const Icon = item.icon;
          return (
            <Link
              key={item.path}
              href={item.path}
              className={cn(
                "flex flex-col items-center justify-center w-full h-full space-y-1 transition-colors",
                isActive ? "text-secondary" : "text-muted-foreground hover:text-foreground"
              )}
              data-testid={`nav-${item.name.toLowerCase()}`}
            >
              <Icon className="w-5 h-5" />
              <span className="text-[10px] font-medium">{item.name}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
