import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2, Send, Globe } from "lucide-react";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";

interface ChatInputProps {
    input: string;
    setInput: (value: string) => void;
    handleSendQuery: (e: React.FormEvent) => void;
    isLoading: boolean;
    webSearch?: boolean;
    setWebSearch?: (value: boolean) => void;
    className?: string;
}

export function ChatInput({ input, setInput, handleSendQuery, isLoading, webSearch, setWebSearch, className }: ChatInputProps) {
    return (
        <form onSubmit={handleSendQuery} className={`flex w-full items-center gap-2 ${className}`}>
            <Input
                placeholder="Ask away!..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                disabled={isLoading}
                className="flex-1 bg-input text-foreground focus-visible:ring-primary placeholder:text-muted-foreground"
            />

            {setWebSearch && (
                <TooltipProvider>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className={`w-auto h-auto p-2 hover:bg-transparent ${webSearch ? "text-blue-500" : "text-muted-foreground"}`}
                                onClick={() => setWebSearch(!webSearch)}
                            >
                                <Globe className="!w-6 !h-6" />
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                            <p>Web search might make the answer less grounded</p>
                        </TooltipContent>
                    </Tooltip>
                </TooltipProvider>
            )}

            <Button type="submit" disabled={isLoading} className="bg-primary hover:bg-primary/90 text-primary-foreground h-10 w-10 p-0">
                {isLoading ? <Loader2 className="animate-spin" /> : <Send size={20} />}
            </Button>
        </form>
    );
}
