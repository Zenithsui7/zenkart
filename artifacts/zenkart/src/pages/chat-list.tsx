import { useListConversations } from "@workspace/api-client-react";
import { Link } from "wouter";
import { formatDateTime } from "@/lib/format";
import { Card, CardContent } from "@/components/ui/card";
import { User } from "lucide-react";

export default function ChatList() {
  const { data: conversations, isLoading } = useListConversations();

  if (isLoading) return <div className="p-4">Loading chats...</div>;

  if (!conversations || conversations.length === 0) {
    return (
      <div className="p-8 text-center mt-20">
        <p className="text-muted-foreground">No conversations yet.</p>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-4">
      <h1 className="font-heading font-bold text-2xl">Messages</h1>
      <div className="space-y-2">
        {conversations.map(conv => (
          <Link key={conv.id} href={`/chat/${conv.id}`}>
            <Card className="hover-elevate cursor-pointer border-border/50">
              <CardContent className="p-3 flex gap-3">
                <div className="relative shrink-0">
                  <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center overflow-hidden">
                    {conv.otherUserAvatar ? (
                      <img src={conv.otherUserAvatar} alt={conv.otherUserName} className="w-full h-full object-cover" />
                    ) : (
                      <User className="w-6 h-6 text-muted-foreground" />
                    )}
                  </div>
                  {conv.listingImage && (
                    <img 
                      src={conv.listingImage} 
                      alt="" 
                      className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full border-2 border-background object-cover"
                    />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-baseline mb-0.5">
                    <h3 className={`font-medium text-sm truncate ${conv.unreadCount > 0 ? 'font-bold' : ''}`}>
                      {conv.otherUserName}
                    </h3>
                    <span className="text-[10px] text-muted-foreground shrink-0 ml-2">
                      {formatDateTime(conv.updatedAt)}
                    </span>
                  </div>
                  {conv.listingTitle && (
                    <div className="text-xs text-primary mb-1 truncate font-medium">
                      Regarding: {conv.listingTitle}
                    </div>
                  )}
                  <p className={`text-sm line-clamp-1 ${conv.unreadCount > 0 ? 'text-foreground font-semibold' : 'text-muted-foreground'}`}>
                    {conv.lastMessage}
                  </p>
                </div>
                {conv.unreadCount > 0 && (
                  <div className="shrink-0 flex items-center">
                    <div className="w-5 h-5 rounded-full bg-secondary text-secondary-foreground flex items-center justify-center text-xs font-bold">
                      {conv.unreadCount}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
