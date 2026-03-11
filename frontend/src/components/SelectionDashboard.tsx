import React, { useState, useEffect } from 'react';
import {
    Filter as FilterIcon,
    Search as SearchIcon,
    FileText as DocIcon,
    ExternalLink as LaunchIcon,
    Bookmark as SectionIcon,
    Tag as TagIcon,
    Loader2
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';

interface GuidelineEntry {
    title: string;
    description: string;
    link: string;
    icon: string;
    tags: string[];
    section: string;
    fileName?: string; // Optinal filename if matched from MDX source
}

interface MDXSource {
    title: string;
    description: string;
    fileName: string;
}

interface SelectionDashboardProps {
    apiUrl: string;
    configUrl: string;
    title: string;
    subtitle: string;
}

const SelectionDashboard: React.FC<SelectionDashboardProps> = ({ apiUrl, configUrl, title, subtitle }) => {
    const [data, setData] = useState<GuidelineEntry[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [search, setSearch] = useState('');
    const [selectedSections, setSelectedSections] = useState<string[]>([]);
    const [selectedTags, setSelectedTags] = useState<string[]>([]);

    useEffect(() => {
        Promise.all([
            fetch(configUrl).then(res => res.json()),
            fetch(apiUrl).then(res => res.json())
        ])
            .then(([rawConfig, mdxData]: [GuidelineEntry[] | { codelabs: GuidelineEntry[] }, MDXSource[]]) => {
                // Normalize config data (Training has it under .codelabs, Guidelines is a plain array)
                const configEntries: GuidelineEntry[] = Array.isArray(rawConfig)
                    ? rawConfig
                    : (rawConfig.codelabs || []);

                // Merge config with MDX source info where links match filename
                const merged = configEntries.map(item => {
                    // Try to match link to filename
                    // Links are often like /guidelines/intro or /training/module
                    const linkPart = item.link.split('/').filter(Boolean).pop();
                    const fileName = linkPart + '.mdx';
                    const source = mdxData.find(m => m.fileName === fileName);

                    return {
                        ...item,
                        // If it's training, the icon might be in appEmoji
                        icon: item.icon || (item as unknown as { appEmoji: string }).appEmoji || '📄',
                        // If it's training, the section might be in appName or we use a default
                        section: item.section || (item as unknown as { appName: string }).appName || 'Uncategorized',
                        fileName: source?.fileName
                    };
                });

                // Add items that are in MDX source but NOT in config as "Drafts"
                const configuredFiles = new Set(merged.map(m => m.fileName));
                const drafts = mdxData
                    .filter(m => !configuredFiles.has(m.fileName))
                    .map(m => ({
                        title: m.title,
                        description: m.description,
                        link: '#',
                        icon: '📝',
                        tags: ['Draft', 'Source Only'],
                        section: 'Designed Docs',
                        fileName: m.fileName
                    }));

                setData([...merged, ...drafts]);
                setLoading(false);
            })
            .catch(err => {
                setError(err.message);
                setLoading(false);
            });
    }, [apiUrl, configUrl]);

    const sections = Array.from(new Set(data.map(item => item.section)));
    const allTags = Array.from(new Set(data.flatMap(item => item.tags)));

    const filteredData = data.filter(item => {
        const matchesSearch = item.title.toLowerCase().includes(search.toLowerCase()) ||
            item.description.toLowerCase().includes(search.toLowerCase()) ||
            item.fileName?.toLowerCase().includes(search.toLowerCase());
        const matchesSection = selectedSections.length === 0 || selectedSections.includes(item.section);
        const matchesTags = selectedTags.length === 0 || selectedTags.some(tag => item.tags.includes(tag));
        return matchesSearch && matchesSection && matchesTags;
    });

    const toggleSection = (section: string) => {
        setSelectedSections(prev =>
            prev.includes(section) ? prev.filter(s => s !== section) : [...prev, section]
        );
    };

    const toggleTag = (tag: string) => {
        setSelectedTags(prev =>
            prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
        );
    };

    if (loading) return (
        <div className="flex items-center justify-center min-h-[400px]">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
    );

    if (error) return (
        <div className="p-8 text-center text-destructive font-medium">
            Error: {error}
        </div>
    );

    return (
        <div className="flex h-[calc(100vh-120px)] bg-background overflow-hidden border rounded-xl shadow-sm">
            {/* Left Sidebar: Selection Criteria */}
            <aside className="w-[300px] border-r bg-muted/10 p-6 overflow-y-auto shrink-0">
                <div className="space-y-8">
                    <div className="space-y-3">
                        <div className="flex items-center gap-2 text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                            <FilterIcon className="h-3 w-3 text-primary" /> Search
                        </div>
                        <div className="relative">
                            <SearchIcon className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                                type="search"
                                placeholder="Search..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="pl-9 h-9"
                            />
                        </div>
                    </div>

                    <div className="space-y-3">
                        <div className="flex items-center gap-2 text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                            <SectionIcon className="h-3 w-3 text-primary" /> Categories
                        </div>
                        <div className="space-y-2">
                            {sections.map(section => (
                                <div key={section} className="flex items-center space-x-2">
                                    <Checkbox
                                        id={`section-${section}`}
                                        checked={selectedSections.includes(section)}
                                        onCheckedChange={() => toggleSection(section)}
                                    />
                                    <Label
                                        htmlFor={`section-${section}`}
                                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                    >
                                        {section}
                                    </Label>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="space-y-3">
                        <div className="flex items-center gap-2 text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                            <TagIcon className="h-3 w-3 text-primary" /> Tags
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {allTags.map(tag => (
                                <Badge
                                    key={tag}
                                    variant={selectedTags.includes(tag) ? "default" : "outline"}
                                    className="cursor-pointer transition-colors"
                                    onClick={() => toggleTag(tag)}
                                >
                                    {tag}
                                </Badge>
                            ))}
                        </div>
                    </div>
                </div>
            </aside>

            {/* Main Area: Expanded List */}
            <main className="flex-grow p-8 overflow-y-auto">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
                        <p className="text-muted-foreground mt-1">{subtitle}</p>
                    </div>
                    <Badge variant="secondary" className="px-3 py-1 text-xs">
                        {filteredData.length} matches
                    </Badge>
                </div>

                <div className="space-y-4">
                    {filteredData.map((item, index) => (
                        <div
                            key={index}
                            className={cn(
                                "p-6 rounded-xl border bg-card transition-all hover:shadow-md hover:border-primary/30 relative",
                                item.fileName ? "border-l-4" : "",
                                item.section === 'Designed Docs' ? "border-l-amber-500 bg-amber-500/5" : "border-l-primary"
                            )}
                        >
                            <div className="flex gap-6">
                                <div className="hidden sm:flex text-3xl w-14 h-14 shrink-0 items-center justify-center bg-secondary/50 rounded-xl">
                                    {item.icon}
                                </div>
                                <div className="flex-grow">
                                    <div className="flex justify-between items-start">
                                        <div className="space-y-1">
                                            <div className="flex items-center gap-3">
                                                <h3 className="text-lg font-semibold">{item.title}</h3>
                                                {item.fileName && (
                                                    <Badge variant="outline" className="h-5 px-1.5 text-[9px] font-mono opacity-70">
                                                        {item.fileName}
                                                    </Badge>
                                                )}
                                            </div>
                                            <div className="text-[10px] font-bold text-primary uppercase tracking-widest">
                                                {item.section}
                                            </div>
                                        </div>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            asChild
                                            disabled={item.link === '#'}
                                            className="text-primary hover:text-primary hover:bg-primary/10"
                                        >
                                            <a href={item.link} target="_blank" rel="noopener noreferrer">
                                                <LaunchIcon className="h-4 w-4" />
                                            </a>
                                        </Button>
                                    </div>
                                    <p className="text-sm text-muted-foreground mt-3 mb-4 leading-relaxed max-w-3xl">
                                        {item.description}
                                    </p>
                                    <div className="flex flex-wrap gap-1.5">
                                        {item.tags.map(tag => (
                                            <Badge key={tag} variant="outline" className="text-[10px] font-normal px-2 py-0">
                                                {tag}
                                            </Badge>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}

                    {filteredData.length === 0 && (
                        <div className="py-20 text-center bg-muted/20 border-2 border-dashed rounded-2xl">
                            <DocIcon className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
                            <h3 className="text-lg font-semibold text-muted-foreground">No matches found</h3>
                            <p className="text-sm text-muted-foreground/60 mt-1">Try adjusting your filters or searching for specific keywords</p>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
};

export default SelectionDashboard;
