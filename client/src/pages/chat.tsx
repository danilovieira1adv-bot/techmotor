import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Send, Bot, User, RefreshCw, AlertCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useQueryClient } from "@tanstack/react-query";

interface Message {
  role: "user" | "assistant";
  content: string;
}

export default function ChatPage() {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [conversationId, setConversationId] = useState<number | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Initialize conversation on mount
  useEffect(() => {
    async function initChat() {
      try {
        const res = await fetch("/api/conversations", { 
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ title: "New Support Chat" }) 
        });
        if (res.ok) {
          const data = await res.json();
          setConversationId(data.id);
          // Add welcome message
          setMessages([{ role: "assistant", content: "Hello! I'm the RetíficaPro AI assistant. How can I help you with engine diagnostics or parts today?" }]);
        }
      } catch (err) {
        console.error("Failed to init chat", err);
      }
    }
    initChat();
  }, []);

  const scrollToBottom = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: "smooth" });
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || !conversationId) return;

    const userMessage = input;
    setInput("");
    setMessages(prev => [...prev, { role: "user", content: userMessage }]);
    setIsLoading(true);

    try {
      const response = await fetch(`/api/conversations/${conversationId}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: userMessage }),
      });

      if (!response.ok) throw new Error("Failed to send message");
      if (!response.body) throw new Error("No response body");

      // Handle SSE Streaming
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let assistantMessage = "";
      
      // Add empty assistant message to update
      setMessages(prev => [...prev, { role: "assistant", content: "" }]);

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split("\n\n");
        
        for (const line of lines) {
          if (line.startsWith("data: ")) {
            const data = JSON.parse(line.slice(6));
            
            if (data.content) {
              assistantMessage += data.content;
              // Update last message
              setMessages(prev => {
                const newMessages = [...prev];
                newMessages[newMessages.length - 1].content = assistantMessage;
                return newMessages;
              });
            }
          }
        }
      }
    } catch (error) {
      console.error("Chat error:", error);
      setMessages(prev => [...prev, { role: "assistant", content: "Sorry, I encountered an error connecting to the server. Please try again." }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="h-[calc(100vh-2rem)] p-4 md:p-8 max-w-5xl mx-auto flex flex-col gap-4">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">AI Assistant</h1>
        <p className="text-muted-foreground">Technical support and parts identification via simulated WhatsApp interface.</p>
      </div>

      <Card className="flex-1 flex flex-col overflow-hidden shadow-xl border-t-4 border-t-primary">
        <CardHeader className="bg-muted/30 border-b pb-4">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="h-10 w-10 rounded-full bg-green-500/10 flex items-center justify-center border border-green-500/20">
                <Bot className="h-6 w-6 text-green-600" />
              </div>
              <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-green-500 border-2 border-background animate-pulse"></span>
            </div>
            <div>
              <CardTitle className="text-lg">WhatsApp Support Simulator</CardTitle>
              <CardDescription>RetíficaPro AI Agent • Online</CardDescription>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="flex-1 p-0 overflow-hidden relative">
          {/* Chat background pattern */}
          <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: "radial-gradient(#000 1px, transparent 1px)", backgroundSize: "20px 20px" }}></div>
          
          <ScrollArea className="h-full p-4 md:p-6">
            <div className="flex flex-col gap-6 pb-4">
              <AnimatePresence initial={false}>
                {messages.map((msg, idx) => (
                  <motion.div 
                    key={idx}
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{ duration: 0.2 }}
                    className={`flex items-start gap-3 ${msg.role === "user" ? "flex-row-reverse" : "flex-row"}`}
                  >
                    <Avatar className={`h-8 w-8 mt-1 border shadow-sm ${msg.role === "user" ? "bg-primary text-primary-foreground" : "bg-green-100 text-green-700"}`}>
                      {msg.role === "user" ? (
                        <AvatarImage src={user?.profileImageUrl || ""} />
                      ) : (
                        <div className="flex items-center justify-center w-full h-full bg-green-100">
                          <Bot className="h-5 w-5 text-green-700" />
                        </div>
                      )}
                      <AvatarFallback>{msg.role === "user" ? "ME" : "AI"}</AvatarFallback>
                    </Avatar>
                    
                    <div 
                      className={`
                        rounded-2xl px-4 py-3 max-w-[80%] text-sm shadow-sm
                        ${msg.role === "user" 
                          ? "bg-primary text-primary-foreground rounded-tr-sm" 
                          : "bg-white dark:bg-muted text-foreground border border-border/50 rounded-tl-sm"
                        }
                      `}
                    >
                      {msg.content}
                    </div>
                  </motion.div>
                ))}
                {isLoading && (
                   <motion.div 
                     initial={{ opacity: 0 }} 
                     animate={{ opacity: 1 }}
                     className="flex items-center gap-2 text-xs text-muted-foreground ml-12"
                   >
                     <RefreshCw className="h-3 w-3 animate-spin" />
                     Thinking...
                   </motion.div>
                )}
              </AnimatePresence>
              <div ref={scrollRef} />
            </div>
          </ScrollArea>
        </CardContent>

        <div className="p-4 bg-muted/30 border-t">
          <form onSubmit={handleSubmit} className="flex gap-3">
            <Input 
              placeholder="Type your message..." 
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={isLoading || !conversationId}
              className="bg-background shadow-sm border-border/60 focus-visible:ring-primary/20"
            />
            <Button 
              type="submit" 
              size="icon" 
              disabled={isLoading || !conversationId || !input.trim()}
              className="bg-green-600 hover:bg-green-700 shadow-lg shadow-green-600/20"
            >
              <Send className="h-4 w-4" />
            </Button>
          </form>
        </div>
      </Card>
    </div>
  );
}
