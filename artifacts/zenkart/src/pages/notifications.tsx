import { useListNotifications, useMarkAllNotificationsRead } from "@workspace/api-client-react";
import { formatDate } from "@/lib/format";
import { Card, CardContent } from "@/components/ui/card";
import { Bell, Package, Tag, Info, TrendingDown, MessageCircle, CheckCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useQueryClient } from "@tanstack/react-query";
import { getListNotificationsQueryKey } from "@workspace/api-client-react";
import { Link } from "wouter";

export default function Notifications() {
  const { data: notifications, isLoading } = useListNotifications();
  const markAllMut = useMarkAllNotificationsRead();
  const queryClient = useQueryClient();

  if (isLoading) return <div className="p-4">Loading...</div>;

  const handleMarkAllRead = () => {
    markAllMut.mutate(undefined, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListNotificationsQueryKey() });
      }
    });
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'order': return <Package className="w-5 h-5 text-blue-500" />;
      case 'deal': return <Tag className="w-5 h-5 text-accent" />;
      case 'price_drop': return <TrendingDown className="w-5 h-5 text-secondary" />;
      case 'message': return <MessageCircle className="w-5 h-5 text-green-500" />;
      default: return <Info className="w-5 h-5 text-muted-foreground" />;
    }
  };

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="font-heading font-bold text-2xl">Notifications</h1>
        <Button variant="ghost" size="sm" onClick={handleMarkAllRead} disabled={markAllMut.isPending || !notifications?.length}>
          <CheckCheck className="w-4 h-4 mr-2" />
          Mark all read
        </Button>
      </div>

      <div className="space-y-2">
        {notifications?.map(notif => (
          <Card key={notif.id} className={`border-border/50 ${!notif.isRead ? 'bg-primary/5' : 'bg-card'}`}>
            <CardContent className="p-4 flex gap-3">
              <div className="shrink-0 mt-1">
                {notif.imageUrl ? (
                  <img src={notif.imageUrl} alt="" className="w-10 h-10 rounded-full object-cover" />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                    {getIcon(notif.type)}
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-start">
                  <h3 className={`text-sm font-medium ${!notif.isRead ? 'text-primary font-bold' : ''}`}>
                    {notif.title}
                  </h3>
                  <span className="text-[10px] text-muted-foreground whitespace-nowrap ml-2">
                    {formatDate(notif.createdAt)}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                  {notif.body}
                </p>
                {notif.actionUrl && (
                  <Link href={notif.actionUrl}>
                    <Button variant="link" className="px-0 h-auto mt-2 text-secondary text-xs">
                      View Details
                    </Button>
                  </Link>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
        {notifications?.length === 0 && (
          <div className="text-center py-12 flex flex-col items-center">
            <Bell className="w-12 h-12 text-muted-foreground mb-4 opacity-20" />
            <p className="text-muted-foreground">No notifications yet</p>
          </div>
        )}
      </div>
    </div>
  );
}
