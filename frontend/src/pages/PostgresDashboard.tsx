import React from 'react';
import { Link } from 'react-router-dom';
import {
    Database,
    History,
    CheckCircle2,
    AlertCircle,
    ChevronRight,
    Activity,
    Terminal,
    ShieldCheck,
    Layers,
    ExternalLink
} from 'lucide-react';
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const PostgresDashboard: React.FC = () => {
    const stats = [
        { label: 'Ingested Tables', value: '284', icon: <Layers className="h-4 w-4 text-blue-500" /> },
        { label: 'Active Databases', value: '12', icon: <Database className="h-4 w-4 text-indigo-500" /> },
        { label: 'Schemas Exported', value: '38', icon: <Terminal className="h-4 w-4 text-emerald-500" /> },
        { label: 'Last Scan', value: '1h ago', icon: <Activity className="h-4 w-4 text-muted-foreground" /> }
    ];

    const recentActivity = [
        { db: 'analytics_dw', schema: 'public', status: 'success', time: '2026-03-08 16:45' },
        { db: 'users_service', schema: 'auth', status: 'success', time: '2026-03-08 14:10' },
        { db: 'order_service', schema: 'staging', status: 'error', time: '2026-03-08 11:20' }
    ];

    return (
        <div className="p-6 space-y-10 max-w-7xl mx-auto animate-in fade-in duration-500">
            <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-4 font-medium">
                <Link to="/" className="hover:text-foreground transition-colors">Registry</Link>
                <ChevronRight className="h-4 w-4" />
                <Link to="/ingestion" className="hover:text-foreground transition-colors">Ingestion</Link>
                <ChevronRight className="h-4 w-4" />
                <span className="text-foreground font-bold text-indigo-500">Postgres Dashboard</span>
            </nav>

            <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 shrink-0 border-b pb-8">
                <div className="flex items-center gap-4">
                    <div className="p-3.5 rounded-2xl bg-indigo-500/10 text-indigo-600 shadow-sm border border-indigo-500/20">
                        <Database className="h-10 w-10" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-black tracking-tight text-foreground">PostgreSQL</h1>
                        <p className="text-muted-foreground mt-1 font-medium">Coordinate metadata discovery across relational clusters.</p>
                    </div>
                </div>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((stat) => (
                    <Card key={stat.label} className="border-none shadow-sm bg-muted/30 group hover:shadow-md transition-all">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">
                                {stat.label}
                            </CardTitle>
                            {stat.icon}
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-black tracking-tighter text-foreground group-hover:text-primary transition-colors">
                                {stat.value}
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <Card className="lg:col-span-2 border shadow-lg bg-card/60 backdrop-blur-sm shadow-indigo-500/5">
                    <CardHeader className="flex flex-row items-center justify-between bg-muted/20 pb-4">
                        <div className="space-y-1">
                            <CardTitle className="text-xl font-black tracking-tight flex items-center gap-2">
                                <History className="h-5 w-5 text-indigo-500" />
                                Ingestion Activity
                            </CardTitle>
                            <CardDescription className="text-xs font-bold uppercase tracking-tight text-muted-foreground/50">Real-time sync telemetry</CardDescription>
                        </div>
                    </CardHeader>
                    <CardContent className="p-0">
                        <div className="divide-y divide-muted/30">
                            {recentActivity.map((activity, index) => (
                                <div key={index} className="flex items-center justify-between p-5 hover:bg-muted/30 transition-colors group">
                                    <div className="flex items-start gap-4">
                                        <div className={cn("p-2 rounded-full mt-0.5",
                                            activity.status === 'success' ? "bg-green-500/10 text-green-600" : "bg-red-500/10 text-red-600"
                                        )}>
                                            {activity.status === 'success' ? <CheckCircle2 className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
                                        </div>
                                        <div className="space-y-1">
                                            <div className="font-bold text-foreground group-hover:text-primary transition-colors flex items-center gap-2">
                                                {activity.db}
                                                <span className="text-muted-foreground opacity-30 font-medium tracking-widest text-[10px]">.</span>
                                                <span className="font-mono text-xs font-medium text-muted-foreground uppercase">{activity.schema}</span>
                                            </div>
                                            <div className="text-[11px] font-bold text-muted-foreground/60 tabular-nums">
                                                {activity.time}
                                            </div>
                                        </div>
                                    </div>
                                    <Badge
                                        variant="outline"
                                        className={cn(
                                            "font-black text-[9px] uppercase tracking-widest py-0.5 px-3 border-none",
                                            activity.status === 'success' ? "bg-green-500/10 text-green-600" : "bg-red-500/10 text-red-600"
                                        )}
                                    >
                                        {activity.status}
                                    </Badge>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                <div className="space-y-6">
                    <Card className="border-none shadow-xl bg-indigo-600 text-white overflow-hidden relative group">
                        <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent pointer-events-none" />
                        <CardHeader className="relative z-10 space-y-4">
                            <CardTitle className="text-2xl font-black tracking-tight leading-tight text-white">Relational Scoping</CardTitle>
                            <CardDescription className="text-indigo-50 font-bold leading-relaxed">
                                Connect to your PostgreSQL instances to surface deep data relationships and constraints.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="relative z-10 pt-4">
                            <Button asChild className="w-full h-12 bg-white text-indigo-600 hover:bg-white/90 rounded-xl font-bold gap-2">
                                <Link to="/ingestion/postgres/new">
                                    <ExternalLink className="h-4 w-4 shrink-0" />
                                    Connect Cluster
                                </Link>
                            </Button>
                        </CardContent>
                        <div className="absolute -bottom-6 -right-6 opacity-10 group-hover:scale-125 transition-transform duration-700">
                            <Database className="h-32 w-32 rotate-12" />
                        </div>
                    </Card>

                    <Card className="bg-muted/50 border-none shadow-sm h-fit">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-xs font-black uppercase tracking-widest text-muted-foreground">Compliance & Security</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3 p-5">
                            <div className="flex items-center gap-3">
                                <ShieldCheck className="h-4 w-4 text-green-500" />
                                <span className="text-[11px] font-black uppercase tracking-tight">Encryption at Rest</span>
                            </div>
                            <div className="flex items-center gap-3">
                                <ShieldCheck className="h-4 w-4 text-green-500" />
                                <span className="text-[11px] font-black uppercase tracking-tight">SSL/TLS Mandatory</span>
                            </div>
                            <div className="flex items-center gap-3">
                                <ShieldCheck className="h-4 w-4 text-green-500" />
                                <span className="text-[11px] font-black uppercase tracking-tight">Read-only Discovery</span>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default PostgresDashboard;
