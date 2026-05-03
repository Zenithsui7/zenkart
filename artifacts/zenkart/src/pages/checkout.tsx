import { useState } from "react";
import { useGetCart, useCreateOrder, getGetCartQueryKey, CreateOrderBodyPaymentMethod } from "@workspace/api-client-react";
import { useLocation, Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { formatINR } from "@/lib/format";
import { useQueryClient } from "@tanstack/react-query";
import {
  CheckCircle2, MapPin, CreditCard, Smartphone, Banknote, Wallet,
  ChevronRight, Lock, Tag, Plus, Home, Briefcase
} from "lucide-react";
import { cn } from "@/lib/utils";

type Step = 1 | 2 | 3;

const PAYMENT_METHODS = [
  {
    id: CreateOrderBodyPaymentMethod.upi,
    label: "UPI",
    sub: "Google Pay, PhonePe, Paytm, BHIM",
    icon: Smartphone,
    color: "text-purple-600",
  },
  {
    id: CreateOrderBodyPaymentMethod.card,
    label: "Credit / Debit Card",
    sub: "Visa, Mastercard, RuPay",
    icon: CreditCard,
    color: "text-blue-600",
  },
  {
    id: CreateOrderBodyPaymentMethod.cod,
    label: "Cash on Delivery",
    sub: "Pay when your order arrives",
    icon: Banknote,
    color: "text-green-600",
  },
  {
    id: CreateOrderBodyPaymentMethod.wallet,
    label: "ZenKart Wallet",
    sub: "Use your wallet balance",
    icon: Wallet,
    color: "text-secondary",
  },
];

const SAVED_ADDRESSES = [
  { id: 1, label: "Home", icon: Home, name: "Rahul Sharma", line1: "123 Main Street, Apt 4B", city: "Mumbai", state: "Maharashtra", pin: "400001", phone: "+91 98765 43210" },
  { id: 2, label: "Office", icon: Briefcase, name: "Rahul Sharma", line1: "456 Business Park, Tower C", city: "Mumbai", state: "Maharashtra", pin: "400051", phone: "+91 98765 43210" },
];

export default function Checkout() {
  const [step, setStep] = useState<Step>(1);
  const { data: cart, isLoading } = useGetCart();
  const createOrder = useCreateOrder();
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();

  const [selectedAddressId, setSelectedAddressId] = useState<number>(1);
  const [paymentMethod, setPaymentMethod] = useState<CreateOrderBodyPaymentMethod>(CreateOrderBodyPaymentMethod.upi);
  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<string | null>(null);
  const [couponDiscount, setCouponDiscount] = useState(0);
  const [upiId, setUpiId] = useState("");
  const [addingAddress, setAddingAddress] = useState(false);

  const COUPONS: Record<string, number> = { SAVE100: 100, FIRST200: 200, ZEN50: 50 };

  const applyCoupon = () => {
    const discount = COUPONS[couponCode.toUpperCase()];
    if (discount) {
      setAppliedCoupon(couponCode.toUpperCase());
      setCouponDiscount(discount);
      toast.success(`Coupon applied! You save ${formatINR(discount)}`);
    } else {
      toast.error("Invalid coupon code");
    }
  };

  const finalTotal = cart ? Math.max(0, cart.total - couponDiscount) : 0;

  if (isLoading) return <div className="p-8 text-center">Loading checkout...</div>;
  if (!cart || cart.items.length === 0) {
    return (
      <div className="p-8 text-center">
        <h2 className="text-xl font-bold mb-4">Your cart is empty</h2>
        <Link href="/"><Button>Continue Shopping</Button></Link>
      </div>
    );
  }

  const handlePlaceOrder = () => {
    createOrder.mutate({ data: { addressId: selectedAddressId, paymentMethod } }, {
      onSuccess: (order) => {
        toast.success("🎉 Order placed successfully!");
        queryClient.invalidateQueries({ queryKey: getGetCartQueryKey() });
        setLocation(`/orders/${order.id}`);
      },
      onError: () => toast.error("Failed to place order. Please try again.")
    });
  };

  const selectedAddress = SAVED_ADDRESSES.find(a => a.id === selectedAddressId);

  return (
    <div className="p-4 md:p-6 lg:p-8 max-w-screen-xl mx-auto">
      {/* Breadcrumb */}
      <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-6">
        <Link href="/" className="hover:text-foreground">Home</Link>
        <ChevronRight className="w-3 h-3" />
        <Link href="/cart" className="hover:text-foreground">Cart</Link>
        <ChevronRight className="w-3 h-3" />
        <span className="text-foreground font-medium">Checkout</span>
      </div>

      {/* Step indicator */}
      <div className="flex items-center mb-8 max-w-lg">
        {(["Address", "Payment", "Review"] as const).map((label, i) => {
          const s = (i + 1) as Step;
          return (
            <div key={label} className="flex items-center flex-1">
              <div className="flex flex-col items-center">
                <div className={cn("w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm border-2 transition-all",
                  step > s ? "bg-green-600 border-green-600 text-white" :
                    step === s ? "bg-primary border-primary text-primary-foreground" :
                      "bg-background border-border text-muted-foreground")}>
                  {step > s ? <CheckCircle2 className="w-5 h-5" /> : s}
                </div>
                <span className={cn("text-[10px] mt-1 font-semibold uppercase tracking-wide",
                  step >= s ? "text-foreground" : "text-muted-foreground")}>{label}</span>
              </div>
              {i < 2 && <div className={cn("flex-1 h-0.5 mx-2 mb-4 transition-all", step > s ? "bg-green-600" : "bg-border")} />}
            </div>
          );
        })}
      </div>

      <div className="grid lg:grid-cols-[1fr_380px] gap-8 items-start">

        {/* ── LEFT ── */}
        <div className="space-y-5">

          {/* STEP 1: Address */}
          {step === 1 && (
            <div className="space-y-4">
              <h2 className="font-heading font-bold text-xl">Delivery Address</h2>
              {SAVED_ADDRESSES.map(addr => {
                const Icon = addr.icon;
                return (
                  <div key={addr.id}
                    onClick={() => setSelectedAddressId(addr.id)}
                    className={cn("p-5 rounded-2xl border-2 cursor-pointer transition-all",
                      selectedAddressId === addr.id ? "border-primary bg-primary/5" : "border-border hover:border-border/80 hover:shadow-sm")}>
                    <div className="flex items-start gap-4">
                      <div className={cn("w-5 h-5 rounded-full border-2 flex items-center justify-center mt-0.5 shrink-0 transition-all",
                        selectedAddressId === addr.id ? "border-primary bg-primary" : "border-border")}>
                        {selectedAddressId === addr.id && <div className="w-2 h-2 bg-white rounded-full" />}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <Icon className="w-4 h-4 text-muted-foreground" />
                          <span className="font-bold text-sm">{addr.label}</span>
                          <span className="text-sm font-medium">{addr.name}</span>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {addr.line1}, {addr.city}, {addr.state} - {addr.pin}
                        </p>
                        <p className="text-sm text-muted-foreground mt-0.5">{addr.phone}</p>
                      </div>
                    </div>
                  </div>
                );
              })}

              {/* Add new address */}
              <button
                onClick={() => setAddingAddress(v => !v)}
                className="w-full flex items-center justify-center gap-2 py-4 border-2 border-dashed border-border rounded-2xl text-sm font-semibold text-muted-foreground hover:border-primary hover:text-primary transition-all">
                <Plus className="w-4 h-4" />
                Add New Address
              </button>

              {addingAddress && (
                <div className="p-5 border border-border rounded-2xl space-y-4 bg-muted/20">
                  <h3 className="font-semibold text-sm">New Address</h3>
                  <div className="grid grid-cols-2 gap-3">
                    <Input placeholder="Full Name" />
                    <Input placeholder="Phone Number" type="tel" />
                  </div>
                  <Input placeholder="Address Line 1" />
                  <Input placeholder="Address Line 2 (Optional)" />
                  <div className="grid grid-cols-3 gap-3">
                    <Input placeholder="City" />
                    <Input placeholder="State" />
                    <Input placeholder="Pincode" maxLength={6} />
                  </div>
                  <div className="flex gap-3">
                    <Button className="rounded-xl">Save Address</Button>
                    <Button variant="outline" onClick={() => setAddingAddress(false)} className="rounded-xl">Cancel</Button>
                  </div>
                </div>
              )}

              <Button className="w-full h-12 rounded-xl font-bold text-base" onClick={() => setStep(2)}>
                Continue to Payment →
              </Button>
            </div>
          )}

          {/* STEP 2: Payment */}
          {step === 2 && (
            <div className="space-y-4">
              <h2 className="font-heading font-bold text-xl">Payment Method</h2>
              <div className="space-y-3">
                {PAYMENT_METHODS.map(method => {
                  const Icon = method.icon;
                  return (
                    <div key={method.id}
                      onClick={() => setPaymentMethod(method.id)}
                      className={cn("p-5 rounded-2xl border-2 cursor-pointer transition-all",
                        paymentMethod === method.id ? "border-primary bg-primary/5" : "border-border hover:border-border/80")}>
                      <div className="flex items-center gap-4">
                        <div className={cn("w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-all",
                          paymentMethod === method.id ? "border-primary bg-primary" : "border-border")}>
                          {paymentMethod === method.id && <div className="w-2 h-2 bg-white rounded-full" />}
                        </div>
                        <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center", method.color, "bg-current/10")}>
                          <Icon className={cn("w-5 h-5", method.color)} />
                        </div>
                        <div className="flex-1">
                          <div className="font-bold text-sm">{method.label}</div>
                          <div className="text-xs text-muted-foreground">{method.sub}</div>
                        </div>
                      </div>
                      {/* UPI ID input */}
                      {paymentMethod === method.id && method.id === CreateOrderBodyPaymentMethod.upi && (
                        <div className="mt-3 ml-14">
                          <Input placeholder="Enter UPI ID (e.g. name@upi)" value={upiId} onChange={e => setUpiId(e.target.value)} className="max-w-xs" />
                        </div>
                      )}
                      {/* Card input */}
                      {paymentMethod === method.id && method.id === CreateOrderBodyPaymentMethod.card && (
                        <div className="mt-3 ml-14 space-y-2 max-w-sm">
                          <Input placeholder="Card Number" maxLength={19} />
                          <div className="grid grid-cols-2 gap-2">
                            <Input placeholder="MM/YY" maxLength={5} />
                            <Input placeholder="CVV" maxLength={4} type="password" />
                          </div>
                          <Input placeholder="Name on Card" />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
              <div className="flex gap-3">
                <Button variant="outline" className="h-12 flex-1 rounded-xl" onClick={() => setStep(1)}>← Back</Button>
                <Button className="h-12 flex-[2] rounded-xl font-bold text-base" onClick={() => setStep(3)}>Review Order →</Button>
              </div>
            </div>
          )}

          {/* STEP 3: Review */}
          {step === 3 && (
            <div className="space-y-5">
              <h2 className="font-heading font-bold text-xl">Review Your Order</h2>

              {/* Address summary */}
              {selectedAddress && (
                <div className="p-4 rounded-xl border border-border bg-muted/20 flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <MapPin className="w-4 h-4 text-muted-foreground mt-0.5 shrink-0" />
                    <div>
                      <div className="font-semibold text-sm">{selectedAddress.label} — {selectedAddress.name}</div>
                      <div className="text-xs text-muted-foreground">{selectedAddress.line1}, {selectedAddress.city} {selectedAddress.pin}</div>
                    </div>
                  </div>
                  <button onClick={() => setStep(1)} className="text-xs text-primary font-semibold hover:underline shrink-0">Change</button>
                </div>
              )}

              {/* Payment summary */}
              <div className="p-4 rounded-xl border border-border bg-muted/20 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <CreditCard className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm font-semibold">{PAYMENT_METHODS.find(m => m.id === paymentMethod)?.label}</span>
                </div>
                <button onClick={() => setStep(2)} className="text-xs text-primary font-semibold hover:underline">Change</button>
              </div>

              {/* Items */}
              <div className="space-y-3">
                {cart.items.map(item => (
                  <div key={item.id} className="flex gap-3 p-3 border border-border rounded-xl">
                    <img src={item.product.images[0]} alt={item.product.title} className="w-16 h-16 object-cover rounded-lg shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium line-clamp-1">{item.product.title}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">Qty: {item.quantity}</p>
                      <p className="font-bold text-sm mt-1">{formatINR(item.product.price * item.quantity)}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex gap-3">
                <Button variant="outline" className="h-12 flex-1 rounded-xl" onClick={() => setStep(2)}>← Back</Button>
                <Button className="h-12 flex-[2] rounded-xl font-bold text-base" onClick={handlePlaceOrder} disabled={createOrder.isPending}>
                  <Lock className="w-4 h-4 mr-2" />
                  {createOrder.isPending ? "Placing Order..." : `Place Order • ${formatINR(finalTotal)}`}
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* ── RIGHT: Order Summary ── */}
        <div className="lg:sticky lg:top-28 space-y-4">
          {/* Coupon */}
          <div className="bg-card border border-border rounded-2xl p-5">
            <div className="flex items-center gap-2 mb-3">
              <Tag className="w-4 h-4 text-secondary" />
              <span className="font-semibold text-sm">Apply Coupon</span>
            </div>
            {appliedCoupon ? (
              <div className="flex items-center justify-between bg-green-50 dark:bg-green-950/30 border border-green-200 rounded-xl px-3 py-2.5">
                <div>
                  <span className="text-xs font-bold text-green-700">{appliedCoupon}</span>
                  <span className="text-xs text-green-600 ml-2">• {formatINR(couponDiscount)} saved!</span>
                </div>
                <button onClick={() => { setAppliedCoupon(null); setCouponDiscount(0); setCouponCode(""); }}
                  className="text-xs text-destructive font-semibold hover:underline">Remove</button>
              </div>
            ) : (
              <div className="flex gap-2">
                <Input placeholder="Enter coupon code" value={couponCode}
                  onChange={e => setCouponCode(e.target.value.toUpperCase())}
                  className="flex-1 text-sm uppercase" />
                <Button variant="outline" size="sm" onClick={applyCoupon} className="font-bold shrink-0">Apply</Button>
              </div>
            )}
            <div className="mt-2 flex flex-wrap gap-1">
              {Object.keys(COUPONS).map(code => (
                <button key={code} onClick={() => { setCouponCode(code); }}
                  className="text-[10px] px-2 py-0.5 rounded-full border border-dashed border-secondary text-secondary font-semibold">
                  {code}
                </button>
              ))}
            </div>
          </div>

          {/* Price breakdown */}
          <div className="bg-card border border-border rounded-2xl overflow-hidden">
            <div className="px-5 py-4 border-b border-border bg-muted/30">
              <h3 className="font-heading font-bold text-sm uppercase tracking-wide">Price Details ({cart.itemCount} items)</h3>
            </div>
            <div className="p-5 space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Total MRP</span>
                <span>{formatINR(cart.subtotal + cart.discount)}</span>
              </div>
              {cart.discount > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Discount on MRP</span>
                  <span className="text-green-600 font-medium">-{formatINR(cart.discount)}</span>
                </div>
              )}
              {appliedCoupon && (
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Coupon ({appliedCoupon})</span>
                  <span className="text-green-600 font-medium">-{formatINR(couponDiscount)}</span>
                </div>
              )}
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Delivery Charges</span>
                <span className={cart.deliveryCharge === 0 ? "text-green-600 font-medium" : ""}>
                  {cart.deliveryCharge === 0 ? "FREE" : formatINR(cart.deliveryCharge)}
                </span>
              </div>
              <div className="border-t border-border pt-3">
                <div className="flex justify-between font-bold text-lg">
                  <span>Total Amount</span>
                  <span>{formatINR(finalTotal)}</span>
                </div>
                {(cart.discount + couponDiscount) > 0 && (
                  <p className="text-xs text-green-600 font-semibold mt-1">
                    🎉 You save {formatINR(cart.discount + couponDiscount)} on this order
                  </p>
                )}
              </div>
            </div>
            <div className="px-5 pb-5">
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Lock className="w-3 h-3" />
                Safe and Secure Payments. Easy returns. 100% Authentic products.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
