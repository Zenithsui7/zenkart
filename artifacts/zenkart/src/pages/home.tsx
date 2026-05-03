import { useEffect, useState } from "react";
import { useGetDashboardSummary } from "@workspace/api-client-react";
import { Link } from "wouter";
import useEmblaCarousel from "embla-carousel-react";
import { ProductCard, ProductCardSkeleton } from "@/components/product-card";
import { ChevronRight, MapPin, Zap } from "lucide-react";
import { formatINR } from "@/lib/format";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function Home() {
  const { data: summary, isLoading } = useGetDashboardSummary();
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true, duration: 30 });
  const [selectedIndex, setSelectedIndex] = useState(0);

  useEffect(() => {
    if (!emblaApi) return;
    emblaApi.on("select", () => setSelectedIndex(emblaApi.selectedScrollSnap()));
    const id = setInterval(() => emblaApi.scrollNext(), 4000);
    return () => clearInterval(id);
  }, [emblaApi]);

  if (isLoading) {
    return (
      <div className="p-4 md:p-6 space-y-8">
        <div className="h-64 md:h-96 bg-muted animate-pulse rounded-2xl" />
        <div className="grid grid-cols-4 md:grid-cols-8 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="flex flex-col items-center gap-2">
              <div className="w-16 h-16 rounded-full bg-muted animate-pulse" />
              <div className="h-3 bg-muted animate-pulse rounded w-12" />
            </div>
          ))}
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {Array.from({ length: 10 }).map((_, i) => <ProductCardSkeleton key={i} />)}
        </div>
      </div>
    );
  }

  if (!summary) return null;

  return (
    <div className="space-y-8 pb-8">

      {/* Hero Banner Carousel */}
      <div className="relative w-full">
        <div className="overflow-hidden" ref={emblaRef}>
          <div className="flex">
            {summary.banners.map((banner) => (
              <div key={banner.id} className="flex-[0_0_100%] min-w-0">
                <Link href={banner.actionUrl}>
                  <div className="relative w-full" style={{ aspectRatio: "16/5" }}>
                    <img
                      src={banner.imageUrl}
                      alt={banner.title}
                      className="object-cover w-full h-full"
                    />
                    <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/30 to-transparent flex flex-col justify-center px-8 md:px-16">
                      {banner.badgeText && (
                        <Badge className="w-fit mb-3 bg-secondary text-secondary-foreground text-xs">
                          {banner.badgeText}
                        </Badge>
                      )}
                      <h2 className="text-white font-heading font-bold text-2xl md:text-4xl leading-tight max-w-lg">
                        {banner.title}
                      </h2>
                      {banner.subtitle && (
                        <p className="text-white/80 text-sm md:text-base mt-2 max-w-md">{banner.subtitle}</p>
                      )}
                      <div className="mt-4">
                        <span className="inline-block bg-secondary text-secondary-foreground px-5 py-2 rounded-full text-sm font-bold hover:bg-secondary/90 transition-colors cursor-pointer">
                          Shop Now →
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
              </div>
            ))}
          </div>
        </div>
        {/* Dots */}
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
          {summary.banners.map((_, i) => (
            <button key={i} onClick={() => emblaApi?.scrollTo(i)}
              className={`rounded-full transition-all ${i === selectedIndex ? "w-6 h-2 bg-secondary" : "w-2 h-2 bg-white/50"}`}
            />
          ))}
        </div>
      </div>

      {/* Categories */}
      <section className="px-4 md:px-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-heading font-bold text-xl md:text-2xl">Shop by Category</h2>
          <Link href="/categories" className="text-sm font-medium text-secondary flex items-center gap-0.5 hover:underline">
            View All <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
        <div className="grid grid-cols-4 sm:grid-cols-8 gap-3 md:gap-6">
          {summary.categories.map((cat) => (
            <Link key={cat.id} href={`/products?categoryId=${cat.id}`}
              className="flex flex-col items-center gap-2 group">
              <div className="w-14 h-14 md:w-20 md:h-20 rounded-full bg-muted flex items-center justify-center overflow-hidden border-2 border-transparent group-hover:border-secondary transition-all shadow-sm">
                {cat.imageUrl ? (
                  <img src={cat.imageUrl} alt={cat.name} className="w-full h-full object-cover" />
                ) : (
                  <span className="text-2xl">{cat.icon}</span>
                )}
              </div>
              <span className="text-xs md:text-sm text-center font-medium line-clamp-1 group-hover:text-secondary transition-colors">{cat.name}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* Flash Sale */}
      {summary.flashSale && summary.flashSale.products.length > 0 && (
        <section className="bg-gradient-to-r from-red-600/10 to-orange-500/10 border-y border-red-200/30 py-6 px-4 md:px-6">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5 bg-red-600 text-white px-3 py-1.5 rounded-lg font-bold text-sm">
                <Zap className="w-4 h-4 fill-white" />
                Flash Sale
              </div>
              <FlashSaleTimer endsAt={summary.flashSale.endsAt} />
            </div>
            <Link href="/products?isFlashSale=true"
              className="text-sm font-semibold text-red-600 hover:underline flex items-center gap-0.5">
              See All <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 md:gap-4">
            {summary.flashSale.products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </section>
      )}

      {/* Featured Products */}
      <section className="px-4 md:px-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-heading font-bold text-xl md:text-2xl">Featured Products</h2>
          <Link href="/products?isFeatured=true" className="text-sm font-medium text-secondary hover:underline flex items-center gap-0.5">
            View All <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 md:gap-4">
          {summary.featuredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      {/* Used Goods + Trending — side by side on desktop */}
      <div className="px-4 md:px-6 grid md:grid-cols-3 gap-8">

        {/* Used Goods */}
        {summary.recentListings && summary.recentListings.length > 0 && (
          <div className="md:col-span-1">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-heading font-bold text-xl">Used Goods</h2>
              <Link href="/listings" className="text-sm font-medium text-secondary hover:underline">
                Browse All
              </Link>
            </div>
            <div className="space-y-3">
              {summary.recentListings.slice(0, 4).map((listing) => (
                <Link key={listing.id} href={`/listings/${listing.id}`}>
                  <Card className="hover:shadow-md cursor-pointer overflow-hidden border-border/50 transition-all duration-200">
                    <div className="flex h-24">
                      <div className="w-24 h-full bg-muted flex-shrink-0">
                        <img
                          src={listing.images[0] || "https://placehold.co/200"}
                          alt={listing.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="p-3 flex flex-col justify-center flex-1 min-w-0">
                        <h3 className="font-semibold text-sm truncate">{listing.title}</h3>
                        <span className="font-bold text-sm text-primary">{listing.isFree ? "FREE" : formatINR(listing.price)}</span>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                          <MapPin className="w-3 h-3" />
                          <span className="truncate">{listing.city}</span>
                          <span>•</span>
                          <span className="uppercase font-medium">{listing.condition.replace("_", " ")}</span>
                        </div>
                      </div>
                    </div>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Trending */}
        <div className="md:col-span-2">
          <h2 className="font-heading font-bold text-xl md:text-2xl mb-4">Trending Now</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
            {summary.trendingProducts.slice(0, 8).map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      </div>

      {/* Reseller CTA Banner */}
      <section className="mx-4 md:mx-6">
        <Link href="/reseller">
          <div className="bg-gradient-to-r from-primary to-primary/80 rounded-2xl p-6 md:p-10 flex flex-col md:flex-row items-center justify-between gap-4 cursor-pointer hover:shadow-xl transition-shadow">
            <div>
              <h3 className="font-heading font-bold text-white text-xl md:text-3xl">Earn with ZenKart Reseller</h3>
              <p className="text-white/70 mt-1 text-sm md:text-base">Share products on WhatsApp & earn up to ₹50,000/month commission</p>
            </div>
            <div className="shrink-0">
              <span className="block bg-secondary text-secondary-foreground font-bold px-6 py-3 rounded-full text-sm hover:bg-secondary/90 transition-colors">
                Join Free →
              </span>
            </div>
          </div>
        </Link>
      </section>

    </div>
  );
}

function FlashSaleTimer({ endsAt }: { endsAt: string }) {
  const [timeLeft, setTimeLeft] = useState({ h: 0, m: 0, s: 0 });

  useEffect(() => {
    const calc = () => {
      const diff = new Date(endsAt).getTime() - Date.now();
      if (diff > 0) setTimeLeft({
        h: Math.floor(diff / 3600000),
        m: Math.floor((diff % 3600000) / 60000),
        s: Math.floor((diff % 60000) / 1000),
      });
    };
    calc();
    const id = setInterval(calc, 1000);
    return () => clearInterval(id);
  }, [endsAt]);

  const pad = (n: number) => String(n).padStart(2, "0");

  return (
    <div className="flex items-center gap-1 font-mono font-bold text-sm">
      {[timeLeft.h, timeLeft.m, timeLeft.s].map((v, i) => (
        <span key={i} className="flex items-center gap-1">
          <span className="bg-red-600 text-white px-2 py-0.5 rounded">{pad(v)}</span>
          {i < 2 && <span className="text-red-600">:</span>}
        </span>
      ))}
    </div>
  );
}
