import React from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
    Database,
    ShieldCheck,
    Zap,
    ChevronRight,
    Server,
    Layers,
    Info
} from 'lucide-react';
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

const PostgresIngestion: React.FC = () => {
    return (
        <div className="p-6 space-y-10 max-w-5xl mx-auto animate-in fade-in duration-700">
            <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-4 font-medium italic">
                <RouterLink to="/" className="hover:text-foreground transition-colors uppercase tracking-widest text-[10px]">Registry</RouterLink>
                <ChevronRight className="h-3 w-3" />
                <RouterLink to="/ingestion" className="hover:text-foreground transition-colors uppercase tracking-widest text-[10px]">Ingestion</RouterLink>
                <ChevronRight className="h-3 w-3" />
                <span className="text-foreground font-black uppercase tracking-widest text-[10px]">PostgreSQL</span>
            </nav>

            <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 shrink-0 border-b pb-8 border-slate-200 dark:border-slate-800">
                <div className="flex items-center gap-4">
                    <div className="p-3.5 rounded-2xl bg-blue-500/10 text-blue-600 shadow-sm border border-blue-500/20">
                        <Database className="h-10 w-10" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-black tracking-tighter text-foreground uppercase italic leading-none">
                            Postgres <span className="text-blue-600 not-italic">Ingestion</span>
                        </h1>
                        <p className="text-muted-foreground mt-2 font-medium italic tracking-tight">Extract schema definitions from remote or local PostgreSQL clusters with zero-latency metadata mapping.</p>
                    </div>
                </div>
            </header>

            <Alert className="bg-blue-500/5 border-blue-500/20 rounded-2xl p-6">
                <Info className="h-5 w-5 text-blue-600" />
                <AlertTitle className="text-blue-600 font-black uppercase tracking-widest text-xs mb-2">Automated Extraction Protocol</AlertTitle>
                <AlertDescription className="text-muted-foreground font-medium italic leading-relaxed">
                    The ingestion process utilizes <code className="text-blue-600 bg-blue-500/5 px-1.5 py-0.5 rounded font-mono text-[10px]">information_schema</code> and <code className="text-blue-600 bg-blue-500/5 px-1.5 py-0.5 rounded font-mono text-[10px]">pg_catalog</code> to reconstruct table metadata, constraints, and relational dependencies with high fidelity.
                </AlertDescription>
            </Alert>

            <Card className="border-none shadow-2xl bg-card/40 backdrop-blur-md rounded-[2rem] overflow-hidden">
                <CardHeader className="bg-muted/30 p-8 border-b border-muted/50">
                    <div className="flex items-center gap-3">
                        <Zap className="h-5 w-5 text-blue-500" />
                        <CardTitle className="text-xl font-black uppercase italic tracking-tight">Configuration <span className="text-blue-600 not-italic text-sm">Matrix</span></CardTitle>
                    </div>
                </CardHeader>
                <CardContent className="p-8 space-y-10">
                    <div className="space-y-6">
                        <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">
                            <Server className="h-3 w-3" /> Connection Topography
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                            <div className="md:col-span-3 space-y-2">
                                <Label htmlFor="host" className="text-[10px] font-black uppercase tracking-widest px-1">Host Endpoint</Label>
                                <Input id="host" placeholder="pg.production.cluster.internal" className="h-12 border-muted bg-background/50 focus-visible:ring-blue-500/50" />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="port" className="text-[10px] font-black uppercase tracking-widest px-1">Port</Label>
                                <Input id="port" placeholder="5432" className="h-12 border-muted bg-background/50 text-center font-mono focus-visible:ring-blue-500/50" />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="database" className="text-[10px] font-black uppercase tracking-widest px-1">Identity Vector (Database Name)</Label>
                            <Input id="database" placeholder="primary_analytics_db" className="h-12 border-muted bg-background/50 focus-visible:ring-blue-500/50" />
                        </div>
                    </div>

                    <Separator className="bg-muted/50" />

                    <div className="space-y-6">
                        <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">
                            <ShieldCheck className="h-3 w-3" /> Security Access Framework
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-2">
                                <Label htmlFor="username" className="text-[10px] font-black uppercase tracking-widest px-1">Principal (Username)</Label>
                                <Input id="username" placeholder="read_only_agent" className="h-12 border-muted bg-background/50 focus-visible:ring-blue-500/50" />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="password" className="text-[10px] font-black uppercase tracking-widest px-1">Secret (Password)</Label>
                                <Input id="password" type="password" placeholder="••••••••••••" className="h-12 border-muted bg-background/50 focus-visible:ring-blue-500/50" />
                            </div>
                        </div>
                    </div>

                    <Separator className="bg-muted/50" />

                    <div className="space-y-6">
                        <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">
                            <Layers className="h-3 w-3" /> Extraction Boundary
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="schema" className="text-[10px] font-black uppercase tracking-widest px-1">Namespace (Schema Name)</Label>
                            <Input id="schema" placeholder="public" className="h-12 border-muted bg-background/50 focus-visible:ring-blue-500/50" />
                        </div>
                    </div>

                    <div className="pt-6 flex flex-col md:flex-row items-center justify-end gap-4">
                        <Button variant="outline" className="h-12 px-8 uppercase text-[11px] font-black tracking-widest border-2 hover:bg-muted/50 w-full md:w-auto">
                            Validate Auth
                        </Button>
                        <Button className="h-12 px-10 uppercase text-[11px] font-black tracking-widest bg-blue-600 hover:bg-blue-700 text-white shadow-xl shadow-blue-500/20 w-full md:w-auto">
                            Execute Ingestion
                        </Button>
                    </div>
                </CardContent>
            </Card>

            <footer className="pt-4 flex items-center justify-center gap-6 text-[10px] text-muted-foreground/20 font-black uppercase tracking-[0.5em]">
                <div className="flex items-center gap-2">
                    <Zap className="h-3 w-3 text-blue-500/50" />
                    High Fidelity
                </div>
                <div className="h-1 w-1 rounded-full bg-muted-foreground/20" />
                <div className="flex items-center gap-2 font-mono">
                    PROTOCOL V4.1
                </div>
            </footer>
        </div>
    );
};

export default PostgresIngestion;
