import { useListOrders } from "@workspace/api-client-react";
import { Link } from "wouter";
import { formatINR, formatDate } from "@/lib/format";
import { Badge } from "@/components/ui/badge";
import { Package, ChevronRight, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { cn } from "@/lib/utils";

const STATUS_STYLES: Record<string, { color: string; dot: string; label: string }> = {
  pending: { color: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400", dot: "bg-yellow-500", label: "Order Placed" },
  confirmed: { color: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400", dot: "bg-blue-500", label: "Confirmed" },
  processing: { color: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400", dot: "bg-purple-500", label: "Processing" },
  shipped: { color: "bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-400", dot: "bg-indigo-500", label: "Shipped" },
  out_for_delivery: { color: "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400", dot: "bg-orange-500 animate-pulse", label: "Out for Delivery" },
  delivered: { color: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400", dot: "bg-green-500", label: "Delivered" },
  cancelled: { color: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400", dot: "bg-red-500", label: "Cancelled" },
};

const FILTER_TABS = [
  { key: "all", label: "All Orders" },
  { key: "active", label: "Active" },
  { key: "delivered", label: "Delivered" },
  { key: "cancelled", label: "Cancelled" },
];

export default function Orders() {
  const { data: orders, isLoading } = useListOrders();
  const [activeTab, setActiveTab] = useState("all");
  const [search, setSearch] = useState("");

  if (isLoading) {
    return (
      <div className="p-6 max-w-screen-lg mx-auto space-y-4">
        {[1, 2, 3].map(i => <div key={i} className="h-40 bg-muted animate-pulse rounded-2xl" />)}
      </div>
    );
  }

  if (!orders || orders.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
        <Package className="w-16 h-16 text-muted-foreground/30 mb-4" />
        <h2 className="text-2xl font-heading font-bold mb-2">No orders yet</h2>
        <p className="text-muted-foreground mb-6">Start shopping to see your orders here.</p>
        <Link href="/products"><Button size="lg" className="rounded-xl font-bold">Shop Now</Button></Link>
      </div>
    );
  }

  const filteredOrders = orders.filter(order => {
    if (activeTab === "active" && ["pending", "confirmed", "processing", "shipped", "out_for_delivery"].includes(order.status)) {/* pass */}
    else if (activeTab !== "all" && order.status !== activeTab) return false;
    if (search && !order.items.some(i => i.productTitle.toLowerCase().includes(search.toLowerCase()))) return false;
    return true;
  });

  return (
    <div className="p-4 md:p-6 lg:p-8 max-w-screen-lg mx-auto">
      <h1 className="font-heading font-bold text-2xl md:text-3xl mb-6">My Orders</h1>

      {/* Filter tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2 mb-5">
        {FILTER_TABS.map(tab => (
          <button key={tab.key} onClick={() => setActiveTab(tab.key)}
            className={cn("px-4 py-2 rounded-full text-sm font-semibold whitespace-nowrap border transition-all shrink-0",
              activeTab === tab.key ? "bg-primary text-primary-foreground border-primary" : "border-border hover:bg-muted")}>
            {tab.label}
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="relative mb-5 max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input type="text" placeholder="Search by product name..."
          value={search} onChange={e => setSearch(e.target.value)}
          className="w-full pl-9 pr-4 py-2 border border-border rounded-xl text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary/30" />
      </div>

      <div className="space-y-4">
        {filteredOrders.map(order => {
          const statusStyle = STATUS_STYLES[order.status] ?? STATUS_STYLES.pending;
          return (
            <Link key={order.id} href={`/orders/${order.id}`}>
              <div className="bg-card border border-border rounded-2xl overflow-hidden hover:shadow-md transition-shadow cursor-pointer group">
                {/* Order header */}
                <div className="flex items-center justify-between px-5 py-3 bg-muted/30 border-b border-border">
                  <div className="flex items-center gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Order </span>
                      <span className="font-bold">#{order.id}</span>
                    </div>
                    <div className="hidden sm:block text-muted-foreground">{formatDate(order.createdAt)}</div>
                    <div className="hidden sm:block">
                      <span className="text-muted-foreground">Total: </span>
                      <span className="font-bold">{formatINR(order.total)}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className={cn("flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold", statusStyle.color)}>
                      <span className={cn("w-1.5 h-1.5 rounded-full", statusStyle.dot)} />
                      {statusStyle.label}
                    </div>
                    <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors" />
                  </div>
                </div>

                {/* Order items */}
                <div className="p-5">
                  <div className="flex gap-4 overflow-x-auto">
                    {order.items.slice(0, 3).map((item, i) => (
                      <div key={i} className="flex gap-3 items-center min-w-0 flex-shrink-0 max-w-xs">
                        <img src={item.productImage} alt={item.productTitle}
                          className="w-16 h-16 rounded-xl object-cover shrink-0 border border-border" />
                        <div className="min-w-0">
                          <p className="text-sm font-medium line-clamp-2 leading-tight">{item.productTitle}</p>
                          <p className="text-xs text-muted-foreground mt-1">Qty: {item.quantity}</p>
                          <p className="text-sm font-bold mt-0.5">{formatINR(item.price)}</p>
                        </div>
                      </div>
                    ))}
                    {order.items.length > 3 && (
                      <div className="flex items-center justify-center w-16 h-16 rounded-xl bg-muted text-muted-foreground text-sm font-semibold shrink-0">
                        +{order.items.length - 3}
                      </div>
                    )}
                  </div>

                  {/* Footer actions */}
                  <div className="flex items-center justify-between mt-4 pt-4 border-t border-border">
                    <div className="sm:hidden text-sm">
                      <span className="text-muted-foreground">Total: </span>
                      <span className="font-bold">{formatINR(order.total)}</span>
                    </div>
                    <div className="flex gap-2 ml-auto">
                      {order.status === "delivered" && (
                        <span className="text-xs px-3 py-1.5 rounded-lg border border-border text-muted-foreground hover:bg-muted cursor-pointer">
                          Rate & Review
                        </span>
                      )}
                      <span className="text-xs px-3 py-1.5 rounded-lg bg-primary/10 text-primary font-semibold hover:bg-primary/20 cursor-pointer">
                        View Details →
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          );
        })}
        {filteredOrders.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">
            <Package className="w-10 h-10 mx-auto mb-3 opacity-30" />
            <p className="font-medium">No orders found</p>
          </div>
        )}
      </div>
    </div>
  );
}
