"use client";
import { useState, useEffect } from "react";
import { ChatBox, Message } from "@/components/chat-box";
import { ChatInput } from "@/components/chat-input";
import { Bot, Sparkles } from "lucide-react";
import Image from "next/image";
import { Card, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import AppIcon from "./icon.png";

//modular components
import { TopControls } from "@/components/top-controls";
import { NamespaceButtons } from "@/components/namespace-buttons";
import { WebSearchToggle } from "@/components/web-search-toggle";
import { useTitleAnimation } from "@/hooks/use-title-animation";

export default function ChatPage() {
  //state management
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [selectedNamespaces, setSelectedNamespaces] = useState<string[]>([]);
  const [webSearch, setWebSearch] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [isMuted, setIsMuted] = useState(false);

  //custom hook for title animation
  const titleText = useTitleAnimation("Insight Engine");

  //theme toggle effect - adds/removes class on html element
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.remove("light");
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
      document.documentElement.classList.add("light");
    }
  }, [isDarkMode]);

  //handle sending query to API
  const handleSendQuery = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return; //don't send empty messages

    const userMessage = input.trim(); //store the user message
    setInput(""); //clear input immediately
    setIsLoading(true);

    //add user message to chat
    setMessages((prev) => [...prev, { role: "user", content: userMessage }]);

    try {
      //call the API
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messages: [...messages, { role: "user", content: userMessage }],
          namespaces: selectedNamespaces,
          webSearch: webSearch,
        }),
      });

      if (!response.body) return;

      //setup stream reader
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let assistantText = "";

      //add placeholder for AI response
      setMessages((prev) => [...prev, { role: "assistant", content: "" }]);

      //the loop: drip-feed text into state
      while (true) {
        const { done, value } = await reader.read();
        if (done) break; //break when done

        //convert binary chunk to string
        assistantText += decoder.decode(value, { stream: true });

        //update ONLY the last message
        setMessages((prev) => {
          const otherMessages = prev.slice(0, -1);
          return [...otherMessages, { role: "assistant", content: assistantText }];
        });
      }
    } catch (error) {
      console.error("Error processing request:", error);
    } finally {
      setIsLoading(false);
    }
  };

  //toggle namespace selection
  const toggleNamespace = (ns: string) => {
    setSelectedNamespaces((prev) =>
      prev.includes(ns) ? prev.filter((n) => n !== ns) : [...prev, ns]
    );
  };

  //get dynamic context text for headline
  const getDynamicContextText = () => {
    if (selectedNamespaces.length === 0) return "Next.js and React.js";
    if (selectedNamespaces.length === 2) return "Next.js and React.js";
    if (selectedNamespaces.includes("nextjs-docs")) return "Next.js";
    if (selectedNamespaces.includes("reactjs-docs")) return "React.js";
    return "Next.js and React.js";
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4 bg-background relative">
      {/* Top Right Controls - mute and theme toggles */}
      <TopControls
        isDarkMode={isDarkMode}
        setIsDarkMode={setIsDarkMode}
        isMuted={isMuted}
        setIsMuted={setIsMuted}
      />

      {messages.length === 0 ? (
        // INITIAL STATE: Centered Layout
        <div className="flex flex-col items-center justify-center w-full max-w-2xl space-y-8 animate-in fade-in zoom-in duration-500">
          <div className="flex flex-col items-center space-y-4">
            {/* App icon with shimmer effect */}
            <div className="p-4 rounded-full bg-gradient-to-r from-primary/10 via-foreground/10 to-primary/10 bg-[length:600%_auto] animate-shimmer ring-4 ring-primary/5">
              <Image
                src={AppIcon}
                alt="Insight Engine Icon"
                width={48}
                height={48}
                className="w-12 h-12"
              />
            </div>
            {/* Animated title */}
            <h1 className="text-5xl md:text-7xl font-light font-[family-name:var(--font-bitcount)] bg-gradient-to-r from-primary via-foreground to-primary bg-[length:400%_auto] animate-shimmer bg-clip-text text-transparent p-4 mb-20 text-center whitespace-nowrap [word-spacing:1rem]">
              {titleText}
            </h1>
            {/* Dynamic description based on selected namespaces */}
            <p className="text-muted-foreground text-center max-w-md">
              Ask anything about {getDynamicContextText()}. I can help you find
              answers, debug code, and explore new ideas.
            </p>
          </div>

          {/* Search input container */}
          <div className="w-full shadow-lg rounded-xl overflow-hidden ring-1 ring-border/50">
            <div className="bg-card p-2">
              <div className="flex justify-between items-center mb-2 px-2">
                <NamespaceButtons
                  selectedNamespaces={selectedNamespaces}
                  onToggleNamespace={toggleNamespace}
                />
                <WebSearchToggle webSearch={webSearch} setWebSearch={setWebSearch} />
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

          {/* Suggestion buttons */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 w-full text-xs text-muted-foreground">
            {["Debug TypeScript", "Explain Hooks", "Generate API Route", "Suggest UI"].map(
              (suggestion) => (
                <button
                  key={suggestion}
                  onClick={() => setInput(suggestion)}
                  className="border border-border/50 bg-card/50 p-2 rounded-lg hover:bg-card hover:border-primary/50 transition-colors text-center truncate"
                >
                  {suggestion}
                </button>
              )
            )}
          </div>
        </div>
      ) : (
        // CHAT STATE: Full Page Layout
        <Card className="w-full max-w-2xl flex flex-col h-[calc(100vh-2rem)] border border-border shadow-xl bg-card/90 backdrop-blur-sm overflow-hidden">
          {/* Card header with bot icon */}
          <CardHeader className="flex flex-row items-center gap-3 p-4 bg-card border-b border-border shrink-0">
            <div className="p-2 rounded-full bg-primary/10">
              <Bot className="w-5 h-5 text-primary" />
            </div>
            <CardTitle className="flex items-center gap-2 text-lg font-medium">
              <Sparkles className="w-4 h-4 text-primary animate-pulse" />
              Insight Engine
            </CardTitle>
          </CardHeader>

          {/* Chat messages */}
          <ChatBox messages={messages} isLoading={isLoading} />

          {/* Chat input footer */}
          <CardFooter className="flex flex-col p-4 bg-card border-t border-border">
            <div className="w-full">
              <div className="flex justify-between items-center mb-2">
                <NamespaceButtons
                  selectedNamespaces={selectedNamespaces}
                  onToggleNamespace={toggleNamespace}
                />
                <WebSearchToggle webSearch={webSearch} setWebSearch={setWebSearch} />
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