"use client";
import { useState, useEffect } from "react";
import { ChatBox, Message } from "@/components/chat-box";
import { ChatInput } from "@/components/chat-input";
import { Bot, Sparkles, Globe } from "lucide-react";
import Image from "next/image";
import { Card, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import AppIcon from "./icon.png";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [selectedNamespaces, setSelectedNamespaces] = useState<string[]>([]);
  const [webSearch, setWebSearch] = useState(false);

  const [titleText, setTitleText] = useState("Insight Engine");

  // "Digital Decoding" effect: progressively locks characters to reveal the final title.
  useEffect(() => {
    const targetText = "Insight Engine";
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*";

    let isMounted = true;

    const runAnimation = async () => {
      // Loop through each character index to "lock" it in
      for (let i = 0; i <= targetText.length; i++) {
        if (!isMounted) return;

        // Easing logic: Start fast (30ms), slow down as we progress
        // Using a simple linear increase for the "slow down" effect
        const stepDuration = Math.max(30, 30 + (i * 15));

        // Scramble the "unlocked" characters for a few frames before locking the current index
        const scrambles = 3;
        for (let s = 0; s < scrambles; s++) {
          if (!isMounted) return;

          const scrambledText = targetText.split('').map((char, index) => {
            if (index < i) return char; // Locked characters
            if (char === ' ') return ' ';
            // Randomize remainder
            return chars[Math.floor(Math.random() * chars.length)];
          }).join('');

          setTitleText(scrambledText);
          await new Promise(r => setTimeout(r, stepDuration / scrambles));
        }
      }

      // Ensure final state is clean
      if (isMounted) {
        setTitleText(targetText);
      }
    };

    runAnimation();

    return () => {
      isMounted = false;
    };
  }, []);

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
          messages: [...messages, { role: "user", content: userMessage }],
          namespaces: selectedNamespaces,
          webSearch: webSearch
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

  const toggleNamespace = (ns: string) => {
    setSelectedNamespaces(prev =>
      prev.includes(ns)
        ? prev.filter(n => n !== ns)
        : [...prev, ns]
    );
  };

  const getDynamicContextText = () => {
    if (selectedNamespaces.length === 0) return "Next.js and React.js";
    if (selectedNamespaces.length === 2) return "Next.js and React.js";
    if (selectedNamespaces.includes("nextjs-docs")) return "Next.js";
    if (selectedNamespaces.includes("reactjs-docs")) return "React.js";
    return "Next.js and React.js";
  };

  const NamespaceButtons = () => (
    <div className="flex gap-2 mb-2 px-2">
      <Button
        variant={selectedNamespaces.includes("nextjs-docs") ? "default" : "outline"}
        size="sm"
        onClick={() => toggleNamespace("nextjs-docs")}
        className="rounded-full text-xs"
      >
        Next.js
      </Button>
      <Button
        variant={selectedNamespaces.includes("reactjs-docs") ? "default" : "outline"}
        size="sm"
        onClick={() => toggleNamespace("reactjs-docs")}
        className="rounded-full text-xs"
      >
        React.js
      </Button>
    </div>
  );

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
              {titleText}
            </h1>
            <p className="text-muted-foreground text-center max-w-md">
              Ask anything about {getDynamicContextText()}. I can help you find answers, debug code, and explore new ideas.
            </p>
          </div>

          <div className="w-full shadow-lg rounded-xl overflow-hidden ring-1 ring-border/50">
            <div className="bg-card p-2">
              <div className="flex justify-between items-center mb-2 px-2">
                <NamespaceButtons />
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="flex items-center">
                        <Switch
                          id="web-search-mode"
                          checked={webSearch}
                          onCheckedChange={setWebSearch}
                          className="h-6 w-10 bg-gray-200 data-[state=checked]:bg-blue-500 border-0 shadow-[inset_2px_2px_4px_rgba(0,0,0,0.2),inset_-2px_-2px_4px_rgba(255,255,255,0.8)]"
                          thumbClassName="h-5 w-5 shadow-[2px_2px_4px_rgba(0,0,0,0.2)] data-[state=checked]:translate-x-[18px] data-[state=unchecked]:translate-x-[4px]"
                          thumbContent={
                            <Globe size={14} className={`transition-colors ${webSearch ? "text-blue-500" : "text-gray-400"}`} />
                          }
                        />
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Web search might make the answer less grounded</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
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

          <CardFooter className="flex flex-col p-4 bg-card border-t border-border">
            <div className="w-full">
              <div className="flex justify-between items-center mb-2">
                <NamespaceButtons />
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="flex items-center">
                        <Switch
                          id="web-search-mode-chat"
                          checked={webSearch}
                          onCheckedChange={setWebSearch}
                          className="h-6 w-10 bg-gray-200 data-[state=checked]:bg-blue-500 border-0 shadow-[inset_2px_2px_4px_rgba(0,0,0,0.2),inset_-2px_-2px_4px_rgba(255,255,255,0.8)]"
                          thumbClassName="h-5 w-5 shadow-[2px_2px_4px_rgba(0,0,0,0.2)] data-[state=checked]:translate-x-[18px] data-[state=unchecked]:translate-x-[4px]"
                          thumbContent={
                            <Globe size={14} className={`transition-colors ${webSearch ? "text-blue-500" : "text-gray-400"}`} />
                          }
                        />
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Web search might make the answer less grounded</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
              <ChatInput
                input={input}
                setInput={setInput}
                handleSendQuery={handleSendQuery}
                isLoading={isLoading}
              />
            </div>
          </CardFooter>
        </Card>
      )}
    </main>
  );
}