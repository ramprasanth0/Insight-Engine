//use-title-animation.ts - custom hook for the scrambling "digital decode" title animation effect

"use client";

import { useState, useEffect } from "react";

//custom hook for the "digital decoding" title animation effect
export function useTitleAnimation(targetText: string = "Insight Engine") {
    const [titleText, setTitleText] = useState(targetText);

    useEffect(() => {
        //characters to use for scrambling effect
        const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*";
        let isMounted = true;

        const runAnimation = async () => {
            //loop through each character to "lock" it in
            for (let i = 0; i <= targetText.length; i++) {
                if (!isMounted) return;

                //easing: start fast, slow down as we progress
                const stepDuration = Math.max(30, 30 + i * 15);
                const scrambles = 3; //scramble a few times before locking

                for (let s = 0; s < scrambles; s++) {
                    if (!isMounted) return;

                    //build scrambled text
                    const scrambledText = targetText
                        .split("")
                        .map((char, index) => {
                            if (index < i) return char; //locked characters stay
                            if (char === " ") return " "; //preserve spaces
                            return chars[Math.floor(Math.random() * chars.length)]; //randomize rest
                        })
                        .join("");

                    setTitleText(scrambledText);
                    await new Promise((r) => setTimeout(r, stepDuration / scrambles));
                }
            }

            //ensure final state is clean
            if (isMounted) {
                setTitleText(targetText);
            }
        };

        runAnimation();

        //cleanup on unmount
        return () => {
            isMounted = false;
        };
    }, [targetText]);

    return titleText;
}
