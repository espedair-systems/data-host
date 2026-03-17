import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Github, FolderGit2, Star, GitFork, ExternalLink, Activity } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Repository {
    id: string;
    name: string;
    description: string;
    stars: number;
    forks: number;
    language: string;
    url: string;
    isPrivate: boolean;
    status: 'active' | 'archived' | 'maintenance';
}

const mockRepos: Repository[] = [
    {
        id: '1',
        name: 'data-host',
        description: 'Core data hosting and schema management repository. Central service for managing system schemas and relationships.',
        stars: 12,
        forks: 4,
        language: 'TypeScript / Go',
        url: '#',
        isPrivate: true,
        status: 'active'
    },
    {
        id: '2',
        name: 'espedair-ui',
        description: 'Frontend component library and design system for the Espedair ecosystem apps.',
        stars: 8,
        forks: 2,
        language: 'TypeScript',
        url: '#',
        isPrivate: true,
        status: 'active'
    },
    {
        id: '3',
        name: 'registry-manager',
        description: 'Schema registry service that handles distribution of definitions to clients.',
        stars: 24,
        forks: 7,
        language: 'Go',
        url: '#',
        isPrivate: false,
        status: 'active'
    },
    {
        id: '4',
        name: 'legacy-data-extractor',
        description: 'Old scripts for pulling records from legacy systems into intermediate formats.',
        stars: 3,
        forks: 0,
        language: 'Python',
        url: '#',
        isPrivate: true,
        status: 'archived'
    }
];

const GithubRepos: React.FC = () => {
    const [repos] = useState<Repository[]>(mockRepos);

    return (
        <div className="flex flex-col gap-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="flex items-center gap-3">
                    <div className="p-3 bg-primary/10 text-primary rounded-xl">
                        <Github className="h-6 w-6" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">GitHub Repositories</h1>
                        <p className="text-muted-foreground">Manage and view your connected GitHub repositories.</p>
                    </div>
                </div>
                <Button className="gap-2">
                    <Github className="h-4 w-4" />
                    Connect Organization
                </Button>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card className="bg-card/50 backdrop-blur-sm border-muted">
                    <CardContent className="p-4 flex items-center gap-4">
                        <div className="p-3 rounded-xl bg-blue-500/10 text-blue-500">
                            <FolderGit2 className="h-5 w-5" />
                        </div>
                        <div>
                            <div className="text-2xl font-bold">{repos.length}</div>
                            <div className="text-xs text-muted-foreground tracking-wider uppercase font-bold">Total Repos</div>
                        </div>
                    </CardContent>
                </Card>
                <Card className="bg-card/50 backdrop-blur-sm border-muted">
                    <CardContent className="p-4 flex items-center gap-4">
                        <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-500">
                            <Activity className="h-5 w-5" />
                        </div>
                        <div>
                            <div className="text-2xl font-bold">{repos.filter(r => r.status === 'active').length}</div>
                            <div className="text-xs text-muted-foreground tracking-wider uppercase font-bold">Active</div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Repositories Grid */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {repos.map((repo) => (
                    <Card key={repo.id} className="bg-card/50 backdrop-blur-sm border-muted hover:bg-card/80 transition-colors flex flex-col">
                        <CardHeader className="pb-3 flex-grow">
                            <div className="flex justify-between items-start">
                                <CardTitle className="text-lg flex flex-col gap-2">
                                    <div className="flex items-center gap-2">
                                        <FolderGit2 className="h-5 w-5 text-primary" />
                                        {repo.name}
                                    </div>
                                    {repo.isPrivate && (
                                        <span className="text-[9px] px-2 py-0.5 rounded-full bg-muted uppercase tracking-wider font-bold w-fit">
                                            Private
                                        </span>
                                    )}
                                </CardTitle>
                                <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-primary shrink-0">
                                    <ExternalLink className="h-4 w-4" />
                                </Button>
                            </div>
                            <CardDescription className="mt-2 line-clamp-3">
                                {repo.description}
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="pt-0">
                            <div className="flex items-center justify-between text-xs text-muted-foreground font-medium pt-4 border-t border-muted/50 mt-2">
                                <div className="flex gap-3">
                                    <span className="flex items-center gap-1"><Star className="h-3 w-3" /> {repo.stars}</span>
                                    <span className="flex items-center gap-1"><GitFork className="h-3 w-3" /> {repo.forks}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="w-2 h-2 rounded-full bg-primary/70"></span>
                                    {repo.language}
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
};

export default GithubRepos;
