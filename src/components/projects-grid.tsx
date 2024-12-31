// components/projects-grid.tsx
import Link from "next/link";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowUpRight } from "lucide-react";
import { BisectLogo } from "@/components/svg/bisect-logo";

interface Project {
    title: string;
    description: string;
    href: string;
    tags?: string[];
    logo?: React.ReactNode;
}

const projects: Project[] = [
    {
        title: "Bisect Tool",
        description: "A binary search implementation to help debug issues",
        href: "/bisect",
        tags: ["Debug", "Algorithm"],
        logo: <BisectLogo className="h-12 w-12" />
    },
    // {
    //     title: "State Management",
    //     description: "Example of complex state management patterns",
    //     href: "/state",
    //     tags: ["React", "State"]
    // },
    // Add more projects here
];

export function ProjectsGrid() {
    return (
        <div className="mt-16">
            <h2 className="text-2xl font-semibold tracking-tight mb-8">Available Projects</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {projects.map((project) => (
                    <Link key={project.href} href={project.href}>
                        <Card className="group hover:shadow-lg transition-all h-full">
                            <CardHeader>
                                <div className="flex items-start justify-between">
                                    <div className="space-y-4">
                                        {project.logo && (
                                            <div className="mb-2 group-hover:scale-105 transition-transform">
                                                {project.logo}
                                            </div>
                                        )}
                                        <CardTitle className="group-hover:text-primary transition-colors">
                                            {project.title}
                                        </CardTitle>
                                    </div>
                                    <ArrowUpRight className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
                                </div>
                                <CardDescription className="mt-2">{project.description}</CardDescription>
                            </CardHeader>
                            {project.tags && (
                                <CardContent>
                                    <div className="flex flex-wrap gap-2">
                                        {project.tags.map((tag) => (
                                            <Badge key={tag} variant="secondary">
                                                {tag}
                                            </Badge>
                                        ))}
                                    </div>
                                </CardContent>
                            )}
                        </Card>
                    </Link>
                ))}
            </div>
        </div>
    );
}