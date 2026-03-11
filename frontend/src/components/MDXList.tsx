import React, { useState, useEffect } from 'react';
import {
    BookOpen as BookIcon,
    GraduationCap as SchoolIcon,
    FileCode,
    Loader2,
    Database,
    AlertCircle
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import {
    Card,
    CardContent
} from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface MDXItem {
    title: string;
    description: string;
    fileName: string;
}

interface MDXListProps {
    apiUrl: string;
    title: string;
    subtitle: string;
    type: 'guidelines' | 'training';
}

const MDXList: React.FC<MDXListProps> = ({ apiUrl, title, subtitle, type }) => {
    const [items, setItems] = useState<MDXItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        setLoading(true);
        fetch(apiUrl)
            .then(res => {
                if (!res.ok) throw new Error('Failed to fetch content');
                return res.json();
            })
            .then(data => {
                setItems(data);
                setLoading(false);
            })
            .catch(err => {
                setError(err.message);
                setLoading(false);
            });
    }, [apiUrl]);

    if (loading) return (
        <div className="flex items-center justify-center min-h-[300px]">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
    );

    if (error) return (
        <div className="p-8 flex flex-col items-center justify-center text-center">
            <div className="p-4 rounded-full bg-destructive/10 text-destructive mb-4">
                <AlertCircle className="h-10 w-10" />
            </div>
            <h3 className="text-xl font-bold">Failed to Load Content</h3>
            <p className="text-muted-foreground mt-2 max-w-md">{error}</p>
        </div>
    );

    return (
        <div className="p-6 space-y-8 max-w-6xl mx-auto">
            <header className="flex items-center gap-4">
                <div className={cn(
                    "p-4 rounded-2xl shadow-sm",
                    type === 'training' ? "bg-orange-500/10 text-orange-600" : "bg-blue-500/10 text-blue-600"
                )}>
                    {type === 'training' ? (
                        <SchoolIcon className="h-10 w-10" />
                    ) : (
                        <BookIcon className="h-10 w-10" />
                    )}
                </div>
                <div>
                    <h1 className="text-3xl font-extrabold tracking-tight">{title}</h1>
                    <p className="text-muted-foreground mt-1 text-lg">
                        {subtitle}
                    </p>
                </div>
            </header>

            <Card className="border-none shadow-none bg-muted/20">
                <CardContent className="p-0">
                    <div className="divide-y divide-border/50">
                        {items.map((item) => (
                            <div
                                key={item.fileName}
                                className="group p-6 hover:bg-muted/40 transition-all cursor-default"
                            >
                                <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                                    <div className="space-y-2">
                                        <div className="flex flex-wrap items-center gap-3">
                                            <h3 className="text-xl font-bold group-hover:text-primary transition-colors">
                                                {item.title}
                                            </h3>
                                            <Badge variant="outline" className="font-mono text-[10px] bg-background">
                                                <FileCode className="h-3 w-3 mr-1 opacity-50" />
                                                {item.fileName}
                                            </Badge>
                                        </div>
                                        <p className="text-muted-foreground leading-relaxed max-w-3xl">
                                            {item.description || 'No detailed description available for this document.'}
                                        </p>
                                    </div>
                                    <div className="shrink-0 flex items-center md:pt-1">
                                        <Badge variant="secondary" className="bg-primary/5 text-primary border-primary/20">
                                            DOC0-V1
                                        </Badge>
                                    </div>
                                </div>
                            </div>
                        ))}

                        {items.length === 0 && (
                            <div className="p-20 text-center flex flex-col items-center gap-4">
                                <Database className="h-12 w-12 text-muted-foreground/30" />
                                <div className="space-y-1">
                                    <p className="text-lg font-medium text-muted-foreground">Source Empty</p>
                                    <p className="text-sm text-muted-foreground/60">
                                        No files were found in the configured repository directory.
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default MDXList;
