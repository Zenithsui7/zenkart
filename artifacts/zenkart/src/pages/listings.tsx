import { useListUsedGoods } from "@workspace/api-client-react";
import { Link } from "wouter";
import { formatINR } from "@/lib/format";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, Plus, Package } from "lucide-react";
import { Button } from "@/components/ui/button";

const CONDITION_STYLES: Record<string, string> = {
  new: "bg-green-500 text-white",
  like_new: "bg-blue-500 text-white",
  good: "bg-yellow-500 text-black",
  fair: "bg-orange-500 text-white",
};

export default function Listings() {
  const { data, isLoading } = useListUsedGoods();

  return (
    <div className="p-4 md:p-6 lg:p-8 max-w-screen-xl mx-auto">
      {/* Page header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="font-heading font-bold text-2xl md:text-3xl">Used Goods Marketplace</h1>
          <p className="text-muted-foreground mt-1 text-sm">Buy and sell second-hand items in your city</p>
        </div>
        <Link href="/listings/new">
          <Button className="rounded-xl font-semibold">
            <Plus className="w-4 h-4 mr-2" />
            Sell an Item
          </Button>
        </Link>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="h-56 bg-muted animate-pulse rounded-2xl" />
          ))}
        </div>
      ) : !data?.listings.length ? (
        <div className="text-center py-20 text-muted-foreground">
          <Package className="w-16 h-16 mx-auto mb-4 opacity-25" />
          <p className="text-lg font-medium">No listings yet</p>
          <p className="text-sm mt-1 mb-6">Be the first to list something!</p>
          <Link href="/listings/new">
            <Button>List Your Item</Button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-5">
          {data.listings.map(listing => (
            <Link key={listing.id} href={`/listings/${listing.id}`}>
              <Card className="hover:shadow-lg cursor-pointer overflow-hidden border-border/60 transition-all duration-200 h-full group">
                {/* Image */}
                <div className="relative aspect-[4/3] bg-muted overflow-hidden">
                  <img
                    src={listing.images[0] || "https://placehold.co/400x300"}
                    alt={listing.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <Badge
                    className={`absolute top-2 left-2 text-[10px] py-0.5 border-none ${CONDITION_STYLES[listing.condition] ?? "bg-gray-500 text-white"}`}
                  >
                    {listing.condition.replace("_", " ").toUpperCase()}
                  </Badge>
                  {listing.isFree && (
                    <Badge className="absolute top-2 right-2 bg-green-600 text-white border-none text-[10px]">FREE</Badge>
                  )}
                </div>

                <CardContent className="p-4">
                  <h3 className="font-semibold text-sm leading-snug line-clamp-2 mb-2">{listing.title}</h3>
                  <div className="font-bold text-lg text-primary">
                    {listing.isFree ? "FREE" : formatINR(listing.price)}
                  </div>
                  {listing.isNegotiable && !listing.isFree && (
                    <span className="text-xs text-muted-foreground">Negotiable</span>
                  )}
                  <div className="flex items-center gap-1 text-xs text-muted-foreground mt-2">
                    <MapPin className="w-3 h-3 shrink-0" />
                    <span className="truncate">{listing.city}</span>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
