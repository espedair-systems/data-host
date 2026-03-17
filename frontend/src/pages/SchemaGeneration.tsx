import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
    ChevronRight,
    Folder,
    FileCode,
    Play,
    Wand2,
    CheckCircle2,
    AlertCircle,
    ArrowLeft
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from 'sonner';
import { cn } from "@/lib/utils";

interface PlannedFile {
    name: string;
    path: string;
    template: string;
    exists: boolean;
    enabled: boolean;
}

interface GenerationPlan {
    rootPath: string;
    directories: string[];
    files: PlannedFile[];
}

const SchemaGeneration: React.FC = () => {
    const { asset } = useParams<{ asset: string }>();
    const navigate = useNavigate();
    const [plan, setPlan] = useState<GenerationPlan | null>(null);
    const [files, setFiles] = useState<PlannedFile[]>([]);
    const [loading, setLoading] = useState(true);
    const [processing, setProcessing] = useState(false);
    const [dryRunResult, setDryRunResult] = useState<{ success: boolean; message: string } | null>(null);

    useEffect(() => {
        const fetchPlan = async () => {
            try {
                const res = await fetch(`/api/ingestion/generate/${asset}/plan`);
                if (res.ok) {
                    const data = await res.json();
                    setPlan(data);
                    setFiles(data.files || []);
                } else {
                    toast.error("Failed to load generation plan");
                }
            } catch (error) {
                console.error("Plan fetch failed:", error);
                toast.error("Network error loading plan");
            } finally {
                setLoading(false);
            }
        };

        if (asset) fetchPlan();
    }, [asset]);

    const handleToggleFile = (index: number) => {
        setFiles(prev => prev.map((f, i) => i === index ? { ...f, enabled: !f.enabled } : f));
    };

    const handlePathChange = (index: number, newPath: string) => {
        setFiles(prev => prev.map((f, i) => i === index ? { ...f, path: newPath } : f));
    };

    const handleAction = async (dryRun: boolean) => {
        setProcessing(true);
        setDryRunResult(null);

        try {
            const res = await fetch(`/api/ingestion/generate/${asset}${dryRun ? '?dry_run=true' : ''}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ files })
            });
            const data = await res.json();

            if (res.ok) {
                if (dryRun) {
                    setDryRunResult({ success: true, message: "Validation successful! All enabled templates and data are valid." });
                    toast.success("Dry run successful");
                } else {
                    toast.success(`Successfully generated schema artifacts for ${asset}`);
                    const planRes = await fetch(`/api/ingestion/generate/${asset}/plan`);
                    if (planRes.ok) {
                        const newPlan = await planRes.json();
                        setPlan(newPlan);
                        setFiles(newPlan.files);
                    }
                }
            } else {
                if (dryRun) {
                    setDryRunResult({ success: false, message: data.error || "Validation failed" });
                }
                toast.error(data.error || "Action failed");
            }
        } catch (error) {
            toast.error("Network error during operation");
        } finally {
            setProcessing(false);
        }
    };

    if (loading) {
        return (
            <div className="p-6 max-w-5xl mx-auto space-y-6">
                <Skeleton className="h-8 w-64" />
                <Card>
                    <CardHeader><Skeleton className="h-6 w-48" /></CardHeader>
                    <CardContent className="space-y-4">
                        <Skeleton className="h-20 w-full" />
                        <Skeleton className="h-20 w-full" />
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="p-6 space-y-10 max-w-5xl mx-auto animate-in fade-in duration-500">
            <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-4 font-medium italic">
                <Link to="/" className="hover:text-foreground transition-colors uppercase tracking-widest text-[10px]">Registry</Link>
                <ChevronRight className="h-3 w-3" />
                <Link to="/curate/schema" className="hover:text-foreground transition-colors uppercase tracking-widest text-[10px]">Schema</Link>
                <ChevronRight className="h-3 w-3" />
                <span className="text-foreground font-black uppercase tracking-widest text-[10px] italic">Generation {asset}</span>
            </nav>

            <header className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" onClick={() => navigate(-1)} className="rounded-full">
                        <ArrowLeft className="h-5 w-5" />
                    </Button>
                    <div>
                        <h1 className="text-3xl font-black tracking-tight uppercase italic">Schema Artifact Generation</h1>
                        <p className="text-muted-foreground font-medium italic">Preparing site workspace for <span className="text-primary font-bold">{asset}</span></p>
                    </div>
                </div>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="md:col-span-2 space-y-6">
                    {/* Destination Card */}
                    <Card className="border-slate-200 dark:border-slate-800 bg-card/60 backdrop-blur-sm shadow-xl rounded-3xl overflow-hidden">
                        <CardHeader className="bg-muted/30 border-b">
                            <CardTitle className="text-sm font-black uppercase tracking-widest flex items-center gap-2">
                                <Folder className="h-4 w-4 text-primary" />
                                Target Workspace
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-6 space-y-6">
                            <div>
                                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 block mb-2">Root Output Directory (Config)</label>
                                <div className="p-4 rounded-xl bg-muted/50 font-mono text-sm border border-slate-200 dark:border-slate-800 break-all uppercase italic">
                                    {plan?.rootPath || './generated'}
                                </div>
                            </div>

                            <div>
                                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 block mb-2">Directory Structure</label>
                                <div className="space-y-2">
                                    {plan?.directories.map(dir => (
                                        <div key={dir} className="flex items-center gap-2 text-sm font-bold italic">
                                            <Badge variant="outline" className="font-mono text-[9px] border-none bg-primary/10 text-primary">NEW</Badge>
                                            <span className="text-muted-foreground/60">{plan?.rootPath || './generated'}/</span>
                                            <span className="text-foreground">{dir}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Files Card */}
                    <Card className="border-slate-200 dark:border-slate-800 bg-card/60 backdrop-blur-sm shadow-xl rounded-3xl overflow-hidden">
                        <CardHeader className="bg-muted/30 border-b flex flex-row items-center justify-between py-4">
                            <CardTitle className="text-sm font-black uppercase tracking-widest flex items-center gap-2">
                                <FileCode className="h-4 w-4 text-primary" />
                                Artifact Payload
                            </CardTitle>
                            <Badge variant="outline" className="h-6 px-3 rounded-full font-bold bg-background/50 border-none">
                                {files.length} Templates Detected
                            </Badge>
                        </CardHeader>
                        <CardContent className="p-0">
                            {files.length === 0 ? (
                                <div className="p-12 text-center space-y-4">
                                    <div className="w-16 h-16 rounded-2xl bg-muted/30 flex items-center justify-center mx-auto">
                                        <AlertCircle className="h-8 w-8 text-muted-foreground/40" />
                                    </div>
                                    <div>
                                        <h3 className="font-black uppercase italic text-lg text-foreground">No Templates Found</h3>
                                        <p className="text-muted-foreground text-sm font-medium">No embedded templates were detected in the system binary.</p>
                                    </div>
                                </div>
                            ) : (
                                <div className="divide-y divide-slate-200 dark:divide-slate-800">
                                    {files.map((file, i) => (
                                        <div key={i} className={cn("p-6 flex flex-col gap-6 transition-all duration-300", !file.enabled && "opacity-40 grayscale-[0.5]")}>
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-4">
                                                    <div className="relative group cursor-pointer" onClick={() => handleToggleFile(i)}>
                                                        <div className={cn(
                                                            "w-12 h-12 rounded-2xl border flex items-center justify-center transition-all duration-500",
                                                            file.enabled
                                                                ? "bg-primary/10 border-primary/20 text-primary shadow-lg shadow-primary/5"
                                                                : "bg-muted/50 border-transparent text-muted-foreground/40"
                                                        )}>
                                                            <FileCode className="h-5 w-5" />
                                                        </div>
                                                        <div className={cn(
                                                            "absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full border-2 border-background flex items-center justify-center transition-transform",
                                                            file.enabled ? "bg-primary scale-100" : "bg-muted-foreground/20 scale-75"
                                                        )}>
                                                            {file.enabled && <CheckCircle2 className="h-3 w-3 text-white" />}
                                                        </div>
                                                    </div>
                                                    <div className="flex flex-col gap-0.5">
                                                        <span className="text-sm font-black uppercase italic tracking-tight">{file.name}</span>
                                                        <div className="flex items-center gap-2">
                                                            <Badge variant="outline" className="px-1 py-0 rounded bg-primary/5 text-[8px] border-none font-bold">TYPE: MDX</Badge>
                                                            <span className="text-[9px] font-bold text-muted-foreground/60 uppercase tracking-widest">Source: {file.template}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-3">
                                                    {file.exists ? (
                                                        <Badge variant="outline" className="bg-amber-500/10 text-amber-500 border-amber-500/20 text-[9px] font-black uppercase tracking-widest px-3 h-6 rounded-full">Update</Badge>
                                                    ) : (
                                                        <Badge variant="outline" className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20 text-[9px] font-black uppercase tracking-widest px-3 h-6 rounded-full">New</Badge>
                                                    )}
                                                    <input
                                                        type="checkbox"
                                                        checked={file.enabled}
                                                        onChange={() => handleToggleFile(i)}
                                                        className="w-5 h-5 rounded-lg border-slate-300 text-primary focus:ring-primary cursor-pointer transition-transform active:scale-90"
                                                    />
                                                </div>
                                            </div>

                                            <div className="space-y-4 ml-16">
                                                <div>
                                                    <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/40 block mb-2 px-1">Target Output Path</label>
                                                    <div className="relative group">
                                                        <div className="absolute left-4 top-1/2 -translate-y-1/2 flex items-center gap-1.5 pointer-events-none border-r pr-3 border-border/50">
                                                            <Folder className="h-3 w-3 text-muted-foreground/40" />
                                                            <span className="text-[10px] font-mono text-muted-foreground/40 font-bold uppercase tracking-tight">{plan?.rootPath || './generated'}/</span>
                                                        </div>
                                                        <input
                                                            type="text"
                                                            value={file.path}
                                                            disabled={!file.enabled}
                                                            onChange={(e) => handlePathChange(i, e.target.value)}
                                                            className={cn(
                                                                "w-full h-11 pl-44 pr-4 rounded-xl font-mono text-xs transition-all outline-none",
                                                                file.enabled
                                                                    ? "bg-background border border-border group-hover:border-primary/30 focus:border-primary focus:ring-4 focus:ring-primary/5"
                                                                    : "bg-muted/30 border-transparent text-muted-foreground/40 italic"
                                                            )}
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>

                <div className="space-y-6">
                    {/* Execution Panel */}
                    <Card className="border-slate-200 dark:border-slate-800 bg-card/60 backdrop-blur-sm shadow-2xl rounded-3xl overflow-hidden sticky top-24">
                        <CardHeader className="bg-primary/5 border-b">
                            <CardTitle className="text-sm font-black uppercase tracking-widest">Orchestration</CardTitle>
                        </CardHeader>
                        <CardContent className="p-6 space-y-6">
                            <div className="space-y-3">
                                <Button
                                    className="w-full h-12 rounded-2xl font-black uppercase tracking-widest text-[10px] gap-3 bg-slate-800 hover:bg-slate-900 border-none transition-all active:scale-95"
                                    onClick={() => handleAction(true)}
                                    disabled={processing || files.every(f => !f.enabled)}
                                >
                                    <Play className="h-4 w-4" />
                                    {processing ? 'Processing...' : 'Run Dry Run'}
                                </Button>
                                <Button
                                    className="w-full h-12 rounded-2xl font-black uppercase tracking-widest text-[10px] gap-3 bg-primary hover:bg-primary/90 border-none transition-all shadow-lg shadow-primary/20 active:scale-95"
                                    onClick={() => handleAction(false)}
                                    disabled={processing || files.every(f => !f.enabled)}
                                >
                                    <Wand2 className="h-4 w-4" />
                                    {processing ? 'Processing...' : 'Generate Artifacts'}
                                </Button>
                            </div>

                            {dryRunResult && (
                                <div className={`p-4 rounded-2xl flex gap-3 border animate-in slide-in-from-top-2 duration-300 ${dryRunResult.success
                                    ? 'bg-emerald-500/5 border-emerald-500/20 text-emerald-500'
                                    : 'bg-red-500/5 border-red-500/20 text-red-500'
                                    }`}>
                                    {dryRunResult.success ? <CheckCircle2 className="h-5 w-5 shrink-0" /> : <AlertCircle className="h-5 w-5 shrink-0" />}
                                    <p className="text-xs font-bold italic py-0.5">{dryRunResult.message}</p>
                                </div>
                            )}

                            <Separator />

                            <div className="space-y-4">
                                <h4 className="text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground/40 italic">Process Overview</h4>
                                <div className="space-y-2">
                                    <div className="flex items-center gap-3 text-[10px] font-bold italic text-muted-foreground">
                                        <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                                        Fetch database schema
                                    </div>
                                    <div className="flex items-center gap-3 text-[10px] font-bold italic text-muted-foreground">
                                        <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                                        Initialize directory structure
                                    </div>
                                    <div className="flex items-center gap-3 text-[10px] font-bold italic text-muted-foreground">
                                        <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                                        Hydrate MDX templates
                                    </div>
                                    <div className="flex items-center gap-3 text-[10px] font-bold italic text-muted-foreground">
                                        <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                                        Commit to filesystem
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>

            <footer className="pt-12 text-center border-t border-slate-200 dark:border-slate-800">
                <p className="text-[9px] font-black uppercase tracking-[1em] text-muted-foreground/20">Artifact Engine v2.4-stable</p>
            </footer>
        </div>
    );
};

export default SchemaGeneration;
