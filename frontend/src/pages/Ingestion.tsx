import React, { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import {
    UploadCloud,
    FileJson,
    ChevronRight,
    CheckCircle,
    FileUp,
    Globe,
    Network,
    AlertCircle,
    ArrowRight,
    Database,
    Zap,
    History,
    ShieldAlert,
    Check
} from 'lucide-react';
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription,
    CardFooter
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Checkbox } from '@/components/ui/checkbox';

interface ValidationResult {
    status: 'success' | 'conflict' | 'error';
    message: string;
    existing?: any;
    new?: any;
    error?: string;
    details?: string[];
}

const IngestionPage: React.FC = () => {
    const [isUploading, setIsUploading] = useState(false);
    const [result, setResult] = useState<ValidationResult | null>(null);
    const [selectedTables, setSelectedTables] = useState<Record<string, boolean>>({});
    const [selectedEnums, setSelectedEnums] = useState<Record<string, boolean>>({});
    const [selectedFunctions, setSelectedFunctions] = useState<Record<string, boolean>>({});
    const fileInputRef = useRef<HTMLInputElement>(null);

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
                setResult(data);
                if (data.status === 'conflict') {
                    // Initialize selection with all new/changed items
                    const tables: Record<string, boolean> = {};
                    data.new.tables?.forEach((t: any) => tables[t.name] = true);
                    setSelectedTables(tables);

                    const enums: Record<string, boolean> = {};
                    data.new.enums?.forEach((e: any) => enums[e.name] = true);
                    setSelectedEnums(enums);

                    const funcs: Record<string, boolean> = {};
                    data.new.functions?.forEach((f: any) => funcs[f.name] = true);
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

        const payload = { ...result.new };

        // If conflict, filter elements based on selection
        if (result.status === 'conflict') {
            payload.tables = result.new.tables?.filter((t: any) => selectedTables[t.name]) || [];
            payload.enums = result.new.enums?.filter((e: any) => selectedEnums[e.name]) || [];
            payload.functions = result.new.functions?.filter((f: any) => selectedFunctions[f.name]) || [];
        }

        setIsUploading(true);
        try {
            const token = localStorage.getItem('token');
            const response = await fetch('/api/ingestion/ingest', {
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

    return (
        <div className="p-6 space-y-10 max-w-6xl mx-auto animate-in fade-in duration-500">
            <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-4 font-medium">
                <Link to="/" className="hover:text-foreground transition-colors">Schema</Link>
                <ChevronRight className="h-4 w-4" />
                <span className="text-foreground font-bold">Schema Ingestion</span>
            </nav>

            <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 shrink-0 border-b pb-8">
                <div className="flex items-center gap-4">
                    <div className="p-3.5 rounded-2xl bg-primary/10 text-primary shadow-sm border border-primary/20">
                        <UploadCloud className="h-10 w-10" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-black tracking-tight text-foreground">Schema Ingestion</h1>
                        <p className="text-muted-foreground mt-1 font-medium">Coordinate and register new data definitions within the federated registry.</p>
                    </div>
                </div>
            </header>

            {!result ? (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <Card className="border shadow-lg bg-card/60 backdrop-blur-sm overflow-hidden group">
                        <CardHeader className="bg-muted/30">
                            <div className="flex items-center gap-3">
                                <FileUp className="h-5 w-5 text-indigo-500" />
                                <CardTitle className="text-xl font-black tracking-tight uppercase text-xs">Direct Upload</CardTitle>
                            </div>
                            <CardDescription className="text-xs font-bold uppercase tracking-tight text-muted-foreground/50">Local file synchronization</CardDescription>
                        </CardHeader>
                        <CardContent className="p-8">
                            <input
                                type="file"
                                accept=".json"
                                className="hidden"
                                ref={fileInputRef}
                                onChange={handleFileUpload}
                            />
                            <div
                                className="border-2 border-dashed border-muted-foreground/20 rounded-[2rem] p-12 text-center cursor-pointer hover:bg-muted/40 hover:border-primary/40 transition-all group/dropzone relative overflow-hidden"
                                onClick={() => fileInputRef.current?.click()}
                                onDragOver={(e) => e.preventDefault()}
                                onDrop={handleDrop}
                            >
                                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover/dropzone:opacity-100 transition-opacity" />
                                <div className="relative z-10 space-y-4">
                                    <div className="mx-auto w-20 h-20 rounded-3xl bg-primary/5 flex items-center justify-center group-hover/dropzone:scale-110 group-hover/dropzone:bg-primary/10 transition-all duration-500 shadow-sm border border-black/5">
                                        <FileJson className="h-10 w-10 text-primary/60 group-hover/dropzone:text-primary transition-colors" />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-black tracking-tight">Drop definition here</h3>
                                        <p className="text-xs font-bold text-muted-foreground/60 mt-1 uppercase tracking-widest leading-loose">
                                            or browse your filesystem for <code className="text-[10px] bg-muted px-1.5 py-0.5 rounded border">*.schema.json</code>
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border shadow-lg bg-card/60 backdrop-blur-sm group">
                        <CardHeader className="bg-muted/30">
                            <div className="flex items-center gap-3">
                                <Network className="h-5 w-5 text-emerald-500" />
                                <CardTitle className="text-xl font-black tracking-tight uppercase text-xs">Manual Entry</CardTitle>
                            </div>
                            <CardDescription className="text-xs font-bold uppercase tracking-tight text-muted-foreground/50">Remote source registration</CardDescription>
                        </CardHeader>
                        <CardContent className="p-8 space-y-6">
                            <div className="space-y-2">
                                <Label htmlFor="moduleName" className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/70 ml-1">Module Namespace</Label>
                                <Input
                                    id="moduleName"
                                    placeholder="e.g. data-governance-hub"
                                    className="bg-muted/30 border-none h-12 focus-visible:ring-1 focus-visible:ring-primary font-bold text-sm rounded-xl px-5"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="sourceUrl" className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/70 ml-1">Metadata Source URL</Label>
                                <div className="relative group/input">
                                    <Input
                                        id="sourceUrl"
                                        placeholder="https://api.v2.source.io/v1/schema"
                                        className="bg-muted/30 border-none h-12 focus-visible:ring-1 focus-visible:ring-primary font-mono text-xs rounded-xl pl-10 pr-5"
                                    />
                                    <Globe className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/40 group-focus-within/input:text-primary transition-colors" />
                                </div>
                            </div>
                            <div className="pt-4">
                                <Button
                                    className="w-full h-14 bg-foreground text-background hover:bg-foreground/90 rounded-2xl font-black uppercase tracking-widest text-xs shadow-xl shadow-black/5 flex items-center gap-3"
                                    disabled={true}
                                >
                                    <CheckCircle className="h-4 w-4" />
                                    Finalize Registration
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            ) : (
                <div className="space-y-8 max-w-4xl mx-auto">
                    {result.status === 'error' && (
                        <Card className="border-destructive/30 bg-destructive/5 backdrop-blur-md">
                            <CardHeader>
                                <div className="flex items-center gap-3 text-destructive">
                                    <AlertCircle className="h-6 w-6" />
                                    <CardTitle>Validation Failed</CardTitle>
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <p className="text-sm font-bold">{result.message}</p>
                                {result.details && (
                                    <ul className="list-disc list-inside space-y-2 text-xs font-medium text-muted-foreground bg-black/5 p-4 rounded-xl">
                                        {result.details.map((err, i) => (
                                            <li key={i}>{err}</li>
                                        ))}
                                    </ul>
                                )}
                            </CardContent>
                            <CardFooter>
                                <Button variant="outline" onClick={() => setResult(null)} className="rounded-xl font-bold">Try again</Button>
                            </CardFooter>
                        </Card>
                    )}

                    {result.status === 'success' && (
                        <Card className="border-emerald-500/20 bg-emerald-500/5 backdrop-blur-md">
                            <CardHeader>
                                <div className="flex items-center gap-3 text-emerald-600">
                                    <Zap className="h-6 w-6" />
                                    <CardTitle>Schema Ready</CardTitle>
                                </div>
                                <CardDescription className="text-emerald-600/60 font-bold uppercase tracking-widest text-[10px]">Ready for ingestion into the master registry</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex items-center gap-6 p-6 bg-emerald-500/10 rounded-2xl border border-emerald-500/20">
                                    <div className="p-4 bg-emerald-500/20 rounded-xl text-emerald-600">
                                        <Database className="h-8 w-8" />
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-black">{result.new.name}</h3>
                                        <p className="text-sm text-emerald-600/70 font-medium">{result.new.tables.length} tables found in definition</p>
                                    </div>
                                </div>
                            </CardContent>
                            <CardFooter className="flex gap-4">
                                <Button
                                    className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl px-8 h-12 font-black uppercase tracking-widest text-xs flex items-center gap-2"
                                    onClick={handleConfirmIngestion}
                                    disabled={isUploading}
                                >
                                    {isUploading ? "Ingesting..." : "Ingest Schema"}
                                    <ArrowRight className="h-4 w-4" />
                                </Button>
                                <Button variant="ghost" onClick={() => setResult(null)} className="rounded-xl font-bold">Cancel</Button>
                            </CardFooter>
                        </Card>
                    )}

                    {result.status === 'conflict' && (
                        <Card className="border-amber-500/20 bg-amber-500/5 backdrop-blur-md overflow-hidden">
                            <CardHeader className="bg-amber-500/10 border-b border-amber-500/10 mb-6">
                                <div className="flex items-center gap-3 text-amber-600">
                                    <History className="h-6 w-6" />
                                    <CardTitle>Review Changes</CardTitle>
                                </div>
                                <CardDescription className="text-amber-600/60 font-bold uppercase tracking-widest text-[10px]">Federated collision detected. Select components to update.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div className="flex items-center justify-between px-2">
                                    <h4 className="text-xs font-black uppercase tracking-widest text-muted-foreground/60">Module: {result.new.name}</h4>
                                    <div className="flex gap-2">
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="text-[10px] font-black uppercase h-7 px-3 rounded-lg"
                                            onClick={() => {
                                                const all: Record<string, boolean> = {};
                                                result.new.tables.forEach((t: any) => all[t.name] = true);
                                                setSelectedTables(all);
                                            }}
                                        >Select All</Button>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="text-[10px] font-black uppercase h-7 px-3 rounded-lg"
                                            onClick={() => setSelectedTables({})}
                                        >Clear All</Button>
                                    </div>
                                </div>

                                <ScrollArea className="h-[400px] rounded-2xl border border-amber-500/20 bg-black/5">
                                    <div className="p-4 space-y-8">
                                        {/* Tables Section */}
                                        {result.new.tables && result.new.tables.length > 0 && (
                                            <div className="space-y-4">
                                                <h5 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/40 px-2">Tables</h5>
                                                {result.new.tables.map((table: any) => {
                                                    const existingTable = result.existing.tables?.find((t: any) => t.name === table.name);
                                                    const isNew = !existingTable;
                                                    const hasChanges = existingTable && JSON.stringify(existingTable) !== JSON.stringify(table);

                                                    return (
                                                        <div
                                                            key={table.name}
                                                            className={`p-4 rounded-xl border flex items-center justify-between group transition-all cursor-pointer ${selectedTables[table.name] ? 'bg-amber-500/10 border-amber-500/30' : 'bg-transparent border-transparent grayscale'
                                                                }`}
                                                            onClick={() => setSelectedTables(prev => ({ ...prev, [table.name]: !prev[table.name] }))}
                                                        >
                                                            <div className="flex items-center gap-4">
                                                                <div className={`p-2 rounded-lg ${selectedTables[table.name] ? 'bg-amber-500/20 text-amber-600' : 'bg-muted text-muted-foreground'}`}>
                                                                    <Database className="h-5 w-5" />
                                                                </div>
                                                                <div>
                                                                    <div className="flex items-center gap-2">
                                                                        <span className="font-black text-sm">{table.name}</span>
                                                                        {isNew && <Badge className="bg-indigo-500 hover:bg-indigo-500 text-[9px] font-black px-1.5 h-4">NEW</Badge>}
                                                                        {hasChanges && <Badge className="bg-amber-500 hover:bg-amber-500 text-[9px] font-black px-1.5 h-4">CHANGED</Badge>}
                                                                    </div>
                                                                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-tight mt-0.5">{table.columns.length} columns</p>
                                                                </div>
                                                            </div>
                                                            <Checkbox
                                                                checked={selectedTables[table.name]}
                                                                className="data-[state=checked]:bg-amber-500 data-[state=checked]:border-amber-500 h-5 w-5 rounded-lg border-2"
                                                            />
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        )}

                                        {/* Enums Section */}
                                        {result.new.enums && result.new.enums.length > 0 && (
                                            <div className="space-y-4">
                                                <h5 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/40 px-2">Enums</h5>
                                                {result.new.enums.map((en: any) => {
                                                    const existingEnum = result.existing.enums?.find((e: any) => e.name === en.name);
                                                    const isNew = !existingEnum;
                                                    const hasChanges = existingEnum && JSON.stringify(existingEnum) !== JSON.stringify(en);

                                                    return (
                                                        <div
                                                            key={en.name}
                                                            className={`p-4 rounded-xl border flex items-center justify-between group transition-all cursor-pointer ${selectedEnums[en.name] ? 'bg-amber-500/10 border-amber-500/30' : 'bg-transparent border-transparent grayscale'
                                                                }`}
                                                            onClick={() => setSelectedEnums(prev => ({ ...prev, [en.name]: !prev[en.name] }))}
                                                        >
                                                            <div className="flex items-center gap-4">
                                                                <div className={`p-2 rounded-lg ${selectedEnums[en.name] ? 'bg-amber-500/20 text-amber-600' : 'bg-muted text-muted-foreground'}`}>
                                                                    <FileJson className="h-5 w-5" />
                                                                </div>
                                                                <div>
                                                                    <div className="flex items-center gap-2">
                                                                        <span className="font-black text-sm">{en.name}</span>
                                                                        {isNew && <Badge className="bg-indigo-500 hover:bg-indigo-500 text-[9px] font-black px-1.5 h-4">NEW</Badge>}
                                                                        {hasChanges && <Badge className="bg-amber-500 hover:bg-amber-500 text-[9px] font-black px-1.5 h-4">CHANGED</Badge>}
                                                                    </div>
                                                                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-tight mt-0.5">{en.values.length} values</p>
                                                                </div>
                                                            </div>
                                                            <Checkbox
                                                                checked={selectedEnums[en.name]}
                                                                className="data-[state=checked]:bg-amber-500 data-[state=checked]:border-amber-500 h-5 w-5 rounded-lg border-2"
                                                            />
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        )}

                                        {/* Functions Section */}
                                        {result.new.functions && result.new.functions.length > 0 && (
                                            <div className="space-y-4">
                                                <h5 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/40 px-2">Functions</h5>
                                                {result.new.functions.map((fn: any) => {
                                                    const existingFn = result.existing.functions?.find((f: any) => f.name === fn.name);
                                                    const isNew = !existingFn;
                                                    const hasChanges = existingFn && JSON.stringify(existingFn) !== JSON.stringify(fn);

                                                    return (
                                                        <div
                                                            key={fn.name}
                                                            className={`p-4 rounded-xl border flex items-center justify-between group transition-all cursor-pointer ${selectedFunctions[fn.name] ? 'bg-amber-500/10 border-amber-500/30' : 'bg-transparent border-transparent grayscale'
                                                                }`}
                                                            onClick={() => setSelectedFunctions(prev => ({ ...prev, [fn.name]: !prev[fn.name] }))}
                                                        >
                                                            <div className="flex items-center gap-4">
                                                                <div className={`p-2 rounded-lg ${selectedFunctions[fn.name] ? 'bg-amber-500/20 text-amber-600' : 'bg-muted text-muted-foreground'}`}>
                                                                    <Zap className="h-5 w-5" />
                                                                </div>
                                                                <div>
                                                                    <div className="flex items-center gap-2">
                                                                        <span className="font-black text-sm">{fn.name}</span>
                                                                        {isNew && <Badge className="bg-indigo-500 hover:bg-indigo-500 text-[9px] font-black px-1.5 h-4">NEW</Badge>}
                                                                        {hasChanges && <Badge className="bg-amber-500 hover:bg-amber-500 text-[9px] font-black px-1.5 h-4">CHANGED</Badge>}
                                                                    </div>
                                                                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-tight mt-0.5">{fn.parameters?.length || 0} parameters</p>
                                                                </div>
                                                            </div>
                                                            <Checkbox
                                                                checked={selectedFunctions[fn.name]}
                                                                className="data-[state=checked]:bg-amber-500 data-[state=checked]:border-amber-500 h-5 w-5 rounded-lg border-2"
                                                            />
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        )}
                                    </div>
                                </ScrollArea>

                                <div className="p-6 bg-red-500/5 rounded-2xl border border-red-500/10 space-y-3">
                                    <div className="flex items-center gap-2 text-red-600">
                                        <ShieldAlert className="h-4 w-4" />
                                        <span className="text-[10px] font-black uppercase tracking-widest">Caution</span>
                                    </div>
                                    <p className="text-xs font-medium text-red-600/80 leading-relaxed">
                                        Updating existing tables will overwrite column definitions and metadata. System-level relations might be affected if key signatures change.
                                    </p>
                                </div>
                            </CardContent>
                            <CardFooter className="flex items-center justify-between p-8 bg-muted/20 border-t">
                                <Button variant="ghost" onClick={() => setResult(null)} className="rounded-xl font-bold h-12 px-6">Abort Process</Button>
                                <Button
                                    className="bg-amber-600 hover:bg-amber-700 text-white rounded-xl px-10 h-14 font-black uppercase tracking-widest text-xs flex items-center gap-3 shadow-xl shadow-amber-600/20"
                                    onClick={handleConfirmIngestion}
                                    disabled={isUploading || (Object.values(selectedTables).every(v => !v) && Object.values(selectedEnums).every(v => !v) && Object.values(selectedFunctions).every(v => !v))}
                                >
                                    {isUploading ? "Syncing..." : "Finalize Changes"}
                                    <Check className="h-4 w-4" />
                                </Button>
                            </CardFooter>
                        </Card>
                    )}
                </div>
            )}

            <footer className="pt-8 flex items-center justify-center gap-3 text-[10px] text-muted-foreground/30 font-black uppercase tracking-[0.4em]">
                <Network className="h-3 w-3" />
                Registration Protocol v4 Active
            </footer>
        </div>
    );
};

export default IngestionPage;
