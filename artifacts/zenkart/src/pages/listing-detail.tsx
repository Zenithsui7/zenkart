import { useGetListing, useStartConversation } from "@workspace/api-client-react";
import { useParams, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { formatINR } from "@/lib/format";
import useEmblaCarousel from "embla-carousel-react";
import { MessageCircle, MapPin, User, Tag } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/context/auth-context";

export default function ListingDetail() {
  const { id } = useParams<{ id: string }>();
  const listingId = Number(id);
  const { data: listing, isLoading } = useGetListing(listingId, { query: { enabled: !!listingId } });
  const [emblaRef] = useEmblaCarousel();
  const { user } = useAuth();
  const [, setLocation] = useLocation();

  const startChatMut = useStartConversation();

  if (isLoading) return <div className="p-4 animate-pulse h-96 bg-muted m-4 rounded-xl" />;
  if (!listing) return <div className="p-4 text-center">Listing not found</div>;

  const handleChat = () => {
    if (!user) {
      setLocation("/login");
      return;
    }
    startChatMut.mutate({ data: { listingId, sellerId: listing.userId, initialMessage: `Hi, I am interested in your listing for ${listing.title}.` } }, {
      onSuccess: (chat) => {
        setLocation(`/chat/${chat.id}`);
      }
    });
  };

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
    <div className="pb-24 relative">
      <div className="overflow-hidden bg-black" ref={emblaRef}>
        <div className="flex">
          {listing.images.map((img, i) => (
            <div key={i} className="flex-[0_0_100%] min-w-0 h-[350px]">
              <img src={img} alt={`${listing.title} ${i}`} className="w-full h-full object-contain" />
            </div>
          ))}
        </div>
      </div>

      <div className="p-4 space-y-4">
        <div>
          <h1 className="font-heading font-bold text-2xl">{formatINR(listing.price)}</h1>
          <p className="text-lg mt-1 font-medium leading-tight">{listing.title}</p>
        </div>

        <div className="flex gap-2">
          <Badge className={`${getConditionColor(listing.condition)} border-none`}>
            {listing.condition.replace('_', ' ').toUpperCase()}
          </Badge>
          {listing.isNegotiable && (
            <Badge variant="outline">Negotiable</Badge>
          )}
        </div>

        <div className="flex items-center gap-2 text-sm text-muted-foreground pb-4 border-b border-border">
          <MapPin className="w-4 h-4" />
          <span>{listing.city}, {listing.state}</span>
        </div>

        <div>
          <h2 className="font-bold mb-2">Description</h2>
          <p className="text-sm text-muted-foreground whitespace-pre-wrap">{listing.description}</p>
        </div>

        <div className="pt-4 border-t border-border">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
              {listing.sellerAvatar ? (
                <img src={listing.sellerAvatar} alt={listing.sellerName} className="w-full h-full rounded-full object-cover" />
              ) : (
                <User className="w-6 h-6 text-muted-foreground" />
              )}
            </div>
            <div>
              <div className="font-bold">{listing.sellerName}</div>
              <div className="text-xs text-muted-foreground">Seller</div>
            </div>
          </div>
        </div>
      </div>

      {user?.id !== listing.userId && (
        <div className="fixed bottom-16 left-0 right-0 max-w-md mx-auto p-4 bg-background border-t border-border flex gap-3">
          <Button variant="outline" className="flex-1 h-12 rounded-xl text-md font-bold">
            <Tag className="w-5 h-5 mr-2" /> Make Offer
          </Button>
          <Button 
            className="flex-1 h-12 rounded-xl text-md font-bold"
            onClick={handleChat}
            disabled={startChatMut.isPending}
          >
            <MessageCircle className="w-5 h-5 mr-2" /> Chat
          </Button>
        </div>
      )}
    </div>
  );
}
