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
    );
}