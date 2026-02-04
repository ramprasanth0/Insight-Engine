//namespace-buttons.tsx - toggle buttons for selecting which documentation namespaces to search

"use client";

import { Button } from "@/components/ui/button";

//props for namespace button selection
interface NamespaceButtonsProps {
    selectedNamespaces: string[];
    onToggleNamespace: (ns: string) => void;
}

//toggle buttons for selecting which docs to search
export function NamespaceButtons({
    selectedNamespaces,
    onToggleNamespace,
}: NamespaceButtonsProps) {
    return (
        <div className="flex gap-2 mb-2 px-2">
            {/* Next.js namespace toggle */}
            <Button
                variant={selectedNamespaces.includes("nextjs-docs") ? "default" : "outline"} //highlight if selected
                size="sm"
                onClick={() => onToggleNamespace("nextjs-docs")}
                className="rounded-full text-xs"
            >
                Next.js
            </Button>
            {/* React.js namespace toggle */}
            <Button
                variant={selectedNamespaces.includes("reactjs-docs") ? "default" : "outline"} //highlight if selected
                size="sm"
                onClick={() => onToggleNamespace("reactjs-docs")}
                className="rounded-full text-xs"
            >
                React.js
            </Button>
        </div>
    );
}
