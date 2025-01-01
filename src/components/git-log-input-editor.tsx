"use client"
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Check, Copy, RefreshCw } from 'lucide-react';
import dynamic from 'next/dynamic';

const CopyParticles = dynamic(() => import('./copy-particles'), { ssr: false });

interface GitLogInputProps {
    onCommitsLoad: (commits: Array<{ hash: string; message: string }>) => void;
}

export function GitLogInput({ onCommitsLoad }: GitLogInputProps) {
    const [input, setInput] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [isCopied, setIsCopied] = useState(false);

    const GIT_COMMAND = 'git log --pretty=format:"%h %s"';

    const handleCopyCommand = () => {
        navigator.clipboard.writeText(GIT_COMMAND);
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2000);
    };

    const parseGitLog = (input: string) => {
        const lines = input.trim().split('\n');
        const commits: Array<{ hash: string; message: string }> = [];
        const hashSet = new Set<string>();

        for (const line of lines) {
            // Split by first space to separate hash and message
            const firstSpaceIndex = line.indexOf(' ');
            if (firstSpaceIndex === -1) {
                throw new Error(`Invalid format in line: ${line}. No space found between hash and message.`);
            }

            const hash = line.slice(0, firstSpaceIndex);
            const message = line.slice(firstSpaceIndex + 1);

            // Check for duplicate hashes
            if (hashSet.has(hash)) {
                throw new Error(`Duplicate commit hash found: ${hash}`);
            }

            hashSet.add(hash);
            commits.push({ hash, message });
        }

        if (commits.length < 2) {
            throw new Error('At least 2 commits are required for bisecting');
        }

        return commits.reverse(); // Reverse to get chronological order
    };

    const handleSubmit = () => {
        try {
            setError(null);
            const commits = parseGitLog(input);
            onCommitsLoad(commits);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to parse git log');
        }
    };

    const handlePasteExample = () => {
        const example = `o5p6q7r fix(security): patch OAuth state validation
n4o5p6q feat(auth): add social login providers
m3n4o5p perf(core): add caching layer for user sessions
l2m3n4o feat(security): implement rate limiting
k1l2m3n fix(mfa): resolve QR code generation issue`;
        setInput(example);
        setError(null);
    };

    return (
        <div className="space-y-4">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div className="space-y-2 w-full">
                    <p className="text-sm text-gray-500">Paste the output of:</p>
                    <div className="relative group">
                        <code className="block bg-gray-100 px-3 py-2 rounded text-sm w-full overflow-x-auto whitespace-pre font-mono">{GIT_COMMAND}</code>
                        <div className="absolute right-2 top-1/2 -translate-y-1/2">
                            <Button
                                variant="ghost"
                                size="icon"
                                className="relative opacity-0 group-hover:opacity-100 transition-opacity"
                                onClick={handleCopyCommand}
                            >
                                {isCopied ? (
                                    <Check className="w-4 h-4 text-green-500" />
                                ) : (
                                    <Copy className="w-4 h-4" />
                                )}
                                <CopyParticles show={isCopied} />
                            </Button>
                        </div>
                    </div>
                </div>
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={handlePasteExample}
                    className="flex items-center gap-1 text-xs whitespace-nowrap"
                >
                    <RefreshCw className="w-3 h-3" />
                    Load Example
                </Button>
            </div>

            <Textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="58c2874 fix(bisect): not cool enough"
                className="font-mono text-sm h-32"
            />

            {error && (
                <Alert variant="destructive">
                    <AlertDescription>{error}</AlertDescription>
                </Alert>
            )}

            <div className="flex justify-end">
                <Button
                    onClick={handleSubmit}
                    disabled={!input.trim()}
                >
                    Load Commits
                </Button>
            </div>
        </div>
    );
}