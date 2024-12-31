// components/loading-screen.tsx
import { Home } from "lucide-react";

export default function LoadingScreen() {
    return (
        <div className="flex flex-col items-center justify-center min-h-[400px]">
            <div className="relative">
                <div className="absolute inset-0 rounded-full animate-ping bg-blue-400 opacity-20"></div>
                <div className="relative bg-background rounded-full p-4 shadow-lg animate-pulse">
                    <Home className="h-12 w-12 text-primary animate-bounce" />
                </div>
            </div>
            <div className="mt-8 text-muted-foreground">
                <span className="inline-block animate-pulse">Loading</span>
                <span className="inline-block ml-1 animate-bounce delay-100">.</span>
                <span className="inline-block ml-1 animate-bounce delay-200">.</span>
                <span className="inline-block ml-1 animate-bounce delay-300">.</span>
            </div>
        </div>
    );
}

export function LoadingSpinner() {
    return (
        <div className="flex items-center justify-center p-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
    );
}