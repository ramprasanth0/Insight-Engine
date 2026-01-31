import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2, Send } from "lucide-react";
import { CardFooter } from "@/components/ui/card";

interface ChatInputProps {
    input: string;
    setInput: (value: string) => void;
    handleSendQuery: (e: React.FormEvent) => void;
    isLoading: boolean;
}

export function ChatInput({ input, setInput, handleSendQuery, isLoading }: ChatInputProps) {
    return (
        <CardFooter className="p-4 bg-card border-t border-border">
            <form onSubmit={handleSendQuery} className="flex w-full gap-2">
                <Input
                    placeholder="Ask anything about NextJs..."
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    disabled={isLoading}
                    className="flex-1 bg-input border-border text-foreground focus-visible:ring-primary placeholder:text-muted-foreground"
                />
                <Button type="submit" disabled={isLoading} className="bg-primary hover:bg-primary/90 text-primary-foreground">
                    {isLoading ? <Loader2 className="animate-spin" /> : <Send size={18} />}
                </Button>
            </form>
        </CardFooter>
    );
}