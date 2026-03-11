import React from 'react';
import { Link } from 'react-router-dom';
import {
    Database,
    History,
    CheckCircle2,
    AlertCircle,
    ChevronRight,
    Zap,
    Gauge,
    Server,
    Activity,
    ExternalLink,
    Search
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

const MySQLDashboard: React.FC = () => {
    const stats = [
        { label: 'Ingested Tables', value: '189', icon: <Search className="h-4 w-4 text-cyan-500" /> },
        { label: 'Active Clusters', value: '3', icon: <Server className="h-4 w-4 text-indigo-500" /> },
        { label: 'Databases Syncing', value: '7', icon: <Database className="h-4 w-4 text-emerald-500" /> },
        { label: 'Metadata Size', value: '14 MB', icon: <Activity className="h-4 w-4 text-muted-foreground" /> }
    ];

    const recentActivity = [
        { host: 'mysql-prod-01', db: 'customer_db', status: 'success', time: '2026-03-08 17:50' },
        { host: 'mariadb-staging', db: 'tests', status: 'success', time: '2026-03-08 12:30' },
        { host: 'mysql-prod-02', db: 'inventory', status: 'error', time: '2026-03-07 22:10' }
    ];

    return (
        <div className="p-6 space-y-10 max-w-7xl mx-auto animate-in fade-in duration-500">
            <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-4 font-medium">
                <Link to="/" className="hover:text-foreground transition-colors">Registry</Link>
                <ChevronRight className="h-4 w-4" />
                <Link to="/ingestion" className="hover:text-foreground transition-colors">Ingestion</Link>
                <ChevronRight className="h-4 w-4" />
                <span className="text-foreground font-bold text-cyan-600">MySQL Dashboard</span>
            </nav>

            <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 shrink-0 border-b pb-8">
                <div className="flex items-center gap-4">
                    <div className="p-3.5 rounded-2xl bg-cyan-500/10 text-cyan-600 shadow-sm border border-cyan-500/20">
                        <Database className="h-10 w-10" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-black tracking-tight text-foreground">MySQL & MariaDB</h1>
                        <p className="text-muted-foreground mt-1 font-medium">Coordinate metadata discovery across relational clusters and standalone instances.</p>
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
                <Card className="lg:col-span-2 border shadow-lg bg-card/60 backdrop-blur-sm shadow-cyan-500/5">
                    <CardHeader className="flex flex-row items-center justify-between bg-muted/20 pb-4">
                        <div className="space-y-1">
                            <CardTitle className="text-xl font-black tracking-tight flex items-center gap-2">
                                <History className="h-5 w-5 text-cyan-500" />
                                Metadata Syncs
                            </CardTitle>
                            <CardDescription className="text-xs font-bold uppercase tracking-tight text-muted-foreground/50">Real-time ingestion telemetry</CardDescription>
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
                                                {activity.host}
                                                <span className="text-muted-foreground opacity-30 font-medium tracking-widest text-[10px]">/</span>
                                                <span className="font-mono text-xs font-medium text-muted-foreground uppercase">{activity.db}</span>
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
                    <Card className="border-none shadow-xl bg-[#00758F] text-white overflow-hidden relative group">
                        <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent pointer-events-none" />
                        <CardHeader className="relative z-10 space-y-4">
                            <CardTitle className="text-2xl font-black tracking-tight leading-tight text-white">Registry Sync</CardTitle>
                            <CardDescription className="text-cyan-50 font-bold leading-relaxed">
                                Automatically track schema evolutions and relationship changes across your MySQL landscape.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="relative z-10 pt-4">
                            <Button asChild className="w-full h-12 bg-white text-[#00758F] hover:bg-white/90 rounded-xl font-bold gap-2">
                                <Link to="/ingestion/mysql/new">
                                    <Zap className="h-4 w-4 shrink-0" />
                                    Synchronize Cluster
                                </Link>
                            </Button>
                        </CardContent>
                        <div className="absolute -bottom-6 -right-6 opacity-10 group-hover:scale-125 transition-transform duration-700">
                            <Gauge className="h-32 w-32 rotate-12" />
                        </div>
                    </Card>

                    <Card className="bg-muted/50 border-none shadow-sm h-fit">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-xs font-black uppercase tracking-widest text-muted-foreground">Resource Links</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2">
                            {[
                                { name: "MariaDB Foundation", url: "https://mariadb.org" },
                                { name: "MySQL Documentation", url: "https://dev.mysql.com/doc/" },
                                { name: "Query Optimizer", url: "#" },
                            ].map((link, i) => (
                                <a key={i} href={link.url} target="_blank" rel="noreferrer" className="flex items-center justify-between p-3 rounded-lg hover:bg-background transition-colors font-bold text-xs text-muted-foreground group">
                                    {link.name}
                                    <ExternalLink className="h-3.5 w-3.5 opacity-0 group-hover:opacity-100 transition-opacity" />
                                </a>
                            ))}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default MySQLDashboard;
