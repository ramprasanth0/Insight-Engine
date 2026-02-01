import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2, Send } from "lucide-react";
import { CardFooter } from "@/components/ui/card";

interface ChatInputProps {
    input: string;
    setInput: (value: string) => void;
    handleSendQuery: (e: React.FormEvent) => void;
    isLoading: boolean;
    className?: string;
}

export function ChatInput({ input, setInput, handleSendQuery, isLoading, className }: ChatInputProps) {
    return (
        <form onSubmit={handleSendQuery} className={`flex w-full gap-2 ${className}`}>
            <Input
                placeholder="Ask away!..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                disabled={isLoading}
                className="flex-1 bg-input text-foreground focus-visible:ring-primary placeholder:text-muted-foreground"
            />
            <Button type="submit" disabled={isLoading} className="bg-primary hover:bg-primary/90 text-primary-foreground">
                {isLoading ? <Loader2 className="animate-spin" /> : <Send size={18} />}
            </Button>
        </form>
    );
}