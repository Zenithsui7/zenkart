import { useGetCart, useRemoveFromCart, getGetCartQueryKey } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { formatINR } from "@/lib/format";
import { Trash2, ShoppingCart, ChevronRight, Truck, Shield, RotateCcw } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { Link } from "wouter";

export default function Cart() {
  const { data: cart, isLoading } = useGetCart();
  const remove = useRemoveFromCart();
  const queryClient = useQueryClient();

  if (isLoading) {
    return (
      <div className="p-6 max-w-screen-xl mx-auto">
        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-32 bg-muted animate-pulse rounded-xl" />
            ))}
          </div>
          <div className="h-64 bg-muted animate-pulse rounded-xl" />
        </div>
      </div>
    );
  }

  if (!cart || cart.items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
        <ShoppingCart className="w-20 h-20 text-muted-foreground/30 mb-5" />
        <h2 className="text-2xl font-heading font-bold mb-2">Your cart is empty</h2>
        <p className="text-muted-foreground mb-6 max-w-sm">
          Looks like you haven't added anything yet. Start exploring thousands of products!
        </p>
        <Link href="/products">
          <Button size="lg" className="rounded-xl font-bold">Start Shopping</Button>
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
    <div className="p-4 md:p-6 lg:p-8 max-w-screen-xl mx-auto">
      {/* Breadcrumb */}
      <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-5">
        <Link href="/" className="hover:text-foreground">Home</Link>
        <ChevronRight className="w-3 h-3" />
        <span className="text-foreground font-medium">Cart ({cart.itemCount} items)</span>
      </div>

      <h1 className="font-heading font-bold text-2xl md:text-3xl mb-6">
        Shopping Cart
        <span className="text-base font-normal text-muted-foreground ml-2">({cart.itemCount} items)</span>
      </h1>

      <div className="grid lg:grid-cols-3 gap-6 lg:gap-8 items-start">

        {/* Cart items — left column */}
        <div className="lg:col-span-2 space-y-3">
          {cart.items.map(item => (
            <div key={item.id}
              className="flex gap-4 bg-card p-4 md:p-5 rounded-2xl border border-border hover:shadow-sm transition-shadow">
              <Link href={`/products/${item.productId}`}>
                <img
                  src={item.product.images[0]}
                  alt={item.product.title}
                  className="w-24 h-24 md:w-28 md:h-28 object-cover rounded-xl shrink-0 hover:opacity-90 transition-opacity"
                />
              </Link>
              <div className="flex-1 min-w-0 flex flex-col justify-between">
                <div>
                  <Link href={`/products/${item.productId}`}>
                    <h3 className="font-medium text-sm md:text-base line-clamp-2 hover:text-primary transition-colors">
                      {item.product.title}
                    </h3>
                  </Link>
                  {item.product.brand && (
                    <p className="text-xs text-muted-foreground mt-0.5">{item.product.brand}</p>
                  )}
                </div>
                <div className="flex items-center justify-between mt-3">
                  <div className="flex items-baseline gap-2">
                    <span className="font-bold text-lg">{formatINR(item.product.price)}</span>
                    {item.product.mrp > item.product.price && (
                      <span className="text-xs text-muted-foreground line-through">{formatINR(item.product.mrp)}</span>
                    )}
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm text-muted-foreground bg-muted px-2 py-0.5 rounded">
                      Qty: {item.quantity}
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 px-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                      onClick={() => handleRemove(item.productId)}
                      disabled={remove.isPending}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          ))}

          {/* Trust badges */}
          <div className="grid grid-cols-3 gap-3 pt-2">
            {[
              { icon: Truck, title: "Free Delivery", sub: "Above ₹499" },
              { icon: RotateCcw, title: "7-Day Returns", sub: "Easy returns" },
              { icon: Shield, title: "Secure Checkout", sub: "100% safe" },
            ].map(({ icon: Icon, title, sub }) => (
              <div key={title} className="flex items-center gap-2 p-3 bg-muted/50 rounded-xl text-sm">
                <Icon className="w-4 h-4 text-secondary shrink-0" />
                <div>
                  <div className="font-semibold text-xs">{title}</div>
                  <div className="text-xs text-muted-foreground">{sub}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Order summary — right column */}
        <div className="lg:sticky lg:top-28">
          <div className="bg-card border border-border rounded-2xl overflow-hidden">
            <div className="px-5 py-4 border-b border-border bg-muted/30">
              <h2 className="font-heading font-bold text-base">Order Summary</h2>
            </div>
            <div className="p-5 space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Subtotal ({cart.itemCount} items)</span>
                <span className="font-medium">{formatINR(cart.subtotal)}</span>
              </div>
              {cart.discount > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Discount</span>
                  <span className="text-green-600 font-medium">-{formatINR(cart.discount)}</span>
                </div>
              )}
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Delivery Charges</span>
                <span className={cart.deliveryCharge === 0 ? "text-green-600 font-medium" : "font-medium"}>
                  {cart.deliveryCharge === 0 ? "FREE" : formatINR(cart.deliveryCharge)}
                </span>
              </div>
              {cart.deliveryCharge === 0 && (
                <p className="text-xs text-green-600 bg-green-50 dark:bg-green-950/30 px-3 py-2 rounded-lg">
                  🎉 You qualify for free delivery!
                </p>
              )}
              <div className="border-t border-border pt-3 mt-1">
                <div className="flex justify-between font-bold text-lg">
                  <span>Total Amount</span>
                  <span>{formatINR(cart.total)}</span>
                </div>
                <p className="text-xs text-muted-foreground mt-1">Inclusive of all taxes</p>
              </div>
            </div>
            <div className="px-5 pb-5">
              <Link href="/checkout">
                <Button className="w-full h-12 rounded-xl text-base font-bold">
                  Proceed to Checkout →
                </Button>
              </Link>
              <Link href="/products">
                <Button variant="outline" className="w-full mt-3 rounded-xl">
                  Continue Shopping
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
