"use client";

import { useState } from 'react';
import { Check, X, RotateCcw } from 'lucide-react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CommitList } from '@/components/commit-list';
import { StartOptions } from '@/components/start-options';

interface Commit {
    hash: string;
    message: string;
}

interface PrevState {
    goodCommits: string[];
    badCommits: string[];
    currentIndex: number | null;
    result: Result | null;
    isActive: boolean;
}

interface Action {
    type: string;
    commit: string;
    prevState: PrevState;
}

type Result = {
    message?: string;
    type: string;
    lastGood?: Commit;
    firstBad?: Commit;
}

export default function CommitBisect() {
    const [commits, setCommits] = useState<Commit[]>([]);
    const [currentIndex, setCurrentIndex] = useState<number | null>(null);
    const [goodCommits, setGoodCommits] = useState<Set<string>>(new Set());
    const [badCommits, setBadCommits] = useState<Set<string>>(new Set());
    const [result, setResult] = useState<Result | null>(null);
    const [isActive, setIsActive] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [actionHistory, setActionHistory] = useState<Action[]>([]);

    const validateStateWithNewCommits = (newGoodCommits: Set<string>, newBadCommits: Set<string>): boolean => {
        const intersection = new Set([...newGoodCommits].filter(x => newBadCommits.has(x)));
        if (intersection.size > 0) {
            setError(`Commit ${[...intersection][0]} marked as both good and bad`);
            return false;
        }

        const goodIndices = [...newGoodCommits].map(hash =>
            commits.findIndex(c => c.hash === hash)
        );
        const badIndices = [...newBadCommits].map(hash =>
            commits.findIndex(c => c.hash === hash)
        );

        if (goodIndices.length > 0 && badIndices.length > 0) {
            const latestGood = Math.max(...goodIndices);
            const earliestBad = Math.min(...badIndices);
            if (earliestBad > latestGood) {
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

        console.debug('goodIndices >>', goodIndices)
        console.debug('badIndices >>', badIndices)

        const latestGoodIndex = goodIndices.length > 0 ? Math.min(...goodIndices) : -1;
        const earliestBadIndex = badIndices.length > 0 ? Math.max(...badIndices) : commits.length;


        // Check for all commits marked
        if (currentGoodCommits.size + currentBadCommits.size >= commits.length) {
            if (currentGoodCommits.size === commits.length) {
                return {
                    done: true,
                    result: {
                        message: "All commits are good. No problematic commit found.",
                        type: "ALL_GOOD"
                    }
                };
            }
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

        console.debug('earliestBadIndex - latestGoodIndex >>', earliestBadIndex - latestGoodIndex)

        // Found transition
        if (latestGoodIndex - earliestBadIndex === 1) {
            return {
                done: true,
                result: {
                    lastGood: commits[latestGoodIndex],
                    firstBad: commits[earliestBadIndex],
                    type: "FOUND_TRANSITION"
                }
            };
        }

        // Binary search logic
        if (latestGoodIndex === -1 && earliestBadIndex === commits.length) {
            console.debug('here');
            return { done: false, nextIndex: Math.floor(commits.length / 2) };
        } else if (latestGoodIndex === -1) {
            console.debug('here 2');
            // Only bad commits marked - search later half
            return {
                done: false,
                nextIndex: earliestBadIndex + Math.floor((commits.length - earliestBadIndex) / 2)
            };
        } else if (earliestBadIndex === commits.length) {
            console.debug('here 3');
            // Only good commits marked - search earlier half
            const newIndex = Math.floor(latestGoodIndex / 2);
            return { done: false, nextIndex: Math.max(0, newIndex) };
        } else {
            console.debug('here 4');
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
        console.debug('nextBounds >>', nextBounds)
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
            setResult(nextBounds.result ?? null);
            setIsActive(false);
        } else {
            if (typeof nextBounds.nextIndex === 'number') {
                setCurrentIndex(nextBounds.nextIndex);
            }
        }
    };

    const markBad = () => {
        if (!isActive || currentIndex === null) return;

        const currentHash = commits[currentIndex].hash;
        const newBadCommits = new Set(badCommits);
        newBadCommits.add(currentHash);
        console.debug('newBadCommits >>', newBadCommits)

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
            setResult(nextBounds.result ?? null);
            setIsActive(false);
        } else {
            if (typeof nextBounds.nextIndex === 'number') {
                setCurrentIndex(nextBounds.nextIndex);
            }
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
        <div className="w-full max-w-7xl mx-auto p-4">
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
                        <Alert variant="destructive" className="mb-4">
                            <AlertDescription>{error}</AlertDescription>
                        </Alert>
                    )}

                    {!isActive && !result && (
                        <StartOptions onStart={startBisect} />
                    )}

                    {isActive && currentIndex !== null && (
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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
                                    <div className="flex flex-wrap justify-center gap-4">
                                        <Button
                                            onClick={markGood}
                                            variant="outline"
                                            className="flex items-center gap-2 min-w-[120px]"
                                            disabled={!isActive}
                                        >
                                            <Check className="w-4 h-4" />
                                            Mark as Good
                                        </Button>
                                        <Button
                                            onClick={markBad}
                                            variant="outline"
                                            className="flex items-center gap-2 min-w-[120px]"
                                            disabled={!isActive}
                                        >
                                            <X className="w-4 h-4" />
                                            Mark as Bad
                                        </Button>
                                        <Button
                                            onClick={undoLastAction}
                                            variant="ghost"
                                            className="flex items-center gap-2 min-w-[100px]"
                                            disabled={actionHistory.length === 0}
                                        >
                                            <RotateCcw className="w-4 h-4" />
                                            Undo
                                        </Button>
                                    </div>

                                    <div className="text-sm text-gray-500">
                                        <div className="flex flex-wrap justify-center gap-4">
                                            <p className="bg-green-50 px-3 py-1 rounded">Good commits: {goodCommits.size}</p>
                                            <p className="bg-red-50 px-3 py-1 rounded">Bad commits: {badCommits.size}</p>
                                        </div>
                                        {actionHistory.length > 0 && (
                                            <div className="text-xs bg-gray-100 px-3 py-2 rounded mt-2 flex items-center justify-center gap-2">
                                                {actionHistory[actionHistory.length - 1].type === 'MARK_GOOD' ?
                                                    <Check className="w-3 h-3 text-green-600" /> :
                                                    <X className="w-3 h-3 text-red-600" />
                                                }
                                                <span className="font-mono">{actionHistory[actionHistory.length - 1].commit}</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="border border-gray-200 rounded-lg overflow-hidden">
                                <div className="bg-gray-50 px-4 py-2 border-b border-gray-200">
                                    <h3 className="text-sm font-medium text-gray-700">Commit History</h3>
                                </div>
                                <div className="divide-y divide-gray-200 max-h-[500px] overflow-y-auto">
                                    <CommitList commits={commits} badCommits={badCommits} currentIndex={currentIndex} goodCommits={goodCommits} />
                                </div>
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
                                                <p className="font-mono text-sm">{result.lastGood?.hash}</p>
                                                <p className="text-sm mt-1">{result.lastGood?.message}</p>
                                            </div>
                                            <div className="bg-red-50 p-3 rounded">
                                                <p className="text-sm text-red-800 font-medium">First bad commit:</p>
                                                <p className="font-mono text-sm">{result.firstBad?.hash}</p>
                                                <p className="text-sm mt-1">{result.firstBad?.message}</p>
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