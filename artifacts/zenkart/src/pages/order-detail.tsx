import { useGetOrder } from "@workspace/api-client-react";
import { useParams } from "wouter";
import { formatINR, formatDateTime } from "@/lib/format";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle2, Clock, Truck, Package } from "lucide-react";

export default function OrderDetail() {
  const { id } = useParams<{ id: string }>();
  const orderId = Number(id);
  const { data: order, isLoading } = useGetOrder(orderId, { query: { enabled: !!orderId } });

  if (isLoading) return <div className="p-4">Loading order details...</div>;
  if (!order) return <div className="p-4 text-center">Order not found</div>;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'delivered': return 'bg-secondary text-secondary-foreground';
      case 'cancelled': return 'bg-destructive text-destructive-foreground';
      default: return 'bg-primary/10 text-primary';
    }
  };

  return (
    <div className="p-4 space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="font-heading font-bold text-xl">Order #{order.id}</h1>
          <p className="text-sm text-muted-foreground">{formatDateTime(order.createdAt)}</p>
        </div>
        <Badge className={getStatusColor(order.status)}>{order.status.toUpperCase()}</Badge>
      </div>

      <Card>
        <CardContent className="p-4 space-y-4">
          <h2 className="font-bold text-sm text-muted-foreground uppercase tracking-wider">Tracking Timeline</h2>
          <div className="space-y-4">
            {order.trackingEvents?.map((event, i) => (
              <div key={i} className="flex gap-4">
                <div className="flex flex-col items-center">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${event.isCompleted ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>
                    {event.isCompleted ? <CheckCircle2 className="w-5 h-5" /> : <Clock className="w-4 h-4" />}
                  </div>
                  {i < order.trackingEvents.length - 1 && (
                    <div className={`w-0.5 h-10 ${event.isCompleted ? 'bg-primary' : 'bg-muted'} mt-2`} />
                  )}
                </div>
                <div className="flex-1 pb-4">
                  <div className={`font-bold text-sm ${!event.isCompleted ? 'text-muted-foreground' : ''}`}>{event.status}</div>
                  <div className="text-xs text-muted-foreground mt-0.5">{event.description}</div>
                  <div className="text-[10px] text-muted-foreground mt-1">{formatDateTime(event.timestamp)}</div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4 space-y-4">
          <h2 className="font-bold text-sm text-muted-foreground uppercase tracking-wider">Items</h2>
          <div className="space-y-3">
            {order.items.map((item, i) => (
              <div key={i} className="flex gap-3">
                <img src={item.productImage} alt={item.productTitle} className="w-16 h-16 object-cover rounded" />
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium line-clamp-2">{item.productTitle}</div>
                  <div className="flex justify-between items-center mt-2">
                    <span className="text-xs text-muted-foreground">Qty: {item.quantity}</span>
                    <span className="font-bold text-sm">{formatINR(item.price)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="border-t border-border pt-3 flex justify-between font-bold">
            <span>Total</span>
            <span>{formatINR(order.total)}</span>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4 space-y-4">
          <h2 className="font-bold text-sm text-muted-foreground uppercase tracking-wider">Delivery Details</h2>
          <div className="text-sm">
            <div className="font-medium mb-1">Shipping Address</div>
            <div className="text-muted-foreground whitespace-pre-wrap">{order.deliveryAddress}</div>
          </div>
          {order.courierName && order.trackingNumber && (
            <div className="text-sm">
              <div className="font-medium mb-1">Courier</div>
              <div className="text-muted-foreground">{order.courierName} (Tracking: {order.trackingNumber})</div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
