import React, { useState, useEffect } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import {
    Database,
    Grid,
    Pencil,
    ChevronRight,
    Filter,
    Layers,
    Activity,
    Layout,
    Columns,
    FileText,
    Table as TableIcon,
    Link as LinkIcon,
    Shield,
    Box as BoxIcon
} from 'lucide-react';
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion";
import {
    Card,
    CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
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
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from '@/lib/utils';

interface Column {
    name: string;
    type: string;
    description?: string;
}

interface TableDetail {
    name: string;
    type: string;
    description?: string;
    columns: Column[];
}

interface Collection {
    id: string;
    title: string;
    emoji: string;
    description: string;
    tables: string[];
}

interface SchemaStats {
    tableDetail?: TableDetail[];
}

interface SchemaModule {
    name: string;
    collections?: Collection[];
    schemaStats?: SchemaStats;
}

interface BlueprintSchema {
    id: number;
    name: string;
    desc: string;
    createdAt: string;
    updatedAt: string;
}


const Schema: React.FC = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const detailsPath = searchParams.get('details');
    const [schemas, setSchemas] = useState<SchemaModule[]>([]);
    const [blueprintSchemas, setBlueprintSchemas] = useState<BlueprintSchema[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedCollectionId, setSelectedCollectionId] = useState<string | null>(null);


    useEffect(() => {
        const fetchAll = async () => {
            try {
                const [registryRes, blueprintRes] = await Promise.all([
                    fetch('/api/site/schemas'),
                    fetch('/api/blueprint/schemas')
                ]);
                const registryData = await registryRes.json();
                const blueprintData = await blueprintRes.json();

                if (registryRes.ok && Array.isArray(registryData)) {
                    setSchemas(registryData);
                }

                if (blueprintRes.ok && Array.isArray(blueprintData)) {
                    setBlueprintSchemas(blueprintData);
                }
            } catch (error) {
                console.error('Failed to fetch schemas:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchAll();
    }, []);

    const selectedModule = schemas.find((s) => {
        if (!detailsPath) return false;
        const name = detailsPath.split('/').pop();
        return s.name === name;
    });

    const activeCollection = selectedModule?.collections?.find((c) => c.id === selectedCollectionId);

    const filteredTables = selectedModule?.schemaStats?.tableDetail?.filter((table) => {
        if (!selectedCollectionId) return true;
        return activeCollection?.tables?.includes(table.name);
    }) || [];

    if (detailsPath) {
        if (loading) return (
            <div className="p-6 space-y-10 max-w-7xl mx-auto animate-in fade-in duration-500">
                <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-4 font-medium italic">
                    <Link to="/" className="hover:text-foreground transition-colors uppercase tracking-widest text-[10px]">Registry</Link>
                    <ChevronRight className="h-3 w-3" />
                    <Skeleton className="h-4 w-24" />
                </nav>
                <div className="space-y-6">
                    <div className="flex items-center gap-4">
                        <Skeleton className="h-20 w-20 rounded-2xl" />
                        <div className="space-y-2">
                            <Skeleton className="h-10 w-64" />
                            <Skeleton className="h-4 w-48" />
                        </div>
                    </div>
                    <Skeleton className="h-[400px] w-full rounded-2xl" />
                </div>
            </div>
        );

        return (
            <div className="p-6 space-y-10 max-w-7xl mx-auto animate-in fade-in duration-500">
                <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-4 font-medium italic">
                    <Link to="/" className="hover:text-foreground transition-colors uppercase tracking-widest text-[10px]">Registry</Link>
                    <ChevronRight className="h-3 w-3" />
                    <Link to="/schema" className="hover:text-foreground transition-colors uppercase tracking-widest text-[10px]">Schema</Link>
                    <ChevronRight className="h-3 w-3" />
                    <span className="text-foreground font-black uppercase tracking-widest text-[10px] italic">
                        {detailsPath.split('/').pop()}
                    </span>
                </nav>

                <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 shrink-0 border-b pb-8 border-slate-200 dark:border-slate-800">
                    <div className="flex items-center gap-4">
                        <div className="p-3.5 rounded-2xl bg-primary/10 text-primary shadow-sm border border-primary/20">
                            <Layers className="h-10 w-10 shrink-0" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-black tracking-tight uppercase italic flex items-center gap-3">
                                {detailsPath.split('/').pop()} <span className="text-muted-foreground/40 not-italic">Data Model</span>
                            </h1>
                            <p className="text-muted-foreground mt-1 font-medium italic tabular-nums">Namespace: <span className="text-foreground/80 font-bold">{detailsPath}</span></p>
                        </div>
                    </div>
                </header>

                {/* Collections Filter */}
                {selectedModule?.collections && selectedModule.collections.length > 0 && (
                    <div className="space-y-4 animate-in slide-in-from-left-4 duration-700">
                        <div className="flex items-center gap-3">
                            <Filter className="h-3.5 w-3.5 text-muted-foreground/40" />
                            <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground/60">Domain Verticals</h2>
                        </div>
                        <div className="flex flex-wrap gap-3">
                            <Button
                                variant={selectedCollectionId === null ? "default" : "outline"}
                                className={cn(
                                    "h-10 px-4 rounded-xl font-black uppercase tracking-widest text-[9px] gap-2 transition-all active:scale-95",
                                    selectedCollectionId === null ? "shadow-lg shadow-primary/20" : "bg-card/40 border-slate-200 dark:border-slate-800"
                                )}
                                onClick={() => setSelectedCollectionId(null)}
                            >
                                <Layout className="h-3.5 w-3.5" />
                                All Entities
                            </Button>
                            {selectedModule?.collections?.map((c) => (
                                <Button
                                    key={c.id}
                                    variant={selectedCollectionId === c.id ? "default" : "outline"}
                                    className={cn(
                                        "h-10 px-4 rounded-xl font-black uppercase tracking-widest text-[9px] gap-2 transition-all active:scale-95",
                                        selectedCollectionId === c.id ? "shadow-lg shadow-primary/20" : "bg-card/40 border-slate-200 dark:border-slate-800"
                                    )}
                                    onClick={() => setSelectedCollectionId(c.id)}
                                >
                                    <span className="text-xs shrink-0">{c.emoji}</span>
                                    {c.title}
                                </Button>
                            ))}
                        </div>
                        {activeCollection && (
                            <p className="text-xs font-bold text-muted-foreground/60 italic border-l-2 border-primary/30 pl-4 py-1 animate-in fade-in slide-in-from-top-2">
                                {activeCollection.description}
                            </p>
                        )}
                    </div>
                )}

                <div className="space-y-6">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <Grid className="h-4 w-4 text-muted-foreground/40" />
                            <h3 className="text-xl font-black tracking-tight uppercase italic">
                                {selectedCollectionId ? activeCollection?.title : 'Model Entities'} <span className="text-muted-foreground/30 not-italic tabular-nums">({filteredTables.length})</span>
                            </h3>
                        </div>
                    </div>

                    <div className="space-y-4 animate-in slide-in-from-bottom-6 duration-1000">
                        {filteredTables.length > 0 ? (
                            <Accordion type="single" collapsible className="space-y-4">
                                {filteredTables.map((table) => (
                                    <AccordionItem
                                        key={table.name}
                                        value={table.name}
                                        className="border border-slate-200 dark:border-slate-800 bg-card/60 backdrop-blur-sm shadow-sm hover:shadow-md transition-all rounded-[1.5rem] overflow-hidden group border-b-none"
                                    >
                                        <div className="flex items-center justify-between pr-4 bg-muted/20 group-data-[state=open]:bg-muted/40 transition-colors">
                                            <AccordionTrigger className="flex-1 hover:no-underline px-6 py-5 gap-4 h-full">
                                                <div className="flex items-center gap-4 text-left">
                                                    <div className="p-2.5 rounded-[1rem] bg-card border border-slate-200 dark:border-slate-800 text-muted-foreground group-hover:text-primary transition-colors group-hover:scale-110 duration-300">
                                                        <TableIcon className="h-4 w-4 shrink-0" />
                                                    </div>
                                                    <div className="space-y-1">
                                                        <div className="font-black text-foreground uppercase tracking-tight italic group-hover:text-primary transition-colors flex items-center gap-2">
                                                            {table.name}
                                                            <Badge variant="outline" className="text-[8px] font-black uppercase tracking-widest bg-muted/60 border-none px-2 shadow-none">Schema Entity</Badge>
                                                        </div>
                                                        <div className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/50 tabular-nums uppercase">
                                                            {table.columns?.length || 0} Attributes Orchestrated
                                                        </div>
                                                    </div>
                                                </div>
                                            </AccordionTrigger>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                className="h-9 px-4 rounded-[1rem] bg-card border-slate-200 dark:border-slate-800 shadow-sm font-black text-[9px] uppercase tracking-widest text-muted-foreground/80 hover:text-primary gap-2 transition-all active:scale-95 z-30 relative"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    navigate(`/schema/edit?module=${selectedModule?.name}&table=${table.name}`);
                                                }}
                                            >
                                                <Pencil className="h-3 w-3" />
                                                Mutation
                                            </Button>
                                        </div>
                                        <AccordionContent className="p-0 border-t border-slate-200 dark:border-slate-800">
                                            <div className="p-8 bg-card/40 space-y-8 animate-in fade-in slide-in-from-top-4 duration-500">
                                                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                                                    <div className="space-y-1.5 p-5 rounded-2xl bg-muted/30 border border-slate-100 dark:border-slate-900 shadow-inner">
                                                        <div className="text-[9px] font-black uppercase tracking-[0.3em] text-muted-foreground/40 flex items-center gap-2 mb-2">
                                                            <BoxIcon className="h-3 w-3" />
                                                            Entity Classification
                                                        </div>
                                                        <div className="text-sm font-black uppercase italic tracking-tight">{table.type || 'Standard RELATIONAL'}</div>
                                                    </div>
                                                    {table.description && (
                                                        <div className="md:col-span-2 space-y-1.5 p-5 rounded-2xl bg-muted/30 border border-slate-100 dark:border-slate-900 shadow-inner">
                                                            <div className="text-[9px] font-black uppercase tracking-[0.3em] text-muted-foreground/40 flex items-center gap-2 mb-2">
                                                                <FileText className="h-3 w-3" />
                                                                Functional Description
                                                            </div>
                                                            <div className="text-sm font-bold text-muted-foreground italic leading-relaxed">{table.description}</div>
                                                        </div>
                                                    )}
                                                </div>

                                                <div className="space-y-4">
                                                    <div className="flex items-center gap-3">
                                                        <Columns className="h-4 w-4 text-muted-foreground/30" />
                                                        <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground">Attribute Manifest ({table.columns?.length || 0})</h4>
                                                    </div>

                                                    <div className="rounded-[1.5rem] border border-slate-200 dark:border-slate-800 overflow-hidden shadow-2xl shadow-slate-200/50 dark:shadow-none">
                                                        <Table>
                                                            <TableHeader className="bg-muted/50">
                                                                <TableRow className="hover:bg-transparent h-12">
                                                                    <TableHead className="px-6 font-black uppercase text-[9px] tracking-[0.3em] text-muted-foreground/60 w-1/3">Key Identity</TableHead>
                                                                    <TableHead className="px-6 font-black uppercase text-[9px] tracking-[0.3em] text-muted-foreground/60 w-1/4">Data Primitive</TableHead>
                                                                    <TableHead className="px-6 font-black uppercase text-[9px] tracking-[0.3em] text-muted-foreground/60">Semantics / Spec</TableHead>
                                                                </TableRow>
                                                            </TableHeader>
                                                            <TableBody>
                                                                {table.columns?.map((col: any) => (
                                                                    <TableRow key={col.name} className="hover:bg-muted/30 transition-colors h-16 border-slate-100 dark:border-slate-800/60 uppercase italic">
                                                                        <TableCell className="px-6">
                                                                            <div className="font-black text-foreground tracking-tight flex items-center gap-2">
                                                                                <div className="h-1 w-1 rounded-full bg-primary/40" />
                                                                                {col.name}
                                                                            </div>
                                                                        </TableCell>
                                                                        <TableCell className="px-6">
                                                                            <Badge variant="outline" className="font-mono text-[9px] font-black uppercase tracking-widest bg-foreground/5 dark:bg-foreground/10 border-none px-3 py-1 text-muted-foreground/80">
                                                                                {col.type}
                                                                            </Badge>
                                                                        </TableCell>
                                                                        <TableCell className="px-6">
                                                                            <span className="text-[10px] font-bold text-muted-foreground/60 italic lowercase first-letter:uppercase leading-snug">
                                                                                {col.description || 'No specialized metadata provided.'}
                                                                            </span>
                                                                        </TableCell>
                                                                    </TableRow>
                                                                ))}
                                                            </TableBody>
                                                        </Table>
                                                    </div>
                                                </div>
                                            </div>
                                        </AccordionContent>
                                    </AccordionItem>
                                ))}
                            </Accordion>
                        ) : (
                            <Card className="border-4 border-dashed border-slate-200 dark:border-slate-800 bg-muted/10 rounded-[2.5rem] shadow-none overflow-hidden">
                                <CardContent className="py-32 flex flex-col items-center gap-6 text-center">
                                    <div className="p-8 rounded-[2rem] bg-card border border-slate-200 dark:border-slate-800 text-muted-foreground shadow-sm">
                                        <Shield className="h-16 w-16 opacity-10" />
                                    </div>
                                    <div className="space-y-2">
                                        <h3 className="text-xl font-black uppercase tracking-tight italic text-muted-foreground/40">Zero Entity Propagation</h3>
                                        <p className="text-xs font-bold text-muted-foreground/30 uppercase tracking-widest max-w-xs mx-auto leading-relaxed italic">
                                            No table definitions found in this module {selectedCollectionId ? 'for this segment' : ''}.
                                        </p>
                                    </div>
                                    <Button variant="outline" className="mt-4 font-black uppercase tracking-widest text-[9px] rounded-xl border-none bg-muted/40 text-muted-foreground/60 hover:bg-muted/60 px-8">Sync Registry</Button>
                                </CardContent>
                            </Card>
                        )}
                    </div>
                </div>

                <footer className="pt-12 flex items-center justify-between gap-6 border-t border-slate-200 dark:border-slate-800 animate-in fade-in duration-1000">
                    <div className="flex items-center gap-4 text-[10px] text-muted-foreground/30 font-black uppercase tracking-[0.5em]">
                        <Activity className="h-3 w-3 text-emerald-500/40 shrink-0" />
                        Indexing Core v2.4-active
                    </div>
                    <div className="flex items-center gap-4 opacity-10 grayscale hover:grayscale-0 hover:opacity-100 transition-all duration-700">
                        <Database className="h-4 w-4" />
                        <Separator orientation="vertical" className="h-4" />
                        <LinkIcon className="h-4 w-4" />
                    </div>
                </footer>
            </div>
        );
    }

    return (
        <div className="p-6 space-y-10 max-w-7xl mx-auto animate-in fade-in duration-500">
            <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-4 font-medium italic">
                <Link to="/" className="hover:text-foreground transition-colors uppercase tracking-widest text-[10px]">Registry</Link>
                <ChevronRight className="h-3 w-3" />
                <span className="text-foreground font-black uppercase tracking-widest text-[10px]">Schema</span>
            </nav>

            <header className="flex items-center gap-6">
                <div className="p-4 rounded-2xl bg-primary/10 text-primary shadow-sm border border-primary/20">
                    <Database className="h-10 w-10 shrink-0" />
                </div>
                <h1 className="text-4xl font-black tracking-tighter uppercase italic leading-none">
                    Data Model <span className="text-muted-foreground/30 not-italic">Registry</span>
                </h1>
            </header>

            {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[1, 2, 3].map((i) => (
                        <Card key={i} className="rounded-3xl border-slate-200 dark:border-slate-800 bg-card/60">
                            <CardContent className="p-8 space-y-4">
                                <Skeleton className="h-8 w-3/4" />
                                <Skeleton className="h-16 w-full" />
                                <div className="flex justify-between">
                                    <Skeleton className="h-4 w-20" />
                                    <Skeleton className="h-4 w-20" />
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            ) : blueprintSchemas.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {blueprintSchemas.map((s) => (
                        <Card key={s.id} className="rounded-3xl border-slate-200 dark:border-slate-800 bg-card/60 backdrop-blur-sm shadow-xl hover:shadow-2xl transition-all duration-500 group hover:-translate-y-1">
                            <CardContent className="p-8 space-y-6">
                                <div className="flex items-center gap-4">
                                    <div className="p-3 rounded-2xl bg-primary/10 text-primary group-hover:scale-110 transition-transform duration-500">
                                        <Database className="h-5 w-5" />
                                    </div>
                                    <h2 className="text-xl font-black uppercase tracking-tight italic">{s.name}</h2>
                                </div>

                                <p className="text-sm font-bold text-muted-foreground/60 italic leading-relaxed min-h-[3rem]">
                                    {s.desc || "No comprehensive description provided for this blueprint schema definition."}
                                </p>

                                <div className="space-y-3">
                                    <Separator className="bg-slate-200/50 dark:bg-slate-800/50" />
                                    <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest text-muted-foreground/40">
                                        <div className="flex flex-col gap-1">
                                            <span className="text-[8px] opacity-60">Created</span>
                                            <span className="tabular-nums italic">{new Date(s.createdAt).toLocaleDateString()}</span>
                                        </div>
                                        <div className="flex flex-col items-end gap-1">
                                            <span className="text-[8px] opacity-60">Updated</span>
                                            <span className="tabular-nums italic">{new Date(s.updatedAt).toLocaleDateString()}</span>
                                        </div>
                                    </div>
                                </div>

                                <Button
                                    variant="outline"
                                    className="w-full rounded-2xl font-black uppercase text-[10px] tracking-[0.2em] h-11 border-slate-200 dark:border-slate-800 hover:bg-primary hover:text-primary-foreground hover:border-primary transition-all duration-300"
                                    onClick={() => navigate(`/schema?details=${s.name}`)}
                                >
                                    Access Blueprint
                                </Button>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            ) : (
                <Card className="border-slate-200 dark:border-slate-800 bg-card shadow-2xl shadow-slate-200/50 dark:shadow-none rounded-[3rem] overflow-hidden">
                    <CardContent className="py-40 flex flex-col items-center gap-10 text-center">
                        <div className="relative group">
                            <div className="absolute inset-0 bg-primary/10 blur-[80px] rounded-full group-hover:bg-primary/20 transition-all duration-700" />
                            <div className="relative p-12 rounded-[2.5rem] bg-card border border-slate-200 dark:border-slate-800 text-muted-foreground/20 shadow-sm group-hover:scale-110 group-hover:rotate-12 transition-all duration-1000">
                                <Layers className="h-24 w-24" />
                            </div>
                        </div>
                        <div className="space-y-4 max-w-2xl animate-in zoom-in-95 duration-700">
                            <h2 className="text-3xl font-black uppercase tracking-tight italic gradient-text">Domain Discovery <span className="text-muted-foreground/20 not-italic">Required</span></h2>
                            <p className="text-sm font-bold text-muted-foreground italic leading-relaxed tracking-tight group-hover:text-foreground transition-colors px-12 opacity-40 group-hover:opacity-100">
                                No schemas found in blueprint database. Populate your workspace to begin mapping domain verticals.
                            </p>
                        </div>
                    </CardContent>
                </Card>
            )}

            <footer className="pt-2 flex items-center justify-center gap-4 text-[9px] text-muted-foreground/20 font-black uppercase tracking-[0.8em]">
                <span className="h-px w-32 bg-slate-100 dark:bg-slate-800" />
                ORCHESTRATOR INFRASTRUCTURE
                <span className="h-px w-32 bg-slate-100 dark:bg-slate-800" />
            </footer>
        </div>
    );
};

export default Schema;
