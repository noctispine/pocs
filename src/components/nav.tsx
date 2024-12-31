// components/nav.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, Home, ChevronLeft } from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { cn } from "@/lib/utils";

// NavLink component with active state handling
const NavLink = ({
    href,
    children,
    onClick,
    className
}: {
    href: string;
    children: React.ReactNode;
    onClick?: () => void;
    className?: string;
}) => {
    const pathname = usePathname();
    const isActive = pathname.startsWith(href);

    return (
        <Link
            href={href}
            onClick={onClick}
            className={cn(
                "flex items-center justify-between px-4 py-2 text-sm transition-colors hover:text-primary",
                isActive ? "font-medium text-primary" : "text-muted-foreground",
                className
            )}
        >
            <span className="flex items-center gap-2">{children}</span>
            {isActive && <ChevronLeft className="h-4 w-4 md:hidden" />}
        </Link>
    );
};

export function Nav() {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    {/* Logo/Home */}
                    <div className="flex items-center">
                        <Link href="/" className="flex items-center text-primary">
                            <Home className="h-5 w-5" />
                            <span className="ml-2 font-semibold">PoContainer</span>
                        </Link>
                    </div>

                    {/* Mobile menu button */}
                    <div className="md:hidden">
                        <Sheet open={isOpen} onOpenChange={setIsOpen}>
                            <SheetTrigger asChild>
                                <Button variant="ghost" size="icon">
                                    <Menu className="h-5 w-5" />
                                    <span className="sr-only">Open menu</span>
                                </Button>
                            </SheetTrigger>
                            <SheetContent side="right" className="w-72">
                                <SheetHeader>
                                    <SheetTitle>
                                        <Link
                                            href="/"
                                            className="flex items-center text-primary"
                                            onClick={() => setIsOpen(false)}
                                        >
                                            <Home className="h-5 w-5" />
                                            <span className="ml-2 font-semibold">PoContainer</span>
                                        </Link>
                                    </SheetTitle>
                                </SheetHeader>
                                <nav className="mt-6 flex flex-col gap-2">
                                    <NavLink href="/bisect" onClick={() => setIsOpen(false)}>
                                        Bisect
                                    </NavLink>
                                    {/* Add more NavLinks here as needed */}
                                </nav>
                            </SheetContent>
                        </Sheet>
                    </div>

                    {/* Desktop Navigation */}
                    <nav className="hidden md:flex md:gap-1">
                        <NavLink href="/bisect" className="rounded-md px-3 py-2 hover:bg-accent">
                            Bisect
                        </NavLink>
                        {/* Add more NavLinks here as needed */}
                    </nav>
                </div>
            </div>
        </header>
    );
}