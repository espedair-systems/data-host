import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { FocusErd } from '../components/graph/FocusErd';
import { useSidebar } from '../context/SidebarContext';
import {
    Table as TableIcon,
    Search,
    Filter,
    ChevronRight,
    Database,
    Layers,
    Grid,
    Columns,
    ArrowLeft,
    Cpu,
    Zap,
    Shield,
    Info,
    Activity,
    Network
} from 'lucide-react';
import { toast } from 'sonner';
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from '@/lib/utils';

interface BlueprintTableSummary {
    name: string;
    schemaName: string;
    type: string;
    description: string;
    columnCount: number;
    rowCount: number;
}

const Entities: React.FC = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const focusTable = searchParams.get('table');
    const schemaParam = searchParams.get('schema');

    const [viewMode, setViewMode] = useState<'list' | 'map'>(focusTable || schemaParam ? 'map' : 'list');
    const [fullSchema, setFullSchema] = useState<any>(null);
    const [tables, setTables] = useState<BlueprintTableSummary[]>([]);
    const [schemas, setSchemas] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedSchema, setSelectedSchema] = useState<string>('all');

    const { setContent } = useSidebar();

    // Fetch blueprint tables and available schemas for the list view
    const fetchListData = async () => {
        if (viewMode !== 'list') return;
        setIsLoading(true);
        try {
            const token = localStorage.getItem('token');
            const params = new URLSearchParams();
            if (searchTerm) params.append('search', searchTerm);
            if (selectedSchema !== 'all') params.append('schemaName', selectedSchema);

            const [tRes, sRes] = await Promise.all([
                fetch(`/api/blueprint/tables?${params.toString()}`, { headers: { 'Authorization': `Bearer ${token}` } }),
                fetch('/api/blueprint/schemas', { headers: { 'Authorization': `Bearer ${token}` } })
            ]);

            if (tRes.ok && sRes.ok) {
                const tData = await tRes.json();
                const sData = await sRes.json();
                setTables(Array.isArray(tData) ? tData : []);
                setSchemas(Array.isArray(sData) ? sData : []);
            }
        } catch (err) {
            toast.error("Failed to sync with entity registry");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchListData();
    }, [viewMode, selectedSchema]);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        fetchListData();
    };

    // Fetch full schema for map view
    useEffect(() => {
        const fetchSchema = async () => {
            if (viewMode !== 'map') return;
            setIsLoading(true);
            try {
                const token = localStorage.getItem('token');
                const endpoint = schemaParam
                    ? `/api/blueprint/schemas/${encodeURIComponent(schemaParam)}`
                    : '/api/site/master-schema';

                const response = await fetch(endpoint, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (response.ok) {
                    const data = await response.json();
                    setFullSchema(data);
                } else {
                    toast.error(`Failed to load ${schemaParam ? 'requested schema' : 'master blueprint'}`);
                }
            } catch (err) {
                toast.error("Network error while connecting to registry");
            } finally {
                setIsLoading(false);
            }
        };

        fetchSchema();
    }, [viewMode, schemaParam]);

    useEffect(() => {
        setContent(
            <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
                <div className="space-y-4">
                    <div className="flex items-center gap-3 px-1">
                        <Cpu className="h-4 w-4 text-primary" />
                        <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Neural Context</h3>
                    </div>
                    <div className="p-6 rounded-[2rem] bg-primary/5 border border-primary/10 space-y-4">
                        <div className="flex items-center gap-3 text-primary">
                            <Zap className="h-5 w-5" />
                            <span className="text-[10px] font-black uppercase tracking-widest">{viewMode === 'list' ? 'Registry Inventory' : 'Active Modeling'}</span>
                        </div>
                        <p className="text-xs font-medium text-muted-foreground leading-relaxed">
                            {viewMode === 'list'
                                ? 'Exploring the federated entity directory. Search and filter to isolate specific data structures for deep mapping.'
                                : 'Visualizing the federated data registry. Entities and their relations are extracted in real-time from the master metadata graph.'}
                        </p>
                    </div>
                </div>

                {viewMode === 'map' && (
                    <div className="space-y-4">
                        <div className="flex items-center gap-3 px-1">
                            <Shield className="h-4 w-4 text-emerald-500" />
                            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Integrity Wall</h3>
                        </div>
                        <div className="bg-muted/30 p-4 rounded-2xl border border-border/50 space-y-3">
                            {[
                                { label: 'Relational Drift', val: '0.04%', status: 'Low' },
                                { label: 'Entity Coverage', val: '98.2%', status: 'Nominal' },
                                { label: 'Sync Status', val: 'Active', status: 'OK' }
                            ].map((item, i) => (
                                <div key={i} className="flex justify-between items-center border-b border-border/5 last:border-0 pb-2 last:pb-0">
                                    <span className="text-[9px] font-bold text-muted-foreground uppercase">{item.label}</span>
                                    <span className="text-[10px] font-black italic text-emerald-500">{item.val}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                <div className="pt-4 px-2">
                    <div className="flex items-center gap-2 text-[10px] font-black text-muted-foreground/30 uppercase tracking-widest mb-6">
                        <div className="h-px flex-1 bg-muted-foreground/10" />
                        Navigation Guide
                        <div className="h-px flex-1 bg-muted-foreground/10" />
                    </div>
                    <div className="space-y-3">
                        <div className="flex items-start gap-4">
                            <div className="p-2 rounded-lg bg-muted text-muted-foreground mt-0.5">
                                <Info className="h-3 w-3" />
                            </div>
                            <p className="text-[10px] font-bold text-muted-foreground/60 leading-relaxed uppercase">
                                {viewMode === 'list'
                                    ? 'Click the access chevron on any object to enter high-fidelity graph mode focused on that entity.'
                                    : 'Double-click entity nodes to focus neighbors and isolate context.'}
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        );
        return () => setContent(null);
    }, [setContent, viewMode]);

    const handleFocusTable = (tableName: string, schemaName: string) => {
        setSearchParams({ table: tableName, schema: schemaName });
        setViewMode('map');
    };

    if (viewMode === 'map') {
        return (
            <div className="flex flex-col h-[calc(100vh-140px)] animate-in fade-in duration-700">
                <header className="flex items-center justify-between mb-8 shrink-0">
                    <div className="flex items-center gap-6">
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                                setViewMode('list');
                                setSearchParams({});
                            }}
                            className="p-3 h-12 w-12 rounded-2xl bg-muted/50 hover:bg-primary/10 text-primary border border-primary/5 shadow-sm"
                        >
                            <ArrowLeft className="h-6 w-6" />
                        </Button>
                        <div>
                            <h1 className="text-4xl font-black tracking-tighter text-foreground italic uppercase">
                                Entity <span className="text-muted-foreground/30 not-italic">Blueprint</span>
                            </h1>
                            <p className="text-muted-foreground mt-1 font-medium italic">
                                High-fidelity visualization of the {focusTable || 'requested'} entity architecture.
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20 px-4 py-1.5 font-black text-[10px] uppercase tracking-widest rounded-xl">
                            {fullSchema?.tables?.length || 0} Entities Mapped
                        </Badge>
                    </div>
                </header>

                <div className="flex-grow relative min-h-0 bg-muted/5 rounded-[2.5rem] overflow-hidden border border-border/40 shadow-2xl">
                    {isLoading ? (
                        <div className="absolute inset-0 flex flex-col items-center justify-center space-y-6">
                            <div className="relative">
                                <div className="h-24 w-24 rounded-full border-4 border-primary/10 border-t-primary animate-spin" />
                                <TableIcon className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-8 w-8 text-primary animate-pulse" />
                            </div>
                            <div className="text-center space-y-2">
                                <h3 className="text-xl font-black italic tracking-tighter uppercase">Initializing Graph Engine</h3>
                                <p className="text-[10px] font-black text-muted-foreground/40 uppercase tracking-[0.3em]">Extracting and mapping entity relations...</p>
                            </div>
                        </div>
                    ) : fullSchema ? (
                        <FocusErd schema={fullSchema} defaultViewpoint={focusTable || undefined} />
                    ) : (
                        <div className="absolute inset-0 flex flex-col items-center justify-center p-12 text-center">
                            <div className="p-10 rounded-[3rem] bg-muted/30 border border-muted-foreground/10 mb-8">
                                <Database className="h-16 w-16 text-muted-foreground/20" />
                            </div>
                            <h3 className="text-2xl font-black italic tracking-tighter uppercase mb-4">Target Blueprint Missing</h3>
                            <p className="max-w-md text-muted-foreground font-medium italic">The requested metadata context could not be resolved. Return to registry to reinitialize channel.</p>
                            <Button
                                variant="outline"
                                className="mt-8 rounded-2xl px-10 h-14 font-black uppercase text-[10px] tracking-widest border-primary/20 hover:bg-primary/5 shadow-xl transition-all"
                                onClick={() => setViewMode('list')}
                            >
                                Return to Registry
                            </Button>
                        </div>
                    )}
                </div>
            </div>
        );
    }

    return (
        <div className="p-6 space-y-10 max-w-7xl mx-auto animate-in fade-in duration-500">
            {/* Breadcrumbs */}
            <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-4 font-medium italic">
                <Link to="/" className="hover:text-foreground transition-colors uppercase tracking-widest text-[10px]">Registry</Link>
                <ChevronRight className="h-3 w-3" />
                <span className="text-foreground font-black uppercase tracking-widest text-[10px]">Model</span>
                <ChevronRight className="h-3 w-3" />
                <span className="text-foreground font-black uppercase tracking-widest text-[10px]">Entities</span>
            </nav>

            {/* Header section */}
            <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 shrink-0 border-b pb-8 border-slate-200 dark:border-slate-800">
                <div className="flex items-center gap-4">
                    <div className="p-3.5 rounded-2xl bg-primary/10 text-primary shadow-sm border border-primary/20">
                        <Grid className="h-10 w-10 shrink-0" />
                    </div>
                    <div>
                        <h1 className="text-4xl font-black tracking-tighter uppercase italic leading-none">
                            Entity <span className="text-muted-foreground/30 not-italic">Registry</span>
                        </h1>
                        <p className="text-muted-foreground mt-2 font-medium italic tabular-nums">
                            Discovered <span className="text-foreground font-bold">{tables.length}</span> active structural entities
                        </p>
                    </div>
                </div>

                {/* Criteria / Filters */}
                <form onSubmit={handleSearch} className="flex flex-wrap items-center gap-3 bg-card/40 p-2 rounded-2xl border border-slate-200 dark:border-slate-800 backdrop-blur-md">
                    <div className="relative group">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground/40 group-focus-within:text-primary transition-colors" />
                        <Input
                            placeholder="Filter systems..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="h-10 w-64 pl-9 rounded-xl border-none bg-muted/40 font-bold text-xs focus-visible:ring-1 focus-visible:ring-primary/30"
                        />
                    </div>

                    <Select value={selectedSchema} onValueChange={setSelectedSchema}>
                        <SelectTrigger className="h-10 w-48 rounded-xl border-none bg-muted/40 font-bold text-xs focus:ring-1 focus:ring-primary/30">
                            <Layers className="h-3.5 w-3.5 mr-2 text-muted-foreground/40" />
                            <SelectValue placeholder="All Blueprints" />
                        </SelectTrigger>
                        <SelectContent className="rounded-xl border-slate-200 dark:border-slate-800">
                            <SelectItem value="all" className="text-xs font-bold uppercase tracking-widest">All Blueprints</SelectItem>
                            {schemas.map(s => (
                                <SelectItem key={s.id} value={s.name} className="text-xs font-bold uppercase tracking-widest">{s.name}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>

                    <Button
                        type="submit"
                        className="h-10 px-6 rounded-xl font-black uppercase tracking-widest text-[10px] shadow-lg shadow-primary/20 hover:scale-105 active:scale-95 transition-all"
                    >
                        Scan Registry
                    </Button>
                </form>
            </header>

            {/* List View */}
            <div className="space-y-6">
                <Card className="rounded-[40px] border-slate-200 dark:border-slate-800 bg-card/60 backdrop-blur-xl shadow-2xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full -mr-32 -mt-32 blur-[80px]" />
                    <CardHeader className="p-8 border-b border-slate-200 dark:border-slate-800">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <Activity className="h-4 w-4 text-primary" />
                                <CardTitle className="text-xs font-black uppercase tracking-[0.3em] text-muted-foreground/60 italic">Identity Matrix</CardTitle>
                            </div>
                            <Badge variant="outline" className="px-4 py-1.5 rounded-full bg-emerald-500/10 text-emerald-500 border-emerald-500/20 font-black text-[9px] uppercase tracking-widest">
                                Automated Extraction
                            </Badge>
                        </div>
                    </CardHeader>
                    <CardContent className="p-0">
                        {isLoading ? (
                            <div className="p-12 space-y-4">
                                {[1, 2, 3, 4, 5].map(i => (
                                    <Skeleton key={i} className="h-16 w-full rounded-2xl" />
                                ))}
                            </div>
                        ) : tables.length > 0 ? (
                            <Table>
                                <TableHeader>
                                    <TableRow className="hover:bg-transparent border-slate-200 dark:border-slate-800">
                                        <TableHead className="px-8 font-black uppercase tracking-widest text-[9px] text-muted-foreground/40 h-14">Entity Identifier</TableHead>
                                        <TableHead className="font-black uppercase tracking-widest text-[9px] text-muted-foreground/40">Blueprint Context</TableHead>
                                        <TableHead className="font-black uppercase tracking-widest text-[9px] text-muted-foreground/40">Class</TableHead>
                                        <TableHead className="font-black uppercase tracking-widest text-[9px] text-muted-foreground/40 text-center">Depth</TableHead>
                                        <TableHead className="text-right px-8 font-black uppercase tracking-widest text-[9px] text-muted-foreground/40">Operations</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {tables.map((table) => (
                                        <TableRow key={`${table.schemaName}-${table.name}`} className="group hover:bg-primary/5 transition-colors border-slate-100 dark:border-slate-900">
                                            <TableCell className="px-8 py-5">
                                                <div className="flex items-center gap-3">
                                                    <div className="flex flex-col gap-1 flex-1">
                                                        <span className="font-black uppercase tracking-tight text-foreground/90 group-hover:text-primary transition-colors">{table.name}</span>
                                                        <span className="text-[10px] text-muted-foreground/50 italic line-clamp-1 group-hover:text-muted-foreground/70">{table.description || 'No descriptive metadata synced'}</span>
                                                    </div>
                                                    <Link 
                                                        to={`/scratchpad/test/erd1?table=${table.name}&schema=${table.schemaName}`}
                                                        className="p-2 rounded-lg bg-primary/5 text-primary opacity-0 group-hover:opacity-100 hover:bg-primary/20 transition-all shadow-sm"
                                                        title="View Focused ERD"
                                                    >
                                                        <Network className="h-4 w-4" />
                                                    </Link>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant="outline" className="rounded-lg bg-muted/40 border-none font-bold uppercase text-[9px] px-2.5 py-1 text-muted-foreground/70 group-hover:bg-primary/10 group-hover:text-primary transition-all">
                                                    {table.schemaName}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-2">
                                                    <div className={cn(
                                                        "w-1.5 h-1.5 rounded-full animate-pulse",
                                                        table.type === 'TABLE' ? 'bg-emerald-500' : 'bg-primary'
                                                    )} />
                                                    <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">{table.type || 'ENTITY'}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-center">
                                                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                                                    <Columns className="h-3 w-3 text-muted-foreground/40" />
                                                    <span className="text-[10px] font-black tabular-nums">{table.columnCount}δ</span>
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-right px-8">
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => handleFocusTable(table.name, table.schemaName)}
                                                    className="h-9 px-4 rounded-xl font-black uppercase text-[9px] tracking-widest gap-2 bg-muted/20 hover:bg-primary/10 hover:text-primary transition-all"
                                                >
                                                    Map Identity
                                                    <ChevronRight className="h-3 w-3 opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all" />
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        ) : (
                            <div className="p-20 text-center space-y-6">
                                <div className="w-16 h-16 rounded-full bg-muted/30 flex items-center justify-center mx-auto">
                                    <Filter className="h-8 w-8 text-muted-foreground/20" />
                                </div>
                                <div className="space-y-2">
                                    <h3 className="text-xl font-black uppercase italic">Registry empty</h3>
                                    <p className="text-sm text-muted-foreground/60 italic max-w-xs mx-auto">Try initializing a new ingestion protocol to populate the matrix.</p>
                                </div>
                                <Button
                                    variant="outline"
                                    onClick={() => { setSearchTerm(''); setSelectedSchema('all'); }}
                                    className="rounded-xl font-black uppercase text-[9px] tracking-widest px-8"
                                >
                                    Reset Matrix Scan
                                </Button>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Global Metrics Footer */}
                <footer className="pt-12 flex flex-col md:flex-row items-center justify-between gap-8 border-t border-slate-200 dark:border-slate-800 animate-in fade-in duration-1000">
                    <div className="flex items-center gap-6">
                        <div className="flex items-center gap-3 text-[10px] text-muted-foreground/30 font-black uppercase tracking-[0.5em]">
                            <Activity className="h-3 w-3 text-emerald-500/40 shrink-0" />
                            Entity Core v4.0.1
                        </div>
                        <Separator orientation="vertical" className="h-4 opacity-10" />
                        <div className="flex items-center gap-3 text-[10px] text-muted-foreground/30 font-black uppercase tracking-[0.5em]">
                            <Database className="h-3 w-3 text-blue-500/40 shrink-0" />
                            Nodes: {tables.length}
                        </div>
                    </div>

                    <div className="flex items-center gap-6 opacity-20 grayscale hover:grayscale-0 hover:opacity-100 transition-all duration-700">
                        <TableIcon className="h-4 w-4" />
                        <Layers className="h-4 w-4" />
                        <Activity className="h-4 w-4" />
                    </div>
                </footer>
            </div>
        </div>
    );
};

export default Entities;
