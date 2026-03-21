import React, { useEffect, useState } from 'react';
import {
    Database,
    LayoutDashboard,
    Plus,
    ArrowUpRight,
    Globe,
    Layers,
    Table as TableIcon,
    Shield,
    Server
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useNavigate } from 'react-router-dom';

interface PublishedAsset {
    name: string;
    internalName: string;
    hasSchema: boolean;
    tableCount: number;
    relationCount: number;
    inDatabase: boolean;
    lastModified: string;
}

interface SiteConfig {
    name: string;
    type: string;
    description: string;
    mount_path: string;
    active: boolean;
}

const Home: React.FC = () => {
    const navigate = useNavigate();
    const [assets, setAssets] = useState<PublishedAsset[]>([]);
    const [sites, setSites] = useState<SiteConfig[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [assetsRes, sitesRes] = await Promise.all([
                    fetch('/api/site/published-data'),
                    fetch('/api/site/config')
                ]);
                
                if (assetsRes.ok) {
                    const data = await assetsRes.json();
                    setAssets(data || []);
                }
                
                if (sitesRes.ok) {
                    const data = await sitesRes.json();
                    setSites(data || []);
                }
            } catch (error) {
                console.error('Error fetching dashboard data:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    const totalTables = assets.reduce((acc, curr) => acc + (curr.tableCount || 0), 0);
    const totalRelations = assets.reduce((acc, curr) => acc + (curr.relationCount || 0), 0);

    const assetStats = [
        { type: 'Tables', count: totalTables, label: 'Registered Tables', color: 'bg-blue-500', icon: <TableIcon className="h-4 w-4" /> },
        { type: 'Assets', count: assets.length, label: 'Data Registry Assets', color: 'bg-indigo-500', icon: <Layers className="h-4 w-4" /> },
        { type: 'Sites', count: sites.length, label: 'Mounted Site Nodes', color: 'bg-emerald-500', icon: <Globe className="h-4 w-4" /> },
        { type: 'Relations', count: totalRelations, label: 'Schema Relations', color: 'bg-amber-500', icon: <Shield className="h-4 w-4" /> },
    ];

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-1">
                    <div className="flex items-center gap-2 text-primary font-black uppercase tracking-widest text-[10px]">
                        <LayoutDashboard className="h-3 w-3" />
                        Control Center
                    </div>
                    <h1 className="text-4xl font-black tracking-tight">System Overview</h1>
                    <p className="text-muted-foreground text-lg">
                        Operational intelligence and registry management for Espedair Data Host.
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <Button onClick={() => navigate('/ingestion/local')} className="rounded-xl font-bold shadow-lg shadow-primary/20">
                        <Plus className="mr-2 h-4 w-4" />
                        Register Asset
                    </Button>
                </div>
            </header>

            {/* Data Assets Summary Stats */}
            <section className="space-y-4">
                <div className="flex items-center gap-3">
                    <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-500">
                        <Database className="h-4 w-4" />
                    </div>
                    <h2 className="text-sm font-bold uppercase tracking-tight text-muted-foreground">System Health</h2>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {assetStats.map((stat) => (
                        <Card key={stat.type} className="border-none shadow-sm bg-card hover:shadow-md transition-all group overflow-hidden relative">
                            <div className={`absolute top-0 left-0 w-1 h-full ${stat.color}`} />
                            <CardHeader className="pb-2">
                                <div className="flex justify-between items-start">
                                    <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">{stat.type}</p>
                                    <div className="text-muted-foreground/30">{stat.icon}</div>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="text-3xl font-black tracking-tighter">{loading ? '...' : stat.count}</div>
                                <div className="mt-1 text-[10px] text-muted-foreground font-bold font-mono">
                                    {stat.label}
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </section>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Registry Assets List */}
                <Card className="lg:col-span-2 border-none shadow-sm overflow-hidden flex flex-col">
                    <CardHeader className="border-b bg-muted/20 pb-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <div className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-500">
                                    <Layers className="h-4 w-4" />
                                </div>
                                <CardTitle className="text-base font-black tracking-tight">Registry Assets</CardTitle>
                            </div>
                            <Button onClick={() => navigate('/publish/schema')} variant="ghost" size="sm" className="text-xs font-bold h-8">
                                <ArrowUpRight className="mr-2 h-3.5 w-3.5" />
                                Manage Registry
                            </Button>
                        </div>
                    </CardHeader>
                    <CardContent className="p-0 flex-grow">
                        {assets.length === 0 ? (
                            <div className="p-8 text-center text-muted-foreground">
                                <p className="text-sm font-bold italic">No assets registered in the system registry.</p>
                                <Button onClick={() => navigate('/ingestion/local')} variant="outline" size="sm" className="mt-4 rounded-xl font-bold">
                                    Start Ingestion
                                </Button>
                            </div>
                        ) : (
                            <div className="divide-y divide-border">
                                {assets.map((asset) => (
                                    <div key={asset.name} className="flex items-center gap-4 p-4 hover:bg-muted/30 transition-colors">
                                        <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border bg-blue-500/5 text-blue-500 border-blue-100">
                                            <Database className="h-5 w-5" />
                                        </div>
                                        <div className="flex-grow min-w-0">
                                            <div className="flex items-center gap-2">
                                                <span className="text-sm font-black text-foreground">{asset.internalName || asset.name}</span>
                                                {asset.inDatabase && (
                                                    <Badge variant="secondary" className="bg-emerald-500/10 text-emerald-500 border-none font-bold text-[8px] uppercase tracking-tighter">
                                                        Indexed
                                                    </Badge>
                                                )}
                                            </div>
                                            <p className="text-[10px] text-muted-foreground font-bold uppercase">
                                                {asset.tableCount} Tables • {asset.relationCount} Relations
                                            </p>
                                        </div>
                                        <div className="text-[10px] font-bold text-muted-foreground uppercase whitespace-nowrap bg-muted px-2 py-1 rounded">
                                            {asset.lastModified ? new Date(asset.lastModified).toLocaleDateString() : 'N/A'}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Site Mounts List */}
                <Card className="border-none shadow-sm overflow-hidden flex flex-col">
                    <CardHeader className="border-b bg-muted/20 pb-4">
                        <div className="flex items-center gap-2">
                            <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-500">
                                <Globe className="h-4 w-4" />
                            </div>
                            <CardTitle className="text-base font-black tracking-tight">Active Sites</CardTitle>
                        </div>
                    </CardHeader>
                    <CardContent className="p-0 flex-grow">
                        {sites.length === 0 ? (
                            <div className="p-8 text-center text-muted-foreground">
                                <p className="text-sm font-bold italic">No sites configured.</p>
                            </div>
                        ) : (
                            <div className="divide-y divide-border">
                                {sites.map((site) => (
                                    <div key={site.name} className="p-4 hover:bg-muted/30 transition-colors space-y-2">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <Server className="h-3 w-3 text-muted-foreground" />
                                                <span className="text-xs font-black text-foreground">{site.name}</span>
                                            </div>
                                            {site.active && <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />}
                                        </div>
                                        <div className="flex flex-col gap-1">
                                            <div className="text-[10px] text-muted-foreground font-bold uppercase flex items-center gap-1">
                                                Type: <span className="text-foreground">{site.type || 'Standard'}</span>
                                            </div>
                                            <div className="text-[10px] text-muted-foreground font-bold uppercase truncate">
                                                Path: <span className="text-blue-500 lowercase">{site.mount_path || '/'}</span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default Home;
