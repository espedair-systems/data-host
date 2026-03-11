import React from 'react';
import { Link } from 'react-router-dom';
import {
    Database,
    ChevronRight,
    Zap,
    Lock,
    Settings,
    FlaskConical,
    Layers,
    ShieldAlert,
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
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import {
    Alert,
    AlertDescription,
    AlertTitle
} from '@/components/ui/alert';
import { Slider } from "@/components/ui/slider";
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

const MongoIngestion: React.FC = () => {
    const [sampleSize, setSampleSize] = React.useState<number[]>([500]);

    return (
        <div className="p-6 space-y-10 max-w-5xl mx-auto animate-in fade-in duration-500">
            <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-4 font-medium">
                <Link to="/" className="hover:text-foreground transition-colors">Registry</Link>
                <ChevronRight className="h-4 w-4" />
                <Link to="/ingestion" className="hover:text-foreground transition-colors">Ingestion</Link>
                <ChevronRight className="h-4 w-4" />
                <span className="text-foreground font-bold">MongoDB</span>
            </nav>

            <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 shrink-0 border-b pb-8">
                <div className="flex items-center gap-4">
                    <div className="p-3.5 rounded-2xl bg-green-500/10 text-green-600 shadow-sm border border-green-500/20">
                        <Database className="h-10 w-10" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-black tracking-tight text-foreground">MongoDB Ingestion</h1>
                        <p className="text-muted-foreground mt-1 font-medium">Coordinate document sampling and automated schema inference for clusters.</p>
                    </div>
                </div>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-6">
                    <Alert className="bg-amber-500/5 border-amber-500/20 rounded-2xl p-6 shadow-sm">
                        <ShieldAlert className="h-5 w-5 text-amber-500" />
                        <div className="ml-4 space-y-1">
                            <AlertTitle className="text-amber-700 font-black uppercase tracking-widest text-[10px]">Schemaless Architecture</AlertTitle>
                            <AlertDescription className="text-amber-600/80 font-medium text-sm leading-relaxed">
                                MongoDB ingestion utilizes <strong className="text-amber-700">statistical sampling</strong> to generate representative schema definitions from polymorphic document structures.
                            </AlertDescription>
                        </div>
                    </Alert>

                    <Card className="border shadow-lg bg-card/60 backdrop-blur-sm group overflow-hidden">
                        <CardHeader className="bg-muted/30 border-b pb-6 px-8">
                            <div className="flex items-center gap-3">
                                <Settings className="h-5 w-5 text-green-600" />
                                <CardTitle className="text-sm font-black uppercase tracking-widest text-muted-foreground/60">Cluster Topology</CardTitle>
                            </div>
                        </CardHeader>
                        <CardContent className="p-8 space-y-8">
                            <div className="space-y-3">
                                <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/70 ml-1">Stack Connection URI</Label>
                                <div className="relative">
                                    <Input
                                        placeholder="mongodb+srv://user:pass@cluster.mongodb.net/test"
                                        className="bg-muted/30 border-none h-14 focus-visible:ring-1 focus-visible:ring-green-500 font-mono text-xs rounded-xl px-5 pr-12"
                                    />
                                    <Lock className="absolute right-5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/20" />
                                </div>
                                <p className="text-[10px] font-bold text-muted-foreground/50 ml-1 italic">Identity credentials should be provided via SRV record or encoded string.</p>
                            </div>

                            <div className="space-y-3 pt-4 border-t border-muted/50">
                                <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/70 ml-1">Logical Namespace</Label>
                                <Input
                                    placeholder="production_catalog"
                                    className="bg-muted/30 border-none h-14 focus-visible:ring-1 focus-visible:ring-green-500 font-bold text-sm rounded-xl px-5 w-full md:w-2/3"
                                />
                            </div>

                            <div className="pt-8 space-y-6 border-t border-muted/50">
                                <div className="flex items-center justify-between">
                                    <div className="space-y-1">
                                        <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/70 ml-1">Sampling Depth</Label>
                                        <p className="text-[10px] font-medium text-muted-foreground/50 ml-1">Documents to sample per collection</p>
                                    </div>
                                    <Badge variant="outline" className="font-mono text-lg font-black tracking-tighter text-green-600 bg-green-500/5 px-4 py-1 border-green-500/20">
                                        {sampleSize[0]}
                                    </Badge>
                                </div>

                                <div className="px-2 pt-2">
                                    <Slider
                                        value={sampleSize}
                                        onValueChange={setSampleSize}
                                        max={5000}
                                        min={100}
                                        step={100}
                                        className="py-4"
                                    />
                                    <div className="flex justify-between mt-2 text-[10px] font-black text-muted-foreground/30 uppercase tracking-widest">
                                        <span>100</span>
                                        <span>Accurate Result / Performance Balanced</span>
                                        <span>5k</span>
                                    </div>
                                </div>
                            </div>

                            <div className="pt-10 flex flex-col sm:flex-row items-center justify-end gap-4 border-t border-muted/50">
                                <Button
                                    variant="ghost"
                                    className="h-12 px-8 font-black uppercase tracking-widest text-[10px] text-muted-foreground hover:bg-muted"
                                >
                                    Ping Cluster
                                </Button>
                                <Button
                                    className="h-12 px-10 bg-[#47A248] text-white hover:bg-green-700 rounded-xl font-black uppercase tracking-widest text-[10px] shadow-xl shadow-green-500/10 flex items-center gap-3 transition-all active:scale-95"
                                    onClick={() => toast.success("Inference Triggered", { description: "Launching shard-aware document sampling." })}
                                >
                                    <Zap className="h-4 w-4" />
                                    Run Schema Inference
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <div className="space-y-6">
                    <Card className="bg-muted/30 border-none shadow-none rounded-2xl overflow-hidden">
                        <CardHeader className="pb-2 bg-foreground/5">
                            <div className="flex items-center gap-2">
                                <FlaskConical className="h-4 w-4 text-green-500" />
                                <CardTitle className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/80">Inference Logic</CardTitle>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-5 p-6">
                            {[
                                { text: "BSON Type Analysis", status: "Enabled" },
                                { text: "Dynamic Schema Mapping", status: "Enabled" },
                                { text: "Polymorphic Detection", status: "Enabled" },
                                { text: "Sharded Read Bias", status: "Standard" },
                            ].map((item, i) => (
                                <div key={i} className="flex items-center justify-between">
                                    <span className="text-[11px] font-bold text-foreground/70">{item.text}</span>
                                    <span className={cn("text-[9px] font-black uppercase px-2 py-0.5 rounded-full border border-current", i < 3 ? "text-green-600/70 border-green-500/20" : "text-muted-foreground border-muted-foreground/20")}>
                                        {item.status}
                                    </span>
                                </div>
                            ))}
                        </CardContent>
                    </Card>

                    <Card className="border shadow-md bg-card/40 backdrop-blur-sm p-6 rounded-2xl group hover:border-green-500/30 transition-all">
                        <div className="flex items-center gap-2 mb-4">
                            <Layers className="h-4 w-4 text-indigo-500" />
                            <h4 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Atlas Connector</h4>
                        </div>
                        <p className="text-xs font-medium text-muted-foreground leading-relaxed italic group-hover:text-foreground/80 transition-colors">
                            "Full support for MongoDB Atlas serverless and dedicated clusters with zero-configuration schema discovery."
                        </p>
                    </Card>

                    <div className="flex justify-center opacity-10">
                        <Cpu className="h-12 w-12 text-muted-foreground" />
                    </div>
                </div>
            </div>

            <footer className="pt-8 flex items-center justify-center gap-4 text-[9px] text-muted-foreground/20 font-black uppercase tracking-[0.5em]">
                <span className="h-px w-8 bg-muted-foreground/10" />
                BSON Engine v5.0.2
                <span className="h-px w-8 bg-muted-foreground/10" />
            </footer>
        </div>
    );
};

export default MongoIngestion;
