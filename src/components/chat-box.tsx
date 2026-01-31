import { useRef, useEffect } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { User, Bot, Loader2 } from "lucide-react";
import { CardContent } from "@/components/ui/card";

// Re-defining the Message interface here to avoid circular dependencies if we don't export from page.tsx, 
// or ideally importing it if exported.
export interface Message {
    role: "user" | "assistant";
    content: string;
}

interface ChatBoxProps {
    messages: Message[];
    isLoading: boolean;
}

export function ChatBox({ messages, isLoading }: ChatBoxProps) {
    // Ref/Effect for auto-scrolling (kept with the UI that needs it)
    const scrollRef = useRef<HTMLDivElement>(null);
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTo({
                top: scrollRef.current.scrollHeight,
                behavior: "smooth",
            });
        }
    }, [messages]);

    return (
        <CardContent className="flex-1 overflow-hidden p-0 bg-card">
            <ScrollArea className="h-full p-6" ref={scrollRef}>
                <div className="space-y-6">
                    {messages.map((m, i) => (
                        <div
                            key={i}
                            className={`flex gap-3 ${m.role === "user" ? "flex-row-reverse" : ""}`}
                        >
                            <Avatar className={m.role === "user" ? "bg-primary" : "bg-muted"}>
                                <AvatarFallback className="text-primary-foreground">
                                    {m.role === "user" ? <User size={18} /> : <Bot size={18} />}
                                </AvatarFallback>
                            </Avatar>

                            <div className={`max-w-[80%] rounded-2xl px-4 py-2 text-sm shadow-sm ${m.role === "user"
                                ? "bg-primary text-primary-foreground rounded-tr-none"
                                : "bg-muted text-muted-foreground border border-border rounded-tl-none"
                                }`}>
                                {m.content}
                            </div>
                        </div>
                    ))}

                    {isLoading && messages[messages.length - 1]?.content === "" && (
                        <div className="flex gap-2 items-center text-muted-foreground text-xs ml-12">
                            <Loader2 size={14} className="animate-spin" />
                            Searching documents...
                        </div>
                    )}
                </div>
            </ScrollArea>
        </CardContent>
    );
}