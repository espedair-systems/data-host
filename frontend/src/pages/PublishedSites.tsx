import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Globe,
    FileText,
    HelpCircle,
    GraduationCap,
    Plus,
    Layout,
    Upload,
    RefreshCcw,
    Check,
    Layers,
    Server,
    Clock
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from '@/components/ui/table';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface SiteConfig {
    name: string;
    type?: string;
    description?: string;
    data_path: string;
    mount_path: string;
    mount_source?: string;
    mount_dist?: string;
    active: boolean;
    in_database?: boolean;
}

const SITE_TYPES = [
    { label: 'Landing', value: 'Landing', icon: Layout, color: 'text-blue-500', bg: 'bg-blue-500/10' },
    { label: 'Document', value: 'document', icon: FileText, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
    { label: 'Help', value: 'help', icon: HelpCircle, color: 'text-amber-500', bg: 'bg-amber-500/10' },
    { label: 'Training', value: 'Training', icon: GraduationCap, color: 'text-purple-500', bg: 'bg-purple-500/10' }
];

const PublishedSites: React.FC = () => {
    const navigate = useNavigate();
    const [sites, setSites] = useState<SiteConfig[]>([]);
    const [loading, setLoading] = useState(true);
    const [registering, setRegistering] = useState<string | null>(null);

    const handleRegister = async (site: SiteConfig) => {
        console.log('[SITE] Starting registration for:', site.name);
        setRegistering(site.name);
        try {
            const token = localStorage.getItem('token');
            const response = await fetch('/api/site/config', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': token ? `Bearer ${token}` : ''
                },
                body: JSON.stringify(site)
            });

            if (!response.ok) {
                const errorData = await response.json();
                console.error('[SITE] Registration failed:', errorData);
                throw new Error(errorData.error || errorData.message || 'Failed to register site');
            }

            const result = await response.json();
            console.log('[SITE] Registration success:', result);
            toast.success('Site Ingested', {
                description: `${site.name} details saved to database successfully.`
            });

            // Update local state and trigger refresh
            setSites(prev => prev.map(s =>
                s.name === site.name ? { ...s, in_database: true } : s
            ));

            // Optionally refetch to get enriched data
            fetchSites();
        } catch (err: any) {
            console.error('[SITE] Registration error:', err);
            toast.error('Registration Failed', {
                description: err.message
            });
        } finally {
            setRegistering(null);
        }
    };

    const fetchSites = async () => {
        setLoading(true);
        console.log('[SITE] Fetching inventory...');
        try {
            const response = await fetch('/api/site/config');
            if (!response.ok) throw new Error('Failed to fetch site configurations');
            const data = await response.json();
            console.log('[SITE] Inventory received:', data);
            setSites(data || []);
        } catch (err) {
            console.error('[SITE] Fetch error:', err);
            toast.error('Connection Error', {
                description: 'Could not load site configurations.'
            });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSites();
    }, []);

    const getTypeConfig = (typeName?: string) => {
        const type = SITE_TYPES.find(t => t.value.toLowerCase() === (typeName || '').toLowerCase());
        return type || { label: typeName || 'General', icon: Globe, color: 'text-slate-500', bg: 'bg-slate-500/10' };
    };

    const AssetTable = () => (
        <div className="rounded-xl border bg-card/50 overflow-hidden">
            <Table>
                <TableHeader className="bg-muted/50">
                    <TableRow className="hover:bg-transparent border-white/5">
                        <TableHead className="font-black text-[10px] uppercase tracking-widest px-8">Site Node</TableHead>
                        <TableHead className="font-black text-[10px] uppercase tracking-widest text-center">Type</TableHead>
                        <TableHead className="font-black text-[10px] uppercase tracking-widest">Metadata Context</TableHead>
                        <TableHead className="font-black text-[10px] uppercase tracking-widest text-center">Status</TableHead>
                        <TableHead className="font-black text-[10px] uppercase tracking-widest text-right px-8">Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {sites.map((site) => {
                        const typeConfig = getTypeConfig(site.type);
                        const TypeIcon = typeConfig.icon;

                        return (
                            <TableRow
                                key={site.name}
                                className="group border-white/5 hover:bg-white/[0.02] transition-all duration-300"
                            >
                                <TableCell className="px-8 py-4">
                                    <div className="flex items-center gap-5">
                                        <div className={cn("p-4 rounded-2xl shadow-inner border border-white/5 transition-transform group-hover:scale-110", typeConfig.bg)}>
                                            <TypeIcon className={cn("h-6 w-6", typeConfig.color)} />
                                        </div>
                                        <div className="flex flex-col gap-0.5">
                                            <span className="font-black italic uppercase tracking-tighter text-lg group-hover:text-primary transition-colors">
                                                {site.name}
                                            </span>
                                            <div className="flex items-center gap-2">
                                                <span className="text-[10px] font-mono opacity-40 uppercase tracking-tighter tabular-nums truncate max-w-[150px]">
                                                    {site.mount_path || '/'}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </TableCell>
                                <TableCell className="text-center">
                                    <Badge variant="secondary" className="rounded-lg font-black uppercase text-[8px] tracking-[0.2em] italic opacity-60">
                                        {typeConfig.label}
                                    </Badge>
                                </TableCell>
                                <TableCell>
                                    <div className="flex flex-col gap-1 max-w-[200px]">
                                        <span className="text-xs font-bold text-muted-foreground/80 line-clamp-1 italic uppercase tracking-tight">
                                            {site.description || 'System generated node endpoint.'}
                                        </span>
                                    </div>
                                </TableCell>
                                <TableCell className="text-center">
                                    <div className="flex flex-col items-center gap-2">
                                        {site.in_database ? (
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
                                        <Badge variant={site.active ? "default" : "outline"} className={cn("rounded-lg font-black uppercase text-[7px] tracking-widest px-2 py-0.5", site.active ? "bg-primary/10 text-primary border-primary/20" : "opacity-20")}>
                                            {site.active ? "Live" : "Standby"}
                                        </Badge>
                                    </div>
                                </TableCell>
                                <TableCell className="text-right px-8">
                                    <div className="flex justify-end gap-2">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            disabled={site.in_database || registering === site.name}
                                            className="h-8 rounded-lg text-[10px] uppercase font-black tracking-widest gap-2 bg-card border-emerald-200 text-emerald-700 hover:bg-emerald-600 hover:text-white hover:border-emerald-600 transition-all duration-300 disabled:opacity-40 disabled:cursor-not-allowed"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                if (!site.in_database) handleRegister(site);
                                            }}
                                        >
                                            {registering === site.name ? (
                                                <RefreshCcw className="h-3.5 w-3.5 animate-spin" />
                                            ) : site.in_database ? (
                                                <Check className="h-3.5 w-3.5" />
                                            ) : (
                                                <Upload className="h-3.5 w-3.5" />
                                            )}
                                            {site.in_database ? "Ingested" : "Load"}
                                        </Button>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="h-8 px-4 rounded-lg font-black uppercase text-[10px] tracking-widest gap-2 bg-card border-slate-200 hover:bg-primary hover:text-white hover:border-primary transition-all duration-300"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                navigate(`/publish/site/details?details=data/schema/${site.name}`);
                                            }}
                                        >
                                            <Layers className="h-3.5 w-3.5" />
                                            Access
                                        </Button>
                                    </div>
                                </TableCell>
                            </TableRow>
                        );
                    })}

                    {sites.length === 0 && !loading && (
                        <TableRow>
                            <TableCell colSpan={5} className="h-32 text-center">
                                <div className="flex flex-col items-center justify-center gap-2 text-muted-foreground italic">
                                    <Globe className="h-6 w-6 opacity-20" />
                                    <span className="text-sm font-bold uppercase tracking-widest opacity-40">No distribution nodes found</span>
                                </div>
                            </TableCell>
                        </TableRow>
                    )}
                </TableBody>
            </Table>
        </div>
    );

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <header className="flex flex-col gap-2">
                <div className="flex items-center gap-2 text-primary font-bold tracking-tight mb-1">
                    <Globe className="h-5 w-5" />
                    <span className="text-xs uppercase tracking-widest">Astro Infrastructure Layer</span>
                </div>
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-4xl font-black tracking-tight text-foreground italic uppercase">SITE INVENTORY</h1>
                        <p className="text-muted-foreground text-lg italic">Physical distribution nodes and ingestion status.</p>
                        <div className="mt-2 flex items-center gap-4">
                            <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20 h-7 px-4 rounded-lg font-black uppercase tracking-tighter tabular-nums">
                                {sites.length} Nodes Discovered
                            </Badge>
                            {loading && (
                                <span className="text-[10px] font-bold text-primary animate-pulse uppercase tracking-widest flex items-center gap-2">
                                    <RefreshCcw className="h-3 w-3 animate-spin" />
                                    Scanning...
                                </span>
                            )}
                        </div>
                    </div>
                    <div className="flex gap-3">
                        <Button variant="outline" className="gap-2 rounded-xl h-11 border-slate-200 bg-card hover:bg-muted font-bold text-xs">
                            <Plus className="h-4 w-4" />
                            Configure Node
                        </Button>
                        <Button variant="outline" className="gap-2 rounded-xl h-11 border-slate-200 bg-card hover:bg-muted font-bold text-xs" onClick={fetchSites}>
                            <RefreshCcw className={loading ? "animate-spin h-4 w-4 text-primary" : "h-4 w-4 text-primary"} />
                            Re-Scan Inventory
                        </Button>
                    </div>
                </div>
            </header>

            <Card className="border-none shadow-2xl bg-card/60 backdrop-blur-md rounded-3xl overflow-hidden animate-in zoom-in-95 duration-500 border border-white/20">
                <CardHeader className="pb-4 bg-muted/20 border-b border-white/10">
                    <div className="flex items-center justify-between">
                        <div>
                            <h3 className="text-xl font-black italic uppercase tracking-tighter flex items-center gap-2 text-foreground">
                                <Layers className="h-5 w-5 text-primary" />
                                Distribution Node Inventory
                            </h3>
                            <p className="italic font-bold text-muted-foreground/60 text-xs mt-1">
                                ACTIVE INFRASTRUCTURE: ./sites
                            </p>
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="flex flex-col items-end">
                                <span className="text-[10px] font-black uppercase text-muted-foreground">Network Nodes</span>
                                <span className="text-2xl font-black italic tabular-nums text-primary">{sites.length}</span>
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

export default PublishedSites;
