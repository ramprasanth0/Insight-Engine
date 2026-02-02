import { useRef, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
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
                            <Avatar className="bg-secondary">
                                <AvatarFallback className="text-secondary-foreground">
                                    {m.role === "user" ? <User size={18} /> : <Bot size={18} />}
                                </AvatarFallback>
                            </Avatar>

                            <div className={`max-w-[80%] rounded-2xl px-4 py-2 text-sm shadow-sm ${m.role === "user"
                                ? "bg-primary text-white rounded-tr-none"
                                : "bg-muted text-foreground border border-border rounded-tl-none"
                                }`}>
                                <div className={`prose prose-sm max-w-none break-words ${m.role === "user" ? "[&_*]:text-white" : "dark:prose-invert"}`}>
                                    <ReactMarkdown
                                        remarkPlugins={[remarkGfm]}                                         // Render Markdown with GitHub Flavored support and Tailwind typography for automated styling.
                                        components={{
                                            // Optional: Custom renderers can be defined here if we need specific styling for code blocks,
                                            // links, or images that deviates from the default 'prose' styles.
                                        }}
                                    >
                                        {m.content}
                                    </ReactMarkdown>
                                </div>
                            </div>
                        </div>
                    ))}

                    {isLoading && (
                        messages.length === 0 ||
                        messages[messages.length - 1].role === "user" ||
                        (messages[messages.length - 1].role === "assistant" && messages[messages.length - 1].content === "")
                    ) && (
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