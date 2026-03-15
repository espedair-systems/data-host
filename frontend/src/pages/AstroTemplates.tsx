import React, { useState, useEffect } from 'react';
import {
    Component,
    Clock,
    HardDrive,
    Search,
    Plus,
    ArrowRight,
    MoreVertical,
    Layout,
    Code2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';

interface DesignFile {
    name: string;
    size: number;
    lastModified: string;
}

const AstroTemplates: React.FC = () => {
    const [files, setFiles] = useState<DesignFile[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        fetchTemplates();
    }, []);

    const fetchTemplates = async () => {
        try {
            const response = await fetch('/api/design/astro-templates');
            if (!response.ok) throw new Error('Failed to fetch templates');
            const data = await response.json();
            setFiles(data || []);
        } catch (error) {
            console.error('Error:', error);
            toast.error('Could not load templates');
        } finally {
            setLoading(false);
        }
    };

    const filteredFiles = files.filter(file =>
        file.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const formatSize = (bytes: number) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    const formatDate = (dateStr: string) => {
        return new Date(dateStr).toLocaleDateString('en-GB', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    return (
        <div className="flex flex-col gap-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Header section */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div className="space-y-2">
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 rounded-2xl bg-primary/10 text-primary ring-1 ring-primary/20 shadow-lg shadow-primary/5">
                            <Component className="h-6 w-6" />
                        </div>
                        <h1 className="text-4xl font-black tracking-tight uppercase italic">
                            Astro Templates
                        </h1>
                    </div>
                    <p className="text-muted-foreground font-medium max-w-2xl pl-1">
                        Manage UI blueprints and system templates stored in <code className="px-1.5 py-0.5 rounded bg-muted text-foreground text-xs font-bold">./templates</code>.
                    </p>
                </div>

                <div className="flex items-center gap-3">
                    <Button variant="outline" className="rounded-xl h-11 px-6 font-bold gap-2">
                        <Layout className="h-4 w-4" />
                        Preview Mode
                    </Button>
                    <Button className="rounded-xl h-11 px-6 font-black gap-2 shadow-lg shadow-primary/20">
                        <Plus className="h-4 w-4" />
                        Create Template
                    </Button>
                </div>
            </div>

            {/* Main Content Card */}
            <div className="bg-card/40 backdrop-blur-xl border rounded-[2rem] overflow-hidden shadow-2xl shadow-black/5 flex flex-col min-h-[600px]">
                {/* Toolbar */}
                <div className="p-6 border-b bg-muted/20 flex flex-col md:flex-row gap-4 justify-between items-center">
                    <div className="relative w-full md:w-96 group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                        <Input
                            placeholder="Search UI templates..."
                            className="pl-11 h-12 bg-background/50 border-none rounded-2xl focus-visible:ring-2 focus-visible:ring-primary/20 transition-all font-medium"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>

                    <div className="flex items-center gap-4">
                        <Badge variant="outline" className="h-10 px-4 rounded-xl font-bold bg-background/50 border-none whitespace-nowrap">
                            {filteredFiles.length} Design Specs
                        </Badge>
                    </div>
                </div>

                {/* List View */}
                <div className="flex-grow">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center h-full py-20 gap-4 opacity-50">
                            <div className="w-12 h-12 rounded-full border-b-2 border-primary animate-spin" />
                            <p className="font-bold text-sm uppercase tracking-widest">Hydrating templates...</p>
                        </div>
                    ) : filteredFiles.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full py-32 text-center">
                            <div className="w-24 h-24 rounded-[2.5rem] bg-muted/30 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-500">
                                <Code2 className="h-10 w-10 text-muted-foreground/40" />
                            </div>
                            <h3 className="text-2xl font-black uppercase italic mb-2 tracking-tight">No Templates</h3>
                            <p className="text-muted-foreground max-w-sm font-medium">
                                {searchQuery ? "No templates match your criteria." : "Start building your component library."}
                            </p>
                            {!searchQuery && (
                                <Button variant="link" className="mt-4 font-black uppercase text-xs tracking-widest text-primary hover:opacity-80">
                                    Browse Blueprint Gallery
                                </Button>
                            )}
                        </div>
                    ) : (
                        <div className="divide-y divide-border/40">
                            <div className="grid grid-cols-12 px-8 py-4 bg-muted/10 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60">
                                <div className="col-span-6">Component Template</div>
                                <div className="col-span-2 text-center">Density</div>
                                <div className="col-span-3">Sync Date</div>
                                <div className="col-span-1"></div>
                            </div>
                            {filteredFiles.map((file) => (
                                <div
                                    key={file.name}
                                    className="grid grid-cols-12 items-center px-8 py-5 hover:bg-primary/[0.02] transition-colors group cursor-pointer"
                                >
                                    <div className="col-span-6 flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-2xl bg-amber-500/5 border border-amber-500/10 flex items-center justify-center group-hover:bg-amber-500/10 group-hover:scale-110 transition-all duration-300">
                                            <Layout className="h-5 w-5 text-amber-500" />
                                        </div>
                                        <div className="flex flex-col gap-0.5 overflow-hidden">
                                            <span className="font-black text-sm tracking-tight truncate group-hover:text-primary transition-colors">
                                                {file.name}
                                            </span>
                                            <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest flex items-center gap-2">
                                                <Badge variant="outline" className="px-1.5 py-0 rounded bg-amber-500/5 text-amber-500 border-none text-[8px] h-4">ASTRO</Badge>
                                                UI COMPONENT
                                            </span>
                                        </div>
                                    </div>

                                    <div className="col-span-2 flex flex-col items-center gap-1 font-mono text-[11px] font-medium text-muted-foreground">
                                        <div className="flex items-center gap-2">
                                            <HardDrive className="h-3 w-3" />
                                            {formatSize(file.size)}
                                        </div>
                                    </div>

                                    <div className="col-span-3 flex flex-col gap-1">
                                        <div className="flex items-center gap-2 text-[11px] font-bold text-muted-foreground/80 lowercase italic font-mono uppercase tracking-widest tracking-normal">
                                            <Clock className="h-3.5 w-3.5" />
                                            {formatDate(file.lastModified)}
                                        </div>
                                    </div>

                                    <div className="col-span-1 flex justify-end">
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl hover:bg-primary/10 text-muted-foreground hover:text-primary">
                                                    <MoreVertical className="h-4 w-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end" className="w-48 p-2 rounded-xl">
                                                <DropdownMenuItem className="rounded-lg h-10 gap-3 font-bold text-xs">
                                                    Edit Blueprint
                                                </DropdownMenuItem>
                                                <DropdownMenuItem className="rounded-lg h-10 gap-3 font-bold text-xs">
                                                    Live Preview
                                                </DropdownMenuItem>
                                                <Separator className="my-1" />
                                                <DropdownMenuItem className="rounded-lg h-10 gap-3 font-bold text-xs text-destructive hover:bg-destructive/10">
                                                    Remove Template
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                        <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity text-primary">
                                            <ArrowRight className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Footer info */}
                <div className="p-6 border-t bg-muted/5 flex items-center justify-between">
                    <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-muted-foreground/40">
                        <div className="w-1.5 h-1.5 rounded-full bg-cyan-500 animate-pulse" />
                        Design System Linked
                    </div>
                    <p className="text-[10px] font-bold text-muted-foreground/40 uppercase">
                        Engine: Astro Component Manager v1
                    </p>
                </div>
            </div>
        </div>
    );
};

export default AstroTemplates;
