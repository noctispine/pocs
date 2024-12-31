"use client";

import { useState } from 'react';
import { Check, X, PlayCircle, RotateCcw } from 'lucide-react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CommitList } from '@/components/commit-list';

interface Commit {
    hash: string;
    message: string;
}

interface PrevState {
    goodCommits: string[];
    badCommits: string[];
    currentIndex: number | null;
    result: unknown;
    isActive: boolean;
}

interface Action {
    type: string;
    commit: string;
    prevState: PrevState;
}

// Real test scenario with Angular commit convention
const testData = [
    { hash: "a123b4c", message: "chore(setup): initialize React project with configuration" },
    { hash: "b234c5d", message: "feat(auth): implement OAuth authentication flow" },
    { hash: "c345d6e", message: "refactor(forms): extract shared form components" },
    { hash: "d456e7f", message: "chore(deps): upgrade dependencies to latest versions" },
    { hash: "e567f8g", message: "fix(nav): resolve Safari routing issues" },
    { hash: "f678g9h", message: "feat(api): add REST endpoints for user data" },
    { hash: "g789h0i", message: "style(theme): update design system tokens" },
    { hash: "h890i1j", message: "feat(settings): add user preferences page" },
    { hash: "i901j2k", message: "perf(render): optimize component re-renders" },
    { hash: "j012k3l", message: "security(input): add XSS protection" },
    { hash: "k123l4m", message: "docs(api): update endpoint documentation" },
    { hash: "l234m5n", message: "fix(auth): patch token validation vulnerability" },
    { hash: "m345n6o", message: "feat(export): implement data export functionality" },
    { hash: "n456o7p", message: "perf(db): add query result caching" },
    { hash: "o567p8q", message: "feat(dashboard): redesign main layout" }
];

export default function CommitBisect() {
    const [commits, setCommits] = useState<Commit[]>([]);
    const [currentIndex, setCurrentIndex] = useState<number | null>(null);
    const [goodCommits, setGoodCommits] = useState<Set<string>>(new Set());
    const [badCommits, setBadCommits] = useState<Set<string>>(new Set());
    const [result, setResult] = useState<any>(null);
    const [isActive, setIsActive] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [actionHistory, setActionHistory] = useState<Action[]>([]);

    const validateStateWithNewCommits = (newGoodCommits: Set<string>, newBadCommits: Set<string>): boolean => {
        // Check if any commit is marked as both good and bad
        const intersection = new Set([...newGoodCommits].filter(x => newBadCommits.has(x)));
        if (intersection.size > 0) {
            setError(`Commit ${[...intersection][0]} marked as both good and bad`);
            return false;
        }

        // Check for inconsistent state (good commit after bad commit)
        const goodIndices = [...newGoodCommits].map(hash =>
            commits.findIndex(c => c.hash === hash)
        );
        const badIndices = [...newBadCommits].map(hash =>
            commits.findIndex(c => c.hash === hash)
        );

        if (goodIndices.length > 0 && badIndices.length > 0) {
            const latestGood = Math.max(...goodIndices);
            const earliestBad = Math.min(...badIndices);
            if (latestGood > earliestBad) {
                setError("Inconsistent state: good commit found after bad commit");
                return false;
            }
        }

        setError(null);
        return true;
    };

    const calculateNewBounds = (currentGoodCommits: Set<string>, currentBadCommits: Set<string>) => {
        const goodIndices = [...currentGoodCommits].map(hash =>
            commits.findIndex(c => c.hash === hash)
        ).filter(index => index !== -1);

        const badIndices = [...currentBadCommits].map(hash =>
            commits.findIndex(c => c.hash === hash)
        ).filter(index => index !== -1);

        const latestGoodIndex = goodIndices.length > 0 ? Math.max(...goodIndices) : -1;
        const earliestBadIndex = badIndices.length > 0 ? Math.min(...badIndices) : commits.length;

        // Check if all commits are marked
        if (currentGoodCommits.size + currentBadCommits.size >= commits.length) {
            // If all commits are marked as good
            if (currentGoodCommits.size === commits.length) {
                return {
                    done: true,
                    result: {
                        message: "All commits are good. No problematic commit found.",
                        type: "ALL_GOOD"
                    }
                };
            }
            // If all commits are marked as bad
            if (currentBadCommits.size === commits.length) {
                return {
                    done: true,
                    result: {
                        message: "All commits are bad. The issue exists throughout the entire range.",
                        type: "ALL_BAD"
                    }
                };
            }
        }

        // Found the transition
        if (earliestBadIndex - latestGoodIndex === 1) {
            return {
                done: true,
                result: {
                    lastGood: commits[latestGoodIndex],
                    firstBad: commits[earliestBadIndex],
                    type: "FOUND_TRANSITION"
                }
            };
        }

        // Still searching
        if (latestGoodIndex === -1 && earliestBadIndex === commits.length) {
            // No commits marked yet, stay at middle
            return { done: false, nextIndex: Math.floor(commits.length / 2) };
        } else if (latestGoodIndex === -1) {
            // Only bad commits marked, search first half
            return { done: false, nextIndex: Math.floor(earliestBadIndex / 2) };
        } else if (earliestBadIndex === commits.length) {
            // Only good commits marked, search second half
            return {
                done: false,
                nextIndex: Math.min(
                    commits.length - 1,
                    latestGoodIndex + Math.floor((commits.length - latestGoodIndex) / 2)
                )
            };
        } else {
            // Both good and bad commits marked, search between them
            return {
                done: false,
                nextIndex: latestGoodIndex + Math.floor((earliestBadIndex - latestGoodIndex) / 2)
            };
        }
    };

    const startBisect = (commitList: Commit[]) => {
        setCommits(commitList);
        setCurrentIndex(Math.floor(commitList.length / 2));
        setGoodCommits(new Set());
        setBadCommits(new Set());
        setResult(null);
        setError(null);
        setIsActive(true);
        setActionHistory([]);
    };

    const markGood = () => {
        if (!isActive || currentIndex === null) return;

        const currentHash = commits[currentIndex].hash;
        const newGoodCommits = new Set(goodCommits);
        newGoodCommits.add(currentHash);

        const nextBounds = calculateNewBounds(newGoodCommits, badCommits);
        if (!validateStateWithNewCommits(newGoodCommits, badCommits)) return;

        // Save current state for undo
        const prevState = {
            goodCommits: [...goodCommits],
            badCommits: [...badCommits],
            currentIndex,
            result,
            isActive
        };

        setActionHistory([...actionHistory, {
            type: 'MARK_GOOD',
            commit: currentHash,
            prevState
        }]);

        setGoodCommits(newGoodCommits);
        if (nextBounds.done) {
            setResult(nextBounds.result);
            setIsActive(false);
        } else {
            if (nextBounds.nextIndex) {
                setCurrentIndex(nextBounds.nextIndex);
            }
        }
    };

    const markBad = () => {
        if (!isActive || currentIndex === null) return;

        const currentHash = commits[currentIndex].hash;
        const newBadCommits = new Set(badCommits);
        newBadCommits.add(currentHash);

        const nextBounds = calculateNewBounds(goodCommits, newBadCommits);
        if (!validateStateWithNewCommits(goodCommits, newBadCommits)) return;

        // Save current state for undo
        const prevState = {
            goodCommits: [...goodCommits],
            badCommits: [...badCommits],
            currentIndex,
            result,
            isActive
        };

        setActionHistory([...actionHistory, {
            type: 'MARK_BAD',
            commit: currentHash,
            prevState
        }]);

        setBadCommits(newBadCommits);
        if (nextBounds.done) {
            setResult(nextBounds.result);
            setIsActive(false);
        } else {
            setCurrentIndex(nextBounds.nextIndex);
        }
    };

    const undoLastAction = () => {
        if (actionHistory.length === 0) return;

        const lastAction = actionHistory[actionHistory.length - 1];
        const newHistory = actionHistory.slice(0, -1);
        setActionHistory(newHistory);

        // Restore previous state
        setGoodCommits(new Set(lastAction.prevState.goodCommits));
        setBadCommits(new Set(lastAction.prevState.badCommits));
        setCurrentIndex(lastAction.prevState.currentIndex);
        setResult(lastAction.prevState.result);
        setIsActive(lastAction.prevState.isActive);
    };

    const reset = () => {
        setIsActive(false);
        setCommits([]);
        setCurrentIndex(null);
        setGoodCommits(new Set());
        setBadCommits(new Set());
        setResult(null);
        setError(null);
        setActionHistory([]);
    };

    return (
        <div className="w-full max-w-2xl mx-auto p-4">
            <Card>
                <CardHeader>
                    <CardTitle>Git Bisect UI</CardTitle>
                    <CardDescription>
                        Find the commit that introduced an issue using binary search.
                        {!isActive && (
                            <div className="mt-2 text-sm">
                                Test scenario: 15 commits representing a feature development timeline.
                                Try to find where a bug was introduced!
                            </div>
                        )}
                    </CardDescription>
                </CardHeader>

                <CardContent>
                    {error && (
                        <Alert variant="destructive">
                            <AlertDescription>{error}</AlertDescription>
                        </Alert>
                    )}

                    {!isActive && !result && (
                        <div className="flex justify-center">
                            <Button
                                onClick={() => startBisect(testData)}
                                className="flex items-center gap-2"
                            >
                                <PlayCircle className="w-4 h-4" />
                                Start Bisect
                            </Button>
                        </div>
                    )}

                    {isActive && currentIndex !== null && (
                        <div className="space-y-4">
                            <div className="text-center space-y-2">
                                <p className="text-lg font-medium">Testing Commit</p>
                                <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                                    <div className="font-mono text-sm">
                                        <span className="text-gray-500">commit</span> {commits[currentIndex].hash}
                                    </div>
                                    <div className="text-sm">
                                        <span className="text-gray-500">message:</span> {commits[currentIndex].message}
                                    </div>
                                </div>
                            </div>

                            <div className="flex flex-col items-center gap-4">
                                <div className="flex justify-center gap-4">
                                    <Button
                                        onClick={markGood}
                                        variant="outline"
                                        className="flex items-center gap-2 min-w-[120px] transition-all duration-200"
                                        disabled={!isActive}
                                    >
                                        <Check className="w-4 h-4" />
                                        Mark as Good
                                    </Button>
                                    <Button
                                        onClick={markBad}
                                        variant="outline"
                                        className="flex items-center gap-2 min-w-[120px] transition-all duration-200"
                                        disabled={!isActive}
                                    >
                                        <X className="w-4 h-4" />
                                        Mark as Bad
                                    </Button>
                                    <Button
                                        onClick={undoLastAction}
                                        variant="ghost"
                                        className={`flex items-center gap-2 min-w-[100px] transition-all duration-200 ${actionHistory.length === 0 ? 'opacity-50 cursor-not-allowed' : ''
                                            }`}
                                        disabled={actionHistory.length === 0}
                                    >
                                        <RotateCcw className="w-4 h-4" />
                                        Undo
                                    </Button>
                                </div>

                                <div className="text-sm text-gray-500 min-h-[80px] flex flex-col items-center justify-center">
                                    <div className="flex gap-4">
                                        <p className="bg-green-50 px-3 py-1 rounded">Good commits: {goodCommits.size}</p>
                                        <p className="bg-red-50 px-3 py-1 rounded">Bad commits: {badCommits.size}</p>
                                    </div>
                                    <div className="h-12 flex items-center justify-center mt-2">
                                        {actionHistory.length > 0 && (
                                            <div className="text-xs bg-gray-100 px-3 py-2 rounded flex items-center gap-2">
                                                {actionHistory[actionHistory.length - 1].type === 'MARK_GOOD' ?
                                                    <Check className="w-3 h-3 text-green-600" /> :
                                                    <X className="w-3 h-3 text-red-600" />
                                                }
                                                <span className="font-mono">{actionHistory[actionHistory.length - 1].commit}</span>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <CommitList
                                    commits={commits}
                                    currentIndex={currentIndex}
                                    goodCommits={goodCommits}
                                    badCommits={badCommits}
                                />
                            </div>
                        </div>
                    )}

                    {result && (
                        <Alert>
                            <AlertDescription>
                                {result.type === "FOUND_TRANSITION" ? (
                                    <>
                                        <p className="font-medium">Found the problematic commit!</p>
                                        <div className="mt-2 space-y-3">
                                            <div className="bg-green-50 p-3 rounded">
                                                <p className="text-sm text-green-800 font-medium">Last good commit:</p>
                                                <p className="font-mono text-sm">{result.lastGood.hash}</p>
                                                <p className="text-sm mt-1">{result.lastGood.message}</p>
                                            </div>
                                            <div className="bg-red-50 p-3 rounded">
                                                <p className="text-sm text-red-800 font-medium">First bad commit:</p>
                                                <p className="font-mono text-sm">{result.firstBad.hash}</p>
                                                <p className="text-sm mt-1">{result.firstBad.message}</p>
                                            </div>
                                        </div>
                                        <p className="mt-4 text-sm text-gray-600">
                                            The issue was introduced in the above commit. Review the changes made in this commit to identify the root cause.
                                        </p>
                                    </>
                                ) : (
                                    <div className="p-3 rounded">
                                        <p className="font-medium">{result.message}</p>
                                        <p className="mt-2 text-sm text-gray-600">
                                            {result.type === "ALL_GOOD"
                                                ? "Try marking some commits as bad if you're sure the issue exists."
                                                : "Try marking some commits as good if you're sure there was a working state."}
                                        </p>
                                    </div>
                                )}
                            </AlertDescription>
                        </Alert>
                    )}
                </CardContent>

                <CardFooter className="flex justify-end">
                    {(isActive || result) && (
                        <Button
                            onClick={reset}
                            variant="outline"
                            className="flex items-center gap-2"
                        >
                            <RotateCcw className="w-4 h-4" />
                            Reset
                        </Button>
                    )}
                </CardFooter>
            </Card>
        </div>
    );
}