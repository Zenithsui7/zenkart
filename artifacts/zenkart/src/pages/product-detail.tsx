import { useGetProduct, useAddToCart, useGetRelatedProducts, getGetCartQueryKey } from "@workspace/api-client-react";
import { useParams, Link } from "wouter";
import { Button } from "@/components/ui/button";
import { StarRating } from "@/components/ui/star-rating";
import { formatINR } from "@/lib/format";
import useEmblaCarousel from "embla-carousel-react";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { ShoppingCart, Heart, Truck, RotateCcw, Shield, ChevronRight, Check, Minus, Plus } from "lucide-react";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { ProductCard } from "@/components/product-card";

export default function ProductDetail() {
  const { id } = useParams<{ id: string }>();
  const productId = Number(id);
  const { data: product, isLoading } = useGetProduct(productId, { query: { enabled: !!productId } });
  const { data: related } = useGetRelatedProducts(productId, { query: { enabled: !!productId } });
  const [emblaRef, emblaApi] = useEmblaCarousel();
  const [selectedImg, setSelectedImg] = useState(0);
  const queryClient = useQueryClient();
  const addToCart = useAddToCart();
  const [qty, setQty] = useState(1);

  if (isLoading) {
    return (
      <div className="p-6 md:p-8">
        <div className="grid md:grid-cols-2 gap-8">
          <div className="aspect-square bg-muted animate-pulse rounded-2xl" />
          <div className="space-y-4">
            <div className="h-8 bg-muted animate-pulse rounded w-3/4" />
            <div className="h-6 bg-muted animate-pulse rounded w-1/3" />
            <div className="h-10 bg-muted animate-pulse rounded w-1/2" />
            <div className="h-32 bg-muted animate-pulse rounded" />
          </div>
        </div>
      </div>
    );
  }

  if (!product) return <div className="p-8 text-center text-muted-foreground">Product not found</div>;

  const handleAddToCart = () => {
    addToCart.mutate({ data: { productId, quantity: qty } }, {
      onSuccess: () => {
        toast.success(`${qty} item${qty > 1 ? "s" : ""} added to cart!`);
        queryClient.invalidateQueries({ queryKey: getGetCartQueryKey() });
      },
      onError: () => toast.error("Failed to add to cart"),
    });
  };

  return (
    <div className="pb-8">
      {/* Breadcrumb */}
      <div className="px-4 md:px-8 py-3 flex items-center gap-1.5 text-xs text-muted-foreground border-b border-border">
        <Link href="/" className="hover:text-foreground">Home</Link>
        <ChevronRight className="w-3 h-3" />
        <Link href={`/products?categoryId=${product.categoryId}`} className="hover:text-foreground">{product.categoryName}</Link>
        <ChevronRight className="w-3 h-3" />
        <span className="text-foreground font-medium line-clamp-1">{product.title}</span>
      </div>

      <div className="px-4 md:px-8 py-6">
        <div className="grid md:grid-cols-2 lg:grid-cols-[1fr_1.2fr] gap-8 xl:gap-12">

          {/* Left: Images */}
          <div className="space-y-3">
            {/* Main image */}
            <div className="overflow-hidden rounded-2xl bg-muted border border-border" ref={emblaRef}>
              <div className="flex">
                {product.images.map((img, i) => (
                  <div key={i} className="flex-[0_0_100%] min-w-0">
                    <img src={img} alt={`${product.title} ${i + 1}`} className="w-full aspect-square object-cover" />
                  </div>
                ))}
              </div>
            </div>
            {/* Thumbnails */}
            {product.images.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-1">
                {product.images.map((img, i) => (
                  <button key={i}
                    onClick={() => { setSelectedImg(i); emblaApi?.scrollTo(i); }}
                    className={`w-16 h-16 rounded-lg overflow-hidden border-2 shrink-0 transition-all ${selectedImg === i ? "border-secondary" : "border-border hover:border-secondary/50"}`}>
                    <img src={img} alt={`thumb-${i}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right: Product info */}
          <div className="space-y-5">
            {/* Brand + title */}
            <div>
              <div className="text-sm font-semibold text-secondary uppercase tracking-wide mb-1">{product.brand}</div>
              <h1 className="font-heading font-bold text-xl md:text-2xl leading-snug">{product.title}</h1>
              <div className="flex items-center gap-3 mt-2">
                <StarRating rating={product.rating} />
                <span className="text-sm text-muted-foreground">({product.reviewCount.toLocaleString("en-IN")} ratings)</span>
                {product.badge && <Badge variant="destructive">{product.badge}</Badge>}
              </div>
            </div>

            {/* Price */}
            <div className="bg-muted/50 rounded-xl p-4">
              <div className="flex items-baseline gap-3">
                <span className="text-3xl font-bold">{formatINR(product.price)}</span>
                {product.mrp > product.price && (
                  <>
                    <span className="text-base text-muted-foreground line-through">{formatINR(product.mrp)}</span>
                    <Badge className="bg-green-600 text-white">{product.discountPercent}% OFF</Badge>
                  </>
                )}
              </div>
              {product.mrp > product.price && (
                <p className="text-sm text-green-600 font-medium mt-1">
                  You save {formatINR(product.mrp - product.price)}
                </p>
              )}
            </div>

            {/* Description */}
            <div>
              <h3 className="font-semibold text-sm mb-2 text-muted-foreground uppercase tracking-wide">About this item</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{product.description}</p>
            </div>

            {/* Delivery info */}
            <div className="grid grid-cols-3 gap-3">
              {[
                { icon: Truck, title: "Free Delivery", sub: "Above ₹499" },
                { icon: RotateCcw, title: "7-Day Return", sub: "Hassle-free" },
                { icon: Shield, title: "Secure Pay", sub: "100% safe" },
              ].map(({ icon: Icon, title, sub }) => (
                <div key={title} className="flex flex-col items-center text-center p-3 bg-muted/50 rounded-xl border border-border">
                  <Icon className="w-5 h-5 text-secondary mb-1" />
                  <span className="text-xs font-semibold">{title}</span>
                  <span className="text-xs text-muted-foreground">{sub}</span>
                </div>
              ))}
            </div>

            {/* Stock indicator */}
            {product.stock < 20 && (
              <div className="flex items-center gap-2 text-sm text-orange-600 font-medium">
                <span className="inline-block w-2 h-2 rounded-full bg-orange-500 animate-pulse" />
                Only {product.stock} left in stock — order soon!
              </div>
            )}

            {/* Qty selector */}
            <div className="flex items-center gap-3">
              <span className="text-sm font-medium">Quantity:</span>
              <div className="flex items-center border border-border rounded-lg overflow-hidden">
                <button onClick={() => setQty(v => Math.max(1, v - 1))} className="w-9 h-9 flex items-center justify-center hover:bg-muted transition-colors">
                  <Minus className="w-4 h-4" />
                </button>
                <span className="w-10 text-center font-semibold text-sm">{qty}</span>
                <button onClick={() => setQty(v => Math.min(product.stock, v + 1))} className="w-9 h-9 flex items-center justify-center hover:bg-muted transition-colors">
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* CTA buttons */}
            <div className="flex gap-3">
              <Button variant="outline" size="lg" className="w-12 h-12 shrink-0 rounded-xl p-0">
                <Heart className="w-5 h-5" />
              </Button>
              <Button size="lg" className="flex-1 rounded-xl font-bold text-base h-12" onClick={handleAddToCart} disabled={addToCart.isPending}>
                <ShoppingCart className="w-5 h-5 mr-2" />
                {addToCart.isPending ? "Adding..." : "Add to Cart"}
              </Button>
              <Link href="/checkout" className="flex-1">
                <Button size="lg" variant="secondary" className="w-full rounded-xl font-bold text-base h-12">
                  Buy Now
                </Button>
              </Link>
            </div>

            {/* Highlights */}
            {product.highlights && (
              <div className="space-y-2">
                {product.highlights.map((h: string) => (
                  <div key={h} className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Check className="w-4 h-4 text-green-600 shrink-0" />
                    {h}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Specifications */}
        {product.specifications && Object.keys(product.specifications).length > 0 && (
          <div className="mt-10">
            <h2 className="font-heading font-bold text-xl mb-4">Specifications</h2>
            <div className="bg-card border border-border rounded-xl overflow-hidden">
              {Object.entries(product.specifications).map(([key, val], i) => (
                <div key={key} className={`flex text-sm ${i % 2 === 0 ? "bg-muted/30" : ""}`}>
                  <span className="w-40 md:w-56 px-4 py-3 font-medium text-muted-foreground shrink-0">{key}</span>
                  <span className="px-4 py-3">{String(val)}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Related products */}
        {related && related.length > 0 && (
          <div className="mt-10">
            <h2 className="font-heading font-bold text-xl mb-4">Related Products</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 md:gap-4">
              {related.map(p => <ProductCard key={p.id} product={p} />)}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
