import { useGetWishlist, useRemoveFromWishlist, useAddToCart, getGetCartQueryKey, getGetWishlistQueryKey } from "@workspace/api-client-react";
import { Link } from "wouter";
import { formatINR } from "@/lib/format";
import { Heart, Trash2, ShoppingCart, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { StarRating } from "@/components/ui/star-rating";

export default function Wishlist() {
  const { data: wishlist, isLoading } = useGetWishlist();
  const removeMut = useRemoveFromWishlist();
  const addToCartMut = useAddToCart();
  const queryClient = useQueryClient();

  if (isLoading) {
    return (
      <div className="p-6 max-w-screen-xl mx-auto">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="aspect-[3/4] bg-muted animate-pulse rounded-2xl" />
          ))}
        </div>
      </div>
    );
  }

  if (!wishlist || wishlist.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
        <Heart className="w-16 h-16 text-muted-foreground/30 mb-4" />
        <h2 className="text-2xl font-heading font-bold mb-2">Your wishlist is empty</h2>
        <p className="text-muted-foreground mb-6 max-w-sm">
          Save items you love to your wishlist. Review them anytime and easily move them to your cart.
        </p>
        <Link href="/products">
          <Button size="lg" className="rounded-xl font-bold">Explore Products</Button>
        </Link>
      </div>
    );
  }

  const handleRemove = (productId: number) => {
    removeMut.mutate({ data: { productId } }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getGetWishlistQueryKey() });
        toast.success("Removed from wishlist");
      }
    });
  };

  const handleMoveToCart = (productId: number) => {
    addToCartMut.mutate({ data: { productId, quantity: 1 } }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getGetCartQueryKey() });
        removeMut.mutate({ data: { productId } }, {
          onSuccess: () => queryClient.invalidateQueries({ queryKey: getGetWishlistQueryKey() })
        });
        toast.success("Moved to cart!");
      }
    });
  };

  return (
    <div className="p-4 md:p-6 lg:p-8 max-w-screen-xl mx-auto">
      {/* Breadcrumb */}
      <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-5">
        <Link href="/" className="hover:text-foreground">Home</Link>
        <ChevronRight className="w-3 h-3" />
        <span className="text-foreground font-medium">Wishlist</span>
      </div>

      <div className="flex items-center justify-between mb-6">
        <h1 className="font-heading font-bold text-2xl md:text-3xl">
          My Wishlist
          <span className="text-muted-foreground text-base font-normal ml-2">({wishlist.length} items)</span>
        </h1>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-5">
        {wishlist.map(item => {
          const p = item.product;
          const discount = p.mrp > p.price ? Math.round(((p.mrp - p.price) / p.mrp) * 100) : 0;
          return (
            <div key={item.id} className="group bg-card border border-border rounded-2xl overflow-hidden hover:shadow-lg transition-all duration-200 flex flex-col">
              {/* Image */}
              <div className="relative">
                <Link href={`/products/${item.productId}`}>
                  <div className="aspect-square bg-muted overflow-hidden">
                    <img
                      src={p.images[0] || "https://placehold.co/400"}
                      alt={p.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                </Link>
                {discount > 0 && (
                  <Badge className="absolute top-2 left-2 bg-green-600 text-white text-[10px] border-none">{discount}% OFF</Badge>
                )}
                <button
                  onClick={() => handleRemove(item.productId)}
                  className="absolute top-2 right-2 w-8 h-8 rounded-full bg-white dark:bg-background shadow-md flex items-center justify-center text-muted-foreground hover:text-destructive transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Info */}
              <div className="p-3 flex flex-col flex-1">
                <Link href={`/products/${item.productId}`}>
                  <h3 className="font-medium text-xs leading-snug line-clamp-2 hover:text-primary transition-colors min-h-[32px]">{p.title}</h3>
                </Link>
                <div className="flex items-center gap-1 mt-1.5">
                  <StarRating rating={p.rating} starClassName="w-3 h-3" />
                  <span className="text-[10px] text-muted-foreground">({p.reviewCount})</span>
                </div>
                <div className="flex items-baseline gap-1.5 mt-1.5">
                  <span className="font-bold text-sm">{formatINR(p.price)}</span>
                  {p.mrp > p.price && (
                    <span className="text-[10px] text-muted-foreground line-through">{formatINR(p.mrp)}</span>
                  )}
                </div>
                <div className="mt-auto pt-3 flex gap-1.5">
                  <Button size="sm" className="flex-1 h-8 text-xs rounded-lg font-semibold"
                    onClick={() => handleMoveToCart(item.productId)}
                    disabled={addToCartMut.isPending}>
                    <ShoppingCart className="w-3.5 h-3.5 mr-1" />
                    Move to Cart
                  </Button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
