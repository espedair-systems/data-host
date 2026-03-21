import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
    Table as TableIcon,
    Search,
    Filter,
    ChevronRight,
    Database,
    Layers,
    ExternalLink,
    Activity,
    Grid,
    Columns
} from 'lucide-react';
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
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

const TablesPage: React.FC = () => {
    const navigate = useNavigate();
    const [tables, setTables] = useState<BlueprintTableSummary[]>([]);
    const [schemas, setSchemas] = useState<string[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedSchema, setSelectedSchema] = useState<string>('all');

    const fetchData = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            if (searchTerm) params.append('search', searchTerm);
            if (selectedSchema !== 'all') params.append('schemaName', selectedSchema);

            const [tablesRes, schemasRes] = await Promise.all([
                fetch(`/api/blueprint/tables?${params.toString()}`),
                fetch('/api/blueprint/schemas')
            ]);

            if (tablesRes.ok) {
                const tablesData = await tablesRes.json();
                setTables(tablesData);
            }

            if (schemasRes.ok) {
                const schemasData = await schemasRes.json();
                setSchemas(schemasData.map((s: any) => s.name));
            }
        } catch (error) {
            console.error('Failed to fetch table data:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [selectedSchema]);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        fetchData();
    };

    return (
        <div className="p-6 space-y-10 max-w-7xl mx-auto animate-in fade-in duration-500">
            {/* Breadcrumbs */}
            <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-4 font-medium italic">
                <Link to="/" className="hover:text-foreground transition-colors uppercase tracking-widest text-[10px]">Registry</Link>
                <ChevronRight className="h-3 w-3" />
                <span className="text-foreground font-black uppercase tracking-widest text-[10px]">Curation</span>
                <ChevronRight className="h-3 w-3" />
                <span className="text-foreground font-black uppercase tracking-widest text-[10px]">Tables</span>
            </nav>

            {/* Header section */}
            <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 shrink-0 border-b pb-8 border-slate-200 dark:border-slate-800">
                <div className="flex items-center gap-4">
                    <div className="p-3.5 rounded-2xl bg-primary/10 text-primary shadow-sm border border-primary/20">
                        <TableIcon className="h-10 w-10 shrink-0" />
                    </div>
                    <div>
                        <h1 className="text-4xl font-black tracking-tighter uppercase italic leading-none">
                            Object <span className="text-muted-foreground/30 not-italic">Inventory</span>
                        </h1>
                        <p className="text-muted-foreground mt-2 font-medium italic tabular-nums">
                            Curating <span className="text-foreground font-bold">{tables.length}</span> active structural definitions
                        </p>
                    </div>
                </div>

                {/* Criteria / Filters */}
                <form onSubmit={handleSearch} className="flex flex-wrap items-center gap-3 bg-card/40 p-2 rounded-2xl border border-slate-200 dark:border-slate-800 backdrop-blur-md">
                    <div className="relative group">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground/40 group-focus-within:text-primary transition-colors" />
                        <Input
                            placeholder="Filter by name..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="h-10 w-64 pl-9 rounded-xl border-none bg-muted/40 font-bold text-xs focus-visible:ring-1 focus-visible:ring-primary/30"
                        />
                    </div>

                    <Select value={selectedSchema} onValueChange={setSelectedSchema}>
                        <SelectTrigger className="h-10 w-48 rounded-xl border-none bg-muted/40 font-bold text-xs focus:ring-1 focus:ring-primary/30">
                            <Layers className="h-3.5 w-3.5 mr-2 text-muted-foreground/40" />
                            <SelectValue placeholder="All Schemas" />
                        </SelectTrigger>
                        <SelectContent className="rounded-xl border-slate-200 dark:border-slate-800">
                            <SelectItem value="all" className="text-xs font-bold uppercase tracking-widest">All Blueprints</SelectItem>
                            {schemas.map(s => (
                                <SelectItem key={s} value={s} className="text-xs font-bold uppercase tracking-widest">{s}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>

                    <Button
                        type="submit"
                        className="h-10 px-6 rounded-xl font-black uppercase tracking-widest text-[10px] shadow-lg shadow-primary/20 hover:scale-105 active:scale-95 transition-all"
                    >
                        Apply Filters
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
                                <Grid className="h-4 w-4 text-primary" />
                                <CardTitle className="text-xs font-black uppercase tracking-[0.3em] text-muted-foreground/60 italic">Structural Matrix</CardTitle>
                            </div>
                            <Badge variant="outline" className="px-4 py-1.5 rounded-full bg-emerald-500/10 text-emerald-500 border-emerald-500/20 font-black text-[9px] uppercase tracking-widest">
                                Live Registry
                            </Badge>
                        </div>
                    </CardHeader>
                    <CardContent className="p-0">
                        {loading ? (
                            <div className="p-12 space-y-4">
                                {[1, 2, 3, 4, 5].map(i => (
                                    <Skeleton key={i} className="h-16 w-full rounded-2xl" />
                                ))}
                            </div>
                        ) : tables.length > 0 ? (
                            <Table>
                                <TableHeader>
                                    <TableRow className="hover:bg-transparent border-slate-200 dark:border-slate-800">
                                        <TableHead className="px-8 font-black uppercase tracking-widest text-[9px] text-muted-foreground/40 h-14">Table Identifier</TableHead>
                                        <TableHead className="font-black uppercase tracking-widest text-[9px] text-muted-foreground/40">Parent Schema</TableHead>
                                        <TableHead className="font-black uppercase tracking-widest text-[9px] text-muted-foreground/40">Object Type</TableHead>
                                        <TableHead className="font-black uppercase tracking-widest text-[9px] text-muted-foreground/40 text-center">Depth</TableHead>
                                        <TableHead className="text-right px-8 font-black uppercase tracking-widest text-[9px] text-muted-foreground/40">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {tables.map((table) => (
                                        <TableRow key={`${table.schemaName}-${table.name}`} className="group hover:bg-primary/5 transition-colors border-slate-100 dark:border-slate-900">
                                            <TableCell className="px-8 py-5">
                                                <div className="flex flex-col gap-1">
                                                    <span className="font-black uppercase tracking-tight text-foreground/90 group-hover:text-primary transition-colors">{table.name}</span>
                                                    <span className="text-[10px] text-muted-foreground/50 italic line-clamp-1 group-hover:text-muted-foreground/70">{table.description || 'No description provided'}</span>
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
                                                        table.type === 'TABLE' ? 'bg-emerald-500' : 'bg-amber-500'
                                                    )} />
                                                    <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">{table.type}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-center">
                                                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                                                    <Columns className="h-3 w-3 text-muted-foreground/40" />
                                                    <span className="text-[10px] font-black tabular-nums">{table.columnCount}c</span>
                                                </div>
                                            </TableCell>
                                             <TableCell className="text-right px-8 flex justify-end gap-2">
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => navigate(`/curate/tables/${table.schemaName}.${table.name}/data`)}
                                                    className="h-9 px-4 rounded-xl font-black uppercase text-[9px] tracking-widest gap-2 bg-primary/10 text-primary hover:bg-primary/20 transition-all"
                                                >
                                                    View Data
                                                    <Grid className="h-3 w-3" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => navigate(`/curate/schema?details=${table.schemaName}`)}
                                                    className="h-9 px-4 rounded-xl font-black uppercase text-[9px] tracking-widest gap-2 bg-muted/20 hover:bg-primary/10 hover:text-primary transition-all"
                                                >
                                                    Access Schema
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
                                    <h3 className="text-xl font-black uppercase italic">No objects found</h3>
                                    <p className="text-sm text-muted-foreground/60 italic max-w-xs mx-auto">Try adjusting your criteria to locate the desired table definitions.</p>
                                </div>
                                <Button
                                    variant="outline"
                                    onClick={() => { setSearchTerm(''); setSelectedSchema('all'); }}
                                    className="rounded-xl font-black uppercase text-[9px] tracking-widest px-8"
                                >
                                    Clear Matrix Filter
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
                            Inventory Core v2.4-active
                        </div>
                        <Separator orientation="vertical" className="h-4 opacity-10" />
                        <div className="flex items-center gap-3 text-[10px] text-muted-foreground/30 font-black uppercase tracking-[0.5em]">
                            <Database className="h-3 w-3 text-blue-500/40 shrink-0" />
                            Region: Local-DB-01
                        </div>
                    </div>

                    <div className="flex items-center gap-6 opacity-20 grayscale hover:grayscale-0 hover:opacity-100 transition-all duration-700">
                        <TableIcon className="h-4 w-4" />
                        <Layers className="h-4 w-4" />
                        <ExternalLink className="h-4 w-4" />
                    </div>
                </footer>
            </div>
        </div>
    );
};

export default TablesPage;
