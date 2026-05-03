import { useListOrders } from "@workspace/api-client-react";
import { Link } from "wouter";
import { formatINR, formatDate } from "@/lib/format";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Package } from "lucide-react";

export default function Orders() {
  const { data, isLoading } = useListOrders();

  if (isLoading) {
    return <div className="p-4">Loading orders...</div>;
  }

  if (!data || data.length === 0) {
    return (
      <div className="p-8 text-center flex flex-col items-center justify-center h-64">
        <Package className="w-12 h-12 text-muted-foreground mb-4" />
        <h2 className="text-xl font-bold mb-2">No orders yet</h2>
        <p className="text-muted-foreground mb-4">Start shopping to see your orders here.</p>
        <Link href="/">
          <span className="inline-flex h-10 items-center justify-center rounded-md bg-primary px-8 text-sm font-medium text-primary-foreground">Shop Now</span>
        </Link>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'delivered': return 'bg-secondary text-secondary-foreground';
      case 'cancelled': return 'bg-destructive text-destructive-foreground';
      default: return 'bg-primary/10 text-primary';
    }
  };

  return (
    <div className="p-4 space-y-4">
      <h1 className="font-heading font-bold text-2xl">My Orders</h1>
      <div className="space-y-3">
        {data.map(order => (
          <Link key={order.id} href={`/orders/${order.id}`}>
            <Card className="hover-elevate cursor-pointer border-border/50 transition-all">
              <CardContent className="p-4">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <div className="text-sm text-muted-foreground">Order #{order.id}</div>
                    <div className="text-xs text-muted-foreground">{formatDate(order.createdAt)}</div>
                  </div>
                  <Badge className={getStatusColor(order.status)}>
                    {order.status.toUpperCase()}
                  </Badge>
                </div>
                
                <div className="space-y-3">
                  {order.items.slice(0, 2).map((item, i) => (
                    <div key={i} className="flex gap-3 items-center">
                      <img src={item.productImage} alt={item.productTitle} className="w-12 h-12 rounded object-cover" />
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium line-clamp-1">{item.productTitle}</div>
                        <div className="text-xs text-muted-foreground">Qty: {item.quantity}</div>
                      </div>
                    </div>
                  ))}
                  {order.items.length > 2 && (
                    <div className="text-xs text-center text-muted-foreground">
                      + {order.items.length - 2} more items
                    </div>
                  )}
                </div>

                <div className="mt-4 pt-3 border-t border-border flex justify-between items-center">
                  <div className="text-sm font-medium">Total</div>
                  <div className="font-bold">{formatINR(order.total)}</div>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
