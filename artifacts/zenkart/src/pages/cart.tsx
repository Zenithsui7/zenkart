import { useGetCart, useRemoveFromCart, getGetCartQueryKey } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { formatINR } from "@/lib/format";
import { Trash2 } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { Link } from "wouter";

export default function Cart() {
  const { data: cart, isLoading } = useGetCart();
  const remove = useRemoveFromCart();
  const queryClient = useQueryClient();

  if (isLoading) return <div className="p-4">Loading cart...</div>;
  if (!cart || cart.items.length === 0) {
    return (
      <div className="p-8 text-center flex flex-col items-center justify-center h-64">
        <h2 className="text-xl font-bold mb-2">Your cart is empty</h2>
        <p className="text-muted-foreground mb-4">Looks like you haven't added anything yet.</p>
        <Link href="/">
          <Button>Start Shopping</Button>
        </Link>
      </div>
    );
  }

  const handleRemove = (id: number) => {
    remove.mutate({ data: { productId: id } }, {
      onSuccess: () => queryClient.invalidateQueries({ queryKey: getGetCartQueryKey() })
    });
  };

  return (
    <div className="p-4 space-y-4">
      <h1 className="font-heading font-bold text-2xl">Your Cart</h1>
      <div className="space-y-3">
        {cart.items.map(item => (
          <div key={item.id} className="flex gap-3 bg-card p-3 rounded-xl border border-border">
            <img src={item.product.images[0]} alt={item.product.title} className="w-20 h-20 object-cover rounded-lg" />
            <div className="flex-1 min-w-0 flex flex-col justify-between">
              <div>
                <h3 className="font-medium text-sm line-clamp-2">{item.product.title}</h3>
                <div className="font-bold mt-1">{formatINR(item.product.price)}</div>
              </div>
              <div className="flex items-center justify-between mt-2">
                <span className="text-xs text-muted-foreground">Qty: {item.quantity}</span>
                <Button variant="ghost" size="sm" className="h-8 px-2 text-destructive" onClick={() => handleRemove(item.productId)}>
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-card border border-border p-4 rounded-xl space-y-2 mt-6">
        <div className="flex justify-between text-sm">
          <span>Subtotal</span>
          <span>{formatINR(cart.subtotal)}</span>
        </div>
        <div className="flex justify-between text-sm text-secondary">
          <span>Discount</span>
          <span>-{formatINR(cart.discount)}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span>Delivery</span>
          <span>{cart.deliveryCharge === 0 ? 'FREE' : formatINR(cart.deliveryCharge)}</span>
        </div>
        <div className="border-t border-border pt-2 mt-2 flex justify-between font-bold text-lg">
          <span>Total</span>
          <span>{formatINR(cart.total)}</span>
        </div>
      </div>

      <Button className="w-full h-12 rounded-xl text-lg font-bold">
        Proceed to Checkout
      </Button>
    </div>
  );
}
