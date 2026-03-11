import React from 'react';
import { Link } from 'react-router-dom';
import {
    Database,
    ChevronRight,
    Info,
    CheckCircle,
    ShieldAlert,
    Terminal,
    Network,
    Lock,
    Cpu
} from 'lucide-react';
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
    Alert,
    AlertDescription,
    AlertTitle
} from '@/components/ui/alert';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

const MSSQLIngestion: React.FC = () => {
    return (
        <div className="p-6 space-y-10 max-w-5xl mx-auto animate-in fade-in duration-500">
            <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-4 font-medium">
                <Link to="/" className="hover:text-foreground transition-colors">Registry</Link>
                <ChevronRight className="h-4 w-4" />
                <Link to="/ingestion" className="hover:text-foreground transition-colors">Ingestion</Link>
                <ChevronRight className="h-4 w-4" />
                <span className="text-foreground font-bold">MS SQL</span>
            </nav>

            <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 shrink-0 border-b pb-8">
                <div className="flex items-center gap-4">
                    <div className="p-3.5 rounded-2xl bg-red-500/10 text-red-600 shadow-sm border border-red-500/20">
                        <Database className="h-10 w-10" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-black tracking-tight text-foreground">Microsoft SQL Server</h1>
                        <p className="text-muted-foreground mt-1 font-medium">Coordinate schema extraction from SQL Server and Azure SQL databases.</p>
                    </div>
                </div>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-6">
                    <Alert className="bg-red-500/5 border-red-500/20 rounded-2xl p-6">
                        <Info className="h-5 w-5 text-red-500" />
                        <div className="ml-4 space-y-1">
                            <AlertTitle className="text-red-700 font-black uppercase tracking-widest text-[10px]">Credential Scope</AlertTitle>
                            <AlertDescription className="text-red-600/80 font-medium text-sm">
                                Identity requires <strong className="text-red-700 font-black underline underline-offset-4 decoration-red-500/30">VIEW DEFINITION</strong> or <code>db_datareader</code> role membership.
                            </AlertDescription>
                        </div>
                    </Alert>

                    <Card className="border shadow-lg bg-card/60 backdrop-blur-sm group">
                        <CardHeader className="bg-muted/30 border-b pb-6">
                            <div className="flex items-center gap-3">
                                <Network className="h-5 w-5 text-indigo-500" />
                                <CardTitle className="text-xl font-black tracking-tight uppercase text-xs text-muted-foreground">Cluster Configuration</CardTitle>
                            </div>
                        </CardHeader>
                        <CardContent className="p-8 space-y-6">
                            <div className="grid grid-cols-4 gap-6">
                                <div className="col-span-3 space-y-2">
                                    <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/70 ml-1">Instance FQDN</Label>
                                    <Input placeholder="sql-cluster.production.int" className="bg-muted/30 border-none h-12 focus-visible:ring-1 focus-visible:ring-red-500 font-bold text-sm rounded-xl px-5" />
                                </div>
                                <div className="col-span-1 space-y-2">
                                    <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/70 ml-1">Port</Label>
                                    <Input placeholder="1433" className="bg-muted/30 border-none h-12 focus-visible:ring-1 focus-visible:ring-red-500 font-mono text-sm rounded-xl px-5" />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/70 ml-1">Database</Label>
                                    <Input placeholder="MasterDB" className="bg-muted/30 border-none h-12 focus-visible:ring-1 focus-visible:ring-red-500 font-bold text-sm rounded-xl px-5" />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/70 ml-1">Named Instance</Label>
                                    <Input placeholder="SQLEXPRESS" className="bg-muted/30 border-none h-12 focus-visible:ring-1 focus-visible:ring-red-500 font-mono text-sm rounded-xl px-5" />
                                </div>
                            </div>

                            <div className="pt-4 grid grid-cols-2 gap-6 border-t border-muted/50">
                                <div className="space-y-2">
                                    <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/70 ml-1 font-black">SQL Identity</Label>
                                    <Input placeholder="sa" className="bg-muted/30 border-none h-12 focus-visible:ring-1 focus-visible:ring-red-500 font-bold text-sm rounded-xl px-5" />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/70 ml-1 font-black">Security Key</Label>
                                    <div className="relative">
                                        <Input type="password" placeholder="••••••••" className="bg-muted/30 border-none h-12 focus-visible:ring-1 focus-visible:ring-red-500 font-mono text-sm rounded-xl px-5" />
                                        <Lock className="absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/30" />
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-2 pt-4">
                                <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/70 ml-1">Extraction Scope (Schema)</Label>
                                <Input placeholder="dbo" className="bg-muted/30 border-none h-12 focus-visible:ring-1 focus-visible:ring-red-500 font-bold text-sm rounded-xl px-5" />
                            </div>

                            <div className="pt-8 border-t flex flex-col sm:flex-row items-center justify-end gap-4">
                                <Button
                                    variant="ghost"
                                    className="h-12 px-8 font-black uppercase tracking-widest text-[10px] text-muted-foreground hover:bg-muted"
                                >
                                    Verify Topology
                                </Button>
                                <Button
                                    className="h-12 px-10 bg-[#A91D22] text-white hover:bg-red-800 rounded-xl font-black uppercase tracking-widest text-[10px] shadow-xl shadow-red-500/10 flex items-center gap-3"
                                    onClick={() => toast.success("Scanning Objects", { description: "Extracting T-SQL metadata and relationship constraints." })}
                                >
                                    <CheckCircle className="h-4 w-4" />
                                    Scan SQL Objects
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <div className="space-y-6">
                    <Card className="bg-muted/30 border-none shadow-none rounded-2xl">
                        <CardHeader className="pb-2">
                            <div className="flex items-center gap-2">
                                <Terminal className="h-4 w-4 text-indigo-500" />
                                <CardTitle className="text-xs font-black uppercase tracking-widest text-muted-foreground/80">Capabilities</CardTitle>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {[
                                { text: "Table Schemata", status: "Active" },
                                { text: "View Definitions", status: "Active" },
                                { text: "Foreign Key Graphs", status: "Active" },
                                { text: "Stored Proc Logic", status: "InDev" },
                            ].map((item, i) => (
                                <div key={i} className="flex items-center justify-between">
                                    <span className="text-xs font-bold text-foreground/70">{item.text}</span>
                                    <span className={cn("text-[9px] font-black uppercase px-2 py-0.5 rounded-full", i < 3 ? "bg-green-500/10 text-green-600" : "bg-amber-500/10 text-amber-600")}>
                                        {item.status}
                                    </span>
                                </div>
                            ))}
                        </CardContent>
                    </Card>

                    <Card className="border shadow-md bg-card/40 backdrop-blur-sm p-6 rounded-2xl space-y-4">
                        <div className="flex items-center gap-2">
                            <ShieldAlert className="h-4 w-4 text-red-500" />
                            <h4 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Governance Guard</h4>
                        </div>
                        <p className="text-xs font-medium text-muted-foreground leading-relaxed italic">
                            "Enterprise-grade SQL metadata extraction with full support for Always On Availability Groups and Azure SQL Managed Instances."
                        </p>
                    </Card>

                    <div className="flex justify-center opacity-20">
                        <Cpu className="h-10 w-10 text-muted-foreground" />
                    </div>
                </div>
            </div>

            <footer className="pt-8 flex items-center justify-center gap-3 text-[10px] text-muted-foreground/30 font-black uppercase tracking-[0.4em]">
                <Database className="h-3 w-3" />
                T-SQL Metadata Hub v2.4
            </footer>
        </div>
    );
};

export default MSSQLIngestion;
