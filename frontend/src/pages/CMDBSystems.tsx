import React, { useState, useEffect } from 'react';
import { 
    Monitor, 
    Search, 
    ChevronRight, 
    Filter, 
    Download, 
    Layers,
    Clock,
    ArrowLeft,
    Users,
    Activity,
    Shield
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
    Table, 
    TableBody, 
    TableCell, 
    TableHead, 
    TableHeader, 
    TableRow 
} from '@/components/ui/table';
import { toast } from 'sonner';
import { useSidebar } from '@/context/SidebarContext';

interface CMDBSystem {
    id: number;
    system_id: string;
    system_name: string;
    system_layer: string;
    criticality: string;
    environment: string;
    lifecycle_stage: string;
    status: string;
    hosting_platform: string;
    description: string;
    owner_id: string;
}

interface CMDBSnapshot {
    id: number;
    name: string;
    version: string;
    description: string;
    source: string;
    generated_at_utc: string;
    created_at_utc: string;
}

const CMDBSystemsPage: React.FC = () => {
    const [snapshots, setSnapshots] = useState<CMDBSnapshot[]>([]);
    const [selectedSnapshot, setSelectedSnapshot] = useState<CMDBSnapshot | null>(null);
    const [systems, setSystems] = useState<CMDBSystem[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [layerFilter, setLayerFilter] = useState('All');
    const [envFilter, setEnvFilter] = useState('All');

    const { setContent } = useSidebar();

    useEffect(() => {
        fetchSnapshots();
    }, []);

    useEffect(() => {
        if (!selectedSnapshot) {
            setContent(null);
            return;
        }

        const layers = ['All', ...Array.from(new Set(systems.map(s => s.system_layer)))];
        const envs = ['All', ...Array.from(new Set(systems.map(s => s.environment)))];

        setContent(
            <div className="space-y-8 animate-in fade-in slide-in-from-right-10 duration-700">
                <section className="space-y-3">
                    <div className="flex items-center gap-3 px-1">
                        <Search className="h-4 w-4 text-primary" />
                        <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground opacity-60">Search Systems</h3>
                    </div>
                    <Input 
                        placeholder="FILTER BY NAME/ID..." 
                        className="h-12 rounded-2xl bg-muted/30 border-none font-black text-[11px] uppercase tracking-widest placeholder:text-muted-foreground/30 focus-visible:ring-1 focus-visible:ring-primary/20"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </section>

                <section className="space-y-3">
                    <div className="flex items-center gap-3 px-1">
                        <Filter className="h-4 w-4 text-primary" />
                        <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground opacity-60">System Filters</h3>
                    </div>
                    <div className="p-5 rounded-3xl bg-muted/10 border border-border/40 space-y-6">
                        <div>
                            <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/60 mb-3">Architectural Layer</p>
                            <div className="flex flex-wrap gap-2">
                                {layers.map(layer => (
                                    <Badge 
                                        key={layer} 
                                        variant={layerFilter === layer ? 'default' : 'outline'}
                                        className={`cursor-pointer rounded-lg px-2 py-0.5 text-[9px] font-black uppercase tracking-tighter transition-all ${
                                            layerFilter === layer ? 'bg-primary text-primary-foreground' : 'hover:bg-primary/10 hover:border-primary/20'
                                        }`}
                                        onClick={() => setLayerFilter(layer)}
                                    >
                                        {layer}
                                    </Badge>
                                ))}
                            </div>
                        </div>
                        <div className="h-px bg-border/40" />
                        <div>
                            <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/60 mb-3">Environment</p>
                            <div className="flex flex-wrap gap-2">
                                {envs.map(env => (
                                    <Badge 
                                        key={env} 
                                        variant={envFilter === env ? 'default' : 'outline'}
                                        className={`cursor-pointer rounded-lg px-2 py-0.5 text-[9px] font-black uppercase tracking-tighter transition-all ${
                                            envFilter === env ? 'bg-primary text-primary-foreground' : 'hover:bg-primary/10 hover:border-primary/20'
                                        }`}
                                        onClick={() => setEnvFilter(env)}
                                    >
                                        {env}
                                    </Badge>
                                ))}
                            </div>
                        </div>
                    </div>
                </section>

                <div className="p-6 rounded-[2.5rem] bg-primary/5 border border-primary/10 text-xs font-black uppercase tracking-widest">
                    <div className="flex items-center gap-3 mb-4">
                        <Activity className="h-4 w-4 text-primary" />
                        <span className="text-primary">Snapshot Health</span>
                    </div>
                    <div className="space-y-3 opacity-60 italic">
                        <div className="flex justify-between">
                            <span>TOTAL SYSTEMS</span>
                            <span className="text-foreground not-italic">{systems.length}</span>
                        </div>
                        <div className="flex justify-between">
                            <span>ACTIVE SYSTEMS</span>
                            <span className="text-foreground not-italic">{systems.filter(s => s.status === 'active').length}</span>
                        </div>
                        <div className="flex justify-between">
                            <span>CRITICALITY ALPHA</span>
                            <span className="text-foreground not-italic">{systems.filter(s => s.criticality === 'Tier 1' || s.criticality === 'Critical').length}</span>
                        </div>
                    </div>
                </div>
            </div>
        );

        return () => setContent(null);
    }, [selectedSnapshot, systems, searchQuery, layerFilter, envFilter, setContent]);

    const fetchSnapshots = async () => {
        setIsLoading(true);
        try {
            const response = await fetch('/api/cmdb/list');
            if (response.ok) {
                const data = await response.json();
                setSnapshots(Array.isArray(data) ? data : []);
            }
        } catch (err) {
            toast.error("Failed to load snapshots");
        } finally {
            setIsLoading(false);
        }
    };

    const fetchSystems = async (snapshotId: number) => {
        setIsLoading(true);
        try {
            const response = await fetch(`/api/cmdb/${snapshotId}/systems`);
            if (response.ok) {
                const data = await response.json();
                setSystems(Array.isArray(data) ? data : []);
            }
        } catch (err) {
            toast.error("Failed to load systems");
        } finally {
            setIsLoading(false);
        }
    };

    const handleSnapshotSelect = (snapshot: CMDBSnapshot) => {
        setSelectedSnapshot(snapshot);
        fetchSystems(snapshot.id);
    };

    const filteredSystems = systems.filter(s => {
        const matchesSearch = s.system_name.toLowerCase().includes(searchQuery.toLowerCase()) || 
            s.system_id.toLowerCase().includes(searchQuery.toLowerCase()) ||
            s.description.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesLayer = layerFilter === 'All' || s.system_layer === layerFilter;
        const matchesEnv = envFilter === 'All' || s.environment === envFilter;
        return matchesSearch && matchesLayer && matchesEnv;
    });

    if (!selectedSnapshot) {
        return (
            <div className="p-8 space-y-10 animate-in fade-in duration-700">
                <header className="flex flex-col gap-4">
                    <div className="flex items-center gap-4">
                        <div className="p-3 rounded-2xl bg-primary/10 text-primary border border-primary/20">
                            <Monitor className="h-8 w-8" />
                        </div>
                        <div>
                            <h1 className="text-4xl font-black tracking-tighter uppercase italic">CMDB Infrastructure</h1>
                            <p className="text-muted-foreground font-medium italic">Federated inventory of enterprise systems and assets.</p>
                        </div>
                    </div>
                </header>

                <div className="bg-card/30 border border-border/40 rounded-[2.5rem] overflow-hidden backdrop-blur-sm shadow-xl">
                    <Table>
                        <TableHeader>
                            <TableRow className="border-border/40 hover:bg-transparent px-6">
                                <TableHead className="w-16 h-14 pl-8 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60">ID</TableHead>
                                <TableHead className="h-14 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60">Snapshot Name</TableHead>
                                <TableHead className="h-14 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60 text-center">Version</TableHead>
                                <TableHead className="h-14 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60">Description</TableHead>
                                <TableHead className="h-14 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60">Generated At</TableHead>
                                <TableHead className="w-20 h-14 pr-8"></TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {isLoading && snapshots.length === 0 ? (
                                [1, 2, 3, 4, 5].map(i => (
                                    <TableRow key={i} className="animate-pulse border-border/40 px-6 h-20">
                                        <TableCell colSpan={6} className="p-0">
                                            <div className="h-12 w-full bg-muted/10" />
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                snapshots.map(s => (
                                    <TableRow 
                                        key={s.id} 
                                        className="group border-border/40 hover:bg-primary/[0.03] transition-all duration-300 cursor-pointer h-20 px-6"
                                        onClick={() => handleSnapshotSelect(s)}
                                    >
                                        <TableCell className="pl-8 text-[11px] font-black text-muted-foreground/40 italic">#{s.id}</TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-4">
                                                <div className="p-2.5 rounded-xl bg-primary/5 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-500">
                                                    <Clock className="h-4 w-4" />
                                                </div>
                                                <span className="text-sm font-black uppercase tracking-tight italic group-hover:text-primary transition-colors">
                                                    {s.name}
                                                </span>
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-center">
                                            <Badge className="bg-primary/10 text-primary border-none text-[8px] font-black px-3 h-5 rounded-lg uppercase tracking-[0.2em]">
                                                v{s.version}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            <span className="text-[10px] font-black uppercase text-muted-foreground/60 tracking-widest italic line-clamp-1 max-w-sm">
                                                {s.description || "NO METADATA DESCRIPTION"}
                                            </span>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex flex-col">
                                                <span className="text-[11px] font-black uppercase tracking-widest text-muted-foreground italic">
                                                    {new Date(s.generated_at_utc || s.created_at_utc).toLocaleDateString()}
                                                </span>
                                                <span className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/40 italic">
                                                    {new Date(s.generated_at_utc || s.created_at_utc).toLocaleTimeString()}
                                                </span>
                                            </div>
                                        </TableCell>
                                        <TableCell className="pr-8 text-right">
                                            <div className="inline-flex p-2 rounded-xl bg-muted group-hover:bg-primary group-hover:text-primary-foreground transition-all">
                                                <ChevronRight className="h-4 w-4" />
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </div>

                {!isLoading && snapshots.length === 0 && (
                    <div className="flex flex-col items-center justify-center p-32 text-center border-2 border-dashed border-muted-foreground/10 rounded-[4rem] bg-muted/5">
                        <Monitor className="h-16 w-16 text-muted-foreground/10 mb-8" />
                        <h3 className="text-3xl font-black uppercase italic tracking-tighter opacity-20">inventory empty</h3>
                        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground/30 mt-3">No CMDB snapshots have been ingested.</p>
                    </div>
                )}
            </div>
        );
    }

    return (
        <div className="h-full flex flex-col p-6 space-y-6 animate-in slide-in-from-bottom-4 duration-500">
            <header className="flex items-center justify-between border-b pb-6 shrink-0">
                <div className="flex items-center gap-6 text-xs uppercase tracking-widest font-black">
                    <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={() => setSelectedSnapshot(null)}
                        className="rounded-2xl hover:bg-primary/10 hover:text-primary transition-all mr-2"
                    >
                        <ArrowLeft className="h-6 w-6" />
                    </Button>
                    <div>
                        <div className="flex items-center gap-4">
                            <h1 className="text-3xl font-black tracking-tighter italic">{selectedSnapshot.name}</h1>
                            <Badge className="bg-primary text-primary-foreground border-none text-[10px] font-black px-4 h-7 rounded-xl uppercase tracking-widest leading-none">
                                {systems.length} Systems
                            </Badge>
                        </div>
                        <div className="flex items-center gap-3 mt-1.5 opacity-40 italic">
                            <span>Repository Snapshot</span>
                            <div className="w-1 h-1 rounded-full bg-foreground" />
                            <span>v{selectedSnapshot.version}</span>
                        </div>
                    </div>
                </div>
                <Button variant="outline" className="rounded-2xl h-12 px-6 font-black uppercase text-[10px] tracking-widest border-border/40">
                    <Download className="h-4 w-4 mr-3" />
                    Export Map
                </Button>
            </header>

            <ScrollArea className="flex-grow min-h-0 bg-card/20 rounded-[3rem] border border-border/40 p-10 overflow-hidden shadow-inner">
                <div className="bg-card/40 border border-border/40 rounded-[2.5rem] overflow-hidden backdrop-blur-md shadow-2xl">
                    <Table>
                        <TableHeader>
                            <TableRow className="border-border/40 hover:bg-transparent px-8">
                                <TableHead className="w-12 h-14 pl-10 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60">Status</TableHead>
                                <TableHead className="h-14 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60">System Identity</TableHead>
                                <TableHead className="h-14 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60">Infrastructure Layer</TableHead>
                                <TableHead className="h-14 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60">Criticality</TableHead>
                                <TableHead className="h-14 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60">Environment</TableHead>
                                <TableHead className="h-14 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60">Owner ID</TableHead>
                                <TableHead className="w-16 h-14 pr-10"></TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredSystems.map(s => (
                                <TableRow key={s.id} className="group border-border/40 hover:bg-primary/[0.04] transition-all duration-500 h-24 px-8">
                                    <TableCell className="pl-10">
                                        <div className={`w-2.5 h-2.5 rounded-full ${s.status === 'active' ? 'bg-emerald-500 shadow-[0_0_12px_rgba(16,185,129,0.5)]' : 'bg-muted-foreground/30'}`} />
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-4">
                                            <div className="p-3.5 rounded-2xl bg-muted group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-700 shadow-sm border border-border/10">
                                                <Layers className="h-5 w-5" />
                                            </div>
                                            <div className="flex flex-col">
                                                <h4 className="text-base font-black tracking-tight uppercase italic group-hover:text-primary transition-colors">
                                                    {s.system_name}
                                                </h4>
                                                <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/40 mt-0.5">{s.system_id}</span>
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-2.5">
                                            <Shield className="h-3 w-3 text-primary/40 group-hover:text-primary transition-colors" />
                                            <span className="text-[11px] font-black uppercase italic text-muted-foreground/80 tracking-widest">{s.system_layer}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <Badge className={`border-none text-[8px] px-3 h-5 rounded-md uppercase tracking-widest font-black ${
                                            s.criticality === 'Critical' || s.criticality === 'Tier 1' 
                                                ? 'bg-red-500/10 text-red-500 border border-red-500/20' 
                                                : 'bg-muted text-muted-foreground'
                                        }`}>
                                            {s.criticality}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant="outline" className="text-[9px] font-black border-border/40 rounded-lg h-6 px-3 italic uppercase text-muted-foreground/70 group-hover:border-primary/30 group-hover:text-foreground transition-all">
                                            {s.environment}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-2">
                                            <Users className="h-3 w-3 text-muted-foreground/40" />
                                            <span className="text-[10px] font-black uppercase italic text-muted-foreground tracking-tighter">{s.owner_id}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell className="pr-10 text-right">
                                        <Button variant="ghost" size="icon" className="rounded-xl opacity-0 group-hover:opacity-100 group-hover:bg-primary/20 group-hover:text-primary transition-all">
                                            <ChevronRight className="h-5 w-5" />
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                    {filteredSystems.length === 0 && (
                        <div className="flex flex-col items-center justify-center py-40 text-center">
                            <Search className="h-20 w-20 text-muted-foreground/10 mb-8" />
                            <h3 className="text-3xl font-black uppercase italic tracking-tighter opacity-20">inventory void</h3>
                            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground/30 mt-3">Refine mapping criteria to isolate infrastructure nodes.</p>
                        </div>
                    )}
                </div>
            </ScrollArea>
        </div>
    );
};

export default CMDBSystemsPage;
