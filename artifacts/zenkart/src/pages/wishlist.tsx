import { useGetWishlist, useRemoveFromWishlist, getGetWishlistQueryKey } from "@workspace/api-client-react";
import { Link } from "wouter";
import { formatINR } from "@/lib/format";
import { Card, CardContent } from "@/components/ui/card";
import { Heart, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { StarRating } from "@/components/ui/star-rating";

export default function Wishlist() {
  const { data: wishlist, isLoading } = useGetWishlist();
  const removeMut = useRemoveFromWishlist();
  const queryClient = useQueryClient();

  if (isLoading) return <div className="p-4">Loading wishlist...</div>;

  if (!wishlist || wishlist.length === 0) {
    return (
      <div className="p-8 text-center flex flex-col items-center justify-center h-64">
        <Heart className="w-12 h-12 text-muted-foreground mb-4" />
        <h2 className="text-xl font-bold mb-2">Your wishlist is empty</h2>
        <p className="text-muted-foreground mb-4">Save items you like to view them later.</p>
        <Link href="/">
          <Button>Explore Products</Button>
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

  return (
    <div className="p-4 space-y-4">
      <h1 className="font-heading font-bold text-2xl">My Wishlist ({wishlist.length})</h1>
      <div className="grid grid-cols-2 gap-3">
        {wishlist.map(item => (
          <Card key={item.id} className="relative overflow-hidden group">
            <Button 
              variant="secondary" 
              size="icon" 
              className="absolute top-2 right-2 z-10 w-8 h-8 rounded-full shadow-md"
              onClick={() => handleRemove(item.productId)}
            >
              <Trash2 className="w-4 h-4" />
            </Button>
            <Link href={`/products/${item.productId}`}>
              <div className="aspect-square bg-muted">
                <img 
                  src={item.product.images[0] || "https://placehold.co/400"} 
                  alt={item.product.title}
                  className="w-full h-full object-cover"
                />
              </div>
              <CardContent className="p-3">
                <h3 className="font-medium text-sm line-clamp-2 min-h-[40px]">{item.product.title}</h3>
                <div className="mt-1 font-bold">{formatINR(item.product.price)}</div>
                <div className="flex items-center gap-1 mt-1">
                  <StarRating rating={item.product.rating} starClassName="w-3 h-3" />
                  <span className="text-[10px] text-muted-foreground">({item.product.reviewCount})</span>
                </div>
              </CardContent>
            </Link>
          </Card>
        ))}
      </div>
    </div>
  );
}
