import React, { useEffect, useState } from 'react';
import { Layers, Database, Table, HardDrive, RefreshCcw, Activity } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';

interface TableStat {
    name: string;
    rows: number;
}

interface DatabaseStats {
    tables: TableStat[];
    size: number;
    version: string;
}

const CuratePage: React.FC = () => {
    const [stats, setStats] = useState<DatabaseStats | null>(null);
    const [loading, setLoading] = useState(true);

    const fetchStats = async () => {
        setLoading(true);
        try {
            const resp = await fetch('/api/database/stats');
            if (resp.ok) {
                const data = await resp.json();
                setStats(data);
            }
        } catch (err) {
            console.error('Failed to fetch DB stats:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchStats();
    }, []);

    const formatSize = (bytes: number) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    return (
        <div className="p-6 space-y-8 animate-in fade-in duration-500">
            <header className="flex flex-col gap-2">
                <div className="flex items-center justify-between">
                    <div className="flex flex-col gap-2">
                        <div className="flex items-center gap-2 text-primary font-bold tracking-tight mb-1">
                            <Layers className="h-5 w-5" />
                            <span className="text-xs uppercase tracking-widest">Curation Engine</span>
                        </div>
                        <h1 className="text-4xl font-black tracking-tight text-foreground text-shadow-sm">System Insights</h1>
                        <p className="text-muted-foreground text-lg">Monitoring internal SQLite state and data inventory.</p>
                    </div>
                    <Button
                        onClick={fetchStats}
                        disabled={loading}
                        variant="outline"
                        className="rounded-2xl gap-2 h-12 px-6 border-primary/20 hover:bg-primary/5 transition-all active:scale-95"
                    >
                        <RefreshCcw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                        Refresh Stats
                    </Button>
                </div>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Card className="border-none shadow-2xl bg-primary/5 rounded-[40px] p-8 border border-primary/10 relative overflow-hidden backdrop-blur-xl">
                            <div className="absolute -top-10 -right-10 w-32 h-32 bg-primary/10 rounded-full blur-[60px]" />
                            <CardHeader className="p-0 mb-6">
                                <CardTitle className="text-[10px] font-bold uppercase tracking-[0.3em] text-primary flex items-center gap-3">
                                    <HardDrive className="h-4 w-4" /> Physical Capacity
                                </CardTitle>
                            </CardHeader>
                            <div className="flex flex-col gap-2">
                                <span className="text-5xl font-black tracking-tighter tabular-nums">
                                    {stats ? formatSize(stats.size) : '--'}
                                </span>
                                <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Post-Compaction Storage</p>
                            </div>
                        </Card>

                        <Card className="border-none shadow-2xl bg-card rounded-[40px] p-8 border border-white/5 relative overflow-hidden">
                            <CardHeader className="p-0 mb-6">
                                <CardTitle className="text-[10px] font-bold uppercase tracking-[0.3em] text-muted-foreground/60 flex items-center gap-3">
                                    <Activity className="h-4 w-4 opacity-50" /> Object Inventory
                                </CardTitle>
                            </CardHeader>
                            <div className="flex flex-col gap-2">
                                <span className="text-5xl font-black tracking-tighter tabular-nums">
                                    {stats?.tables.length || 0}
                                </span>
                                <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Active System Tables</p>
                            </div>
                        </Card>
                    </div>

                    <Card className="border-none shadow-2xl bg-card/50 backdrop-blur-md rounded-[40px] border border-white/5 overflow-hidden">
                        <CardHeader className="p-8 border-b border-white/5">
                            <div className="flex items-center justify-between">
                                <div>
                                    <CardTitle className="text-xl font-black uppercase tracking-tight mb-1">Schema Registry</CardTitle>
                                    <CardDescription className="text-[10px] font-bold uppercase tracking-widest">Internal database table metrics</CardDescription>
                                </div>
                                <Badge variant="outline" className="rounded-full px-4 py-1 bg-primary/10 text-primary border-primary/20 font-black text-[10px]">
                                    SQLITE v{stats?.version || '3.x'}
                                </Badge>
                            </div>
                        </CardHeader>
                        <CardContent className="p-0">
                            <ScrollArea className="h-[500px]">
                                <div className="divide-y divide-white/5">
                                    {loading ? (
                                        <div className="p-20 text-center space-y-4">
                                            <RefreshCcw className="h-8 w-8 animate-spin mx-auto text-primary/40" />
                                            <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground/60">Retrieving system metrics...</p>
                                        </div>
                                    ) : (
                                        stats?.tables.map((table, idx) => (
                                            <div key={idx} className="flex items-center justify-between p-6 hover:bg-primary/5 transition-all group cursor-default">
                                                <div className="flex items-center gap-5">
                                                    <div className="w-12 h-12 rounded-2xl bg-muted/50 flex items-center justify-center text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary transition-all shadow-inner border border-white/5">
                                                        <Table className="h-6 w-6" />
                                                    </div>
                                                    <div className="flex flex-col">
                                                        <span className="text-sm font-black uppercase tracking-tight text-foreground/90">{table.name}</span>
                                                        <span className="text-[9px] font-bold text-muted-foreground/40 uppercase tracking-[0.2em]">Core Relation</span>
                                                    </div>
                                                </div>
                                                <div className="flex flex-col items-end gap-1">
                                                    <span className="text-xl font-black tabular-nums tracking-tighter">
                                                        {table.rows.toLocaleString()}
                                                    </span>
                                                    <span className="text-[8px] font-black uppercase tracking-widest text-muted-foreground/30">Total Rows</span>
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </ScrollArea>
                        </CardContent>
                    </Card>
                </div>

                <div className="space-y-8">
                    <Card className="border-none shadow-2xl bg-primary text-primary-foreground rounded-[40px] p-8 overflow-hidden relative group overflow-hidden">
                        <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -mr-20 -mt-20 blur-3xl transition-transform group-hover:scale-150 duration-700" />
                        <CardHeader className="p-0 mb-8">
                            <CardTitle className="text-xs font-black uppercase tracking-[0.3em] opacity-80 flex items-center gap-2">
                                <Database className="h-4 w-4" /> Integrity Status
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-0 space-y-8">
                            <div className="space-y-3">
                                <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest opacity-70">
                                    <span>Sync Health</span>
                                    <span>98.4%</span>
                                </div>
                                <div className="h-4 w-full bg-black/20 rounded-2xl overflow-hidden p-1 shadow-inner">
                                    <div className="h-full bg-white rounded-xl w-[98.4%] shadow-lg" />
                                </div>
                            </div>
                            <Button className="w-full bg-white text-primary hover:bg-white/90 font-black uppercase text-[11px] tracking-[0.2em] h-14 rounded-2xl transition-all active:scale-95 shadow-xl">
                                Compact Database
                            </Button>
                        </CardContent>
                    </Card>

                    <Card className="border-none shadow-2xl bg-card rounded-[40px] p-8 border border-white/5">
                        <CardHeader className="p-0 mb-6 border-b border-white/5 pb-4">
                            <CardTitle className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground/60 flex items-center gap-3">
                                <Activity className="h-4 w-4 opacity-50" /> System Metrics
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-0 space-y-6">
                            {[
                                { label: 'Active Buffers', val: '2.4 MB' },
                                { label: 'Index Coverage', val: '100.0%' },
                                { label: 'Query Cache', val: 'Hit' }
                            ].map((m, i) => (
                                <div key={i} className="flex flex-col gap-1">
                                    <span className="text-[8px] font-black uppercase tracking-[0.2em] text-muted-foreground/40">{m.label}</span>
                                    <span className="text-sm font-black tracking-tight">{m.val}</span>
                                    {i < 2 && <Separator className="mt-4 opacity-20" />}
                                </div>
                            ))}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default CuratePage;
