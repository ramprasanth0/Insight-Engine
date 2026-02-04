//top-controls.tsx - mute and dark mode toggle switches in the top right corner

"use client";

import { Sun, Moon, Volume2, VolumeX } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";

//props for the top controls component
interface TopControlsProps {
    isDarkMode: boolean;
    setIsDarkMode: (value: boolean) => void;
    isMuted: boolean;
    setIsMuted: (value: boolean) => void;
}

//mute and theme toggle switches positioned in top right corner
export function TopControls({
    isDarkMode,
    setIsDarkMode,
    isMuted,
    setIsMuted,
}: TopControlsProps) {
    return (
        <div className="absolute top-4 right-4 flex items-center gap-3">
            {/* Mute Toggle */}
            <TooltipProvider>
                <Tooltip>
                    <TooltipTrigger asChild>
                        <div className="flex items-center">
                            <Switch
                                id="mute-toggle"
                                checked={!isMuted} //inverted because switch ON = sound ON
                                onCheckedChange={(checked) => setIsMuted(!checked)}
                                className="h-6 w-10 bg-gray-200 data-[state=checked]:bg-emerald-600 border-0 shadow-[inset_2px_2px_4px_rgba(0,0,0,0.2),inset_-2px_-2px_4px_rgba(255,255,255,0.8)]"
                                thumbClassName="h-5 w-5 shadow-[2px_2px_4px_rgba(0,0,0,0.2)] data-[state=checked]:translate-x-[18px] data-[state=unchecked]:translate-x-[2px]"
                                thumbContent={
                                    //show different icon based on mute state
                                    isMuted ? (
                                        <VolumeX size={12} className="text-red-500" />
                                    ) : (
                                        <Volume2 size={12} className="text-emerald-600" />
                                    )
                                }
                            />
                        </div>
                    </TooltipTrigger>
                    <TooltipContent>
                        <p>{isMuted ? "Unmute sounds" : "Mute sounds"}</p>
                    </TooltipContent>
                </Tooltip>
            </TooltipProvider>

            {/* Theme Toggle */}
            <TooltipProvider>
                <Tooltip>
                    <TooltipTrigger asChild>
                        <div className="flex items-center">
                            <Switch
                                id="theme-toggle"
                                checked={isDarkMode} //checked = dark mode
                                onCheckedChange={setIsDarkMode}
                                className="h-6 w-10 bg-gray-200 data-[state=checked]:bg-slate-700 border-0 shadow-[inset_2px_2px_4px_rgba(0,0,0,0.2),inset_-2px_-2px_4px_rgba(255,255,255,0.8)]"
                                thumbClassName="h-5 w-5 shadow-[2px_2px_4px_rgba(0,0,0,0.2)] data-[state=checked]:translate-x-[18px] data-[state=unchecked]:translate-x-[2px]"
                                thumbContent={
                                    //moon for dark, sun for light
                                    isDarkMode ? (
                                        <Moon size={12} className="text-slate-300" />
                                    ) : (
                                        <Sun size={12} className="text-amber-500" />
                                    )
                                }
                            />
                        </div>
                    </TooltipTrigger>
                    <TooltipContent>
                        <p>{isDarkMode ? "Switch to light mode" : "Switch to dark mode"}</p>
                    </TooltipContent>
                </Tooltip>
            </TooltipProvider>
        </div>
    );
}
