import { useEffect, useState } from "react";
import { useGetDashboardSummary } from "@workspace/api-client-react";
import { Link } from "wouter";
import useEmblaCarousel from "embla-carousel-react";
import { ProductCard, ProductCardSkeleton } from "@/components/product-card";
import { Button } from "@/components/ui/button";
import { ChevronRight, Clock, MapPin } from "lucide-react";
import { formatINR } from "@/lib/format";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";

export default function Home() {
  const { data: summary, isLoading } = useGetDashboardSummary();
  const [emblaRef] = useEmblaCarousel({ loop: true });

  if (isLoading) {
    return (
      <div className="p-4 space-y-6">
        <div className="h-40 bg-muted animate-pulse rounded-xl" />
        <div className="space-y-3">
          <div className="h-6 bg-muted animate-pulse rounded w-32" />
          <div className="grid grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="aspect-square bg-muted animate-pulse rounded-full" />
            ))}
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <ProductCardSkeleton key={i} />
          ))}
        </div>
      </div>
    );
  }

  if (!summary) return null;

  return (
    <div className="space-y-6 pb-6">
      {/* Banners */}
      <div className="relative">
        <div className="overflow-hidden" ref={emblaRef}>
          <div className="flex">
            {summary.banners.map((banner) => (
              <div key={banner.id} className="flex-[0_0_100%] min-w-0">
                <Link href={banner.actionUrl}>
                  <div className="relative aspect-[21/9] w-full">
                    <img 
                      src={banner.imageUrl} 
                      alt={banner.title}
                      className="object-cover w-full h-full"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex flex-col justify-end p-4">
                      {banner.badgeText && (
                        <Badge className="w-fit mb-2 bg-secondary text-secondary-foreground">
                          {banner.badgeText}
                        </Badge>
                      )}
                      <h2 className="text-white font-heading font-bold text-xl leading-tight">
                        {banner.title}
                      </h2>
                      {banner.subtitle && (
                        <p className="text-white/80 text-sm mt-1">{banner.subtitle}</p>
                      )}
                    </div>
                  </div>
                </Link>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Categories */}
      <section className="px-4">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-heading font-bold text-lg">Categories</h2>
          <Link href="/categories" className="text-sm font-medium text-secondary flex items-center">
            View All <ChevronRight className="w-4 h-4 ml-0.5" />
          </Link>
        </div>
        <div className="grid grid-cols-4 gap-3">
          {summary.categories.slice(0, 8).map((cat) => (
            <Link key={cat.id} href={`/products?categoryId=${cat.id}`} className="flex flex-col items-center gap-1">
              <div className="w-14 h-14 rounded-full bg-muted flex items-center justify-center overflow-hidden border border-border/50">
                {cat.imageUrl ? (
                  <img src={cat.imageUrl} alt={cat.name} className="w-full h-full object-cover" />
                ) : (
                  <span className="text-2xl">{cat.icon}</span>
                )}
              </div>
              <span className="text-xs text-center font-medium line-clamp-1">{cat.name}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* Flash Sale */}
      {summary.flashSale && summary.flashSale.products.length > 0 && (
        <section className="bg-destructive/10 py-4 px-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <h2 className="font-heading font-bold text-lg text-destructive flex items-center gap-1">
                ⚡ Flash Sale
              </h2>
              <FlashSaleTimer endsAt={summary.flashSale.endsAt} />
            </div>
            <Link href="/products?isFlashSale=true" className="text-sm font-medium text-destructive">
              See All
            </Link>
          </div>
          <div className="flex gap-4 overflow-x-auto pb-2 -mx-4 px-4 snap-x hide-scrollbar">
            {summary.flashSale.products.map((product) => (
              <div key={product.id} className="w-[140px] flex-none snap-start">
                <ProductCard product={product} />
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Featured Products */}
      <section className="px-4">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-heading font-bold text-lg">Featured</h2>
          <Link href="/products?isFeatured=true" className="text-sm font-medium text-secondary">
            View All
          </Link>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {summary.featuredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      {/* Recent C2C Listings Teaser */}
      {summary.recentListings && summary.recentListings.length > 0 && (
        <section className="px-4 py-4 bg-muted/30">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-heading font-bold text-lg">Used Goods Near You</h2>
            <Link href="/listings" className="text-sm font-medium text-secondary">
              Browse All
            </Link>
          </div>
          <div className="grid gap-3">
            {summary.recentListings.slice(0, 3).map((listing) => (
              <Link key={listing.id} href={`/listings/${listing.id}`}>
                <Card className="hover-elevate cursor-pointer overflow-hidden border-border/50">
                  <div className="flex h-24">
                    <div className="w-24 h-full bg-muted flex-shrink-0">
                      <img 
                        src={listing.images[0] || "https://placehold.co/200"} 
                        alt={listing.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="p-3 flex flex-col justify-center flex-1 min-w-0">
                      <div className="flex justify-between items-start mb-1">
                        <h3 className="font-semibold text-sm truncate pr-2">{listing.title}</h3>
                        <span className="font-bold text-sm text-primary whitespace-nowrap">{formatINR(listing.price)}</span>
                      </div>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground mt-auto">
                        <MapPin className="w-3 h-3" />
                        <span className="truncate">{listing.city}</span>
                        <span className="mx-1">•</span>
                        <span className="text-xs font-medium uppercase">{listing.condition.replace('_', ' ')}</span>
                      </div>
                    </div>
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Trending */}
      <section className="px-4">
        <h2 className="font-heading font-bold text-lg mb-3">Trending Now</h2>
        <div className="grid grid-cols-2 gap-3">
          {summary.trendingProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

    </div>
  );
}

function FlashSaleTimer({ endsAt }: { endsAt: string }) {
  const [timeLeft, setTimeLeft] = useState<{h: number, m: number, s: number}>({ h: 0, m: 0, s: 0 });

  useEffect(() => {
    const calculateTime = () => {
      const difference = new Date(endsAt).getTime() - new Date().getTime();
      if (difference > 0) {
        setTimeLeft({
          h: Math.floor((difference / (1000 * 60 * 60)) % 24),
          m: Math.floor((difference / 1000 / 60) % 60),
          s: Math.floor((difference / 1000) % 60),
        });
      }
    };
    
    calculateTime();
    const interval = setInterval(calculateTime, 1000);
    return () => clearInterval(interval);
  }, [endsAt]);

  return (
    <div className="flex items-center gap-1 text-xs font-bold font-mono">
      <div className="bg-destructive text-white px-1.5 py-0.5 rounded">{String(timeLeft.h).padStart(2, '0')}</div>:
      <div className="bg-destructive text-white px-1.5 py-0.5 rounded">{String(timeLeft.m).padStart(2, '0')}</div>:
      <div className="bg-destructive text-white px-1.5 py-0.5 rounded">{String(timeLeft.s).padStart(2, '0')}</div>
    </div>
  );
}
