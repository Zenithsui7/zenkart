import { useGetSellerAnalytics } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatINR } from "@/lib/format";
import { TrendingUp, Package, IndianRupee, Star } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

export default function SellerDashboard() {
  const { data: analytics, isLoading } = useGetSellerAnalytics();

  if (isLoading) return <div className="p-4">Loading dashboard...</div>;
  if (!analytics) return null;

  return (
    <div className="p-4 space-y-6 pb-20">
      <h1 className="font-heading font-bold text-2xl">Seller Dashboard</h1>

      <div className="grid grid-cols-2 gap-3">
        <Card className="border-border/50 shadow-sm">
          <CardContent className="p-4">
            <IndianRupee className="w-5 h-5 text-secondary mb-2" />
            <div className="text-xs text-muted-foreground font-medium uppercase">This Month</div>
            <div className="text-lg font-bold font-heading">{formatINR(analytics.thisMonthRevenue)}</div>
          </CardContent>
        </Card>
        <Card className="border-border/50 shadow-sm">
          <CardContent className="p-4">
            <Package className="w-5 h-5 text-primary mb-2" />
            <div className="text-xs text-muted-foreground font-medium uppercase">Pending Orders</div>
            <div className="text-lg font-bold font-heading">{analytics.pendingOrders}</div>
          </CardContent>
        </Card>
        <Card className="border-border/50 shadow-sm">
          <CardContent className="p-4">
            <TrendingUp className="w-5 h-5 text-accent mb-2" />
            <div className="text-xs text-muted-foreground font-medium uppercase">Total Revenue</div>
            <div className="text-lg font-bold font-heading">{formatINR(analytics.totalRevenue)}</div>
          </CardContent>
        </Card>
        <Card className="border-border/50 shadow-sm">
          <CardContent className="p-4">
            <Star className="w-5 h-5 text-yellow-500 mb-2" />
            <div className="text-xs text-muted-foreground font-medium uppercase">Avg Rating</div>
            <div className="text-lg font-bold font-heading">{analytics.averageRating}</div>
          </CardContent>
        </Card>
      </div>

      <Card className="border-border/50">
        <CardHeader className="p-4 pb-2">
          <CardTitle className="text-sm font-bold">Revenue by Month</CardTitle>
        </CardHeader>
        <CardContent className="p-4 pt-0 h-48">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={analytics.revenueByMonth}>
              <XAxis dataKey="month" fontSize={10} axisLine={false} tickLine={false} />
              <Tooltip formatter={(value: number) => formatINR(value)} cursor={{ fill: 'transparent' }} />
              <Bar dataKey="revenue" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <div>
        <h2 className="font-heading font-bold text-lg mb-3">Top Products</h2>
        <div className="space-y-3">
          {analytics.topProducts.map((product, i) => (
            <div key={product.productId} className="flex items-center gap-3 p-3 bg-card border border-border rounded-xl">
              <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center font-bold text-sm">
                {i + 1}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium line-clamp-1">{product.title}</div>
                <div className="text-xs text-muted-foreground">{product.unitsSold} units sold</div>
              </div>
              <div className="font-bold text-sm">
                {formatINR(product.revenue)}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
