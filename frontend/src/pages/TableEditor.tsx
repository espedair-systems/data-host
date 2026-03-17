import React, { useState, useEffect } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import {
    Save,
    ArrowLeft,
    Trash2,
    Plus,
    ChevronRight,
    Columns,
    Layers,
    Box as BoxIcon,
    Settings2,
    DatabaseZap,
    History,
    AlertCircle,
    Loader2,
    FileText
} from 'lucide-react';
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from 'sonner';

interface ColumnDefinition {
    name: string;
    type: string;
    description?: string;
}

interface TableDefinition {
    name: string;
    type: string;
    description?: string;
    columns: ColumnDefinition[];
}

interface SchemaModule {
    name: string;
    schemaStats?: {
        tableDetail?: TableDefinition[];
    };
}

const TableEditor: React.FC = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const moduleName = searchParams.get('module');
    const tableName = searchParams.get('table');

    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [editedTable, setEditedTable] = useState<TableDefinition | null>(null);

    useEffect(() => {
        if (moduleName) {
            setLoading(true);
            fetch('/api/site/schemas')
                .then(res => res.json())
                .then((data: SchemaModule[]) => {
                    const module = data.find((s) => s.name === moduleName);
                    if (module) {
                        const table = module?.schemaStats?.tableDetail?.find((t) => t.name === tableName);
                        if (table) {
                            setEditedTable(JSON.parse(JSON.stringify(table))); // Deep clone for editing
                        }
                    }
                    setLoading(false);
                })
                .catch(() => setLoading(false));
        }
    }, [moduleName, tableName]);

    const handleSave = async () => {
        if (!moduleName || !tableName || !editedTable) return;

        setSaving(true);
        try {
            const response = await fetch(`/api/site/schemas/${moduleName}/table`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    tableName: editedTable.name,
                    type: editedTable.type,
                    description: editedTable.description,
                    columns: editedTable.columns
                })
            });

            if (response.ok) {
                toast.success("Synchronized", { description: "Table metadata commit successful." });
                navigate(-1); // Go back on success
            } else {
                toast.error("Commit Failed", { description: "Failed to persist schema alterations." });
                console.error('Failed to save table');
            }
        } catch (error) {
            toast.error("Critical Failure", { description: "An exception occurred during network propagation." });
            console.error('Error saving table:', error);
        } finally {
            setSaving(false);
        }
    };

    const updateColumn = (index: number, field: string, value: string) => {
        if (!editedTable) return;
        const newCols = [...editedTable.columns];
        newCols[index] = { ...newCols[index], [field]: value };
        setEditedTable({ ...editedTable, columns: newCols });
    };

    if (loading) return (
        <div className="p-6 space-y-10 max-w-7xl mx-auto animate-in fade-in duration-500 font-sans">
            <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-4 font-medium italic">
                <Link to="/" className="hover:text-foreground transition-colors uppercase tracking-widest text-[10px]">Registry</Link>
                <ChevronRight className="h-3 w-3" />
                <Skeleton className="h-4 w-24" />
            </nav>
            <div className="flex flex-col gap-8">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Skeleton className="h-16 w-16 rounded-2xl" />
                        <div className="space-y-2">
                            <Skeleton className="h-8 w-48" />
                            <Skeleton className="h-4 w-32" />
                        </div>
                    </div>
                    <div className="flex gap-4">
                        <Skeleton className="h-10 w-24" />
                        <Skeleton className="h-10 w-32" />
                    </div>
                </div>
                <Skeleton className="h-[200px] w-full rounded-3xl" />
                <Skeleton className="h-[400px] w-full rounded-3xl" />
            </div>
        </div>
    );

    if (!editedTable) return (
        <div className="p-6 h-[calc(100vh-100px)] flex flex-col items-center justify-center text-center space-y-6">
            <div className="p-8 rounded-[2.5rem] bg-rose-500/10 text-rose-500 border border-rose-500/20 shadow-xl">
                <AlertCircle className="h-16 w-16" />
            </div>
            <div className="space-y-2">
                <h2 className="text-3xl font-black uppercase tracking-tighter italic">Entity Not Found</h2>
                <p className="text-muted-foreground font-medium italic">The requested table definition does not exist in the current registry index.</p>
            </div>
            <Button variant="ghost" onClick={() => navigate(-1)} className="font-black uppercase tracking-widest text-[10px] gap-2">
                <ArrowLeft className="h-3 w-3" />
                Terminate Session
            </Button>
        </div>
    );

    return (
        <div className="p-6 space-y-10 max-w-7xl mx-auto animate-in fade-in duration-700 font-sans pb-24">
            <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-4 font-medium italic">
                <Link to="/" className="hover:text-foreground transition-colors uppercase tracking-widest text-[10px]">Registry</Link>
                <ChevronRight className="h-3 w-3" />
                <Link to="/curate/schema" className="hover:text-foreground transition-colors uppercase tracking-widest text-[10px]">Schema</Link>
                <ChevronRight className="h-3 w-3" />
                <Link to={`/curate/schema?details=data/schema/${moduleName}`} className="hover:text-foreground transition-colors uppercase tracking-widest text-[10px]">{moduleName}</Link>
                <ChevronRight className="h-3 w-3" />
                <span className="text-foreground font-black uppercase tracking-widest text-[10px] italic">Edit {tableName}</span>
            </nav>

            <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 shrink-0 border-b pb-8 border-slate-200 dark:border-slate-800 animate-in slide-in-from-top-4 duration-1000">
                <div className="flex items-center gap-5">
                    <div className="p-4 rounded-2xl bg-primary/10 text-primary shadow-sm border border-primary/20 group relative overflow-hidden">
                        <div className="absolute inset-0 bg-primary/20 blur-xl opacity-0 group-hover:opacity-100 transition-opacity" />
                        <Settings2 className="h-10 w-10 relative z-10 group-hover:rotate-90 transition-transform duration-700" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-black tracking-tight uppercase italic flex items-center gap-3 leading-none">
                            Mutation <span className="text-primary not-italic italic">Workbench</span>
                        </h1>
                        <p className="text-muted-foreground mt-2 font-medium italic tracking-tight">Alteration protocol for <span className="text-foreground/80 font-black uppercase">{tableName}</span> in <span className="text-primary/70">{moduleName}</span>.</p>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    <Button variant="outline" onClick={() => navigate(-1)} className="h-11 px-6 rounded-xl font-black uppercase tracking-widest text-[9px] gap-2 hover:bg-rose-500/5 hover:text-rose-600 hover:border-rose-500/20 transition-all border-slate-200 dark:border-slate-800" disabled={saving}>
                        <ArrowLeft className="h-3.5 w-3.5" />
                        Cancel
                    </Button>
                    <Button
                        onClick={handleSave}
                        className="h-11 px-8 rounded-xl font-black uppercase tracking-widest text-[9px] gap-3 bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/25 transition-all active:scale-95 group"
                        disabled={saving}
                    >
                        {saving ? (
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        ) : (
                            <Save className="h-3.5 w-3.5 group-hover:scale-110 transition-transform" />
                        )}
                        {saving ? 'Syncing...' : 'Commit Changes'}
                    </Button>
                </div>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                <div className="lg:col-span-4 space-y-10">
                    <Card className="border-slate-200 dark:border-slate-800 bg-card/40 backdrop-blur-sm rounded-[2rem] overflow-hidden shadow-sm animate-in slide-in-from-left-4 duration-700">
                        <CardHeader className="pb-4 pt-8 px-8">
                            <div className="flex items-center gap-3">
                                <Layers className="h-4 w-4 text-primary/40" />
                                <CardTitle className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground/60">Global Metadata</CardTitle>
                            </div>
                        </CardHeader>
                        <CardContent className="px-8 pb-8 space-y-6">
                            <div className="space-y-2">
                                <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/40 ml-1">Entity Identifier</Label>
                                <Input value={editedTable.name} readOnly className="bg-muted/30 border-none font-mono text-[11px] font-bold h-11 text-muted-foreground/60 cursor-not-allowed uppercase" />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-[10px] font-black uppercase tracking-widest text-primary/60 ml-1">Structural Type</Label>
                                <Input
                                    value={editedTable.type || 'BASE TABLE'}
                                    onChange={(e) => setEditedTable({ ...editedTable, type: e.target.value })}
                                    className="bg-muted/40 border-none h-11 font-bold tracking-tight focus-visible:ring-1 focus-visible:ring-primary uppercase transition-all"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/40 ml-1">Semantic Definition</Label>
                                <Textarea
                                    className="bg-muted/40 border-none min-h-[120px] focus-visible:ring-1 focus-visible:ring-primary font-medium italic px-4 py-3 resize-none leading-relaxed transition-all"
                                    value={editedTable.description || ''}
                                    placeholder="Annotate this table's core purpose in the ecosystem..."
                                    onChange={(e) => setEditedTable({ ...editedTable, description: e.target.value })}
                                />
                            </div>
                        </CardContent>
                    </Card>

                    <div className="p-8 rounded-[2rem] bg-primary/5 border border-primary/10 space-y-6 animate-in slide-in-from-left-4 duration-1000 delay-200">
                        <div className="flex items-center gap-3 text-primary/60 uppercase italic font-black text-xs tracking-tight">
                            <History className="h-4 w-4" />
                            Workbench Integrity
                        </div>
                        <p className="text-[11px] font-bold text-muted-foreground/60 leading-relaxed italic">Alterations staged here are volatile until propagated to the central metadata registry. Ensure relational consistency before commitment.</p>
                        <Separator className="bg-primary/10" />
                        <div className="flex items-center gap-4">
                            <div className="flex flex-col">
                                <span className="text-[9px] font-black uppercase tracking-widest text-primary/40">Status</span>
                                <span className="text-xs font-black uppercase text-primary italic">Staging Mutation</span>
                            </div>
                            <div className="flex flex-col text-right ml-auto">
                                <span className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/40">Entities</span>
                                <span className="text-xs font-black italic tabular-nums">{editedTable.columns?.length || 0} Attributes</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="lg:col-span-8">
                    <div className="space-y-6 animate-in slide-in-from-bottom-6 duration-1000 delay-300">
                        <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-3">
                                <Columns className="h-5 w-5 text-primary/30" />
                                <h2 className="text-xl font-black tracking-tight uppercase italic leading-none">Attribute <span className="text-muted-foreground/30 not-italic">Matrix</span></h2>
                            </div>
                            <Button variant="outline" className="h-9 px-4 rounded-xl border-dashed border-primary/30 text-primary hover:bg-primary/5 hover:border-primary/50 font-black uppercase tracking-widest text-[9px] gap-2 transition-all">
                                <Plus className="h-3 w-3" />
                                Instantiate Attribute
                            </Button>
                        </div>

                        <div className="space-y-4">
                            {editedTable.columns?.map((col: ColumnDefinition, idx: number) => (
                                <Card key={idx} className="group border-slate-200 dark:border-slate-800 bg-card/60 backdrop-blur-sm overflow-hidden hover:shadow-lg transition-all duration-300 rounded-[1.5rem]">
                                    <CardContent className="p-0">
                                        <div className="grid grid-cols-1 md:grid-cols-12 items-center">
                                            <div className="md:col-span-3 px-6 py-6 border-b md:border-b-0 md:border-r border-slate-100 dark:border-slate-800 space-y-1 bg-muted/10 group-hover:bg-muted/20 transition-colors">
                                                <div className="flex items-center gap-2 mb-1.5 opacity-40">
                                                    <DatabaseZap className="h-3 w-3 text-primary" />
                                                    <span className="text-[8px] font-black uppercase tracking-[0.2em]">Identity</span>
                                                </div>
                                                <Input
                                                    value={col.name}
                                                    className="bg-transparent border-none p-0 h-auto font-mono text-xs font-black uppercase tracking-tight focus-visible:ring-0 focus-visible:ring-offset-0 focus:text-primary transition-colors h-7"
                                                    onChange={(e) => updateColumn(idx, 'name', e.target.value)}
                                                />
                                            </div>
                                            <div className="md:col-span-3 px-6 py-6 border-b md:border-b-0 md:border-r border-slate-100 dark:border-slate-800 space-y-1">
                                                <div className="flex items-center gap-2 mb-1.5 opacity-40 font-black">
                                                    <BoxIcon className="h-3 w-3" />
                                                    <span className="text-[8px] font-black uppercase tracking-[0.2em]">Data Class</span>
                                                </div>
                                                <Input
                                                    value={col.type}
                                                    className="bg-transparent border-none p-0 h-auto font-mono text-[11px] font-bold text-muted-foreground focus-visible:ring-0 focus-visible:ring-offset-0 transition-colors uppercase h-7"
                                                    onChange={(e) => updateColumn(idx, 'type', e.target.value)}
                                                />
                                            </div>
                                            <div className="md:col-span-5 px-6 py-6 space-y-1">
                                                <div className="flex items-center gap-2 mb-1.5 opacity-40">
                                                    <FileText className="h-3 w-3" />
                                                    <span className="text-[8px] font-black uppercase tracking-[0.2em]">Metadata Annotation</span>
                                                </div>
                                                <Input
                                                    value={col.description || ''}
                                                    placeholder="Null value annotation..."
                                                    className="bg-transparent border-none p-0 h-auto text-[11px] font-bold italic text-muted-foreground focus-visible:ring-0 focus-visible:ring-offset-0 group-hover:text-foreground transition-colors h-7"
                                                    onChange={(e) => updateColumn(idx, 'description', e.target.value)}
                                                />
                                            </div>
                                            <div className="md:col-span-1 flex items-center justify-center p-4">
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-9 w-9 rounded-xl text-slate-300 hover:text-rose-600 hover:bg-rose-500/10 transition-all group/del"
                                                >
                                                    <Trash2 className="h-4 w-4 group-hover/del:scale-110 transition-transform" />
                                                </Button>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TableEditor;
