import { useAuth } from "@/context/auth-context";
import { Button } from "@/components/ui/button";
import { useLogoutUser } from "@workspace/api-client-react";
import { useLocation } from "wouter";

export default function Profile() {
  const { user, logout } = useAuth();
  const [, setLocation] = useLocation();
  const logoutMut = useLogoutUser();

  if (!user) {
    return (
      <div className="p-8 text-center">
        <p className="mb-4">Please login to view your profile.</p>
        <Button onClick={() => setLocation("/login")}>Login</Button>
      </div>
    );
  }

  const handleLogout = () => {
    logoutMut.mutate(undefined, {
      onSuccess: () => {
        logout();
        setLocation("/");
      }
    });
  };

  return (
    <div className="p-4 space-y-6">
      <div className="flex items-center gap-4 bg-card p-4 rounded-xl border border-border">
        <div className="w-16 h-16 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-2xl font-bold">
          {user.name.charAt(0)}
        </div>
        <div>
          <h1 className="font-heading font-bold text-xl">{user.name}</h1>
          <p className="text-sm text-muted-foreground">{user.email}</p>
        </div>
      </div>

      <div className="space-y-2">
        <Button variant="outline" className="w-full justify-start" onClick={() => setLocation("/orders")}>
          My Orders
        </Button>
        <Button variant="outline" className="w-full justify-start" onClick={() => setLocation("/wallet")}>
          Wallet (Balance: ₹{user.walletBalance})
        </Button>
        <Button variant="outline" className="w-full justify-start" onClick={() => setLocation("/wishlist")}>
          Wishlist
        </Button>
      </div>

      <Button variant="destructive" className="w-full" onClick={handleLogout} disabled={logoutMut.isPending}>
        Logout
      </Button>
    </div>
  );
}
