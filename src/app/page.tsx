"use client";         //to use useEffect
import { useState, useRef, useEffect } from "react";
// import { ChatBox } from "@/components/chat-box";
// import { ChatInput } from "@/components/chat-input";
import { Send, Bot, User, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

// Defining our message structure
interface Message {
  role: "user" | "assistant";
  content: string;
}

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Ref for auto-scrolling
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom whenever messages change (dependency array -> [messages])
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  }, [messages]);

  const handleSendQuery = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return; // Don't send empty messages

    const userMessage = input.trim();   //store the user message
    setInput("")         //clear the input box immediately after storing
    setIsLoading(true);

    setMessages((prev) => [...prev, { role: "user", content: userMessage }])
    // 'prev' is the latest array of messages stored in React's memory
    // It is NOT necessarily the 'messages' variable you see in your code

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: [...messages, { role: "user", content: userMessage }]
        }),
      });

      if (!response.body) return;

      // Setup the Stream Reader
      const reader = response.body.getReader();
      const decoder = new TextDecoder();        //cause we are receiving bytes from the API
      let assistantText = "";

      // Add a "placeholder" message for the AI that we will fill up
      setMessages((prev) => [...prev, { role: "assistant", content: "" }]);

      // The Loop: Drip-feed the text into state
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;      //Break out of the loop when done

        // Convert binary chunk to string
        assistantText += decoder.decode(value, { stream: true });

        //update ONLY the last message
        setMessages((prev) => {
          const otherMessages = prev.slice(0, -1); // Everything but the last one
          return [...otherMessages, { role: "assistant", content: assistantText }]; //Return the updated array
        });
      }
    } catch (error) {
      console.error("Error processing request:", error);
    } finally {
      setIsLoading(false);
    }
  }
  // The JSX Layout
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4 bg-zinc-50">
      {/* 1. The Main Container */}
      <Card className="w-full max-w-2xl h-[85vh] flex flex-col shadow-xl border-zinc-200">

        {/* 2. Header */}
        <CardHeader className="border-b bg-white">
          <CardTitle className="flex items-center gap-2 text-zinc-800">
            <div className="p-2 bg-indigo-600 rounded-lg text-white">
              <Bot size={20} />
            </div>
            Insight Engine
          </CardTitle>
        </CardHeader>

        {/* 3. The Scrollable Chat Area */}
        <CardContent className="flex-1 overflow-hidden p-0">
          <ScrollArea className="h-full p-6">
            <div className="space-y-6">
              {messages.map((m, i) => (
                <div
                  key={i}
                  className={`flex gap-3 ${m.role === "user" ? "flex-row-reverse" : ""}`}
                >
                  {/* Avatar Icon */}
                  <Avatar className={m.role === "user" ? "bg-zinc-800" : "bg-indigo-600"}>
                    <AvatarFallback className="text-white">
                      {m.role === "user" ? <User size={18} /> : <Bot size={18} />}
                    </AvatarFallback>
                  </Avatar>

                  {/* The Bubble */}
                  <div className={`max-w-[80%] rounded-2xl px-4 py-2 text-sm shadow-sm ${m.role === "user"
                    ? "bg-zinc-800 text-white rounded-tr-none"
                    : "bg-white border border-zinc-200 text-zinc-800 rounded-tl-none"
                    }`}>
                    {m.content}
                  </div>
                </div>
              ))}

              {/* Show "thinking" dots when loading but message is empty */}
              {isLoading && messages[messages.length - 1]?.content === "" && (
                <div className="flex gap-2 items-center text-zinc-400 text-xs ml-12">
                  <Loader2 size={14} className="animate-spin" />
                  Searching documents...
                </div>
              )}
            </div>
          </ScrollArea>
        </CardContent>

        {/* 4. The Sticky Input Bar */}
        <CardFooter className="p-4 bg-white border-t">
          <form onSubmit={handleSendQuery} className="flex w-full gap-2">
            <Input
              placeholder="Ask anything about the docs..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={isLoading}
              className="flex-1 bg-zinc-50 border-zinc-200 focus-visible:ring-indigo-500"
            />
            <Button type="submit" disabled={isLoading} className="bg-indigo-600 hover:bg-indigo-700">
              {isLoading ? <Loader2 className="animate-spin" /> : <Send size={18} />}
            </Button>
          </form>
        </CardFooter>
      </Card>
    </main>
  );
}