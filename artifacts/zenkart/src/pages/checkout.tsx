import { useState } from "react";
import { useGetCart, useCreateOrder, getGetCartQueryKey, CreateOrderBodyPaymentMethod } from "@workspace/api-client-react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import { formatINR } from "@/lib/format";
import { useQueryClient } from "@tanstack/react-query";
import { CheckCircle2, MapPin, CreditCard } from "lucide-react";

export default function Checkout() {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const { data: cart, isLoading } = useGetCart();
  const createOrder = useCreateOrder();
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();

  const [addressId, setAddressId] = useState<number>(1);
  const [paymentMethod, setPaymentMethod] = useState<CreateOrderBodyPaymentMethod>(CreateOrderBodyPaymentMethod.upi);

  if (isLoading) return <div className="p-4">Loading checkout...</div>;

  if (!cart || cart.items.length === 0) {
    return (
      <div className="p-8 text-center">
        <h2 className="text-xl font-bold mb-2">Cart is empty</h2>
        <Button onClick={() => setLocation("/")}>Go Home</Button>
      </div>
    );
  }

  const handlePlaceOrder = () => {
    createOrder.mutate({ data: { addressId, paymentMethod } }, {
      onSuccess: (order) => {
        toast.success("Order placed successfully!");
        queryClient.invalidateQueries({ queryKey: getGetCartQueryKey() });
        setLocation(`/orders/${order.id}`);
      },
      onError: () => toast.error("Failed to place order")
    });
  };

  return (
    <div className="p-4 space-y-6 pb-24">
      <div className="flex justify-between items-center mb-6">
        {[1, 2, 3].map((s) => (
          <div key={s} className="flex flex-col items-center flex-1">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm
              ${step >= s ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>
              {step > s ? <CheckCircle2 className="w-5 h-5" /> : s}
            </div>
            <div className="text-[10px] mt-1 font-medium text-muted-foreground">
              {s === 1 ? 'ADDRESS' : s === 2 ? 'PAYMENT' : 'CONFIRM'}
            </div>
          </div>
        ))}
      </div>

      {step === 1 && (
        <div className="space-y-4">
          <h2 className="font-heading font-bold text-xl">Select Address</h2>
          <Card className={`border-2 ${addressId === 1 ? 'border-primary' : 'border-border'} cursor-pointer`} onClick={() => setAddressId(1)}>
            <CardContent className="p-4 flex gap-3">
              <MapPin className="w-5 h-5 text-muted-foreground mt-0.5" />
              <div>
                <div className="font-bold text-sm">Home</div>
                <div className="text-sm text-muted-foreground mt-1">
                  123 Main Street, Appt 4B<br />
                  Mumbai, Maharashtra 400001<br />
                  India
                </div>
              </div>
            </CardContent>
          </Card>
          <Button className="w-full h-12 text-lg" onClick={() => setStep(2)}>Continue to Payment</Button>
        </div>
      )}

      {step === 2 && (
        <div className="space-y-4">
          <h2 className="font-heading font-bold text-xl">Payment Method</h2>
          <div className="space-y-3">
            {[
              { id: CreateOrderBodyPaymentMethod.upi, label: "UPI (Google Pay, PhonePe, Paytm)" },
              { id: CreateOrderBodyPaymentMethod.card, label: "Credit / Debit Card" },
              { id: CreateOrderBodyPaymentMethod.cod, label: "Cash on Delivery" }
            ].map(method => (
              <Card 
                key={method.id}
                className={`border-2 ${paymentMethod === method.id ? 'border-primary' : 'border-border'} cursor-pointer`} 
                onClick={() => setPaymentMethod(method.id)}
              >
                <CardContent className="p-4 flex gap-3 items-center">
                  <CreditCard className="w-5 h-5 text-muted-foreground" />
                  <div className="font-bold text-sm">{method.label}</div>
                </CardContent>
              </Card>
            ))}
          </div>
          <div className="flex gap-3">
            <Button variant="outline" className="h-12 flex-1" onClick={() => setStep(1)}>Back</Button>
            <Button className="h-12 flex-[2] text-lg" onClick={() => setStep(3)}>Review Order</Button>
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="space-y-4">
          <h2 className="font-heading font-bold text-xl">Order Summary</h2>
          <div className="bg-card p-4 rounded-xl border border-border space-y-3">
            {cart.items.map(item => (
              <div key={item.id} className="flex justify-between text-sm">
                <span>{item.quantity}x {item.product.title}</span>
                <span className="font-bold">{formatINR(item.product.price * item.quantity)}</span>
              </div>
            ))}
            <div className="border-t border-border pt-3 mt-3 flex justify-between font-bold text-lg">
              <span>Total Amount</span>
              <span>{formatINR(cart.total)}</span>
            </div>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" className="h-12 flex-1" onClick={() => setStep(2)}>Back</Button>
            <Button className="h-12 flex-[2] text-lg" onClick={handlePlaceOrder} disabled={createOrder.isPending}>
              {createOrder.isPending ? "Processing..." : "Place Order"}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
