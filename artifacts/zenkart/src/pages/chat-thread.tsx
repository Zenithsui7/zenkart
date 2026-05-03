import { useState, useRef, useEffect } from "react";
import { useListMessages, useSendMessage, getListMessagesQueryKey, getListConversationsQueryKey } from "@workspace/api-client-react";
import { useParams } from "wouter";
import { useAuth } from "@/context/auth-context";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Send } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";

export default function ChatThread() {
  const { id } = useParams<{ id: string }>();
  const conversationId = Number(id);
  const { user } = useAuth();
  const { data: messages, isLoading } = useListMessages(conversationId, { query: { enabled: !!conversationId } });
  const sendMut = useSendMessage();
  const queryClient = useQueryClient();
  const [text, setText] = useState("");
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  if (isLoading) return <div className="p-4">Loading messages...</div>;

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;

    sendMut.mutate({ conversationId, data: { text } }, {
      onSuccess: () => {
        setText("");
        queryClient.invalidateQueries({ queryKey: getListMessagesQueryKey(conversationId) });
        queryClient.invalidateQueries({ queryKey: getListConversationsQueryKey() });
      }
    });
  };

  return (
    <div className="flex flex-col h-[calc(100vh-4rem-4rem)]">
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages?.map(msg => {
          const isMine = msg.senderId === user?.id;
          return (
            <div key={msg.id} className={`flex flex-col max-w-[80%] ${isMine ? 'ml-auto items-end' : 'mr-auto items-start'}`}>
              <div className={`p-3 rounded-2xl ${isMine ? 'bg-primary text-primary-foreground rounded-tr-sm' : 'bg-muted rounded-tl-sm'}`}>
                <p className="text-sm">{msg.text}</p>
              </div>
              <span className="text-[10px] text-muted-foreground mt-1 mx-1">
                {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
          );
        })}
        <div ref={endRef} />
      </div>

      <div className="p-3 bg-background border-t border-border">
        <form onSubmit={handleSend} className="flex gap-2">
          <Input 
            value={text} 
            onChange={e => setText(e.target.value)} 
            placeholder="Type a message..." 
            className="rounded-full"
          />
          <Button type="submit" size="icon" className="rounded-full shrink-0" disabled={sendMut.isPending || !text.trim()}>
            <Send className="w-4 h-4" />
          </Button>
        </form>
      </div>
    </div>
  );
}
