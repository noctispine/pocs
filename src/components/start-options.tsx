"use client"
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PlayCircle } from 'lucide-react';
import { GitLogInput } from '@/components/git-log-input-editor';

export function StartOptions({ onStart }: { onStart: (commits: Array<{ hash: string; message: string }>) => void }) {
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

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="h-full">
                <CardHeader>
                    <CardTitle className="text-base">Start with Demo Data</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        <p className="text-sm text-gray-500">
                            Try the bisect tool with a pre-configured set of commits following the Angular commit convention.
                        </p>
                        <div className="flex justify-center">
                            <Button
                                onClick={() => onStart(testData)}
                                className="flex items-center gap-2"
                            >
                                <PlayCircle className="w-4 h-4" />
                                Start Demo
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card className="h-full">
                <CardHeader>
                    <CardTitle className="text-base">Start with Your Commits</CardTitle>
                </CardHeader>
                <CardContent>
                    <GitLogInput onCommitsLoad={onStart} />
                </CardContent>
            </Card>
        </div>
    );
}