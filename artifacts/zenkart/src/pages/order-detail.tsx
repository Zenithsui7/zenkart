import { useGetOrder, useCancelOrder } from "@workspace/api-client-react";
import { useParams, Link } from "wouter";
import { formatINR, formatDateTime, formatDate } from "@/lib/format";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  CheckCircle2, Clock, Truck, Package, MapPin, CreditCard, ChevronRight,
  Star, RefreshCcw, Download, AlertTriangle
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { useState } from "react";

const TRACKING_ICONS: Record<string, any> = {
  "Order Placed": Package,
  "Order Confirmed": CheckCircle2,
  "Processing": RefreshCcw,
  "Shipped": Truck,
  "Out for Delivery": Truck,
  "Delivered": CheckCircle2,
};

export default function OrderDetail() {
  const { id } = useParams<{ id: string }>();
  const orderId = Number(id);
  const { data: order, isLoading } = useGetOrder(orderId, { query: { enabled: !!orderId } });
  const cancelOrder = useCancelOrder();
  const queryClient = useQueryClient();
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);

  if (isLoading) {
    return (
      <div className="p-6 max-w-screen-lg mx-auto space-y-4">
        {[1, 2, 3].map(i => <div key={i} className="h-40 bg-muted animate-pulse rounded-2xl" />)}
      </div>
    );
  }
  if (!order) return <div className="p-8 text-center text-muted-foreground">Order not found</div>;

  const canCancel = ["pending", "confirmed"].includes(order.status);
  const isDelivered = order.status === "delivered";

  const handleCancel = () => {
    cancelOrder.mutate({ orderId }, {
      onSuccess: () => {
        toast.success("Order cancelled successfully");
        queryClient.invalidateQueries({ queryKey: ["orders"] });
        setShowCancelConfirm(false);
      },
      onError: () => toast.error("Failed to cancel order")
    });
  };

  return (
    <div className="p-4 md:p-6 lg:p-8 max-w-screen-lg mx-auto">
      {/* Breadcrumb */}
      <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-5">
        <Link href="/" className="hover:text-foreground">Home</Link>
        <ChevronRight className="w-3 h-3" />
        <Link href="/orders" className="hover:text-foreground">My Orders</Link>
        <ChevronRight className="w-3 h-3" />
        <span className="text-foreground font-medium">Order #{order.id}</span>
      </div>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="font-heading font-bold text-xl md:text-2xl">Order #{order.id}</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Placed on {formatDate(order.createdAt)}</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-1.5 text-sm text-primary font-semibold hover:underline">
            <Download className="w-4 h-4" /> Invoice
          </button>
          {canCancel && !showCancelConfirm && (
            <Button variant="outline" size="sm" className="text-destructive border-destructive hover:bg-destructive hover:text-destructive-foreground rounded-xl"
              onClick={() => setShowCancelConfirm(true)}>
              Cancel Order
            </Button>
          )}
        </div>
      </div>

      {/* Cancel confirmation */}
      {showCancelConfirm && (
        <div className="mb-6 p-4 bg-destructive/10 border border-destructive/30 rounded-2xl">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-destructive shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="font-semibold text-sm text-destructive">Cancel this order?</p>
              <p className="text-xs text-muted-foreground mt-0.5">This action cannot be undone. Refund will be processed in 3-5 business days.</p>
              <div className="flex gap-3 mt-3">
                <Button size="sm" variant="destructive" onClick={handleCancel} disabled={cancelOrder.isPending} className="rounded-lg">
                  {cancelOrder.isPending ? "Cancelling..." : "Yes, Cancel"}
                </Button>
                <Button size="sm" variant="outline" onClick={() => setShowCancelConfirm(false)} className="rounded-lg">Keep Order</Button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="grid lg:grid-cols-[1fr_340px] gap-6 items-start">
        {/* ── LEFT ── */}
        <div className="space-y-5">

          {/* Tracking Timeline */}
          <div className="bg-card border border-border rounded-2xl overflow-hidden">
            <div className="px-5 py-4 border-b border-border bg-muted/30 flex items-center justify-between">
              <h2 className="font-bold text-sm uppercase tracking-wide">Order Tracking</h2>
              {order.courierName && order.trackingNumber && (
                <div className="text-xs text-muted-foreground">
                  {order.courierName} • <span className="font-mono font-semibold">{order.trackingNumber}</span>
                </div>
              )}
            </div>
            <div className="p-5">
              <div className="space-y-0">
                {order.trackingEvents?.map((event, i) => {
                  const Icon = TRACKING_ICONS[event.status] ?? Package;
                  const isLast = i === order.trackingEvents.length - 1;
                  return (
                    <div key={i} className="flex gap-4">
                      <div className="flex flex-col items-center">
                        <div className={cn("w-9 h-9 rounded-full flex items-center justify-center border-2 transition-all",
                          event.isCompleted
                            ? "bg-primary border-primary text-primary-foreground"
                            : "bg-background border-border text-muted-foreground")}>
                          {event.isCompleted ? <Icon className="w-4 h-4" /> : <Clock className="w-4 h-4" />}
                        </div>
                        {!isLast && (
                          <div className={cn("w-0.5 flex-1 min-h-[32px] my-1 transition-all", event.isCompleted ? "bg-primary" : "bg-border")} />
                        )}
                      </div>
                      <div className={cn("pb-6 flex-1 min-w-0", isLast && "pb-0")}>
                        <div className={cn("font-bold text-sm", !event.isCompleted && "text-muted-foreground")}>{event.status}</div>
                        <div className="text-xs text-muted-foreground mt-0.5">{event.description}</div>
                        {event.isCompleted && event.timestamp && (
                          <div className="text-[10px] text-muted-foreground/70 mt-1 font-mono">{formatDateTime(event.timestamp)}</div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Items */}
          <div className="bg-card border border-border rounded-2xl overflow-hidden">
            <div className="px-5 py-4 border-b border-border bg-muted/30">
              <h2 className="font-bold text-sm uppercase tracking-wide">Items Ordered</h2>
            </div>
            <div className="divide-y divide-border">
              {order.items.map((item, i) => (
                <div key={i} className="flex gap-4 p-5">
                  <Link href={`/products/${item.productId ?? ""}`}>
                    <img src={item.productImage} alt={item.productTitle}
                      className="w-20 h-20 object-cover rounded-xl shrink-0 border border-border hover:opacity-90 transition-opacity" />
                  </Link>
                  <div className="flex-1 min-w-0">
                    <Link href={`/products/${item.productId ?? ""}`}>
                      <p className="text-sm font-medium line-clamp-2 hover:text-primary transition-colors">{item.productTitle}</p>
                    </Link>
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-xs text-muted-foreground">Qty: {item.quantity}</span>
                      <span className="font-bold text-sm">{formatINR(item.price)}</span>
                    </div>
                    {isDelivered && (
                      <button className="mt-2 flex items-center gap-1 text-xs font-semibold text-primary hover:underline">
                        <Star className="w-3.5 h-3.5" /> Rate & Review
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
            {isDelivered && (
              <div className="px-5 pb-5">
                <Link href="/products">
                  <Button variant="outline" size="sm" className="rounded-xl">Buy Again</Button>
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* ── RIGHT ── */}
        <div className="space-y-5">
          {/* Price breakdown */}
          <div className="bg-card border border-border rounded-2xl overflow-hidden">
            <div className="px-5 py-4 border-b border-border bg-muted/30">
              <h2 className="font-bold text-sm uppercase tracking-wide">Price Details</h2>
            </div>
            <div className="p-5 space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Subtotal</span>
                <span>{formatINR(order.total)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Delivery</span>
                <span className="text-green-600 font-medium">FREE</span>
              </div>
              <div className="border-t border-border pt-3">
                <div className="flex justify-between font-bold">
                  <span>Total</span>
                  <span>{formatINR(order.total)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Delivery address */}
          <div className="bg-card border border-border rounded-2xl overflow-hidden">
            <div className="px-5 py-4 border-b border-border bg-muted/30 flex items-center gap-2">
              <MapPin className="w-4 h-4 text-muted-foreground" />
              <h2 className="font-bold text-sm uppercase tracking-wide">Delivery Address</h2>
            </div>
            <div className="p-5 text-sm text-muted-foreground whitespace-pre-wrap leading-relaxed">
              {order.deliveryAddress}
            </div>
          </div>

          {/* Payment */}
          <div className="bg-card border border-border rounded-2xl overflow-hidden">
            <div className="px-5 py-4 border-b border-border bg-muted/30 flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-muted-foreground" />
              <h2 className="font-bold text-sm uppercase tracking-wide">Payment</h2>
            </div>
            <div className="p-5">
              <p className="text-sm font-semibold capitalize">{order.paymentMethod?.replace("_", " ")}</p>
              <p className="text-xs text-muted-foreground mt-0.5 capitalize">Status: {order.paymentStatus}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
