import {
  useGetProduct, useAddToCart, useGetRelatedProducts, getGetCartQueryKey,
  useListReviews, useCreateReview, useAddToWishlist, useRemoveFromWishlist,
  useGetWishlist, useGetRecommendations
} from "@workspace/api-client-react";
import { useParams, Link } from "wouter";
import { Button } from "@/components/ui/button";
import { StarRating } from "@/components/ui/star-rating";
import { formatINR } from "@/lib/format";
import useEmblaCarousel from "embla-carousel-react";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import {
  ShoppingCart, Heart, Truck, RotateCcw, Shield, ChevronRight, Check, Minus,
  Plus, MapPin, Star, Share2, CreditCard, Smartphone, Banknote, Store,
  ThumbsUp, Award, ChevronDown, ChevronUp
} from "lucide-react";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { ProductCard } from "@/components/product-card";
import { cn } from "@/lib/utils";

const BANK_OFFERS = [
  { bank: "HDFC Bank", desc: "10% instant discount on HDFC Credit Cards", code: "HDFC10" },
  { bank: "SBI Card", desc: "5% cashback on SBI Credit Cards (min ₹2000)", code: "SBI5" },
  { bank: "Axis Bank", desc: "₹200 off on Axis Debit Cards", code: "AXIS200" },
];

const EMI_OPTIONS = [
  { months: 3, interest: 0 },
  { months: 6, interest: 1.5 },
  { months: 9, interest: 2 },
  { months: 12, interest: 3 },
];

export default function ProductDetail() {
  const { id } = useParams<{ id: string }>();
  const productId = Number(id);
  const { data: product, isLoading } = useGetProduct(productId, { query: { enabled: !!productId } });
  const { data: related } = useGetRelatedProducts(productId, { query: { enabled: !!productId } });
  const { data: reviews } = useListReviews(productId, { query: { enabled: !!productId } });
  const { data: wishlist } = useGetWishlist();
  const { data: recommendations } = useGetRecommendations({ query: { enabled: !!productId } });
  const [emblaRef, emblaApi] = useEmblaCarousel();
  const [selectedImg, setSelectedImg] = useState(0);
  const queryClient = useQueryClient();
  const addToCart = useAddToCart();
  const addToWishlist = useAddToWishlist();
  const removeFromWishlist = useRemoveFromWishlist();
  const createReview = useCreateReview();
  const [qty, setQty] = useState(1);
  const [pincode, setPincode] = useState("");
  const [pincodeResult, setPincodeResult] = useState<null | { available: boolean; date: string }>(null);
  const [showAllOffers, setShowAllOffers] = useState(false);
  const [showEMI, setShowEMI] = useState(false);
  const [reviewText, setReviewText] = useState("");
  const [reviewRating, setReviewRating] = useState(5);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [showAllSpecs, setShowAllSpecs] = useState(false);

  const isWishlisted = wishlist?.some(w => w.productId === productId);

  const handleWishlistToggle = () => {
    if (isWishlisted) {
      removeFromWishlist.mutate({ data: { productId } }, {
        onSuccess: () => { toast.success("Removed from wishlist"); queryClient.invalidateQueries({ queryKey: ["wishlist"] }); }
      });
    } else {
      addToWishlist.mutate({ data: { productId } }, {
        onSuccess: () => { toast.success("Added to wishlist!"); queryClient.invalidateQueries({ queryKey: ["wishlist"] }); }
      });
    }
  };

  const checkPincode = () => {
    if (pincode.length !== 6) { toast.error("Enter a valid 6-digit pincode"); return; }
    const available = parseInt(pincode[0]) % 2 === 0;
    const days = available ? 2 + (parseInt(pincode[1]) % 3) : 5 + (parseInt(pincode[1]) % 4);
    const date = new Date(); date.setDate(date.getDate() + days);
    setPincodeResult({ available, date: date.toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long" }) });
  };

  const handleReviewSubmit = () => {
    if (!reviewText.trim()) return;
    createReview.mutate({ data: { productId, rating: reviewRating, comment: reviewText, title: "My Review" } }, {
      onSuccess: () => {
        toast.success("Review submitted!");
        setShowReviewForm(false);
        setReviewText("");
        queryClient.invalidateQueries({ queryKey: ["reviews"] });
      }
    });
  };

  if (isLoading) {
    return (
      <div className="p-6 md:p-8">
        <div className="grid md:grid-cols-2 gap-8">
          <div className="aspect-square bg-muted animate-pulse rounded-2xl" />
          <div className="space-y-4">
            {[3, 1, 2, 4, 2].map((w, i) => (
              <div key={i} className={`h-${w === 4 ? 20 : 8} bg-muted animate-pulse rounded w-${w}/4`} />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!product) return <div className="p-8 text-center text-muted-foreground">Product not found</div>;

  const specsEntries = product.specifications ? Object.entries(product.specifications) : [];
  const visibleSpecs = showAllSpecs ? specsEntries : specsEntries.slice(0, 6);
  const emiMonthly = (price: number, months: number, rate: number) =>
    Math.round(price * (1 + rate / 100) / months);

  // Rating breakdown (mock from reviews or product data)
  const ratingBreakdown = [5, 4, 3, 2, 1].map(stars => ({
    stars,
    count: reviews ? reviews.filter(r => Math.round(r.rating) === stars).length : Math.floor(Math.random() * 50)
  }));
  const totalReviews = ratingBreakdown.reduce((a, b) => a + b.count, 0) || product.reviewCount;

  return (
    <div className="pb-12">
      {/* Breadcrumb */}
      <div className="px-4 md:px-8 py-3 flex items-center gap-1.5 text-xs text-muted-foreground border-b border-border">
        <Link href="/" className="hover:text-foreground">Home</Link>
        <ChevronRight className="w-3 h-3" />
        <Link href={`/products?categoryId=${product.categoryId}`} className="hover:text-foreground">{product.categoryName}</Link>
        <ChevronRight className="w-3 h-3" />
        <span className="text-foreground font-medium line-clamp-1">{product.title}</span>
      </div>

      <div className="px-4 md:px-8 py-6">
        <div className="grid md:grid-cols-2 lg:grid-cols-[1fr_1.3fr] gap-8 xl:gap-14">

          {/* ── LEFT: Images ── */}
          <div className="space-y-3 md:sticky md:top-28 md:self-start">
            <div className="overflow-hidden rounded-2xl bg-muted border border-border" ref={emblaRef}>
              <div className="flex">
                {product.images.map((img, i) => (
                  <div key={i} className="flex-[0_0_100%] min-w-0">
                    <img src={img} alt={`${product.title} ${i + 1}`} className="w-full aspect-square object-contain bg-white" />
                  </div>
                ))}
              </div>
            </div>
            {product.images.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-1">
                {product.images.map((img, i) => (
                  <button key={i}
                    onClick={() => { setSelectedImg(i); emblaApi?.scrollTo(i); }}
                    className={`w-16 h-16 rounded-lg overflow-hidden border-2 shrink-0 transition-all ${selectedImg === i ? "border-secondary" : "border-border hover:border-secondary/50"}`}>
                    <img src={img} alt={`thumb-${i}`} className="w-full h-full object-contain bg-white" />
                  </button>
                ))}
              </div>
            )}
            {/* Action buttons below image */}
            <div className="flex gap-3">
              <button onClick={handleWishlistToggle}
                className={cn("flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border-2 font-semibold text-sm transition-all",
                  isWishlisted ? "border-red-400 bg-red-50 text-red-600 dark:bg-red-950/30" : "border-border hover:border-secondary")}>
                <Heart className={cn("w-4 h-4", isWishlisted && "fill-red-500 text-red-500")} />
                {isWishlisted ? "Wishlisted" : "Add to Wishlist"}
              </button>
              <button onClick={() => { navigator.share?.({ title: product.title, url: window.location.href }) || navigator.clipboard.writeText(window.location.href).then(() => toast.success("Link copied!")); }}
                className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border-2 border-border hover:border-secondary font-semibold text-sm transition-all">
                <Share2 className="w-4 h-4" />
                Share
              </button>
            </div>
          </div>

          {/* ── RIGHT: Product info ── */}
          <div className="space-y-5">
            {/* Brand + title */}
            <div>
              <div className="text-sm font-semibold text-secondary uppercase tracking-wide mb-1">{product.brand}</div>
              <h1 className="font-heading font-bold text-xl md:text-2xl leading-snug">{product.title}</h1>
              <div className="flex flex-wrap items-center gap-3 mt-2">
                <div className="flex items-center gap-2 bg-green-600 text-white px-2.5 py-1 rounded-md text-sm font-bold">
                  {product.rating.toFixed(1)} <Star className="w-3.5 h-3.5 fill-white" />
                </div>
                <span className="text-sm text-muted-foreground">{product.reviewCount.toLocaleString("en-IN")} Ratings & Reviews</span>
                {product.badge && <Badge variant="destructive">{product.badge}</Badge>}
              </div>
            </div>

            {/* Price */}
            <div className="bg-muted/40 rounded-xl p-4 border border-border/50">
              <div className="flex items-baseline gap-3 flex-wrap">
                <span className="text-3xl font-bold">{formatINR(product.price)}</span>
                {product.mrp > product.price && (
                  <>
                    <span className="text-base text-muted-foreground line-through">{formatINR(product.mrp)}</span>
                    <Badge className="bg-green-600 text-white text-sm px-2 py-0.5">{product.discountPercent}% off</Badge>
                  </>
                )}
              </div>
              {product.mrp > product.price && (
                <p className="text-sm text-green-600 font-medium mt-1">
                  You save {formatINR(product.mrp - product.price)} on this order
                </p>
              )}
              {/* EMI */}
              <button onClick={() => setShowEMI(v => !v)}
                className="mt-2 flex items-center gap-1.5 text-sm text-primary font-medium hover:underline">
                <CreditCard className="w-4 h-4" />
                EMI from {formatINR(emiMonthly(product.price, 12, 3))}/month
                {showEMI ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
              </button>
              {showEMI && (
                <div className="mt-3 grid grid-cols-2 gap-2">
                  {EMI_OPTIONS.map(opt => (
                    <div key={opt.months} className="bg-background rounded-lg p-2.5 border border-border text-xs">
                      <div className="font-bold text-sm">{formatINR(emiMonthly(product.price, opt.months, opt.interest))}/mo</div>
                      <div className="text-muted-foreground">{opt.months} months {opt.interest === 0 ? "• No cost" : `• ${opt.interest}% interest`}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Bank Offers */}
            <div className="border border-border rounded-xl overflow-hidden">
              <div className="px-4 py-3 bg-muted/30 border-b border-border flex items-center gap-2">
                <Award className="w-4 h-4 text-secondary" />
                <span className="font-semibold text-sm">Available Offers</span>
              </div>
              <div className="divide-y divide-border">
                {(showAllOffers ? BANK_OFFERS : BANK_OFFERS.slice(0, 2)).map((offer, i) => (
                  <div key={i} className="px-4 py-3 flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                      <span className="text-[10px] font-bold text-primary">%</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <span className="text-xs font-bold text-foreground">{offer.bank}: </span>
                      <span className="text-xs text-muted-foreground">{offer.desc}</span>
                      <div className="text-[10px] text-secondary font-semibold mt-0.5">Use code: {offer.code}</div>
                    </div>
                  </div>
                ))}
              </div>
              <button onClick={() => setShowAllOffers(v => !v)}
                className="w-full text-center text-xs font-semibold text-primary py-2.5 hover:bg-muted/30 transition-colors border-t border-border">
                {showAllOffers ? "Show less" : `+${BANK_OFFERS.length - 2} more offers`}
              </button>
            </div>

            {/* Delivery & Seller */}
            <div className="border border-border rounded-xl overflow-hidden divide-y divide-border">
              {/* Pincode checker */}
              <div className="px-4 py-3">
                <div className="flex items-center gap-2 mb-2">
                  <MapPin className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm font-semibold">Delivery</span>
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    maxLength={6}
                    placeholder="Enter pincode"
                    value={pincode}
                    onChange={e => { setPincode(e.target.value.replace(/\D/g, "")); setPincodeResult(null); }}
                    className="flex-1 border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 bg-background"
                  />
                  <Button variant="outline" size="sm" onClick={checkPincode} className="font-bold">Check</Button>
                </div>
                {pincodeResult && (
                  <div className={`mt-2 text-xs font-medium flex items-center gap-1.5 ${pincodeResult.available ? "text-green-600" : "text-orange-600"}`}>
                    {pincodeResult.available
                      ? <><Check className="w-3.5 h-3.5" /> Delivery by {pincodeResult.date} — FREE</>
                      : <><Truck className="w-3.5 h-3.5" /> Delivery by {pincodeResult.date} — ₹49 charge</>}
                  </div>
                )}
              </div>
              {/* Seller info */}
              <div className="px-4 py-3 flex items-center gap-3">
                <Store className="w-4 h-4 text-muted-foreground shrink-0" />
                <div className="flex-1">
                  <span className="text-sm text-muted-foreground">Sold by </span>
                  <span className="text-sm font-semibold text-primary cursor-pointer hover:underline">
                    {product.brand} Official Store
                  </span>
                </div>
                <Badge variant="outline" className="text-[10px] text-green-600 border-green-400">Top Seller</Badge>
              </div>
              {/* Return policy */}
              <div className="px-4 py-3 flex items-center gap-3">
                <RotateCcw className="w-4 h-4 text-muted-foreground shrink-0" />
                <span className="text-sm text-muted-foreground">7-day return policy on this product</span>
              </div>
            </div>

            {/* Stock indicator */}
            {product.stock < 20 && (
              <div className="flex items-center gap-2 text-sm text-orange-600 font-semibold bg-orange-50 dark:bg-orange-950/30 px-3 py-2 rounded-lg">
                <span className="inline-block w-2 h-2 rounded-full bg-orange-500 animate-pulse shrink-0" />
                Only {product.stock} left in stock — order soon!
              </div>
            )}

            {/* Qty + CTA */}
            <div className="space-y-3">
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
              <div className="flex gap-3">
                <Button size="lg" className="flex-1 rounded-xl font-bold text-base h-12"
                  onClick={() => addToCart.mutate({ data: { productId, quantity: qty } }, {
                    onSuccess: () => { toast.success("Added to cart!"); queryClient.invalidateQueries({ queryKey: getGetCartQueryKey() }); },
                    onError: () => toast.error("Failed to add to cart"),
                  })} disabled={addToCart.isPending}>
                  <ShoppingCart className="w-5 h-5 mr-2" />
                  {addToCart.isPending ? "Adding..." : "Add to Cart"}
                </Button>
                <Link href="/checkout" className="flex-1">
                  <Button size="lg" variant="secondary" className="w-full rounded-xl font-bold text-base h-12">
                    Buy Now
                  </Button>
                </Link>
              </div>
            </div>

            {/* Payment icons */}
            <div className="flex items-center gap-3 flex-wrap">
              {[
                { icon: Smartphone, label: "UPI" },
                { icon: CreditCard, label: "Cards" },
                { icon: Banknote, label: "COD" },
              ].map(({ icon: Icon, label }) => (
                <div key={label} className="flex items-center gap-1.5 text-xs text-muted-foreground bg-muted/50 px-2.5 py-1.5 rounded-lg">
                  <Icon className="w-3.5 h-3.5" />
                  {label}
                </div>
              ))}
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground bg-muted/50 px-2.5 py-1.5 rounded-lg">
                <Shield className="w-3.5 h-3.5" />
                100% Secure
              </div>
            </div>

            {/* Highlights */}
            {product.highlights && product.highlights.length > 0 && (
              <div className="space-y-2">
                <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">Highlights</h3>
                {product.highlights.map((h: string) => (
                  <div key={h} className="flex items-center gap-2 text-sm">
                    <Check className="w-4 h-4 text-green-600 shrink-0" />
                    {h}
                  </div>
                ))}
              </div>
            )}

            {/* Description */}
            <div>
              <h3 className="font-semibold text-sm mb-2 text-muted-foreground uppercase tracking-wide">About this item</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{product.description}</p>
            </div>
          </div>
        </div>

        {/* ── SPECIFICATIONS ── */}
        {specsEntries.length > 0 && (
          <div className="mt-10">
            <h2 className="font-heading font-bold text-xl mb-4">Specifications</h2>
            <div className="bg-card border border-border rounded-xl overflow-hidden">
              {visibleSpecs.map(([key, val], i) => (
                <div key={key} className={`flex text-sm ${i % 2 === 0 ? "bg-muted/30" : ""}`}>
                  <span className="w-40 md:w-56 px-4 py-3 font-medium text-muted-foreground shrink-0 border-r border-border">{key}</span>
                  <span className="px-4 py-3">{String(val)}</span>
                </div>
              ))}
            </div>
            {specsEntries.length > 6 && (
              <button onClick={() => setShowAllSpecs(v => !v)}
                className="mt-3 flex items-center gap-1 text-sm font-semibold text-primary hover:underline">
                {showAllSpecs ? <><ChevronUp className="w-4 h-4" /> Show less</> : <><ChevronDown className="w-4 h-4" /> View all {specsEntries.length} specifications</>}
              </button>
            )}
          </div>
        )}

        {/* ── REVIEWS ── */}
        <div className="mt-10">
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-heading font-bold text-xl">Ratings & Reviews</h2>
            <Button variant="outline" onClick={() => setShowReviewForm(v => !v)} className="rounded-xl">
              Rate this Product
            </Button>
          </div>

          {/* Review form */}
          {showReviewForm && (
            <div className="bg-muted/30 border border-border rounded-xl p-5 mb-6 space-y-4">
              <h3 className="font-semibold">Write a Review</h3>
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Rating:</span>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map(s => (
                    <button key={s} onClick={() => setReviewRating(s)}>
                      <Star className={cn("w-6 h-6", s <= reviewRating ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground")} />
                    </button>
                  ))}
                </div>
              </div>
              <textarea
                value={reviewText}
                onChange={e => setReviewText(e.target.value)}
                placeholder="Share your thoughts about this product..."
                className="w-full border border-border rounded-lg p-3 text-sm bg-background min-h-[100px] resize-none focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
              <div className="flex gap-3">
                <Button onClick={handleReviewSubmit} disabled={createReview.isPending} className="rounded-xl">
                  {createReview.isPending ? "Submitting..." : "Submit Review"}
                </Button>
                <Button variant="outline" onClick={() => setShowReviewForm(false)} className="rounded-xl">Cancel</Button>
              </div>
            </div>
          )}

          <div className="grid md:grid-cols-[280px_1fr] gap-8">
            {/* Rating breakdown */}
            <div className="space-y-3">
              <div className="text-center mb-4">
                <div className="text-6xl font-bold">{product.rating.toFixed(1)}</div>
                <div className="flex justify-center mt-2"><StarRating rating={product.rating} /></div>
                <div className="text-sm text-muted-foreground mt-1">{totalReviews.toLocaleString("en-IN")} reviews</div>
              </div>
              {ratingBreakdown.map(({ stars, count }) => (
                <div key={stars} className="flex items-center gap-2 text-xs">
                  <span className="w-3 text-right">{stars}</span>
                  <Star className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400 shrink-0" />
                  <div className="flex-1 bg-muted rounded-full h-2 overflow-hidden">
                    <div className="bg-yellow-400 h-full rounded-full transition-all"
                      style={{ width: totalReviews > 0 ? `${(count / totalReviews) * 100}%` : "0%" }} />
                  </div>
                  <span className="w-8 text-muted-foreground">{count}</span>
                </div>
              ))}
            </div>

            {/* Review list */}
            <div className="space-y-4">
              {reviews && reviews.length > 0 ? reviews.slice(0, 5).map((review, i) => (
                <div key={i} className="border border-border rounded-xl p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold">
                        {review.userName?.charAt(0) ?? "U"}
                      </div>
                      <div>
                        <div className="font-semibold text-sm">{review.userName ?? "Verified Buyer"}</div>
                        <div className="flex items-center gap-1 bg-green-600 text-white text-xs px-1.5 py-0.5 rounded w-fit">
                          {review.rating} <Star className="w-2.5 h-2.5 fill-white" />
                        </div>
                      </div>
                    </div>
                    {review.isVerifiedPurchase && (
                      <Badge variant="outline" className="text-[10px] text-green-600 border-green-400">✓ Verified</Badge>
                    )}
                  </div>
                  {review.title && <p className="font-semibold text-sm">{review.title}</p>}
                  <p className="text-sm text-muted-foreground">{review.comment}</p>
                  <button className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground">
                    <ThumbsUp className="w-3.5 h-3.5" /> Helpful
                  </button>
                </div>
              )) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Star className="w-10 h-10 mx-auto mb-3 opacity-20" />
                  <p>No reviews yet. Be the first to review!</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ── RECOMMENDATIONS ── */}
        {recommendations && recommendations.length > 0 && (
          <div className="mt-10">
            <h2 className="font-heading font-bold text-xl mb-4">Recommended for You</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 md:gap-4">
              {recommendations.slice(0, 6).map(p => <ProductCard key={p.id} product={p} />)}
            </div>
          </div>
        )}

        {/* ── RELATED PRODUCTS ── */}
        {related && related.length > 0 && (
          <div className="mt-10">
            <h2 className="font-heading font-bold text-xl mb-4">Similar Products</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 md:gap-4">
              {related.map(p => <ProductCard key={p.id} product={p} />)}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
