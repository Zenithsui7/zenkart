import { useGetWallet, useListWalletTransactions } from "@workspace/api-client-react";
import { formatINR, formatDate } from "@/lib/format";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Wallet as WalletIcon, ArrowUpRight, ArrowDownLeft, Coins } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function Wallet() {
  const { data: wallet, isLoading: loadingWallet } = useGetWallet();
  const { data: transactions, isLoading: loadingTx } = useListWalletTransactions();

  if (loadingWallet || loadingTx) return <div className="p-4">Loading wallet...</div>;
  if (!wallet) return null;

  return (
    <div className="p-4 space-y-6">
      <h1 className="font-heading font-bold text-2xl">My Wallet</h1>

      <Card className="bg-primary text-primary-foreground border-none">
        <CardContent className="p-6">
          <div className="flex items-center gap-3 mb-2">
            <WalletIcon className="w-6 h-6 text-secondary" />
            <span className="text-sm font-medium text-primary-foreground/80">Available Balance</span>
          </div>
          <div className="text-4xl font-bold font-heading mb-4">
            {formatINR(wallet.balance)}
          </div>
          
          <div className="flex items-center gap-2 p-3 bg-white/10 rounded-lg">
            <Coins className="w-5 h-5 text-accent" />
            <div>
              <div className="font-bold text-sm">{wallet.zenCoins} ZenCoins</div>
              <div className="text-xs text-primary-foreground/70">Value: {formatINR(wallet.zenCoinsValue)}</div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div>
        <h2 className="font-heading font-bold text-lg mb-3">Recent Transactions</h2>
        <div className="space-y-3">
          {transactions?.map(tx => (
            <div key={tx.id} className="flex items-center justify-between p-3 bg-card border border-border rounded-xl">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  ['credit', 'cashback', 'refund', 'commission'].includes(tx.type) 
                    ? 'bg-secondary/10 text-secondary' 
                    : 'bg-destructive/10 text-destructive'
                }`}>
                  {['credit', 'cashback', 'refund', 'commission'].includes(tx.type) ? (
                    <ArrowDownLeft className="w-5 h-5" />
                  ) : (
                    <ArrowUpRight className="w-5 h-5" />
                  )}
                </div>
                <div>
                  <div className="font-medium text-sm">{tx.description}</div>
                  <div className="text-xs text-muted-foreground">{formatDate(tx.createdAt)}</div>
                </div>
              </div>
              <div className={`font-bold ${
                ['credit', 'cashback', 'refund', 'commission'].includes(tx.type) 
                  ? 'text-secondary' 
                  : 'text-foreground'
              }`}>
                {['credit', 'cashback', 'refund', 'commission'].includes(tx.type) ? '+' : '-'}{formatINR(tx.amount)}
              </div>
            </div>
          ))}
          {transactions?.length === 0 && (
            <div className="text-center text-muted-foreground py-8">
              No recent transactions
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
