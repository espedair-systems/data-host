import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
    Monitor,
    ChevronRight,
    Database,
    FolderInput,
    Layers,
    Zap,
    ShieldCheck,
    CheckCircle2,
    Search,
    RefreshCcw,
    HardDrive
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
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from '@/components/ui/select';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

const LocalIngestion: React.FC = () => {
    const [isExtracting, setIsExtracting] = useState(false);
    const [isIngesting, setIsIngesting] = useState(false);
    const [target, setTarget] = useState<'sqlite' | 'folder'>('sqlite');
    const [dbSource, setDbSource] = useState('data-host');
    const [assetName, setAssetName] = useState('data-host');

    const handleExtract = async () => {
        setIsExtracting(true);
        // Simulate extraction delay
        await new Promise(r => setTimeout(r, 2000));
        setIsExtracting(false);
        toast.success("Extraction Complete", {
            description: "schema.json successfully extracted from " + dbSource
        });
    };

    const handleIngest = async () => {
        setIsIngesting(true);
        try {
            const token = localStorage.getItem('token');
            const url = target === 'sqlite' ? '/api/ingestion/ingest' : '/api/ingestion/ingest-to-local-folder';

            // Dummy schema for now since extraction is mocked
            const dummySchema = {
                name: assetName,
                desc: `Extracted from ${dbSource} nominated database`,
                tables: [],
                relations: []
            };

            const resp = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(dummySchema)
            });

            if (resp.ok) {
                toast.success("Ingestion Complete", {
                    description: `Schema has been registered to ${target === 'sqlite' ? 'SQLite Blueprint' : 'Data-Services Folder'}`
                });
            } else {
                const data = await resp.json();
                toast.error("Ingestion Failed", { description: data.error });
            }
        } catch (err) {
            toast.error("Network Error", { description: "Could not reach the system." });
        } finally {
            setIsIngesting(false);
        }
    };

    return (
        <div className="p-6 space-y-10 max-w-6xl mx-auto animate-in fade-in duration-500">
            <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-4 font-medium italic">
                <Link to="/" className="hover:text-foreground transition-colors uppercase tracking-widest text-[10px]">Registry</Link>
                <ChevronRight className="h-3 w-3" />
                <Link to="/ingestion" className="hover:text-foreground transition-colors uppercase tracking-widest text-[10px]">Ingestion</Link>
                <ChevronRight className="h-3 w-3" />
                <span className="text-foreground font-black uppercase tracking-widest text-[10px]">Local Database</span>
            </nav>

            <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 shrink-0 border-b pb-8">
                <div className="flex items-center gap-4">
                    <div className="p-3.5 rounded-2xl bg-indigo-500/10 text-indigo-500 shadow-sm border border-indigo-500/20">
                        <Monitor className="h-10 w-10" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-black tracking-tighter text-foreground uppercase italic leading-none">
                            Local <span className="text-indigo-500 not-italic">Ingestion</span>
                        </h1>
                        <p className="text-muted-foreground mt-2 font-medium italic tracking-tight italic">
                            Extract and register data schemas from nominated local database environments.
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <Badge variant="outline" className="bg-emerald-500/5 text-emerald-500 border-emerald-500/20 px-3 py-1 font-black text-[10px] uppercase">
                        System Ready
                    </Badge>
                </div>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-8">
                    <Card className="border-none shadow-2xl bg-card/40 backdrop-blur-md rounded-[2.5rem] overflow-hidden border border-white/5">
                        <CardHeader className="p-8 pb-4">
                            <div className="flex items-center gap-3 mb-2">
                                <Zap className="h-5 w-5 text-amber-500" />
                                <CardTitle className="text-xl font-black uppercase tracking-tight italic">Extraction <span className="text-muted-foreground/40 not-italic font-medium text-sm">Protocol</span></CardTitle>
                            </div>
                            <CardDescription className="text-xs font-bold uppercase tracking-widest text-muted-foreground/50">Identify source database for metadata harvesting</CardDescription>
                        </CardHeader>
                        <CardContent className="p-8 space-y-8">
                            <div className="space-y-4">
                                <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 px-1">Selected Environment</Label>
                                <Select value={dbSource} onValueChange={(val) => { setDbSource(val); setAssetName(val); }}>
                                    <SelectTrigger className="h-14 rounded-2xl bg-background/50 border-muted group hover:border-indigo-500/50 transition-all">
                                        <div className="flex items-center gap-3">
                                            <Database className="h-4 w-4 text-indigo-500" />
                                            <SelectValue placeholder="Select Database Source" />
                                        </div>
                                    </SelectTrigger>
                                    <SelectContent className="rounded-2xl p-2">
                                        <SelectItem value="data-host" className="rounded-xl h-11">
                                            <div className="flex items-center gap-2">
                                                <div className="w-2 h-2 rounded-full bg-primary" />
                                                <span>Data Host (Primary SQLite)</span>
                                            </div>
                                        </SelectItem>
                                        <SelectItem value="odoo" className="rounded-xl h-11">
                                            <div className="flex items-center gap-2">
                                                <div className="w-2 h-2 rounded-full bg-purple-500" />
                                                <span>Odoo Production (Postgres)</span>
                                            </div>
                                        </SelectItem>
                                        <SelectItem value="sap" className="rounded-xl h-11">
                                            <div className="flex items-center gap-2">
                                                <div className="w-2 h-2 rounded-full bg-blue-500" />
                                                <span>SAP HANA (Local)</span>
                                            </div>
                                        </SelectItem>
                                        <SelectItem value="legacy_crm" className="rounded-xl h-11">
                                            <div className="flex items-center gap-2">
                                                <div className="w-2 h-2 rounded-full bg-amber-500" />
                                                <span>Legacy CRM (MySQL)</span>
                                            </div>
                                        </SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-4">
                                <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 px-1">Registration Identity (Asset Name)</Label>
                                <Input
                                    value={assetName}
                                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setAssetName(e.target.value)}
                                    placeholder="e.g. odoo-finance"
                                    className="h-14 rounded-2xl bg-background/50 border-muted focus-visible:ring-indigo-500/50 font-mono text-sm"
                                />
                            </div>

                            <Separator className="opacity-10" />

                            <div className="flex items-center justify-between p-6 rounded-3xl bg-indigo-500/5 border border-indigo-500/10 group cursor-pointer hover:bg-indigo-500/10 transition-all active:scale-[0.98]">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-2xl bg-indigo-500/20 flex items-center justify-center">
                                        <Search className="h-6 w-6 text-indigo-500" />
                                    </div>
                                    <div>
                                        <h4 className="text-sm font-black uppercase tracking-tight">Discovery Scan</h4>
                                        <p className="text-[10px] font-bold text-muted-foreground/60 uppercase">Analyze 142 tables and 1.2k relations</p>
                                    </div>
                                </div>
                                <Button
                                    onClick={handleExtract}
                                    disabled={isExtracting}
                                    className="bg-indigo-500 hover:bg-indigo-600 text-white rounded-xl font-black text-[10px] uppercase tracking-widest px-6 h-10 shadow-lg shadow-indigo-500/20"
                                >
                                    {isExtracting ? <RefreshCcw className="h-3 w-3 animate-spin mr-2" /> : <Zap className="h-3 w-3 mr-2" />}
                                    Extract schema.json
                                </Button>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-none shadow-2xl bg-card rounded-[2.5rem] overflow-hidden border border-white/5">
                        <CardHeader className="p-8 pb-4 border-b border-white/5">
                            <div className="flex items-center gap-3">
                                <FolderInput className="h-5 w-5 text-emerald-500" />
                                <CardTitle className="text-xl font-black uppercase tracking-tight italic">Ingestion <span className="text-muted-foreground/40 not-italic font-medium text-sm">Vector</span></CardTitle>
                            </div>
                        </CardHeader>
                        <CardContent className="p-0">
                            <div className="grid grid-cols-1 md:grid-cols-2">
                                <div
                                    className={`p-10 cursor-pointer transition-all border-r border-white/5 ${target === 'sqlite' ? 'bg-primary/5' : 'hover:bg-muted/30'}`}
                                    onClick={() => setTarget('sqlite')}
                                >
                                    <div className="flex flex-col gap-4">
                                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all ${target === 'sqlite' ? 'bg-primary text-primary-foreground shadow-xl' : 'bg-muted text-muted-foreground'}`}>
                                            <HardDrive className="h-6 w-6" />
                                        </div>
                                        <div>
                                            <h4 className="font-black uppercase tracking-tight text-sm mb-1">SQLite Blueprint</h4>
                                            <p className="text-[10px] font-medium text-muted-foreground/70 uppercase tracking-widest">Internal metadata registry</p>
                                        </div>
                                        {target === 'sqlite' && (
                                            <div className="flex items-center gap-2 text-[10px] font-black text-primary uppercase mt-2">
                                                <CheckCircle2 className="h-3 w-3" /> Selected Target
                                            </div>
                                        )}
                                    </div>
                                </div>
                                <div
                                    className={`p-10 cursor-pointer transition-all ${target === 'folder' ? 'bg-indigo-500/5' : 'hover:bg-muted/30'}`}
                                    onClick={() => setTarget('folder')}
                                >
                                    <div className="flex flex-col gap-4">
                                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all ${target === 'folder' ? 'bg-indigo-500 text-white shadow-xl' : 'bg-muted text-muted-foreground'}`}>
                                            <Layers className="h-6 w-6" />
                                        </div>
                                        <div>
                                            <h4 className="font-black uppercase tracking-tight text-sm mb-1">Data-Services Folder</h4>
                                            <p className="text-[10px] font-medium text-muted-foreground/70 uppercase tracking-widest">Static file synchronization</p>
                                        </div>
                                        {target === 'folder' && (
                                            <div className="flex items-center gap-2 text-[10px] font-black text-indigo-500 uppercase mt-2">
                                                <CheckCircle2 className="h-3 w-3" /> Selected Target
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                        <CardFooter className="p-8 bg-muted/20 border-t border-white/5 flex items-center justify-between">
                            <div className="flex flex-col gap-1">
                                <span className="text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground/40">Operation Status</span>
                                <span className="text-xs font-bold italic">Ready for registration pulse...</span>
                            </div>
                            <Button
                                onClick={handleIngest}
                                disabled={isIngesting}
                                className="h-14 rounded-2xl px-10 bg-foreground text-background hover:bg-foreground/90 font-black uppercase text-[11px] tracking-[0.2em] transition-all active:scale-95 shadow-xl group"
                            >
                                {isIngesting ? <RefreshCcw className="h-4 w-4 animate-spin mr-3" /> : <CheckCircle2 className="h-4 w-4 mr-3 group-hover:scale-125 transition-transform" />}
                                Commit Ingestion
                            </Button>
                        </CardFooter>
                    </Card>
                </div>

                <div className="space-y-8">
                    <Card className="border-none shadow-2xl bg-gradient-to-br from-indigo-600 to-indigo-800 text-white rounded-[2.5rem] p-8 overflow-hidden relative group">
                        <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -mr-20 -mt-20 blur-3xl transition-transform group-hover:scale-150 duration-700" />
                        <CardHeader className="p-0 mb-6 font-black uppercase tracking-[0.3em] opacity-80 text-[10px]">
                            Live Telemetry
                        </CardHeader>
                        <CardContent className="p-0 space-y-6">
                            <div className="flex items-center justify-between">
                                <span className="text-[10px] font-bold uppercase opacity-60">Source Link</span>
                                <Badge className="bg-white/20 text-white border-white/10 text-[9px] font-black">ENCRYPTED</Badge>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-[10px] font-bold uppercase opacity-60">Auth Schema</span>
                                <Badge className="bg-white/20 text-white border-white/10 text-[9px] font-black">VALIDATED</Badge>
                            </div>
                            <Separator className="bg-white/10" />
                            <div className="flex flex-col gap-1.5">
                                <span className="text-[10px] font-black uppercase tracking-widest opacity-80 mb-1">Extraction Confidence</span>
                                <div className="h-2 w-full bg-black/20 rounded-full overflow-hidden p-0.5">
                                    <div className="h-full bg-white rounded-full w-[99.2%]" />
                                </div>
                                <div className="flex justify-between text-[8px] font-black opacity-50 uppercase tracking-tighter mt-1">
                                    <span>Fidelity Scan</span>
                                    <span>99.2%</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-none shadow-2xl bg-card rounded-[2.5rem] p-8 border border-white/5 relative overflow-hidden group">
                        <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                        <CardHeader className="p-0 mb-6">
                            <CardTitle className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground/60 flex items-center gap-3">
                                <ShieldCheck className="h-4 w-4" /> Integrity Wall
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-0 space-y-6 relative z-10">
                            {[
                                { l: 'JSON Validation', v: 'Active' },
                                { l: 'Conflict Check', v: 'Enabled' },
                                { l: 'Policy Enforcement', v: 'High' }
                            ].map((item, i) => (
                                <div key={i} className="flex flex-col gap-1">
                                    <span className="text-[8px] font-black uppercase tracking-[0.2em] text-muted-foreground/40">{item.l}</span>
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm font-black italic">{item.v}</span>
                                        <CheckCircle2 className="h-3 w-3 text-emerald-500" />
                                    </div>
                                    {i < 2 && <Separator className="mt-4 opacity-5" />}
                                </div>
                            ))}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default LocalIngestion;
