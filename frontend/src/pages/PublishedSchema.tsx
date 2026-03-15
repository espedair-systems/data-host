import React, { useState, useEffect } from 'react';
import {
    FileJson,
    RefreshCcw,
    Edit3,
    AlertCircle,
    Database,
    Clock,
    ShieldCheck,
    ShieldAlert,
    Server,
    Layers,
    Check,
    X,
    BarChart3
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from '@/components/ui/table';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";

interface PublishedAsset {
    name: string;
    hasSchema: boolean;
    hasCollections: boolean;
    schemaPath: string;
    collectionPath: string;
    lastModified: string;
    inDatabase: boolean;
    isValid: boolean;
    tableCount: number;
    relationCount: number;
    validationErrors?: string[];
}

const PublishedSchema: React.FC = () => {
    const [assets, setAssets] = useState<PublishedAsset[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const navigate = useNavigate();

    const fetchAssets = async () => {
        setLoading(true);
        try {
            const resp = await fetch('/api/site/published-data');
            if (!resp.ok) throw new Error('Failed to fetch published assets');
            const data = await resp.json();
            setAssets(data);
            setError(null);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAssets();
    }, []);

    const AssetTable = () => (
        <div className="rounded-xl border bg-card/50 overflow-hidden">
            <TooltipProvider>
                <Table>
                    <TableHeader className="bg-muted/50">
                        <TableRow>
                            <TableHead className="font-black text-[10px] uppercase tracking-widest px-6">Asset Name</TableHead>
                            <TableHead className="font-black text-[10px] uppercase tracking-widest text-center">Schema</TableHead>
                            <TableHead className="font-black text-[10px] uppercase tracking-widest text-center">Collection</TableHead>
                            <TableHead className="font-black text-[10px] uppercase tracking-widest text-center">Stats</TableHead>
                            <TableHead className="font-black text-[10px] uppercase tracking-widest text-center">Validation</TableHead>
                            <TableHead className="font-black text-[10px] uppercase tracking-widest text-center">Database</TableHead>
                            <TableHead className="font-black text-[10px] uppercase tracking-widest text-right px-6">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {assets.map((asset) => (
                            <TableRow key={asset.name} className="hover:bg-muted/30 transition-colors group">
                                <TableCell className="px-6 py-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                                            <Database className="h-4 w-4 text-primary" />
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="font-bold text-sm text-foreground">{asset.name}</span>
                                            <span className="text-[9px] text-muted-foreground/60 tabular-nums font-medium uppercase tracking-tighter">Updated {new Date(asset.lastModified).toLocaleDateString()}</span>
                                        </div>
                                    </div>
                                </TableCell>
                                <TableCell className="text-center">
                                    <div className="flex justify-center">
                                        {asset.hasSchema ? (
                                            <div className="w-6 h-6 rounded-full bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20">
                                                <Check className="h-3 w-3 text-emerald-600" />
                                            </div>
                                        ) : (
                                            <div className="w-6 h-6 rounded-full bg-slate-500/10 flex items-center justify-center border border-slate-500/20 opacity-30">
                                                <X className="h-3 w-3 text-slate-400" />
                                            </div>
                                        )}
                                    </div>
                                </TableCell>
                                <TableCell className="text-center">
                                    <div className="flex justify-center">
                                        {asset.hasCollections ? (
                                            <div className="w-6 h-6 rounded-full bg-purple-500/10 flex items-center justify-center border border-purple-500/20">
                                                <Check className="h-3 w-3 text-purple-600" />
                                            </div>
                                        ) : (
                                            <div className="w-6 h-6 rounded-full bg-slate-500/10 flex items-center justify-center border border-slate-500/20 opacity-30">
                                                <X className="h-3 w-3 text-slate-400" />
                                            </div>
                                        )}
                                    </div>
                                </TableCell>
                                <TableCell className="text-center">
                                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 hover:bg-slate-200 transition-colors cursor-default border border-slate-200">
                                        <BarChart3 className="h-3 w-3 text-slate-600" />
                                        <span className="text-[10px] font-black text-slate-700 uppercase tracking-tighter tabular-nums">
                                            {asset.tableCount}T / {asset.relationCount}R
                                        </span>
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <div className="flex justify-center">
                                        {asset.isValid ? (
                                            <Badge className="bg-emerald-500 text-white gap-1 px-3 py-1 rounded-full text-[10px] font-bold shadow-sm shadow-emerald-500/20 border-none">
                                                <ShieldCheck className="h-3 w-3" />
                                                Valid
                                            </Badge>
                                        ) : (
                                            <Tooltip>
                                                <TooltipTrigger>
                                                    <Badge className="bg-destructive text-white gap-1 px-3 py-1 rounded-full text-[10px] font-bold cursor-help animate-pulse">
                                                        <ShieldAlert className="h-3 w-3" />
                                                        Invalid
                                                    </Badge>
                                                </TooltipTrigger>
                                                <TooltipContent className="bg-destructive text-destructive-foreground p-3 rounded-xl border-none shadow-2xl max-w-xs ring-2 ring-destructive/20 outline-none">
                                                    <div className="space-y-2">
                                                        <p className="font-bold flex items-center gap-2 underline underline-offset-4">
                                                            <AlertCircle className="h-3 w-3" />
                                                            Validation Failures
                                                        </p>
                                                        <ul className="list-disc pl-4 text-[10px] font-medium leading-tight space-y-1">
                                                            {asset.validationErrors?.map((err, i) => (
                                                                <li key={i}>{err}</li>
                                                            ))}
                                                            {(!asset.validationErrors || asset.validationErrors.length === 0) && (
                                                                <li>Unknown validation error. Check server logs.</li>
                                                            )}
                                                        </ul>
                                                    </div>
                                                </TooltipContent>
                                            </Tooltip>
                                        )}
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <div className="flex justify-center">
                                        {asset.inDatabase ? (
                                            <Badge variant="outline" className="bg-emerald-500/5 text-emerald-600 border-emerald-500/20 gap-1.5 py-1 px-3 font-bold uppercase text-[9px] tracking-widest">
                                                <Server className="h-3 w-3" />
                                                Ingested
                                            </Badge>
                                        ) : (
                                            <Badge variant="outline" className="bg-amber-500/5 text-amber-600 border-amber-500/20 gap-1.5 py-1 px-3 italic font-bold uppercase text-[9px] tracking-widest">
                                                <Clock className="h-3 w-3" />
                                                Local Only
                                            </Badge>
                                        )}
                                    </div>
                                </TableCell>
                                <TableCell className="text-right px-6">
                                    <div className="flex justify-end gap-2">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="h-8 rounded-lg text-[10px] uppercase font-black tracking-widest gap-2 bg-card border-slate-200 hover:bg-primary hover:text-white hover:border-primary transition-all duration-300"
                                            onClick={() => navigate(`/publish/schema-data/edit/${asset.name}/schema.json`)}
                                        >
                                            <Edit3 className="h-3.5 w-3.5" />
                                            Deep Edit
                                        </Button>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TooltipProvider>
        </div>
    );

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <header className="flex flex-col gap-2">
                <div className="flex items-center gap-2 text-primary font-bold tracking-tight mb-1">
                    <FileJson className="h-5 w-5" />
                    <span className="text-xs uppercase tracking-widest">Astro Publication Layer</span>
                </div>
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-4xl font-black tracking-tight text-foreground italic uppercase">SCHEMA MANIFEST</h1>
                        <p className="text-muted-foreground text-lg italic">Raw metadata control center for external site publication.</p>
                    </div>
                    <div className="flex gap-3">
                        <Button variant="outline" className="gap-2 rounded-xl h-11 border-slate-200 bg-card hover:bg-muted font-bold text-xs" onClick={fetchAssets}>
                            <RefreshCcw className={loading ? "animate-spin h-4 w-4 text-primary" : "h-4 w-4 text-primary"} />
                            Re-Scan Repository
                        </Button>
                    </div>
                </div>
            </header>

            {error && (
                <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-2xl text-destructive text-sm font-bold flex items-center gap-3 animate-in slide-in-from-top-4">
                    <AlertCircle className="h-5 w-5" />
                    {error}
                </div>
            )}

            <Card className="border-none shadow-2xl bg-card/60 backdrop-blur-md rounded-3xl overflow-hidden animate-in zoom-in-95 duration-500 border border-white/20">
                <CardHeader className="pb-4 bg-muted/20 border-b border-white/10">
                    <div className="flex items-center justify-between">
                        <div>
                            <h3 className="text-xl font-black italic uppercase tracking-tighter flex items-center gap-2 text-foreground">
                                <Layers className="h-5 w-5 text-primary" />
                                Active Metadata Inventory
                            </h3>
                            <p className="italic font-bold text-muted-foreground/60 text-xs mt-1">
                                DIRECT DIRECTORY: ./data-services/data
                            </p>
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="flex flex-col items-end">
                                <span className="text-[10px] font-black uppercase text-muted-foreground">Orchestrated Assets</span>
                                <span className="text-2xl font-black italic tabular-nums text-primary">{assets.length}</span>
                            </div>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="p-6 pt-6">
                    <AssetTable />
                </CardContent>
            </Card>
        </div>
    );
};

export default PublishedSchema;
