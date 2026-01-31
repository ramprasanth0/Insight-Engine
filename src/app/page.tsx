"use client";
import { useState } from "react";
import { ChatBox, Message } from "@/components/chat-box";
import { ChatInput } from "@/components/chat-input";
import { Bot, Sparkles } from "lucide-react";
import Image from "next/image";
import { Card, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import AppIcon from "./icon.png";

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSendQuery = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return; // Don't send empty messages

    const userMessage = input.trim();   //store the user message
    setInput("")         //clear the input box immediately after storing
    setIsLoading(true);

    setMessages((prev) => [...prev, { role: "user", content: userMessage }])

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
      const decoder = new TextDecoder();
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

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4 bg-background">
      {messages.length === 0 ? (
        // INITIAL STATE: Centered Layout
        <div className="flex flex-col items-center justify-center w-full max-w-2xl space-y-8 animate-in fade-in zoom-in duration-500">
          <div className="flex flex-col items-center space-y-4">
            <div className="p-4 rounded-full bg-gradient-to-r from-primary/10 via-foreground/10 to-primary/10 bg-[length:600%_auto] animate-shimmer ring-4 ring-primary/5">
              <Image
                src={AppIcon}
                alt="Insight Engine Icon"
                width={48}
                height={48}
                className="w-12 h-12"
              />
            </div>
            <h1 className="text-5xl md:text-7xl font-light font-[family-name:var(--font-bitcount)] bg-gradient-to-r from-primary via-foreground to-primary bg-[length:400%_auto] animate-shimmer bg-clip-text text-transparent p-4 mb-20 text-center whitespace-nowrap [word-spacing:1rem]">
              Insight Engine
            </h1>
            <p className="text-muted-foreground text-center max-w-md">
              Ask anything about Next.js. I can help you find answers, debug code, and explore new ideas.
            </p>
          </div>

          <div className="w-full shadow-lg rounded-xl overflow-hidden ring-1 ring-border/50">
            <div className="bg-card p-2">
              <ChatInput
                input={input}
                setInput={setInput}
                handleSendQuery={handleSendQuery}
                isLoading={isLoading}
                className="p-2"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 w-full text-xs text-muted-foreground">
            {["Debug TypeScript", "Explain Hooks", "Generate API Route", "Suggest UI"].map((suggestion) => (
              <button
                key={suggestion}
                onClick={() => setInput(suggestion)}
                className="border border-border/50 bg-card/50 p-2 rounded-lg hover:bg-card hover:border-primary/50 transition-colors text-center truncate"
              >
                {suggestion}
              </button>
            ))}
          </div>
        </div>
      ) : (
        // CHAT STATE: Standard Layout
        <Card className="w-full max-w-2xl h-[85vh] flex flex-col shadow-xl border-border animate-in slide-in-from-bottom-5 duration-500">
          <CardHeader className="border-b border-border bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60">
            <CardTitle className="flex items-center gap-2 text-foreground">
              <div className="p-2 bg-primary rounded-lg text-primary-foreground">
                <Bot size={20} />
              </div>
              Insight Engine
            </CardTitle>
          </CardHeader>

          <ChatBox messages={messages} isLoading={isLoading} />

          <CardFooter className="p-4 bg-card border-t border-border">
            <ChatInput
              input={input}
              setInput={setInput}
              handleSendQuery={handleSendQuery}
              isLoading={isLoading}
            />
          </CardFooter>
        </Card>
      )}
    </main>
  );
}