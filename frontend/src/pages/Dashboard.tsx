import React from 'react';
import {
    LayoutDashboard,
    Server,
    Database,
    Activity,
    TrendingUp,
    Shield,
    Users
} from 'lucide-react';
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription
} from '@/components/ui/card';

const Dashboard: React.FC = () => {
    const stats = [
        { title: 'Active Nodes', value: '42', description: '+3 from last hour', icon: <Server className="h-4 w-4 text-muted-foreground" />, color: "text-blue-500" },
        { title: 'Data Registry', value: '1.2 TB', description: '84% capacity used', icon: <Database className="h-4 w-4 text-muted-foreground" />, color: "text-orange-500" },
        { title: 'Requests/sec', value: '842', description: '+12% from yesterday', icon: <Activity className="h-4 w-4 text-muted-foreground" />, color: "text-green-500" },
        { title: 'Security Score', value: '98%', description: 'All systems protected', icon: <Shield className="h-4 w-4 text-muted-foreground" />, color: "text-purple-500" },
    ];

    return (
        <div className="p-6 space-y-8 animate-in fade-in duration-500">
            <header className="flex flex-col gap-2">
                <div className="flex items-center gap-2 text-primary font-bold tracking-tight mb-1">
                    <LayoutDashboard className="h-5 w-5" />
                    <span className="text-xs uppercase tracking-widest">System Overview</span>
                </div>
                <h1 className="text-4xl font-black tracking-tight text-foreground">Registry Dashboard</h1>
                <p className="text-muted-foreground text-lg">Real-time telemetry and management interface for Espedair nodes.</p>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((stat, i) => (
                    <Card key={i} className="border-none shadow-md bg-card/50 backdrop-blur-sm transition-all hover:shadow-xl hover:-translate-y-1">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-bold uppercase tracking-wider text-muted-foreground/70">
                                {stat.title}
                            </CardTitle>
                            {stat.icon}
                        </CardHeader>
                        <CardContent>
                            <div className={`text-3xl font-black tracking-tighter ${stat.color}`}>{stat.value}</div>
                            <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1 font-medium">
                                <TrendingUp className="h-3 w-3 text-green-500" />
                                {stat.description}
                            </p>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <Card className="lg:col-span-2 border-none shadow-lg bg-[#232F3E] text-white overflow-hidden relative group">
                    <div className="absolute inset-0 bg-gradient-to-br from-orange-500/20 to-transparent opacity-50 group-hover:opacity-70 transition-opacity" />
                    <CardHeader className="relative z-10">
                        <CardTitle className="text-2xl font-black tracking-tight">System Status: Optimal</CardTitle>
                        <CardDescription className="text-white/60 font-medium">Global infrastructure health check completed 2 minutes ago.</CardDescription>
                    </CardHeader>
                    <CardContent className="relative z-10 pb-10">
                        <div className="flex items-center gap-6 mt-4">
                            <div className="flex flex-col items-center">
                                <div className="text-4xl font-black text-orange-500">99.9%</div>
                                <div className="text-[10px] font-bold uppercase tracking-widest text-white/40">Uptime</div>
                            </div>
                            <div className="h-12 w-px bg-white/10" />
                            <div className="flex flex-col items-center">
                                <div className="text-4xl font-black text-blue-400">12ms</div>
                                <div className="text-[10px] font-bold uppercase tracking-widest text-white/40">Latency</div>
                            </div>
                            <div className="h-12 w-px bg-white/10" />
                            <div className="flex flex-col items-center text-center">
                                <div className="text-4xl font-black text-green-400">SLA</div>
                                <div className="text-[10px] font-bold uppercase tracking-widest text-white/40">Guaranteed</div>
                            </div>
                        </div>
                    </CardContent>
                    <div className="absolute bottom-0 right-0 p-8">
                        <Activity className="h-24 w-24 text-white/5 -rotate-12 group-hover:rotate-0 transition-transform duration-700" />
                    </div>
                </Card>

                <Card className="border-none shadow-lg bg-card/30 border-muted">
                    <CardHeader>
                        <CardTitle className="text-xl font-black tracking-tight flex items-center gap-2">
                            <Users className="h-5 w-5 text-primary" />
                            Recent Activity
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {[
                            { user: "Admin", action: "Updated GCP Schema", time: "2m ago" },
                            { user: "System", action: "Node DE-FRA-01 online", time: "15m ago" },
                            { user: "Operator", action: "Backup triggered", time: "1h ago" },
                        ].map((log, i) => (
                            <div key={i} className="flex items-center justify-between text-sm py-2 border-b border-muted last:border-0">
                                <div>
                                    <span className="font-bold text-foreground">{log.user}</span>
                                    <span className="text-muted-foreground mx-2">→</span>
                                    <span className="text-muted-foreground">{log.action}</span>
                                </div>
                                <span className="text-[10px] font-bold text-muted-foreground/50 uppercase">{log.time}</span>
                            </div>
                        ))}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default Dashboard;
