import { useGetProduct, useAddToCart, getGetCartQueryKey } from "@workspace/api-client-react";
import { useParams } from "wouter";
import { Button } from "@/components/ui/button";
import { StarRating } from "@/components/ui/star-rating";
import { formatINR } from "@/lib/format";
import useEmblaCarousel from "embla-carousel-react";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { ShoppingCart, Heart } from "lucide-react";
import { useState } from "react";

export default function ProductDetail() {
  const { id } = useParams<{ id: string }>();
  const productId = Number(id);
  const { data: product, isLoading } = useGetProduct(productId, { query: { enabled: !!productId } });
  const [emblaRef] = useEmblaCarousel();
  const queryClient = useQueryClient();
  
  const addToCart = useAddToCart();
  const [qty, setQty] = useState(1);

  if (isLoading) {
    return <div className="p-4 animate-pulse h-96 bg-muted rounded-xl m-4" />;
  }

  if (!product) return <div className="p-4 text-center">Product not found</div>;

  const handleAddToCart = () => {
    addToCart.mutate({ data: { productId, quantity: qty } }, {
      onSuccess: () => {
        toast.success("Added to cart!");
        queryClient.invalidateQueries({ queryKey: getGetCartQueryKey() });
      },
      onError: () => {
        toast.error("Failed to add to cart");
      }
    });
  };

  return (
    <div className="pb-24 relative">
      <div className="overflow-hidden" ref={emblaRef}>
        <div className="flex">
          {product.images.map((img, i) => (
            <div key={i} className="flex-[0_0_100%] min-w-0">
              <img src={img} alt={`${product.title} ${i}`} className="w-full aspect-square object-cover" />
            </div>
          ))}
        </div>
      </div>
      
      <div className="p-4 space-y-4">
        <div>
          <h1 className="font-heading font-bold text-xl">{product.title}</h1>
          <div className="flex items-center gap-2 mt-2">
            <StarRating rating={product.rating} />
            <span className="text-sm text-muted-foreground">({product.reviewCount} reviews)</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-2xl font-bold">{formatINR(product.price)}</span>
          {product.mrp > product.price && (
            <>
              <span className="text-sm text-muted-foreground line-through">{formatINR(product.mrp)}</span>
              <span className="text-sm font-bold text-secondary">{product.discountPercent}% OFF</span>
            </>
          )}
        </div>

        <div className="text-sm text-muted-foreground">
          {product.description}
        </div>
      </div>

      <div className="fixed bottom-16 left-0 right-0 max-w-md mx-auto p-4 bg-background border-t border-border flex gap-3">
        <Button variant="outline" size="icon" className="w-12 h-12 shrink-0 rounded-xl">
          <Heart className="w-5 h-5" />
        </Button>
        <Button 
          className="flex-1 h-12 rounded-xl font-bold text-md shadow-lg" 
          onClick={handleAddToCart}
          disabled={addToCart.isPending}
        >
          {addToCart.isPending ? "Adding..." : "Add to Cart"}
        </Button>
      </div>
    </div>
  );
}
