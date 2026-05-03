import { useAuth } from "@/context/auth-context";
import { Button } from "@/components/ui/button";
import { useLogoutUser } from "@workspace/api-client-react";
import { useLocation, Link } from "wouter";
import {
  ShoppingBag, Wallet, Heart, Store, Package, Bell, MessageCircle,
  ChevronRight, LogOut, User as UserIcon
} from "lucide-react";

export default function Profile() {
  const { user, logout } = useAuth();
  const [, setLocation] = useLocation();
  const logoutMut = useLogoutUser();

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
        <UserIcon className="w-16 h-16 text-muted-foreground/30 mb-4" />
        <h2 className="text-xl font-heading font-bold mb-2">Sign in to your account</h2>
        <p className="text-muted-foreground mb-6">Access your orders, wishlist, wallet and more</p>
        <Button onClick={() => setLocation("/login")} size="lg" className="rounded-xl font-bold">Login / Sign up</Button>
      </div>
    );
  }

  const handleLogout = () => {
    logoutMut.mutate(undefined, {
      onSuccess: () => { logout(); setLocation("/"); }
    });
  };

  const menuSections = [
    {
      title: "Orders & Shopping",
      items: [
        { label: "My Orders", sub: "Track, return, or buy again", href: "/orders", icon: ShoppingBag },
        { label: "Wishlist", sub: "Saved items for later", href: "/wishlist", icon: Heart },
        { label: "Cart", sub: "Items waiting for checkout", href: "/cart", icon: Package },
      ]
    },
    {
      title: "Money",
      items: [
        { label: "Wallet", sub: `Balance: ₹${user.walletBalance}`, href: "/wallet", icon: Wallet },
      ]
    },
    {
      title: "Seller & Reseller",
      items: [
        { label: "Seller Dashboard", sub: "Manage your store & listings", href: "/seller", icon: Store },
        { label: "Reseller Hub", sub: "Earn commissions by sharing", href: "/reseller", icon: Package },
        { label: "Post Used Goods", sub: "Sell your pre-owned items", href: "/listings/new", icon: Package },
      ]
    },
    {
      title: "Account",
      items: [
        { label: "Notifications", sub: "See your alerts", href: "/notifications", icon: Bell },
        { label: "Messages", sub: "Chat with sellers & buyers", href: "/chat", icon: MessageCircle },
      ]
    },
  ];

  return (
    <div className="p-4 md:p-6 lg:p-8 max-w-screen-lg mx-auto">
      <h1 className="font-heading font-bold text-2xl md:text-3xl mb-6">My Account</h1>

      <div className="grid md:grid-cols-3 gap-6 items-start">

        {/* Profile card */}
        <div className="md:sticky md:top-28 space-y-4">
          <div className="bg-card border border-border rounded-2xl p-6 text-center">
            <div className="w-20 h-20 mx-auto rounded-full bg-primary text-primary-foreground flex items-center justify-center text-3xl font-bold mb-3">
              {user.name.charAt(0)}
            </div>
            <h2 className="font-heading font-bold text-lg">{user.name}</h2>
            <p className="text-sm text-muted-foreground mt-0.5">{user.email}</p>
            {user.phone && <p className="text-sm text-muted-foreground">{user.phone}</p>}

            <div className="grid grid-cols-2 gap-3 mt-5 text-center">
              <div className="bg-muted/50 rounded-xl p-3">
                <div className="font-bold text-lg">₹{user.walletBalance}</div>
                <div className="text-xs text-muted-foreground">Wallet</div>
              </div>
              <div className="bg-muted/50 rounded-xl p-3">
                <div className="font-bold text-lg capitalize">{user.role}</div>
                <div className="text-xs text-muted-foreground">Account type</div>
              </div>
            </div>
          </div>

          <Button
            variant="outline"
            className="w-full rounded-xl border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground"
            onClick={handleLogout}
            disabled={logoutMut.isPending}
          >
            <LogOut className="w-4 h-4 mr-2" />
            {logoutMut.isPending ? "Logging out..." : "Logout"}
          </Button>
        </div>

        {/* Menu sections */}
        <div className="md:col-span-2 space-y-5">
          {menuSections.map(section => (
            <div key={section.title}>
              <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2 px-1">
                {section.title}
              </h3>
              <div className="bg-card border border-border rounded-2xl overflow-hidden divide-y divide-border">
                {section.items.map(({ label, sub, href, icon: Icon }) => (
                  <Link key={href} href={href}>
                    <div className="flex items-center gap-4 px-5 py-4 hover:bg-muted/50 transition-colors cursor-pointer group">
                      <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                        <Icon className="w-4 h-4 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-sm">{label}</div>
                        <div className="text-xs text-muted-foreground">{sub}</div>
                      </div>
                      <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors" />
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
