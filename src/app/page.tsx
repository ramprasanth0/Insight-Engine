"use client";
import { useState } from "react";
import { ChatBox, Message } from "@/components/chat-box";
import { ChatInput } from "@/components/chat-input";
import { Bot } from "lucide-react";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";

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

  // The JSX Layout
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4 bg-background">
      {/* 1. The Main Container */}
      <Card className="w-full max-w-2xl h-[85vh] flex flex-col shadow-xl border-border">

        {/* 2. Header */}
        <CardHeader className="border-b border-border bg-card">
          <CardTitle className="flex items-center gap-2 text-foreground">
            <div className="p-2 bg-primary rounded-lg text-primary-foreground">
              <Bot size={20} />
            </div>
            Insight Engine
          </CardTitle>
        </CardHeader>

        {/* 3. The Chat Box Component */}
        <ChatBox messages={messages} isLoading={isLoading} />

        {/* 4. The Chat Input Component */}
        <ChatInput
          input={input}
          setInput={setInput}
          handleSendQuery={handleSendQuery}
          isLoading={isLoading}
        />
      </Card>
    </main>
  );
}