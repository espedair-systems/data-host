import React from 'react';
import { Link } from 'react-router-dom';
import {
    Cloud,
    History,
    CheckCircle2,
    AlertCircle,
    Database,
    ChevronRight,
    HardDrive,
    FileText,
    Zap,
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

const GCSDashboard: React.FC = () => {
    const stats = [
        { label: 'Active Buckets', value: '42', icon: <Database className="h-4 w-4 text-blue-500" /> },
        { label: 'Files Scanned', value: '12.4k', icon: <FileText className="h-4 w-4 text-indigo-500" /> },
        { label: 'Schemas Inferred', value: '156', icon: <Zap className="h-4 w-4 text-amber-500" /> },
        { label: 'Total Volume', value: '4.2 TB', icon: <HardDrive className="h-4 w-4 text-muted-foreground" /> }
    ];

    const recentActivity = [
        { bucket: 'marketing-assets-prod', object: 'events_2026_03.parquet', status: 'success', time: '2026-03-08 20:45' },
        { bucket: 'raw-data-ingest', object: 'user_logs_v2.json', status: 'success', time: '2026-03-08 18:10' },
        { bucket: 'temporary-exports', object: 'failed_dump.csv', status: 'error', time: '2026-03-08 14:20' }
    ];

    return (
        <div className="p-6 space-y-10 max-w-7xl mx-auto animate-in fade-in duration-500">
            <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-4 font-medium">
                <Link to="/" className="hover:text-foreground transition-colors">Registry</Link>
                <ChevronRight className="h-4 w-4" />
                <Link to="/ingestion" className="hover:text-foreground transition-colors">Ingestion</Link>
                <ChevronRight className="h-4 w-4" />
                <span className="text-foreground font-bold text-blue-500">Cloud Storage Dashboard</span>
            </nav>

            <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 shrink-0 border-b pb-8">
                <div className="flex items-center gap-4">
                    <div className="p-3.5 rounded-2xl bg-blue-500/10 text-blue-600 shadow-sm border border-blue-500/20">
                        <Cloud className="h-10 w-10" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-black tracking-tight text-foreground">Cloud Storage</h1>
                        <p className="text-muted-foreground mt-1 font-medium">Manage metadata discovery and object scanning for GCP clusters.</p>
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
                <Card className="lg:col-span-2 border shadow-lg bg-card/60 backdrop-blur-sm shadow-blue-500/5">
                    <CardHeader className="flex flex-row items-center justify-between bg-muted/20 pb-4">
                        <div className="space-y-1">
                            <CardTitle className="text-xl font-black tracking-tight flex items-center gap-2">
                                <History className="h-5 w-5 text-blue-500" />
                                Recent Object Scans
                            </CardTitle>
                            <CardDescription className="text-xs font-bold uppercase tracking-tight text-muted-foreground/50">Infrastructure audit feed</CardDescription>
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
                                                {activity.bucket}
                                                <span className="text-muted-foreground opacity-30 font-medium tracking-widest text-[10px]">/</span>
                                                <span className="font-mono text-xs font-medium text-muted-foreground">{activity.object}</span>
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
                    <Card className="border-none shadow-xl bg-blue-600 text-white overflow-hidden relative group">
                        <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent pointer-events-none" />
                        <CardHeader className="relative z-10 space-y-4">
                            <CardTitle className="text-2xl font-black tracking-tight leading-tight text-white">Schema Discovery</CardTitle>
                            <CardDescription className="text-blue-50 font-bold leading-relaxed">
                                Automatically infer schema definitions from semi-structured data in your buckets.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="relative z-10 pt-4">
                            <Button asChild className="w-full h-12 bg-white text-blue-600 hover:bg-white/90 rounded-xl font-bold gap-2">
                                <Link to="/ingestion/gcs/connections">
                                    <Database className="h-4 w-4 shrink-0" />
                                    Manage Buckets
                                </Link>
                            </Button>
                        </CardContent>
                        <div className="absolute -bottom-6 -right-6 opacity-10 group-hover:scale-125 transition-transform duration-700">
                            <HardDrive className="h-32 w-32 rotate-12" />
                        </div>
                    </Card>

                    <Card className="bg-muted/50 border-none shadow-sm h-fit">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-xs font-black uppercase tracking-widest text-muted-foreground">Resource Links</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2">
                            {[
                                { name: "Cloud Console", url: "https://console.cloud.google.com/storage" },
                                { name: "Bucket Policies", url: "https://console.cloud.google.com/storage/settings" },
                                { name: "Lifecycle Rules", url: "https://cloud.google.com/storage/docs/lifecycle" },
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

export default GCSDashboard;
