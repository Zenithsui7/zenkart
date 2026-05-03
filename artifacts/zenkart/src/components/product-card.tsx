import { Link } from "wouter";
import { Product } from "@workspace/api-client-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { StarRating } from "@/components/ui/star-rating";
import { formatINR } from "@/lib/format";
import { cn } from "@/lib/utils";

interface ProductCardProps {
  product: Product;
  className?: string;
}

export function ProductCard({ product, className }: ProductCardProps) {
  return (
    <Link href={`/products/${product.id}`}>
      <Card className={cn("overflow-hidden hover-elevate cursor-pointer h-full border-border/50 transition-all duration-200", className)} data-testid={`card-product-${product.id}`}>
        <div className="relative aspect-square overflow-hidden bg-muted">
          <img
            src={product.images[0] || "https://placehold.co/400"}
            alt={product.title}
            className="object-cover w-full h-full"
            loading="lazy"
          />
          {product.badge && (
            <Badge className="absolute top-2 left-2 z-10 bg-destructive text-destructive-foreground pointer-events-none">
              {product.badge}
            </Badge>
          )}
        </div>
        <CardContent className="p-3">
          <div className="space-y-1">
            <h3 className="font-semibold text-sm line-clamp-2 min-h-[40px] leading-tight group-hover:text-primary transition-colors">
              {product.title}
            </h3>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-base">{formatINR(product.price)}</span>
                {product.mrp > product.price && (
                  <span className="text-xs text-muted-foreground line-through">
                    {formatINR(product.mrp)}
                  </span>
                )}
              </div>
            </div>
            {product.discountPercent > 0 && (
              <div className="text-xs font-semibold text-secondary">
                {product.discountPercent}% OFF
              </div>
            )}
            <div className="flex items-center gap-1 mt-2">
              <StarRating rating={product.rating} starClassName="w-3 h-3" />
              <span className="text-xs text-muted-foreground">({product.reviewCount})</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

export function ProductCardSkeleton() {
  return (
    <Card className="overflow-hidden border-border/50 h-full">
      <div className="aspect-square bg-muted animate-pulse" />
      <CardContent className="p-3 space-y-2">
        <div className="h-4 bg-muted animate-pulse rounded w-full" />
        <div className="h-4 bg-muted animate-pulse rounded w-2/3" />
        <div className="h-5 bg-muted animate-pulse rounded w-1/3 mt-2" />
      </CardContent>
    </Card>
  );
}
