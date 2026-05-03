import { useListUsedGoods } from "@workspace/api-client-react";
import { Link } from "wouter";
import { formatINR } from "@/lib/format";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Listings() {
  const { data, isLoading } = useListUsedGoods();

  if (isLoading) return <div className="p-4">Loading listings...</div>;

  const getConditionColor = (condition: string) => {
    switch(condition) {
      case 'new': return 'bg-green-500 text-white';
      case 'like_new': return 'bg-blue-500 text-white';
      case 'good': return 'bg-yellow-500 text-black';
      case 'fair': return 'bg-orange-500 text-white';
      default: return 'bg-gray-500 text-white';
    }
  };

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="font-heading font-bold text-2xl">Used Goods</h1>
        <Link href="/listings/new">
          <Button size="sm">Sell Item</Button>
        </Link>
      </div>

      <div className="grid gap-4">
        {data?.listings.map(listing => (
          <Link key={listing.id} href={`/listings/${listing.id}`}>
            <Card className="hover-elevate cursor-pointer overflow-hidden border-border/50">
              <div className="flex h-32">
                <div className="w-32 h-full bg-muted shrink-0 relative">
                  <img 
                    src={listing.images[0] || "https://placehold.co/300"} 
                    alt={listing.title}
                    className="w-full h-full object-cover"
                  />
                  <Badge className={`absolute top-2 left-2 text-[10px] py-0 ${getConditionColor(listing.condition)} border-none`}>
                    {listing.condition.replace('_', ' ').toUpperCase()}
                  </Badge>
                </div>
                <div className="p-3 flex flex-col justify-between flex-1 min-w-0">
                  <div>
                    <h3 className="font-semibold text-sm line-clamp-2 leading-tight">{listing.title}</h3>
                    <div className="font-bold text-lg text-primary mt-1">{formatINR(listing.price)}</div>
                    {listing.isNegotiable && (
                      <span className="text-[10px] text-muted-foreground block mt-0.5">Negotiable</span>
                    )}
                  </div>
                  <div className="flex items-center justify-between text-xs text-muted-foreground mt-2">
                    <div className="flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      <span className="truncate max-w-[100px]">{listing.city}</span>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
