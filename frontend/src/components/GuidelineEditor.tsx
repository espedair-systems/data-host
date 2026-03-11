import React, { useState, useEffect } from 'react';
import {
    Save as SaveIcon,
    Plus as AddIcon,
    Trash2 as DeleteIcon,
    Edit as EditIcon,
    LayoutGrid as CategoryIcon,
    Loader2,
    Search
} from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Label } from '@/components/ui/label';
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription
} from '@/components/ui/card';

interface GuidelineEntry {
    title: string;
    description: string;
    link: string;
    icon: string;
    tags: string[];
    section: string;
}

const GuidelineEditor: React.FC = () => {
    const [data, setData] = useState<GuidelineEntry[]>([]);
    const [editingIndex, setEditingIndex] = useState<number | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        fetch('/api/site/selection')
            .then(res => res.json())
            .then(json => {
                setData(json);
                setLoading(false);
            })
            .catch(err => {
                setError(err.message);
                setLoading(false);
            });
    }, []);

    const handleSave = () => {
        setSaving(true);
        fetch('/api/site/selection', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        })
            .then(res => {
                if (!res.ok) throw new Error('Failed to save data');
                return res.json();
            })
            .then(() => {
                toast.success('Changes saved successfully!');
                setSaving(false);
            })
            .catch(err => {
                toast.error(err.message);
                setSaving(false);
            });
    };

    const handleEntryChange = (index: number, field: keyof GuidelineEntry, value: string) => {
        const newData = [...data];
        if (field === 'tags') {
            newData[index][field] = value.split(',').map((t: string) => t.trim());
        } else {
            (newData[index] as any)[field] = value;
        }
        setData(newData);
    };

    const addEntry = () => {
        const newEntry: GuidelineEntry = {
            title: 'New Guideline',
            description: 'Enter description...',
            link: '#',
            icon: '📖',
            tags: ['New'],
            section: 'Getting Started'
        };
        setData([...data, newEntry]);
        setEditingIndex(data.length);
    };

    const deleteEntry = (index: number) => {
        const newData = data.filter((_, i) => i !== index);
        setData(newData);
        if (editingIndex === index) setEditingIndex(null);
        toast.info('Entry removed. Don\'t forget to save changes.');
    };

    const filteredData = data.filter(item =>
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.section.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (loading) return (
        <div className="flex items-center justify-center min-h-[400px]">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
    );

    return (
        <div className="p-6 space-y-6 max-w-7xl mx-auto h-[calc(100vh-80px)] flex flex-col">
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 shrink-0">
                <div className="flex items-center gap-4">
                    <div className="p-3 rounded-2xl bg-primary/10">
                        <CategoryIcon className="h-10 w-10 text-primary" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Guidelines Config Editor</h1>
                        <p className="text-muted-foreground mt-1">
                            Managing <code className="text-xs">/src/config/guidelines.json</code>
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <Button
                        variant="outline"
                        onClick={addEntry}
                        className="gap-2"
                    >
                        <AddIcon className="h-4 w-4" /> Add Entry
                    </Button>
                    <Button
                        onClick={handleSave}
                        disabled={saving}
                        className="gap-2 min-w-[140px]"
                    >
                        {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <SaveIcon className="h-4 w-4" />}
                        Save Changes
                    </Button>
                </div>
            </header>

            {error && (
                <Alert variant="destructive" className="shrink-0">
                    <AlertDescription>{error}</AlertDescription>
                </Alert>
            )}

            <div className="flex flex-col lg:flex-row gap-6 flex-grow overflow-hidden">
                {/* Left Side: List */}
                <Card className="w-full lg:w-[350px] shrink-0 flex flex-col overflow-hidden">
                    <CardHeader className="p-4 bg-muted/30 shrink-0">
                        <CardTitle className="text-sm font-bold uppercase tracking-widest text-muted-foreground">
                            CONFIGURED ENTRIES
                        </CardTitle>
                        <div className="relative mt-3">
                            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Filter entries..."
                                className="pl-9 h-9"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                    </CardHeader>
                    <CardContent className="p-0 flex-grow">
                        <ScrollArea className="h-full max-h-[60vh] lg:max-h-none">
                            <div className="divide-y divide-border">
                                {filteredData.map((item) => {
                                    const actualIndex = data.indexOf(item);
                                    return (
                                        <div
                                            key={actualIndex}
                                            className={cn(
                                                "w-full flex items-center justify-between p-4 transition-colors hover:bg-muted/50 group cursor-pointer",
                                                editingIndex === actualIndex && "bg-primary/5 border-r-2 border-r-primary"
                                            )}
                                            onClick={() => setEditingIndex(actualIndex)}
                                        >
                                            <div className="flex items-center gap-3 overflow-hidden">
                                                <span className="text-2xl shrink-0 opacity-80">{item.icon}</span>
                                                <div className="flex flex-col overflow-hidden">
                                                    <span className={cn(
                                                        "text-sm truncate",
                                                        editingIndex === actualIndex ? "font-bold text-primary" : "font-medium"
                                                    )}>
                                                        {item.title}
                                                    </span>
                                                    <span className="text-[10px] text-muted-foreground uppercase tracking-widest truncate">
                                                        {item.section}
                                                    </span>
                                                </div>
                                            </div>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-8 w-8 text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    deleteEntry(actualIndex);
                                                }}
                                            >
                                                <DeleteIcon className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    );
                                })}
                                {filteredData.length === 0 && (
                                    <div className="p-8 text-center text-sm text-muted-foreground italic">
                                        No entries found.
                                    </div>
                                )}
                            </div>
                        </ScrollArea>
                    </CardContent>
                </Card>

                {/* Right Side: Edit Form */}
                <div className="flex-grow overflow-y-auto">
                    {editingIndex !== null ? (
                        <Card className="h-full border-t-4 border-t-primary">
                            <CardHeader>
                                <div className="flex items-center gap-2">
                                    <EditIcon className="h-5 w-5 text-primary" />
                                    <CardTitle>Editing Entry</CardTitle>
                                </div>
                                <CardDescription>
                                    Updates for: <span className="font-semibold text-foreground">{data[editingIndex].title}</span>
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                    <div className="md:col-span-3 space-y-2">
                                        <Label htmlFor="title">Title</Label>
                                        <Input
                                            id="title"
                                            value={data[editingIndex].title}
                                            onChange={(e) => handleEntryChange(editingIndex, 'title', e.target.value)}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="icon">Emoji Icon</Label>
                                        <Input
                                            id="icon"
                                            className="text-center text-xl"
                                            value={data[editingIndex].icon}
                                            onChange={(e) => handleEntryChange(editingIndex, 'icon', e.target.value)}
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="description">Description</Label>
                                    <Textarea
                                        id="description"
                                        rows={4}
                                        value={data[editingIndex].description}
                                        onChange={(e) => handleEntryChange(editingIndex, 'description', e.target.value)}
                                        className="resize-none"
                                    />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="link">Link Path</Label>
                                        <Input
                                            id="link"
                                            value={data[editingIndex].link}
                                            onChange={(e) => handleEntryChange(editingIndex, 'link', e.target.value)}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="section">Category / Section</Label>
                                        <Input
                                            id="section"
                                            value={data[editingIndex].section}
                                            onChange={(e) => handleEntryChange(editingIndex, 'section', e.target.value)}
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="tags">Tags (Comma separated)</Label>
                                    <Input
                                        id="tags"
                                        value={data[editingIndex].tags.join(', ')}
                                        onChange={(e) => handleEntryChange(editingIndex, 'tags', e.target.value)}
                                        placeholder="e.g. Tutorial, Advance, Core"
                                    />
                                </div>

                                <div className="space-y-3 pt-2">
                                    <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-2">
                                        Live Preview
                                        <Separator className="flex-grow" />
                                    </div>
                                    <div className="p-4 rounded-xl border bg-muted/20 flex flex-wrap gap-2">
                                        {data[editingIndex].tags.map((tag, idx) => (
                                            <Badge key={idx} variant="secondary" className="font-normal px-2.5">
                                                {tag}
                                            </Badge>
                                        ))}
                                        {data[editingIndex].tags.length === 0 && (
                                            <span className="text-xs text-muted-foreground italic">No tags defined</span>
                                        )}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ) : (
                        <div className="h-full min-h-[400px] flex flex-col items-center justify-center border-2 border-dashed rounded-2xl bg-muted/10 p-12 text-center">
                            <div className="p-6 rounded-3xl bg-muted/40 mb-6">
                                <CategoryIcon className="h-16 w-16 text-muted-foreground/30" />
                            </div>
                            <h3 className="text-xl font-bold text-muted-foreground">No Entry Selected</h3>
                            <p className="text-muted-foreground/60 mt-2 max-w-xs leading-relaxed">
                                Select an entry from the sidebar to view details and start editing the configuration.
                            </p>
                            <Button
                                variant="outline"
                                className="mt-8 border-dashed border-2 px-8"
                                onClick={addEntry}
                            >
                                <AddIcon className="h-4 w-4 mr-2" /> Add Your First Guideline
                            </Button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default GuidelineEditor;
