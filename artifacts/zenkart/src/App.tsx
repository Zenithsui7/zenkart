import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/context/auth-context";
import { ThemeProvider } from "@/context/theme-context";
import { MainLayout } from "@/components/layout/main-layout";
import NotFound from "@/pages/not-found";

// Pages
import Home from "@/pages/home";
import Products from "@/pages/products";
import ProductDetail from "@/pages/product-detail";
import Categories from "@/pages/categories";
import Cart from "@/pages/cart";
import Profile from "@/pages/profile";
import Login from "@/pages/login";
import Orders from "@/pages/orders";
import OrderDetail from "@/pages/order-detail";
import Wishlist from "@/pages/wishlist";
import Wallet from "@/pages/wallet";
import Notifications from "@/pages/notifications";
import Listings from "@/pages/listings";
import ListingDetail from "@/pages/listing-detail";
import NewListing from "@/pages/new-listing";
import ResellerHub from "@/pages/reseller";
import SellerDashboard from "@/pages/seller";
import ChatList from "@/pages/chat-list";
import ChatThread from "@/pages/chat-thread";
import Checkout from "@/pages/checkout";

const queryClient = new QueryClient();

function Router() {
  return (
    <MainLayout>
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/products" component={Products} />
        <Route path="/products/:id" component={ProductDetail} />
        <Route path="/categories" component={Categories} />
        <Route path="/cart" component={Cart} />
        <Route path="/checkout" component={Checkout} />
        <Route path="/profile" component={Profile} />
        <Route path="/login" component={Login} />
        <Route path="/orders" component={Orders} />
        <Route path="/orders/:id" component={OrderDetail} />
        <Route path="/wishlist" component={Wishlist} />
        <Route path="/wallet" component={Wallet} />
        <Route path="/notifications" component={Notifications} />
        <Route path="/listings" component={Listings} />
        <Route path="/listings/new" component={NewListing} />
        <Route path="/listings/:id" component={ListingDetail} />
        <Route path="/reseller" component={ResellerHub} />
        <Route path="/seller" component={SellerDashboard} />
        <Route path="/chat" component={ChatList} />
        <Route path="/chat/:id" component={ChatThread} />
        
        <Route component={NotFound} />
      </Switch>
    </MainLayout>
  );
}

function App() {
  return (
    <ThemeProvider defaultTheme="light" storageKey="zenkart-theme">
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <TooltipProvider>
            <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
              <Router />
            </WouterRouter>
            <Toaster />
          </TooltipProvider>
        </AuthProvider>
      </QueryClientProvider>
    </ThemeProvider>
  );
}

export default App;
