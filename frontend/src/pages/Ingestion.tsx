import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useSidebar } from '../context/SidebarContext';
import {
    UploadCloud,
    FileJson,
    ChevronRight,
    FileUp,
    Network,
    AlertCircle,
    ArrowRight,
    Database,
    Zap,
    History,
    ShieldAlert,
    Check,
    Cpu,
    BookOpen,
    Layers,
    Trash2
} from 'lucide-react';
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription,
    CardFooter
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Checkbox } from '@/components/ui/checkbox';

interface ValidationResult {
    status: 'success' | 'conflict' | 'error';
    message: string;
    existing?: any;
    new?: any;
    type?: 'SCHEMA' | 'ORG' | 'DFD';
    error?: string;
    details?: string[];
    fileName?: string;
}

const IngestionPage: React.FC = () => {
    const [isUploading, setIsUploading] = useState(false);
    const [result, setResult] = useState<ValidationResult | null>(null);
    const [selectedTables, setSelectedTables] = useState<Record<string, boolean>>({});
    const [selectedEnums, setSelectedEnums] = useState<Record<string, boolean>>({});
    const [selectedFunctions, setSelectedFunctions] = useState<Record<string, boolean>>({});
    const [archives, setArchives] = useState<any[]>([]);
    const [isLoadingArchives, setIsLoadingArchives] = useState(true);
    const { setContent } = useSidebar();
    const fileInputRef = useRef<HTMLInputElement>(null);

    const fetchArchives = async () => {
        setIsLoadingArchives(true);
        try {
            const token = localStorage.getItem('token');
            const response = await fetch('/api/ingestion/archives', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (response.ok) {
                const data = await response.json();
                // Ensure data is an array
                setArchives(Array.isArray(data) ? data : []);
            }
        } catch (err) {
            console.error("Failed to fetch archives", err);
        } finally {
            setIsLoadingArchives(false);
        }
    };

    useEffect(() => {
        fetchArchives();
    }, []);

    // Set page-specific aside content
    useEffect(() => {
        setContent(
            <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
                <div className="space-y-4">
                    <div className="flex items-center gap-3 px-1">
                        <Cpu className="h-4 w-4 text-primary" />
                        <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Neural Context</h3>
                    </div>
                    <div className="p-6 rounded-[2rem] bg-indigo-500/5 border border-indigo-500/10 space-y-4">
                        <div className="flex items-center gap-3 text-indigo-600">
                            <ShieldAlert className="h-5 w-5" />
                            <span className="text-[10px] font-black uppercase tracking-widest text-indigo-600/80">Ingestion Protocol</span>
                        </div>
                        <p className="text-xs font-medium text-muted-foreground leading-relaxed">
                            Uploaded schemas are validated against the global blueprint. Collisions with existing records will trigger a manual review process.
                        </p>
                    </div>
                </div>

                <div className="space-y-4">
                    <div className="flex items-center gap-3 px-1">
                        <History className="h-4 w-4 text-amber-500" />
                        <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Audit Trail</h3>
                    </div>
                    <div className="p-6 rounded-[2rem] bg-amber-500/5 border border-amber-500/10 space-y-4">
                        <div className="flex items-center gap-3 text-amber-600">
                            <Zap className="h-5 w-5" />
                            <span className="text-[10px] font-black uppercase tracking-widest text-amber-600/80">Version Control</span>
                        </div>
                        <p className="text-xs font-medium text-muted-foreground leading-relaxed">
                            Every successful ingestion is archived and hashed to maintain a verifiable history of registry evolution.
                        </p>
                    </div>
                </div>

                <div className="space-y-4">
                    <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60 px-1">Ingestion Resources</h3>
                    <div className="space-y-2">
                        <button className="w-full flex items-center justify-between p-4 rounded-2xl bg-muted/30 hover:bg-muted/50 transition-colors group text-left">
                            <div className="flex items-center gap-3">
                                <BookOpen className="h-4 w-4 text-blue-500" />
                                <span className="text-xs font-bold uppercase tracking-tight">Format Guide</span>
                            </div>
                            <ChevronRight className="h-3 w-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                        </button>
                        <button className="w-full flex items-center justify-between p-4 rounded-2xl bg-muted/30 hover:bg-muted/50 transition-colors group text-left">
                            <div className="flex items-center gap-3">
                                <Layers className="h-4 w-4 text-purple-500" />
                                <span className="text-xs font-bold uppercase tracking-tight">Best Practices</span>
                            </div>
                            <ChevronRight className="h-3 w-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                        </button>
                    </div>
                </div>
            </div>
        );
        return () => setContent(null);
    }, [setContent]);

    const handleDrop = async (event: React.DragEvent<HTMLDivElement>) => {
        event.preventDefault();
        const file = event.dataTransfer.files?.[0];
        if (!file) return;
        await processFile(file);
    };

    const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;
        await processFile(file);
    };

    const processFile = async (file: File) => {
        setIsUploading(true);
        setResult(null);

        try {
            const text = await file.text();
            const schema = JSON.parse(text);

            // SPECIAL CASE: Organizational Structure Data
            if (schema.metadata?.organization || schema.type === "ORG") {
                setResult({
                    status: 'success',
                    message: 'Organizational Structure Authenticated',
                    type: 'ORG' as any,
                    new: schema,
                    fileName: file.name
                });
                toast.success("Org Structure Recognized", { description: "Identity verification complete." });
                setIsUploading(false);
                return;
            }

            // SPECIAL CASE: Data Flow Diagram Data
            if ((schema.elements && schema.elements.nodes) || schema.type === "DFD") {
                setResult({
                    status: 'success',
                    message: 'Data Flow Diagram Authenticated',
                    type: 'DFD' as any,
                    new: schema,
                    fileName: file.name
                });
                toast.success("DFD Structure Recognized", { description: "Data flow context valid." });
                setIsUploading(false);
                return;
            }

            const token = localStorage.getItem('token');
            const response = await fetch('/api/ingestion/validate', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(schema)
            });

            const data = await response.json();

            if (!response.ok) {
                setResult({
                    status: 'error',
                    message: data.error || 'Validation failed',
                    details: data.details
                });
                toast.error("Validation Failed", { description: data.error });
            } else {
                setResult({ ...data, fileName: file.name });
                if (data.status === 'conflict') {
                    // Initialize selection with all new/changed items
                    const tables: Record<string, boolean> = {};
                    data.new?.tables?.forEach((t: any) => tables[t.name] = true);
                    setSelectedTables(tables);

                    const enums: Record<string, boolean> = {};
                    data.new?.enums?.forEach((e: any) => enums[e.name] = true);
                    setSelectedEnums(enums);

                    const funcs: Record<string, boolean> = {};
                    data.new?.functions?.forEach((f: any) => funcs[f.name] = true);
                    setSelectedFunctions(funcs);

                    toast.warning("Schema Conflict", { description: "This schema already exists in the database. Review differences." });
                } else {
                    toast.success("Validation Success", { description: "Schema is valid and ready." });
                }
            }
        } catch (err) {
            setResult({
                status: 'error',
                message: 'Failed to process file',
                error: err instanceof Error ? err.message : String(err)
            });
            toast.error("Processing Error", { description: "Ensure the file is a valid JSON." });
        } finally {
            setIsUploading(false);
        }
    };

    const handleConfirmIngestion = async () => {
        if (!result || !result.new) return;

        const isOrg = (result as any).type === "ORG";
        const isDFD = (result as any).type === "DFD";
        const payload = (isOrg || isDFD) ? { ...result.new, fileName: result.fileName } : { ...result.new, fileName: result.fileName };

        // If conflict, filter elements based on selection
        if (!isOrg && result.status === 'conflict') {
            payload.tables = result.new.tables?.filter((t: any) => selectedTables[t.name]) || [];
            payload.enums = result.new.enums?.filter((e: any) => selectedEnums[e.name]) || [];
            payload.functions = result.new.functions?.filter((f: any) => selectedFunctions[f.name]) || [];
        }

        setIsUploading(true);
        try {
            const token = localStorage.getItem('token');
            let endpoint = '/api/ingestion/ingest';
            if (isOrg) endpoint = '/api/ingestion/ingest-org';
            else if (isDFD) endpoint = '/api/ingestion/ingest-dfd';

            const response = await fetch(endpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(payload)
            });

            if (response.ok) {
                toast.success("Ingestion Complete", { description: "Database has been updated." });
                setResult(null);
                fetchArchives(); // Refresh the list
            } else {
                const data = await response.json();
                toast.error("Ingestion Failed", { description: data.error });
            }
        } catch (err) {
            toast.error("Network Error", { description: "Failed to reach the server." });
        } finally {
            setIsUploading(false);
        }
    };

    const handleDeleteArchive = async (id: number) => {
        if (!window.confirm("Are you sure you want to delete this archive entry?")) return;

        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`/api/ingestion/archives/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (response.ok) {
                toast.success("Archive Entry Removed");
                fetchArchives();
            } else {
                toast.error("Failed to Delete");
            }
        } catch (err) {
            toast.error("Network Error");
        }
    };

    return (
        <div className="p-6 space-y-10 max-w-6xl mx-auto animate-in fade-in duration-500">
            <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-4 font-medium px-2">
                <Link to="/" className="hover:text-foreground transition-colors uppercase tracking-widest text-[10px] font-black">Registry</Link>
                <ChevronRight className="h-3 w-3" />
                <span className="text-foreground font-black uppercase tracking-widest text-[10px]">Data Ingestion</span>
            </nav>

            <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 shrink-0 border-b pb-10">
                <div className="flex items-center gap-6">
                    <div className="p-4 rounded-3xl bg-primary/10 text-primary shadow-sm border border-primary/20">
                        <UploadCloud className="h-10 w-10" />
                    </div>
                    <div>
                        <h1 className="text-4xl font-black tracking-tighter text-foreground italic uppercase">Data File Ingestion</h1>
                        <p className="text-muted-foreground mt-1 font-medium italic">Synchronize local data structures with the federated architecture.</p>
                    </div>
                </div>
            </header>

            {!result ? (
                <div className="space-y-12">
                    {/* Upload Section */}
                    <Card className="border shadow-2xl bg-card/60 backdrop-blur-sm overflow-hidden group rounded-[3rem] border-primary/10">
                        <CardHeader className="bg-muted/30 pb-8 pt-10 px-10">
                            <div className="flex items-center gap-4">
                                <div className="p-3 rounded-2xl bg-primary text-primary-foreground shadow-xl shadow-primary/20">
                                    <FileUp className="h-6 w-6" />
                                </div>
                                <div>
                                    <CardTitle className="text-[10px] font-black tracking-[0.3em] uppercase">DIRECT SYNCHRONIZATION</CardTitle>
                                    <div className="flex items-center gap-2 mt-1.5">
                                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                        <span className="text-[9px] font-bold text-muted-foreground uppercase italic tracking-widest">Ingestion Channel Active</span>
                                    </div>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="p-8 pt-0">
                            <input
                                type="file"
                                accept=".json"
                                className="hidden"
                                ref={fileInputRef}
                                onChange={handleFileUpload}
                            />
                            <div
                                className="border-2 border-dashed border-muted-foreground/20 rounded-[2.5rem] p-12 text-center cursor-pointer hover:bg-muted/40 hover:border-primary/40 transition-all group/dropzone relative overflow-hidden"
                                onClick={() => fileInputRef.current?.click()}
                                onDragOver={(e) => e.preventDefault()}
                                onDrop={handleDrop}
                            >
                                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover/dropzone:opacity-100 transition-opacity" />
                                <div className="relative z-10 space-y-8">
                                    <div className="mx-auto w-20 h-20 rounded-[1.5rem] bg-primary/5 flex items-center justify-center group-hover/dropzone:scale-110 group-hover/dropzone:bg-primary/10 transition-all duration-700 shadow-sm border border-black/5">
                                        <FileJson className="h-10 w-10 text-primary/60 group-hover/dropzone:text-primary transition-colors" />
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-black tracking-tighter italic uppercase">Drop JSON DATA</h3>
                                        <p className="text-[9px] font-black text-muted-foreground/40 mt-2 uppercase tracking-[0.25em] leading-loose">
                                            SELECT <code className="text-primary font-bold">*.JSON</code> FILE TO INITIALIZE VALIDATION PROTOCOL
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* History Section */}
                    <div className="space-y-8">
                        <div className="flex items-center justify-between px-6">
                            <div className="flex items-center gap-4">
                                <div className="p-2 rounded-xl bg-muted text-muted-foreground">
                                    <History className="h-5 w-5" />
                                </div>
                                <h2 className="text-xl font-black tracking-tight uppercase italic opacity-80">Evolutionary Audit Trail</h2>
                            </div>
                            <Badge variant="outline" className="font-black border-muted-foreground/20 text-muted-foreground/60 px-6 py-2 rounded-full text-[10px] uppercase tracking-[0.2em] bg-muted/20">
                                {archives?.length || 0} Records Cataloged
                            </Badge>
                        </div>

                        <div className="grid gap-6 px-2">
                            {isLoadingArchives ? (
                                <div className="space-y-4">
                                    {[1, 2, 3].map(i => (
                                        <div key={i} className="h-28 w-full bg-muted/20 animate-pulse rounded-[2rem]" />
                                    ))}
                                </div>
                            ) : (!archives || archives.length === 0) ? (
                                <div className="p-32 text-center border-2 border-dashed rounded-[5rem] bg-muted/5 border-muted-foreground/10">
                                    <div className="p-10 rounded-[2.5rem] bg-muted w-fit mx-auto mb-10 shadow-inner">
                                        <Database className="h-14 w-14 text-muted-foreground/10" />
                                    </div>
                                    <h3 className="text-2xl font-black tracking-tight italic uppercase opacity-30">Registry Audit trail Sparse</h3>
                                    <p className="text-[11px] text-muted-foreground/40 font-black mt-3 uppercase tracking-[0.2em]">Initiate first ingestion to begin version tracking</p>
                                </div>
                            ) : (
                                archives.map((archive) => (
                                    <Card key={archive?.id || Math.random()} className="border shadow-none bg-card/30 hover:bg-card/80 transition-all group rounded-[2.5rem] overflow-hidden border-border/40 hover:border-primary/20">
                                        <div className="flex items-center p-8 gap-10">
                                            <div className="p-5 rounded-[1.5rem] bg-primary/5 text-primary group-hover:rotate-12 group-hover:scale-110 transition-all duration-700 shadow-sm border border-primary/5">
                                                <FileJson className="h-8 w-8" />
                                            </div>
                                            <div className="flex-grow">
                                                <div className="flex items-center gap-4">
                                                    <h3 className="font-black text-lg tracking-tight uppercase italic">{archive?.name || "Unnamed Asset"}</h3>
                                                    <Badge className="bg-emerald-500/10 text-emerald-600 border-none text-[9px] font-black px-4 h-6 uppercase tracking-widest rounded-xl">
                                                        {archive?.status || "REGISTERED"}
                                                    </Badge>
                                                </div>
                                                <div className="flex items-center gap-6 mt-3">
                                                    <p className="text-[10px] text-muted-foreground font-black uppercase tracking-widest truncate max-w-lg opacity-50">
                                                        {archive?.description || "Federated Registry Update"}
                                                    </p>
                                                    {archive?.fileName && (
                                                        <>
                                                            <div className="h-4 w-px bg-muted-foreground/20" />
                                                            <p className="text-[10px] text-primary/60 font-black uppercase tracking-widest truncate max-w-lg">
                                                                FILE: {archive.fileName}
                                                            </p>
                                                        </>
                                                    )}
                                                    <div className="h-4 w-px bg-muted-foreground/20" />
                                                    <div className="flex items-center gap-2 grayscale opacity-40 group-hover:grayscale-0 group-hover:opacity-100 transition-all">
                                                        <Badge variant="ghost" className="text-[9px] font-black p-0 h-auto uppercase tracking-widest">PROTO: {archive?.type || 'SCHEMA'}</Badge>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="text-right shrink-0 px-4">
                                                <div className="text-[12px] font-black text-foreground uppercase tracking-widest italic">
                                                    {archive?.createdAt ? new Date(archive.createdAt).toLocaleDateString() : '---'}
                                                </div>
                                                <div className="text-[10px] font-black text-muted-foreground uppercase opacity-30 mt-1 tracking-tighter">
                                                    {archive?.createdAt ? new Date(archive.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '---'}
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="rounded-2xl h-14 w-14 hover:bg-destructive/10 hover:text-destructive transition-all"
                                                    onClick={() => handleDeleteArchive(archive.id)}
                                                >
                                                    <Trash2 className="h-5 w-5" />
                                                </Button>
                                                <Link to={`/model/entities?schema=${archive?.name}`}>
                                                    <Button variant="ghost" size="icon" className="rounded-2xl h-14 w-14 hover:bg-primary/10 hover:text-primary transition-all group-hover:translate-x-1">
                                                        <ChevronRight className="h-6 w-6" />
                                                    </Button>
                                                </Link>
                                            </div>
                                        </div>
                                    </Card>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            ) : (
                <div className="space-y-10 max-w-5xl mx-auto">
                    {result.status === 'error' && (
                        <Card className="border-destructive/30 bg-destructive/5 backdrop-blur-xl rounded-[3rem] overflow-hidden shadow-2xl">
                            <CardHeader className="bg-destructive/10 border-b border-destructive/10 p-10">
                                <div className="flex items-center gap-5 text-destructive">
                                    <div className="p-4 rounded-[1.5rem] bg-destructive/20 text-destructive shadow-lg">
                                        <AlertCircle className="h-8 w-8" />
                                    </div>
                                    <div>
                                        <CardTitle className="text-2xl font-black uppercase italic tracking-tighter">Validation Fault</CardTitle>
                                        <CardDescription className="text-destructive/60 font-black uppercase tracking-[0.2em] text-[10px] mt-1.5 opacity-80">Registry integrity check aborted / IO error</CardDescription>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent className="p-12 space-y-8">
                                <div className="p-8 bg-destructive/5 rounded-[2rem] border border-destructive/10 shadow-inner">
                                    <p className="text-lg font-black italic tracking-tight">{result.message}</p>
                                </div>
                                {result.details && (
                                    <div className="space-y-4">
                                        <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground opacity-50 px-4">DEEP DIAGNOSTICS</h4>
                                        <ul className="space-y-3 text-xs font-bold text-muted-foreground bg-black/30 p-8 rounded-[2.5rem] border border-white/5 shadow-2xl">
                                            {result.details.map((err: any, i: number) => (
                                                <li key={i} className="flex gap-4 hover:text-foreground transition-colors group">
                                                    <span className="text-destructive opacity-40 group-hover:opacity-100">•</span>
                                                    <span className="leading-relaxed">{err}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                            </CardContent>
                            <CardFooter className="p-10 bg-muted/20 flex gap-4 border-t border-white/5">
                                <Button variant="outline" onClick={() => setResult(null)} className="rounded-[1.5rem] h-14 px-10 font-black uppercase text-[10px] tracking-widest border-white/10 hover:bg-white/5">Reinitialize Protocol</Button>
                            </CardFooter>
                        </Card>
                    )}

                    {result.status === 'success' && (
                        <Card className="border-emerald-500/20 bg-emerald-500/5 backdrop-blur-xl rounded-[3rem] overflow-hidden shadow-2xl">
                            <CardHeader className="bg-emerald-500/10 border-b border-emerald-500/10 p-10">
                                <div className="flex items-center gap-5 text-emerald-600">
                                    <div className="p-4 rounded-[1.5rem] bg-emerald-500/20 text-emerald-600 shadow-lg">
                                        <Zap className="h-8 w-8" />
                                    </div>
                                    <div>
                                        <CardTitle className="text-2xl font-black uppercase italic tracking-tighter">Schema Validated</CardTitle>
                                        <CardDescription className="text-emerald-600/60 font-black uppercase tracking-[0.2em] text-[10px] mt-1.5 opacity-80">Asset authenticated for master registry ingestion</CardDescription>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent className="p-12 space-y-10">
                                <div className="flex items-center gap-10 p-10 bg-emerald-500/10 rounded-[3rem] border border-emerald-500/20 relative overflow-hidden group shadow-inner">
                                    <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/10 to-transparent skew-x-12 translate-x-full group-hover:translate-x-0 transition-transform duration-1000" />
                                    <div className="p-8 bg-emerald-500/20 rounded-[2rem] text-emerald-600 shadow-2xl shadow-emerald-500/30 relative z-10 scale-110">
                                        {(result as any).type === "ORG" ? (
                                            <Network className="h-12 w-12" />
                                        ) : (result as any).type === "DFD" ? (
                                            <Layers className="h-12 w-12" />
                                        ) : (
                                            <Database className="h-12 w-12" />
                                        )}
                                    </div>
                                    <div className="relative z-10">
                                        <h3 className="text-3xl font-black tracking-tighter uppercase italic text-emerald-600">
                                            {(result as any).type === "ORG" ? (result.new?.metadata?.organization || "Org-Structure") : result.new?.name}
                                        </h3>
                                        <p className="text-xs text-emerald-600/50 font-black uppercase tracking-[0.25em] mt-3">
                                            {(result as any).type === "ORG" ? (
                                                `ORGANIZATIONAL MAP DETECTED [${result.new?.id || 'GLOBAL'}]`
                                            ) : (result as any).type === "DFD" ? (
                                                `DATA FLOW DIAGRAM DETECTED [${result.new?.processes?.length || 0} PROCESSES]`
                                            ) : (
                                                `${result.new?.tables?.length || 0} CORE TABLES AUTHENTICATED`
                                            )}
                                        </p>
                                    </div>
                                </div>
                            </CardContent>
                            <CardFooter className="p-12 bg-muted/20 border-t border-white/5 flex items-center justify-between">
                                <Button variant="ghost" onClick={() => setResult(null)} className="rounded-2xl h-14 px-10 font-black uppercase text-[10px] tracking-[0.3em] hover:bg-black/20">Discard Changes</Button>
                                <Button
                                    className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-[2rem] px-16 h-20 font-black uppercase tracking-[0.3em] text-xs flex items-center gap-5 shadow-[0_20px_50px_rgba(16,185,129,0.3)] hover:scale-105 transition-all"
                                    onClick={handleConfirmIngestion}
                                    disabled={isUploading}
                                >
                                    {isUploading ? "INGESTING..." : "COMMIT TO REGISTRY"}
                                    <ArrowRight className="h-6 w-6" />
                                </Button>
                            </CardFooter>
                        </Card>
                    )}

                    {result.status === 'conflict' && (
                        <Card className="border-amber-500/20 bg-amber-500/5 backdrop-blur-xl overflow-hidden rounded-[4rem] shadow-2xl">
                            <CardHeader className="bg-amber-500/10 border-b border-amber-500/10 p-12">
                                <div className="flex items-center gap-6 text-amber-600">
                                    <div className="p-5 bg-amber-500/20 rounded-[1.5rem] shadow-xl">
                                        <History className="h-10 w-10" />
                                    </div>
                                    <div>
                                        <CardTitle className="text-3xl font-black uppercase italic tracking-tighter">Conflict Resolution</CardTitle>
                                        <CardDescription className="text-amber-600/60 font-black uppercase tracking-[0.2em] text-[10px] mt-2 italic opacity-80">Federated collision detected / Component level reconciliation required</CardDescription>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent className="p-12 space-y-12">
                                <div className="flex items-center justify-between px-6">
                                    <div className="space-y-1.5">
                                        <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-muted-foreground/30">MODULE PROTOCOL</h4>
                                        <div className="text-2xl font-black italic uppercase tracking-tighter text-amber-600">{result.new?.name}</div>
                                    </div>
                                    <div className="flex gap-4">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="text-[10px] font-black uppercase h-10 px-6 rounded-2xl border-amber-500/20 hover:bg-amber-500/10 hover:text-amber-600 transition-all font-sans"
                                            onClick={() => {
                                                const all: Record<string, boolean> = {};
                                                result.new?.tables?.forEach((t: any) => all[t.name] = true);
                                                setSelectedTables(all);
                                            }}
                                        >SELECT ALL</Button>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="text-[10px] font-black uppercase h-10 px-6 rounded-2xl hover:bg-black/10 font-sans"
                                            onClick={() => setSelectedTables({})}
                                        >CANCEL ALL</Button>
                                    </div>
                                </div>

                                <ScrollArea className="h-[500px] rounded-[3rem] border border-amber-500/10 bg-black/10 shadow-2xl">
                                    <div className="p-8 space-y-12">
                                        {/* Tables Section */}
                                        {result.new?.tables && result.new.tables.length > 0 && (
                                            <div className="space-y-6">
                                                <h5 className="text-[11px] font-black uppercase tracking-[0.4em] text-muted-foreground/20 px-6">BLUEPRINT COMPONENTS: TABLES</h5>
                                                <div className="space-y-4">
                                                    {result.new.tables.map((table: any) => {
                                                        const existingTable = result.existing?.tables?.find((t: any) => t.name === table.name);
                                                        const isNew = !existingTable;
                                                        const hasChanges = existingTable && JSON.stringify(existingTable) !== JSON.stringify(table);

                                                        return (
                                                            <div
                                                                key={table.name}
                                                                className={`p-8 rounded-[2rem] border flex items-center justify-between group transition-all duration-700 cursor-pointer ${selectedTables[table.name] ? 'bg-amber-500/10 border-amber-500/30 shadow-2xl scale-[1.01]' : 'bg-transparent border-transparent grayscale opacity-40 hover:opacity-60'
                                                                    }`}
                                                                onClick={() => setSelectedTables(prev => ({ ...prev, [table.name]: !prev[table.name] }))}
                                                            >
                                                                <div className="flex items-center gap-6">
                                                                    <div className={`p-5 rounded-2xl transition-all duration-700 ${selectedTables[table.name] ? 'bg-amber-500/20 text-amber-600 scale-110 shadow-xl shadow-amber-500/10' : 'bg-muted text-muted-foreground'}`}>
                                                                        <Database className="h-7 w-7" />
                                                                    </div>
                                                                    <div>
                                                                        <div className="flex items-center gap-4">
                                                                            <span className="font-black text-xl tracking-tight uppercase italic">{table.name}</span>
                                                                            {isNew && <Badge className="bg-indigo-600 hover:bg-indigo-600 text-[10px] font-black px-3 h-5 rounded-lg border-none shadow-lg shadow-indigo-500/20">NEW</Badge>}
                                                                            {hasChanges && <Badge className="bg-amber-600 hover:bg-amber-600 text-[10px] font-black px-3 h-5 rounded-lg border-none shadow-lg shadow-amber-500/20">DELTA</Badge>}
                                                                        </div>
                                                                        <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] mt-2 opacity-50">{table.columns?.length || 0} STRUCTURAL COLUMNS DEFINED</p>
                                                                    </div>
                                                                </div>
                                                                <Checkbox
                                                                    checked={selectedTables[table.name]}
                                                                    className="data-[state=checked]:bg-amber-600 data-[state=checked]:border-amber-600 h-8 w-8 rounded-xl border-2 border-muted-foreground/20 transition-all duration-500 shadow-sm"
                                                                />
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            </div>
                                        )}

                                        {/* Enums and Functions Section */}
                                        {result.new?.enums && result.new.enums.length > 0 && (
                                            <div className="space-y-6">
                                                <h5 className="text-[11px] font-black uppercase tracking-[0.4em] text-muted-foreground/20 px-6">BLUEPRINT COMPONENTS: ENUMS</h5>
                                                {result.new.enums.map((en: any) => (
                                                    <div
                                                        key={en.name}
                                                        className={`p-6 rounded-2xl border flex items-center justify-between group transition-all duration-500 cursor-pointer ${selectedEnums[en.name] ? 'bg-amber-500/10 border-amber-500/20 shadow-lg' : 'bg-transparent border-transparent grayscale opacity-50'
                                                            }`}
                                                        onClick={() => setSelectedEnums(prev => ({ ...prev, [en.name]: !prev[en.name] }))}
                                                    >
                                                        <div className="flex items-center gap-5">
                                                            <div className={`p-4 rounded-xl transition-all duration-500 ${selectedEnums[en.name] ? 'bg-amber-500/20 text-amber-600' : 'bg-muted text-muted-foreground'}`}>
                                                                <FileJson className="h-6 w-6" />
                                                            </div>
                                                            <div>
                                                                <h4 className="font-black text-base tracking-tight uppercase italic">{en.name}</h4>
                                                                <p className="text-[9px] font-black text-muted-foreground uppercase opacity-60 mt-1">{en.values?.length || 0} VALUES</p>
                                                            </div>
                                                        </div>
                                                        <Checkbox checked={selectedEnums[en.name]} className="h-6 w-6 rounded-lg border-2" />
                                                    </div>
                                                ))}
                                            </div>
                                        )}

                                        {result.new?.functions && result.new.functions.length > 0 && (
                                            <div className="space-y-6">
                                                <h5 className="text-[11px] font-black uppercase tracking-[0.4em] text-muted-foreground/20 px-6">BLUEPRINT COMPONENTS: FUNCTIONS</h5>
                                                {result.new.functions.map((fn: any) => (
                                                    <div
                                                        key={fn.name}
                                                        className={`p-6 rounded-2xl border flex items-center justify-between group transition-all duration-500 cursor-pointer ${selectedFunctions[fn.name] ? 'bg-amber-500/10 border-amber-500/20 shadow-lg' : 'bg-transparent border-transparent grayscale opacity-50'
                                                            }`}
                                                        onClick={() => setSelectedFunctions(prev => ({ ...prev, [fn.name]: !prev[fn.name] }))}
                                                    >
                                                        <div className="flex items-center gap-5">
                                                            <div className={`p-4 rounded-xl transition-all duration-500 ${selectedFunctions[fn.name] ? 'bg-amber-500/20 text-amber-600' : 'bg-muted text-muted-foreground'}`}>
                                                                <Zap className="h-6 w-6" />
                                                            </div>
                                                            <div>
                                                                <h4 className="font-black text-base tracking-tight uppercase italic">{fn.name}</h4>
                                                                <p className="text-[9px] font-black text-muted-foreground uppercase opacity-60 mt-1">{fn.parameters?.length || 0} PARAMETERS</p>
                                                            </div>
                                                        </div>
                                                        <Checkbox checked={selectedFunctions[fn.name]} className="h-6 w-6 rounded-lg border-2" />
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </ScrollArea>

                                <div className="p-10 bg-red-500/5 rounded-[3rem] border border-red-500/10 space-y-4 shadow-inner">
                                    <div className="flex items-center gap-4 text-red-600">
                                        <div className="w-2 h-2 rounded-full bg-red-600 animate-ping shadow-lg shadow-red-500/50" />
                                        <span className="text-[11px] font-black uppercase tracking-[0.4em]">Synchronization Warning Protocol</span>
                                    </div>
                                    <p className="text-[12px] font-bold text-red-600/50 leading-relaxed uppercase tracking-normal px-6">
                                        Updating existing tables will overwrite column definitions and metadata. System-level relations might be affected if key signatures change.
                                    </p>
                                </div>
                            </CardContent>
                            <CardFooter className="flex items-center justify-between p-12 bg-muted/20 border-t border-white/5">
                                <Button variant="ghost" onClick={() => setResult(null)} className="rounded-2xl font-black uppercase text-[10px] tracking-[0.4em] h-14 px-10 hover:bg-black/20">Abort Protocol</Button>
                                <Button
                                    className="bg-amber-600 hover:bg-amber-700 text-white rounded-[2rem] px-20 h-24 font-black uppercase tracking-[0.3em] text-xs flex items-center gap-6 shadow-[0_20px_60px_rgba(217,119,6,0.3)] hover:scale-105 transition-all"
                                    onClick={handleConfirmIngestion}
                                    disabled={isUploading || (Object.values(selectedTables).every(v => !v) && Object.values(selectedEnums).every(v => !v) && Object.values(selectedFunctions).every(v => !v))}
                                >
                                    {isUploading ? "RECONCILING..." : "FINALIZE REGISTRY DELTA"}
                                    <Check className="h-8 w-8" />
                                </Button>
                            </CardFooter>
                        </Card>
                    )}
                </div>
            )}

            <footer className="pt-16 pb-12 flex items-center justify-center gap-6 text-[11px] text-muted-foreground/10 font-black uppercase tracking-[0.6em]">
                <div className="h-px w-20 bg-muted-foreground/5" />
                <div className="flex items-center gap-3">
                    <Network className="h-4 w-4" />
                    Federated Ingestion Engine v4.0.21 [Production Ready]
                </div>
                <div className="h-px w-20 bg-muted-foreground/5" />
            </footer>
        </div>
    );
};

export default IngestionPage;
