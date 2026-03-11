import React from 'react';
import { Link } from 'react-router-dom';
import {
    Database,
    ChevronRight,
    Info,
    Zap,
    Terminal,
    Lock,
    Settings,
    Fingerprint,
    ShieldCheck,
    Globe,
    Users,
    Key,
    Container
} from 'lucide-react';
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
    Alert,
    AlertDescription,
    AlertTitle
} from '@/components/ui/alert';
import {
    RadioGroup,
    RadioGroupItem
} from "@/components/ui/radio-group";
import { toast } from 'sonner';

const OracleIngestion: React.FC = () => {
    const [connectionType, setConnectionType] = React.useState('sid');

    return (
        <div className="p-6 space-y-10 max-w-5xl mx-auto animate-in fade-in duration-500">
            <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-4 font-medium">
                <Link to="/" className="hover:text-foreground transition-colors">Registry</Link>
                <ChevronRight className="h-4 w-4" />
                <Link to="/ingestion" className="hover:text-foreground transition-colors">Ingestion</Link>
                <ChevronRight className="h-4 w-4" />
                <span className="text-foreground font-bold">Oracle</span>
            </nav>

            <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 shrink-0 border-b pb-8">
                <div className="flex items-center gap-4">
                    <div className="p-3.5 rounded-2xl bg-red-500/10 text-red-600 shadow-sm border border-red-500/20">
                        <Database className="h-10 w-10" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-black tracking-tight text-foreground">Oracle Ingestion</h1>
                        <p className="text-muted-foreground mt-1 font-medium">Extract schematic metadata and constraints from Oracle Enterprise instances.</p>
                    </div>
                </div>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-6">
                    <Alert className="bg-blue-500/5 border-blue-500/20 rounded-2xl p-6 shadow-sm">
                        <Info className="h-5 w-5 text-blue-500" />
                        <div className="ml-4 space-y-1">
                            <AlertTitle className="text-blue-700 font-black uppercase tracking-widest text-[10px]">Permission Matrix</AlertTitle>
                            <AlertDescription className="text-blue-600/80 font-medium text-sm leading-relaxed">
                                Database credentials must have <strong className="text-blue-700">SELECT</strong> privileges on <code>ALL_TAB_COLUMNS</code>, <code>ALL_CONSTRAINTS</code>, and analytical metadata views.
                            </AlertDescription>
                        </div>
                    </Alert>

                    <Card className="border shadow-lg bg-card/60 backdrop-blur-sm group overflow-hidden">
                        <CardHeader className="bg-muted/30 border-b pb-6 px-8">
                            <div className="flex items-center gap-3">
                                <Settings className="h-5 w-5 text-red-600" />
                                <CardTitle className="text-sm font-black uppercase tracking-widest text-muted-foreground/60">Instance Configuration</CardTitle>
                            </div>
                        </CardHeader>
                        <CardContent className="p-8 space-y-10">
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                                <div className="md:col-span-3 space-y-3">
                                    <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/70 ml-1">Database Endpoint</Label>
                                    <Input placeholder="db-prod-cluster.internal" className="bg-muted/30 border-none h-14 focus-visible:ring-1 focus-visible:ring-red-500 font-bold text-sm rounded-xl px-5" />
                                </div>
                                <div className="space-y-3">
                                    <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/70 ml-1">Oracle Port</Label>
                                    <Input placeholder="1521" className="bg-muted/30 border-none h-14 focus-visible:ring-1 focus-visible:ring-red-500 font-mono text-xs rounded-xl px-5 text-center" />
                                </div>
                            </div>

                            <div className="space-y-6 pt-4 border-t border-muted/50">
                                <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/70 ml-1">Identification Logic</Label>
                                <RadioGroup
                                    defaultValue="sid"
                                    className="flex gap-8"
                                    onValueChange={setConnectionType}
                                >
                                    <div className="flex items-center space-x-3 bg-muted/20 px-6 py-4 rounded-xl border border-transparent hover:border-red-500/20 transition-all cursor-pointer has-[:checked]:bg-red-500/5 has-[:checked]:border-red-500/30">
                                        <RadioGroupItem value="sid" id="sid" className="text-red-600" />
                                        <Label htmlFor="sid" className="font-black text-[10px] uppercase tracking-widest cursor-pointer">System ID (SID)</Label>
                                    </div>
                                    <div className="flex items-center space-x-3 bg-muted/20 px-6 py-4 rounded-xl border border-transparent hover:border-red-500/20 transition-all cursor-pointer has-[:checked]:bg-red-500/5 has-[:checked]:border-red-500/30">
                                        <RadioGroupItem value="service" id="service" className="text-red-600" />
                                        <Label htmlFor="service" className="font-black text-[10px] uppercase tracking-widest cursor-pointer">Service Name</Label>
                                    </div>
                                </RadioGroup>

                                <div className="pt-2 animate-in slide-in-from-top-2 duration-300">
                                    <div className="relative">
                                        <Input
                                            placeholder={connectionType === 'sid' ? "ORCL" : "orcl.production.svc"}
                                            className="bg-muted/50 border-none h-14 focus-visible:ring-1 focus-visible:ring-red-500 font-mono text-sm rounded-xl px-12 italic"
                                        />
                                        <Fingerprint className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/30" />
                                    </div>
                                </div>
                            </div>

                            <div className="pt-8 space-y-6 border-t border-muted/50">
                                <div className="flex items-center gap-3 mb-2">
                                    <Lock className="h-4 w-4 text-muted-foreground/40" />
                                    <h4 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">Identity Management</h4>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-3">
                                        <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/70 ml-1">Username / Owner</Label>
                                        <Input placeholder="SYSDBA" className="bg-muted/30 border-none h-14 focus-visible:ring-1 focus-visible:ring-red-500 font-bold rounded-xl px-5" />
                                    </div>
                                    <div className="space-y-3">
                                        <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/70 ml-1">Secure Token / Pass</Label>
                                        <Input type="password" placeholder="••••••••" className="bg-muted/30 border-none h-14 focus-visible:ring-1 focus-visible:ring-red-500 rounded-xl px-5" />
                                    </div>
                                </div>
                            </div>

                            <div className="pt-8 space-y-3 border-t border-muted/50">
                                <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/70 ml-1 text-red-600">Schema Namespace (Target)</Label>
                                <div className="relative">
                                    <Input placeholder="ERP_SCHEMA_PROD" className="bg-muted/30 border-none h-14 focus-visible:ring-1 focus-visible:ring-red-500 font-black text-sm rounded-xl px-12" />
                                    <Container className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-red-500/30" />
                                </div>
                            </div>

                            <footer className="pt-10 flex flex-col sm:flex-row items-center justify-end gap-4 border-t border-muted/50">
                                <Button
                                    variant="ghost"
                                    className="h-12 px-8 font-black uppercase tracking-widest text-[10px] text-muted-foreground hover:bg-muted"
                                >
                                    Ping SID
                                </Button>
                                <Button
                                    className="h-12 px-10 bg-[#F80000] text-white hover:bg-red-700 rounded-xl font-black uppercase tracking-widest text-[10px] shadow-xl shadow-red-500/10 flex items-center gap-3 transition-all active:scale-95"
                                    onClick={() => toast.success("Import Initialized", { description: "Establishing Grid-aware connection." })}
                                >
                                    <Zap className="h-4 w-4" />
                                    Import Metadata
                                </Button>
                            </footer>
                        </CardContent>
                    </Card>
                </div>

                <div className="space-y-6">
                    <Card className="bg-muted/30 border-none shadow-none rounded-2xl overflow-hidden">
                        <CardHeader className="pb-2 bg-foreground/5">
                            <div className="flex items-center gap-2">
                                <ShieldCheck className="h-4 w-4 text-red-600" />
                                <CardTitle className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/80">OCI Guard</CardTitle>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-5 p-6 text-[11px] font-bold text-muted-foreground/70 leading-relaxed italic">
                            "Oracle Grid Infrastructure and TNS Names resolution is managed at the cluster level to ensure high availability during metadata synchronization."
                        </CardContent>
                    </Card>

                    <div className="flex flex-col gap-4">
                        {[
                            { icon: <Globe className="h-4 w-4 text-muted-foreground" />, text: "Regional Availability" },
                            { icon: <Users className="h-4 w-4 text-muted-foreground" />, text: "Entra ID Integration" },
                            { icon: <Key className="h-4 w-4 text-muted-foreground" />, text: "Key Vault Storage" }
                        ].map((item, i) => (
                            <div key={i} className="flex items-center gap-3 px-4 py-3 rounded-xl border border-muted/20 bg-muted/10 group hover:border-red-500/20 transition-all">
                                {item.icon}
                                <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground group-hover:text-foreground">{item.text}</span>
                            </div>
                        ))}
                    </div>

                    <div className="flex justify-center opacity-10 pt-4">
                        <Terminal className="h-12 w-12 text-muted-foreground" />
                    </div>
                </div>
            </div>

            <footer className="pt-8 flex items-center justify-center gap-4 text-[9px] text-muted-foreground/20 font-black uppercase tracking-[0.5em]">
                <span className="h-px w-8 bg-muted-foreground/10" />
                OCI Engine v21c (Enterprise)
                <span className="h-px w-8 bg-muted-foreground/10" />
            </footer>
        </div>
    );
};

export default OracleIngestion;
