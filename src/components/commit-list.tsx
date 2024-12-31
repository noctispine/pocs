// components/commit-list.tsx
"use client";

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
    return (
        <div className="mt-8 border border-gray-200 rounded-lg overflow-hidden">
            <div className="bg-gray-50 px-4 py-2 border-b border-gray-200">
                <h3 className="text-sm font-medium text-gray-700">Commit History</h3>
            </div>
            <div className="divide-y divide-gray-200">
                {commits.map((commit, index) => (
                    <div
                        key={commit.hash}
                        className={`px-4 py-3 flex items-center gap-3 transition-colors duration-200 ${goodCommits.has(commit.hash) ? 'bg-green-50' :
                                badCommits.has(commit.hash) ? 'bg-red-50' :
                                    'bg-white'
                            }`}
                    >
                        {currentIndex === index && (
                            <div className="animate-pulse">
                                <ArrowRight className="w-4 h-4 text-blue-500" />
                            </div>
                        )}
                        {currentIndex !== index && <div className="w-4" />}
                        <div className="flex-1 min-w-0">
                            <div className="flex items-baseline gap-2">
                                <code className="text-xs font-mono text-gray-500">{commit.hash}</code>
                                <span className={`text-sm truncate ${goodCommits.has(commit.hash) ? 'text-green-700' :
                                        badCommits.has(commit.hash) ? 'text-red-700' :
                                            'text-gray-700'
                                    }`}>
                                    {commit.message}
                                </span>
                            </div>
                        </div>
                        {goodCommits.has(commit.hash) && (
                            <Check className="w-4 h-4 text-green-500" />
                        )}
                        {badCommits.has(commit.hash) && (
                            <X className="w-4 h-4 text-red-500" />
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}