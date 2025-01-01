"use client";
import React, { useEffect, useRef } from 'react';
import { Check, X, ArrowRight } from 'lucide-react';

interface Commit {
    hash: string;
    message: string;
}

interface CommitListProps {
    commits: Commit[];
    currentIndex: number | null;
    goodCommits: Set<string>;
    badCommits: Set<string>;
}

export function CommitList({ commits, currentIndex, goodCommits, badCommits }: CommitListProps) {
    const listRef = useRef<HTMLDivElement>(null);
    const itemRefs = useRef<Record<number, HTMLDivElement | null>>({});

    useEffect(() => {
        if (currentIndex !== null && itemRefs.current[currentIndex]) {
            itemRefs.current[currentIndex]?.scrollIntoView({
                behavior: 'smooth',
                block: 'center'
            });
        }
    }, [currentIndex]);

    return (
        <div ref={listRef} className="max-h-96 overflow-y-auto">
            {commits.map((commit, index) => {
                const isGood = goodCommits.has(commit.hash);
                const isBad = badCommits.has(commit.hash);
                const isCurrent = currentIndex === index;
                
                return (
                    <div
                        key={commit.hash}
                        ref={(el: HTMLDivElement | null) => {
                            itemRefs.current[index] = el;
                        }}
                        className={`px-4 py-3 flex items-center gap-3 transition-colors duration-200 ${
                            isGood ? 'bg-green-50' :
                            isBad ? 'bg-red-50' :
                            'bg-white'
                        }`}
                    >
                        {isCurrent && (
                            <div className="animate-pulse">
                                <ArrowRight className="w-4 h-4 text-blue-500" />
                            </div>
                        )}
                        {!isCurrent && <div className="w-4" />}
                        <div className="flex-1 min-w-0">
                            <div className="flex items-baseline gap-2">
                                <code className="text-xs font-mono text-gray-500 hidden sm:inline">
                                    {commit.hash}
                                </code>
                                <span className={`text-sm truncate ${
                                    isGood ? 'text-green-700' :
                                    isBad ? 'text-red-700' :
                                    'text-gray-700'
                                }`}>
                                    {commit.message}
                                </span>
                            </div>
                        </div>
                        {isGood && (
                            <Check className="w-4 h-4 text-green-500" />
                        )}
                        {isBad && (
                            <X className="w-4 h-4 text-red-500" />
                        )}
                    </div>
                );
            })}
        </div>
    );
}