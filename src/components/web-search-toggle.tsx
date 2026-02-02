"use client";

import { Globe } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";

//props for web search toggle
interface WebSearchToggleProps {
    webSearch: boolean;
    setWebSearch: (value: boolean) => void;
}

//toggle for enabling web search alongside knowledge base
export function WebSearchToggle({ webSearch, setWebSearch }: WebSearchToggleProps) {
    return (
        <TooltipProvider>
            <Tooltip>
                <TooltipTrigger asChild>
                    <div className="flex items-center">
                        <Switch
                            id="web-search-mode"
                            checked={webSearch} //checked = web search enabled
                            onCheckedChange={setWebSearch}
                            className="h-6 w-10 bg-gray-200 data-[state=checked]:bg-blue-500 border-0 shadow-[inset_2px_2px_4px_rgba(0,0,0,0.2),inset_-2px_-2px_4px_rgba(255,255,255,0.8)]"
                            thumbClassName="h-5 w-5 shadow-[2px_2px_4px_rgba(0,0,0,0.2)] data-[state=checked]:translate-x-[18px] data-[state=unchecked]:translate-x-[4px]"
                            thumbContent={
                                //globe icon changes color based on state
                                <Globe
                                    size={14}
                                    className={`transition-colors ${webSearch ? "text-blue-500" : "text-gray-400"}`}
                                />
                            }
                        />
                    </div>
                </TooltipTrigger>
                <TooltipContent>
                    <p>Web search might make the answer less grounded</p>
                </TooltipContent>
            </Tooltip>
        </TooltipProvider>
    );
}
