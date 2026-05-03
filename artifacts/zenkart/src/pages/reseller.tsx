import { useListResellerProducts, useGetResellerEarnings, useShareProduct } from "@workspace/api-client-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { formatINR } from "@/lib/format";
import { Share2, Wallet, TrendingUp, IndianRupee } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";

export default function ResellerHub() {
  const { data: products, isLoading: prodLoading } = useListResellerProducts();
  const { data: earnings, isLoading: earnLoading } = useGetResellerEarnings();
  const shareMut = useShareProduct();

  if (prodLoading || earnLoading) return <div className="p-4">Loading hub...</div>;

  const handleShare = (productId: number, sellingPrice: number) => {
    shareMut.mutate({ data: { productId, sellingPrice } }, {
      onSuccess: (data) => {
        // Copy to clipboard mock
        navigator.clipboard.writeText(data.shareText);
        toast.success("Share link copied to clipboard!");
      }
    });
  };

  return (
    <div className="p-4 space-y-6 pb-20">
      <div className="bg-primary text-primary-foreground p-6 rounded-2xl shadow-xl">
        <div className="text-sm font-medium text-primary-foreground/80 mb-1">Total Earnings</div>
        <div className="text-4xl font-bold font-heading mb-6">{formatINR(earnings?.totalEarnings || 0)}</div>
        
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white/10 rounded-xl p-3">
            <div className="text-xs text-primary-foreground/70 mb-1">Pending</div>
            <div className="font-bold text-lg">{formatINR(earnings?.pendingEarnings || 0)}</div>
          </div>
          <div className="bg-white/10 rounded-xl p-3">
            <div className="text-xs text-primary-foreground/70 mb-1">Orders</div>
            <div className="font-bold text-lg">{earnings?.successfulOrders || 0}</div>
          </div>
        </div>
      </div>

      <div>
        <h2 className="font-heading font-bold text-xl mb-4">Hot Products to Resell</h2>
        <div className="space-y-4">
          {products?.map(product => (
            <Card key={product.id} className="overflow-hidden border-border/50">
              <div className="flex p-3 gap-3">
                <img src={product.images[0]} alt={product.title} className="w-24 h-24 object-cover rounded-lg bg-muted" />
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-sm line-clamp-2 leading-tight">{product.title}</h3>
                  <div className="mt-2 text-xs space-y-1">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Wholesale Price:</span>
                      <span className="font-bold text-primary">{formatINR(product.wholesalePrice)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Est. Margin:</span>
                      <span className="font-bold text-secondary">{formatINR(product.minMargin)} - {formatINR(product.maxMargin)}</span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-muted/30 p-3 border-t border-border flex gap-2">
                <Button 
                  className="flex-1" 
                  variant="outline"
                  onClick={() => handleShare(product.id, product.wholesalePrice + product.minMargin)}
                >
                  <Share2 className="w-4 h-4 mr-2" /> Share on WA
                </Button>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
