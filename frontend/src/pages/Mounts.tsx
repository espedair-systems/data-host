import React, { useEffect, useState } from 'react';
import {
    ExternalLink,
    HardDrive,
    Loader2,
    ChevronRight,
    Zap,
    FolderSync
} from 'lucide-react';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Link } from 'react-router-dom';

interface MountPoint {
    path: string;
    source_path: string;
}

interface Config {
    Port: number;
    FrontendPath: string;
    DataPath: string;
    Mounts: MountPoint[];
}

const Mounts: React.FC = () => {
    const [config, setConfig] = useState<Config | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch('/api/config')
            .then((res) => res.json())
            .then((data) => {
                setConfig(data);
                setLoading(false);
            })
            .catch((err) => {
                console.error('Error fetching config:', err);
                setLoading(false);
            });
    }, []);

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="text-sm font-medium text-muted-foreground italic uppercase tracking-widest">Hydrating Mount Topology...</p>
            </div>
        );
    }

    return (
        <div className="p-6 space-y-10 max-w-7xl mx-auto animate-in fade-in duration-700">
            <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-4 font-medium italic">
                <Link to="/" className="hover:text-foreground transition-colors uppercase tracking-widest text-[10px]">Registry</Link>
                <ChevronRight className="h-3 w-3" />
                <span className="text-foreground font-black uppercase tracking-widest text-[10px]">Managed Instances</span>
            </nav>

            <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 shrink-0 border-b pb-8 border-slate-200 dark:border-slate-800">
                <div className="flex items-center gap-4">
                    <div className="p-3.5 rounded-2xl bg-amber-500/10 text-amber-600 shadow-sm border border-amber-500/20">
                        <HardDrive className="h-10 w-10" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-black tracking-tighter text-foreground uppercase italic leading-none">
                            Virtual <span className="text-amber-600 not-italic">Mounts</span>
                        </h1>
                        <p className="text-muted-foreground mt-2 font-medium italic tracking-tight">Synchronized filesystem bridges between container storage and semantic data routes.</p>
                    </div>
                </div>
            </header>

            <div className="rounded-2xl border bg-card/40 backdrop-blur-sm overflow-hidden shadow-sm animate-in slide-in-from-bottom-4 duration-1000">
                <Table>
                    <TableHeader className="bg-muted/50 border-b-none">
                        <TableRow className="hover:bg-transparent border-none">
                            <TableHead className="w-[200px] h-14 px-8 uppercase text-[10px] font-black tracking-widest text-muted-foreground/60 italic">Ingress Point</TableHead>
                            <TableHead className="h-14 px-8 uppercase text-[10px] font-black tracking-widest text-muted-foreground/60 italic">Origin Vector</TableHead>
                            <TableHead className="h-14 px-8 uppercase text-[10px] font-black tracking-widest text-muted-foreground/60 italic text-right">Operation</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        <TableRow className="group hover:bg-muted/30 transition-colors border-muted/20">
                            <TableCell className="px-8 py-5">
                                <div className="flex items-center gap-3">
                                    <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20 font-black px-3 py-0.5 italic">/home</Badge>
                                </div>
                            </TableCell>
                            <TableCell className="px-8 py-5">
                                <code className="text-[11px] font-mono font-bold text-muted-foreground/60 group-hover:text-foreground transition-colors">{config?.FrontendPath}</code>
                            </TableCell>
                            <TableCell className="px-8 py-5 text-right">
                                <a href="/home" target="_blank" className="inline-flex items-center gap-2 text-[10px] font-black uppercase text-primary hover:text-primary/70 transition-colors shadow-sm bg-primary/5 px-4 py-1.5 rounded-lg border border-primary/10 italic">
                                    Invoke <ExternalLink className="h-3 w-3" />
                                </a>
                            </TableCell>
                        </TableRow>
                        <TableRow className="group hover:bg-muted/30 transition-colors border-muted/20">
                            <TableCell className="px-8 py-5">
                                <div className="flex items-center gap-3">
                                    <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20 font-black px-3 py-0.5 italic text-lg">/</Badge>
                                </div>
                            </TableCell>
                            <TableCell className="px-8 py-5">
                                <code className="text-[11px] font-mono font-bold text-muted-foreground/60 group-hover:text-foreground transition-colors">{config?.DataPath}</code>
                            </TableCell>
                            <TableCell className="px-8 py-5 text-right">
                                <a href="/" target="_blank" className="inline-flex items-center gap-2 text-[10px] font-black uppercase text-primary hover:text-primary/70 transition-colors shadow-sm bg-primary/5 px-4 py-1.5 rounded-lg border border-primary/10 italic">
                                    Inspect <ExternalLink className="h-3 w-3" />
                                </a>
                            </TableCell>
                        </TableRow>
                        {config?.Mounts?.map((mount, index) => (
                            <TableRow key={index} className="group hover:bg-muted/30 transition-colors border-muted/20 border-t border-dashed">
                                <TableCell className="px-8 py-5">
                                    <div className="flex items-center gap-3 font-bold text-primary italic uppercase tracking-tight">
                                        {mount.path}
                                    </div>
                                </TableCell>
                                <TableCell className="px-8 py-5 text-sm">
                                    <code className="text-[11px] font-mono font-bold text-muted-foreground/60 group-hover:text-foreground transition-colors">{mount.source_path}</code>
                                </TableCell>
                                <TableCell className="px-8 py-5 text-right">
                                    <a href={mount.path} target="_blank" className="inline-flex items-center gap-2 text-[10px] font-black uppercase text-primary hover:text-primary/70 transition-colors shadow-sm bg-primary/5 px-4 py-1.5 rounded-lg border border-primary/10 italic">
                                        Open <ExternalLink className="h-3 w-3" />
                                    </a>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>

            <footer className="pt-2 flex items-center justify-center gap-6 text-[10px] text-muted-foreground/20 font-black uppercase tracking-[0.5em]">
                <div className="flex items-center gap-2">
                    <Zap className="h-3 w-3 text-amber-500/40" />
                    Hot-Swappable
                </div>
                <div className="h-1 w-1 rounded-full bg-muted-foreground/20" />
                <div className="flex items-center gap-2">
                    <FolderSync className="h-3 w-3" />
                    Bi-directional
                </div>
            </footer>
        </div>
    );
};

export default Mounts;
