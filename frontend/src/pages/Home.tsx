import React from 'react';
import {
    Activity,
    Database,
    LayoutDashboard,
    Plus,
    ArrowUpRight,
    History,
    HardDrive
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

const Home: React.FC = () => {
    const assetStats = [
        { type: 'Tables', count: 124, trend: '+12', color: 'bg-blue-500' },
        { type: 'Schemas', count: 18, trend: '+2', color: 'bg-indigo-500' },
        { type: 'Platforms', count: 4, trend: '0', color: 'bg-emerald-500' },
        { type: 'Connections', count: 32, trend: '+5', color: 'bg-amber-500' },
    ];

    const recentActivity = [
        { id: 1, user: 'Admin', action: 'Ingested schema', target: 'GCP-North-01', time: '2m ago', type: 'ingestion' },
        { id: 2, user: 'System', action: 'Connection verified', target: 'PostgreSQL-Main', time: '15m ago', type: 'system' },
        { id: 3, user: 'Operator', action: 'Modified metadata', target: 'Sales-Data-2024', time: '1h ago', type: 'update' },
        { id: 4, user: 'Admin', action: 'Added new platform', target: 'Snowflake-Retail', time: '3h ago', type: 'create' },
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
                        Analytics and activity monitoring for your Espedair Data Host.
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <Button className="rounded-xl font-bold shadow-lg shadow-primary/20">
                        <Plus className="mr-2 h-4 w-4" />
                        Register Asset
                    </Button>
                </div>
            </header>

            {/* Design Rule: Data Assets Cards */}
            <section className="space-y-4">
                <div className="flex items-center gap-3">
                    <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-500">
                        <Database className="h-4 w-4" />
                    </div>
                    <h2 className="text-sm font-bold uppercase tracking-tight text-muted-foreground">Data Assets</h2>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {assetStats.map((stat) => (
                        <Card key={stat.type} className="border-none shadow-sm bg-card hover:shadow-md transition-all group overflow-hidden relative">
                            <div className={`absolute top-0 left-0 w-1 h-full ${stat.color}`} />
                            <CardHeader className="pb-2">
                                <div className="flex justify-between items-start">
                                    <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">{stat.type}</p>
                                    {stat.trend !== '0' && (
                                        <Badge variant="secondary" className="bg-emerald-500/10 text-emerald-500 border-none font-bold text-[10px]">
                                            {stat.trend}
                                        </Badge>
                                    )}
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="text-3xl font-black tracking-tighter">{stat.count}</div>
                                <div className="mt-4 flex items-center text-[10px] text-muted-foreground font-bold group-hover:text-primary transition-colors cursor-pointer capitalize">
                                    View {stat.type} <ArrowUpRight className="ml-1 h-3 w-3" />
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </section>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Design Rule: Activity Card */}
                <Card className="lg:col-span-2 border-none shadow-sm overflow-hidden flex flex-col">
                    <CardHeader className="border-b bg-muted/20 pb-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <div className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-500">
                                    <Activity className="h-4 w-4" />
                                </div>
                                <CardTitle className="text-base font-black tracking-tight">Recent Activity</CardTitle>
                            </div>
                            <Button variant="ghost" size="sm" className="text-xs font-bold h-8">
                                <History className="mr-2 h-3.5 w-3.5" />
                                Full Audit Trail
                            </Button>
                        </div>
                    </CardHeader>
                    <CardContent className="p-0 flex-grow">
                        <div className="divide-y divide-border">
                            {recentActivity.map((log) => (
                                <div key={log.id} className="flex items-center gap-4 p-4 hover:bg-muted/30 transition-colors">
                                    <div className={cn(
                                        "w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border",
                                        log.type === 'ingestion' ? "bg-blue-500/5 text-blue-500 border-blue-100" :
                                            log.type === 'system' ? "bg-emerald-500/5 text-emerald-500 border-emerald-100" :
                                                "bg-muted text-muted-foreground"
                                    )}>
                                        <HardDrive className="h-5 w-5" />
                                    </div>
                                    <div className="flex-grow min-w-0">
                                        <div className="flex items-center gap-2">
                                            <span className="text-sm font-black text-foreground">{log.user}</span>
                                            <Badge variant="outline" className="text-[9px] h-4 font-bold border-muted-foreground/20 uppercase tracking-tighter">{log.type}</Badge>
                                        </div>
                                        <p className="text-xs text-muted-foreground truncate italic">
                                            {log.action} <span className="font-bold text-foreground not-italic">{log.target}</span>
                                        </p>
                                    </div>
                                    <div className="text-[10px] font-bold text-muted-foreground uppercase whitespace-nowrap bg-muted px-2 py-1 rounded">
                                        {log.time}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                {/* Quick Actions / Integration Status */}
                <Card className="border-none shadow-sm">
                    <CardHeader>
                        <CardTitle className="text-sm font-bold uppercase tracking-widest text-muted-foreground">Platform Connect</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="p-4 rounded-2xl bg-muted/40 border-2 border-dashed border-muted flex flex-col items-center text-center gap-3">
                            <div className="w-12 h-12 rounded-full bg-background flex items-center justify-center">
                                <Plus className="text-muted-foreground" />
                            </div>
                            <div className="space-y-1">
                                <p className="text-sm font-bold">New Platform</p>
                                <p className="text-[11px] text-muted-foreground">Setup GCP or AWS agents</p>
                            </div>
                            <Button variant="secondary" size="sm" className="w-full text-xs font-bold rounded-xl h-9">
                                Configuration
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default Home;

function cn(...classes: (string | boolean | undefined)[]) {
    return classes.filter(Boolean).join(' ');
}
