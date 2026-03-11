import React, { useState, useEffect } from 'react';
import {
    Save as SaveIcon,
    Plus as AddIcon,
    Trash2 as DeleteIcon,
    Edit as EditIcon,
    LayoutGrid as CategoryIcon,
    GraduationCap as CodelabIcon,
    Award as RoleIcon,
    Loader2,
    Search
} from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Label } from '@/components/ui/label';
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription
} from '@/components/ui/card';
import {
    Tabs,
    TabsList,
    TabsTrigger,
} from "@/components/ui/tabs";

interface TrainingCategory {
    id: string;
    title: string;
    emoji: string;
    description: string;
}

interface TrainingRole {
    id: string;
    title: string;
    emoji: string;
}

interface CodelabEntry {
    title: string;
    description: string;
    link: string;
    appEmoji: string;
    appName: string;
    duration: string;
    date: string;
    tags: string[];
}

interface TrainingConfig {
    categories: TrainingCategory[];
    roles: TrainingRole[];
    codelabs: CodelabEntry[];
}

const TrainingEditor: React.FC = () => {
    const [config, setConfig] = useState<TrainingConfig | null>(null);
    const [tab, setTab] = useState("codelabs"); // codelabs, categories, roles
    const [editingIndex, setEditingIndex] = useState<number | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        fetch('/api/site/training-selection')
            .then(res => {
                if (!res.ok) throw new Error('Failed to fetch training config');
                return res.json();
            })
            .then(json => {
                setConfig(json);
                setLoading(false);
            })
            .catch(err => {
                setError(err.message);
                setLoading(false);
            });
    }, []);

    const handleSave = () => {
        if (!config) return;
        setSaving(true);
        fetch('/api/site/training-selection', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(config)
        })
            .then(res => {
                if (!res.ok) throw new Error('Failed to save training config');
                return res.json();
            })
            .then(() => {
                toast.success('Training configuration saved successfully!');
                setSaving(false);
            })
            .catch(err => {
                toast.error(err.message);
                setSaving(false);
            });
    };

    const getCurrentArray = (): (CodelabEntry | TrainingCategory | TrainingRole)[] => {
        if (!config) return [];
        if (tab === "codelabs") return config.codelabs;
        if (tab === "categories") return config.categories;
        return config.roles;
    };

    const updateCurrentArray = (newArr: (CodelabEntry | TrainingCategory | TrainingRole)[]) => {
        if (!config) return;
        const newConfig = { ...config };
        if (tab === "codelabs") newConfig.codelabs = newArr as CodelabEntry[];
        else if (tab === "categories") newConfig.categories = newArr as TrainingCategory[];
        else newConfig.roles = newArr as TrainingRole[];
        setConfig(newConfig);
    };

    const handleEntryChange = (index: number, field: string, value: string) => {
        const arr = [...getCurrentArray()] as any[];
        if (field === 'tags') {
            arr[index][field] = value.split(',').map((t: string) => t.trim());
        } else {
            arr[index][field] = value;
        }
        updateCurrentArray(arr);
    };

    const addEntry = () => {
        if (!config) return;
        const arr = [...getCurrentArray()] as (CodelabEntry | TrainingCategory | TrainingRole)[];
        let newEntry;
        if (tab === "codelabs") {
            newEntry = {
                title: 'New Module',
                description: 'Description...',
                link: '#',
                appEmoji: '📚',
                appName: 'Level',
                duration: '10 min',
                date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
                tags: []
            };
        } else if (tab === "categories") {
            newEntry = { id: 'new-cat', title: 'New Category', emoji: '📁', description: '' };
        } else {
            newEntry = { id: 'new-role', title: 'New Role', emoji: '👤' };
        }
        arr.push(newEntry);
        updateCurrentArray(arr);
        setEditingIndex(arr.length - 1);
    };

    const deleteEntry = (index: number) => {
        const arr = getCurrentArray().filter((_, i) => i !== index);
        updateCurrentArray(arr);
        if (editingIndex === index) setEditingIndex(null);
        toast.info('Item removed. Remember to save changes.');
    };

    if (loading) return (
        <div className="flex items-center justify-center min-h-[400px]">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
    );

    if (!config) return (
        <div className="p-8">
            <Alert variant="destructive" className="max-w-md mx-auto">
                <AlertTitle>Load Error</AlertTitle>
                <AlertDescription>
                    {error || 'No configuration loaded. Check backend connectivity.'}
                </AlertDescription>
                <Button variant="outline" size="sm" className="mt-4" onClick={() => window.location.reload()}>
                    Retry Connection
                </Button>
            </Alert>
        </div>
    );

    const items = getCurrentArray();
    const filteredItems = items.filter((item) => {
        const codelab = item as CodelabEntry;
        const catOrRole = item as (TrainingCategory | TrainingRole);
        return item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            ((codelab.appName || (catOrRole as TrainingCategory).id || '').toLowerCase().includes(searchQuery.toLowerCase()))
    });

    return (
        <div className="p-6 space-y-6 max-w-7xl mx-auto h-[calc(100vh-80px)] flex flex-col">
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 shrink-0">
                <div className="flex items-center gap-4">
                    <div className="p-3 rounded-2xl bg-secondary">
                        <CodelabIcon className="h-10 w-10 text-primary" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Training Config Editor</h1>
                        <p className="text-muted-foreground mt-1">
                            Managing <code className="text-xs">/src/config/training.json</code>
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <Button variant="outline" onClick={addEntry} className="gap-2">
                        <AddIcon className="h-4 w-4" /> Add Item
                    </Button>
                    <Button onClick={handleSave} disabled={saving} className="gap-2 min-w-[140px]">
                        {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <SaveIcon className="h-4 w-4" />}
                        Save Changes
                    </Button>
                </div>
            </header>

            <Tabs value={tab} onValueChange={(val) => { setTab(val); setEditingIndex(null); }} className="w-full shrink-0">
                <TabsList className="grid w-full lg:w-max grid-cols-3 bg-muted/50 p-1 rounded-xl">
                    <TabsTrigger value="codelabs" className="rounded-lg gap-2">
                        <CodelabIcon className="h-4 w-4" /> Modules
                    </TabsTrigger>
                    <TabsTrigger value="categories" className="rounded-lg gap-2">
                        <CategoryIcon className="h-4 w-4" /> Categories
                    </TabsTrigger>
                    <TabsTrigger value="roles" className="rounded-lg gap-2">
                        <RoleIcon className="h-4 w-4" /> Roles
                    </TabsTrigger>
                </TabsList>
            </Tabs>

            <div className="flex flex-col lg:flex-row gap-6 flex-grow overflow-hidden">
                {/* Side List */}
                <Card className="w-full lg:w-[350px] shrink-0 flex flex-col overflow-hidden">
                    <CardHeader className="p-4 bg-muted/30 shrink-0">
                        <div className="relative mt-1">
                            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Search training items..."
                                className="pl-9 h-9 border-none bg-background/50 focus-visible:ring-1"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                    </CardHeader>
                    <CardContent className="p-0 flex-grow overflow-hidden">
                        <ScrollArea className="h-full">
                            <div className="divide-y divide-border">
                                {filteredItems.map((item) => {
                                    const actualIndex = items.indexOf(item);
                                    const codelab = item as CodelabEntry;
                                    const catOrRole = item as (TrainingCategory | TrainingRole);
                                    return (
                                        <div
                                            key={actualIndex}
                                            className={cn(
                                                "w-full flex items-center justify-between p-4 transition-all hover:bg-muted/50 group cursor-pointer border-l-2 border-transparent",
                                                editingIndex === actualIndex && "bg-primary/5 border-l-primary"
                                            )}
                                            onClick={() => setEditingIndex(actualIndex)}
                                        >
                                            <div className="flex items-center gap-3 overflow-hidden">
                                                <span className="text-2xl shrink-0 grayscale group-hover:grayscale-0 transition-all">
                                                    {codelab.appEmoji || (catOrRole as TrainingCategory).emoji}
                                                </span>
                                                <div className="flex flex-col overflow-hidden">
                                                    <span className={cn(
                                                        "text-sm truncate",
                                                        editingIndex === actualIndex ? "font-bold text-primary" : "font-medium"
                                                    )}>
                                                        {item.title}
                                                    </span>
                                                    <span className="text-[10px] text-muted-foreground uppercase tracking-widest truncate">
                                                        {codelab.appName || (catOrRole as TrainingCategory).id}
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
                                {filteredItems.length === 0 && (
                                    <div className="p-12 text-center text-sm text-muted-foreground italic">
                                        No items found in this section.
                                    </div>
                                )}
                            </div>
                        </ScrollArea>
                    </CardContent>
                </Card>

                {/* Form Area */}
                <div className="flex-grow overflow-hidden flex flex-col">
                    {editingIndex !== null ? (
                        <Card className="flex-grow border-none shadow-none lg:border lg:shadow-sm overflow-hidden flex flex-col">
                            <CardHeader className="border-b bg-muted/10 shrink-0">
                                <div className="flex items-center gap-2">
                                    <EditIcon className="h-5 w-5 text-primary" />
                                    <CardTitle>Editing {tab === 'codelabs' ? 'Module' : (tab === 'categories' ? 'Category' : 'Role')}</CardTitle>
                                </div>
                                <CardDescription>
                                    Updates for: <span className="font-semibold text-foreground">{items[editingIndex].title}</span>
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="p-0 flex-grow bg-card">
                                <ScrollArea className="h-full">
                                    <div className="p-6 space-y-8">
                                        {tab === "codelabs" ? (
                                            <div className="space-y-6">
                                                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                                                    <div className="md:col-span-3 space-y-2">
                                                        <Label htmlFor="title">Module Title</Label>
                                                        <Input
                                                            id="title"
                                                            value={(items[editingIndex] as CodelabEntry).title}
                                                            onChange={(e) => handleEntryChange(editingIndex, 'title', e.target.value)}
                                                        />
                                                    </div>
                                                    <div className="space-y-2">
                                                        <Label htmlFor="appEmoji">Badge Emoji</Label>
                                                        <Input
                                                            id="appEmoji"
                                                            className="text-center text-xl"
                                                            value={(items[editingIndex] as CodelabEntry).appEmoji}
                                                            onChange={(e) => handleEntryChange(editingIndex, 'appEmoji', e.target.value)}
                                                        />
                                                    </div>
                                                </div>
                                                <div className="space-y-2">
                                                    <Label htmlFor="description">Module Description</Label>
                                                    <Textarea
                                                        id="description"
                                                        rows={3}
                                                        value={(items[editingIndex] as CodelabEntry).description}
                                                        onChange={(e) => handleEntryChange(editingIndex, 'description', e.target.value)}
                                                    />
                                                </div>
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                    <div className="space-y-2">
                                                        <Label htmlFor="link">Navigation Path</Label>
                                                        <Input
                                                            id="link"
                                                            value={(items[editingIndex] as CodelabEntry).link}
                                                            onChange={(e) => handleEntryChange(editingIndex, 'link', e.target.value)}
                                                        />
                                                    </div>
                                                    <div className="space-y-2">
                                                        <Label htmlFor="appName">Level Label (e.g. Fundamental)</Label>
                                                        <Input
                                                            id="appName"
                                                            value={(items[editingIndex] as CodelabEntry).appName}
                                                            onChange={(e) => handleEntryChange(editingIndex, 'appName', e.target.value)}
                                                        />
                                                    </div>
                                                </div>
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                    <div className="space-y-2">
                                                        <Label htmlFor="duration">Estimated Duration</Label>
                                                        <Input
                                                            id="duration"
                                                            value={(items[editingIndex] as CodelabEntry).duration}
                                                            onChange={(e) => handleEntryChange(editingIndex, 'duration', e.target.value)}
                                                        />
                                                    </div>
                                                    <div className="space-y-2">
                                                        <Label htmlFor="date">Last Reviewed Date</Label>
                                                        <Input
                                                            id="date"
                                                            value={(items[editingIndex] as CodelabEntry).date}
                                                            onChange={(e) => handleEntryChange(editingIndex, 'date', e.target.value)}
                                                        />
                                                    </div>
                                                </div>
                                                <div className="space-y-2">
                                                    <Label htmlFor="tags">Associated Categories/Tags (Comma separated)</Label>
                                                    <Input
                                                        id="tags"
                                                        value={(items[editingIndex] as CodelabEntry).tags.join(', ')}
                                                        onChange={(e) => handleEntryChange(editingIndex, 'tags', e.target.value)}
                                                        placeholder="core-concepts, data-modeling..."
                                                    />
                                                    <div className="flex flex-wrap gap-1.5 pt-2">
                                                        {(items[editingIndex] as CodelabEntry).tags.map((tag, idx) => (
                                                            <Badge key={idx} variant="secondary" className="font-normal px-2 shrink-0">
                                                                {tag}
                                                            </Badge>
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="space-y-6">
                                                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                                                    <div className="md:col-span-1 space-y-2">
                                                        <Label htmlFor="id">Uniqe ID</Label>
                                                        <Input
                                                            id="id"
                                                            value={(items[editingIndex] as (TrainingCategory | TrainingRole)).id}
                                                            onChange={(e) => handleEntryChange(editingIndex, 'id', e.target.value)}
                                                        />
                                                    </div>
                                                    <div className="md:col-span-2 space-y-2">
                                                        <Label htmlFor="title-basic">Display Title</Label>
                                                        <Input
                                                            id="title-basic"
                                                            value={(items[editingIndex] as (TrainingCategory | TrainingRole)).title}
                                                            onChange={(e) => handleEntryChange(editingIndex, 'title', e.target.value)}
                                                        />
                                                    </div>
                                                    <div className="space-y-2">
                                                        <Label htmlFor="emoji">Emoji Icon</Label>
                                                        <Input
                                                            id="emoji"
                                                            className="text-center text-xl"
                                                            value={(items[editingIndex] as (TrainingCategory | TrainingRole)).emoji}
                                                            onChange={(e) => handleEntryChange(editingIndex, 'emoji', e.target.value)}
                                                        />
                                                    </div>
                                                </div>
                                                {tab === "categories" && (
                                                    <div className="space-y-2">
                                                        <Label htmlFor="cat-desc">Long Description</Label>
                                                        <Textarea
                                                            id="cat-desc"
                                                            rows={4}
                                                            value={(items[editingIndex] as TrainingCategory).description}
                                                            onChange={(e) => handleEntryChange(editingIndex, 'description', e.target.value)}
                                                        />
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </ScrollArea>
                            </CardContent>
                        </Card>
                    ) : (
                        <div className="h-full flex flex-col items-center justify-center border-2 border-dashed rounded-3xl bg-muted/5 p-12 text-center opacity-80">
                            <div className="p-8 rounded-full bg-muted/40 mb-6 drop-shadow-sm">
                                <CodelabIcon className="h-16 w-16 text-muted-foreground/30" />
                            </div>
                            <h3 className="text-xl font-bold text-muted-foreground">Editor Ready</h3>
                            <p className="text-muted-foreground/60 mt-2 max-w-sm leading-relaxed">
                                Select an item from the left sidebar to begin managing your training modules, roles, or categories.
                            </p>
                            <Button
                                variant="secondary"
                                className="mt-8 px-8 rounded-full font-semibold border"
                                onClick={addEntry}
                            >
                                <AddIcon className="h-4 w-4 mr-2" /> Create New {tab === 'codelabs' ? 'Module' : (tab === 'categories' ? 'Category' : 'Role')}
                            </Button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default TrainingEditor;
