import React from 'react';
import { useLocation, Link } from 'react-router-dom';
import {
    Globe,
    Settings,
    Construction,
    Bug,
    Database,
    ChevronRight,
    Server,
    Zap,
    Activity
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import {
    Card,
    CardContent
} from '@/components/ui/card';
import { cn } from '@/lib/utils';

const Environments: React.FC = () => {
    const location = useLocation();
    const isPlatform = location.pathname.includes('/platforms/');
    const platformType = location.pathname.split('/')[2];

    const platformLabels: Record<string, string> = {
        gcp: 'GCP',
        aws: 'AWS',
        gcve: 'GCVE',
        saas: 'SaaS'
    };

    const parentPath = isPlatform ? `/platforms/${platformType}` : '/';
    const parentLabel = isPlatform ? (platformLabels[platformType] || 'Platform') : 'Registry';

    const production = [
        { id: 'prod', name: 'Production', icon: <Globe className="h-6 w-6 text-green-500" />, status: 'Stable', nodes: 12, uptime: '99.99%', variant: 'success' },
        { id: 'staging', name: 'Staging', icon: <Settings className="h-6 w-6 text-blue-500" />, status: 'Synced', nodes: 4, uptime: '99.95%', variant: 'secondary' }
    ];

    const nonProduction = [
        { id: 'dev', name: 'Development', icon: <Construction className="h-6 w-6 text-orange-500" />, status: 'Active', nodes: 2, uptime: '98.5%', variant: 'outline' },
        { id: 'test', name: 'Test', icon: <Bug className="h-6 w-6 text-red-500" />, status: 'Testing', nodes: 2, uptime: '99.2%', variant: 'destructive' }
    ];

    const renderCard = (env: any) => (
        <Card key={env.id} className="group hover:shadow-lg transition-all border-none bg-muted/30 overflow-hidden relative">
            <div className={cn("absolute top-0 left-0 w-1 h-full",
                env.id === 'prod' ? "bg-green-500" :
                    env.id === 'staging' ? "bg-blue-500" :
                        env.id === 'dev' ? "bg-orange-500" : "bg-red-500"
            )} />
            <CardContent className="p-6 space-y-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-background/80 shadow-sm border">
                            {env.icon}
                        </div>
                        <h3 className="text-xl font-bold tracking-tight">{env.name}</h3>
                    </div>
                    <Badge variant={env.id === 'prod' ? "default" : "outline"} className={cn("font-bold uppercase tracking-wider text-[10px]",
                        env.id === 'prod' && "bg-green-500 hover:bg-green-600"
                    )}>
                        {env.status}
                    </Badge>
                </div>

                <div className="grid grid-cols-2 gap-4 py-4 border-y border-muted-foreground/10">
                    <div className="space-y-1">
                        <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/50">Nodes</p>
                        <p className="text-2xl font-black flex items-center gap-2">
                            <Server className="h-4 w-4 text-muted-foreground/40" />
                            {env.nodes}
                        </p>
                    </div>
                    <div className="space-y-1">
                        <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/50">Uptime</p>
                        <p className="text-2xl font-black flex items-center gap-2">
                            <Zap className="h-4 w-4 text-muted-foreground/40 text-yellow-500" />
                            {env.uptime}
                        </p>
                    </div>
                </div>

                <div className="flex items-center justify-between text-xs font-bold text-muted-foreground group-hover:text-primary transition-colors cursor-pointer pt-2">
                    <span className="flex items-center gap-2 uppercase tracking-tight">
                        <Activity className="h-3 w-3" /> Monitor metrics
                    </span>
                    <ChevronRight className="h-4 w-4" />
                </div>
            </CardContent>
        </Card>
    );

    return (
        <div className="p-6 space-y-10 max-w-6xl mx-auto">
            <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
                <Link to="/" className="hover:text-foreground transition-colors">Registry</Link>
                <ChevronRight className="h-4 w-4" />
                <Link to={parentPath} className="hover:text-foreground transition-colors">{parentLabel}</Link>
                <ChevronRight className="h-4 w-4" />
                <span className="text-foreground font-medium">Environments</span>
            </nav>

            <header className="flex items-center gap-4">
                <div className="p-3 rounded-2xl bg-primary/10 text-primary shadow-sm border border-primary/20">
                    <Database className="h-10 w-10" />
                </div>
                <div>
                    <h1 className="text-4xl font-black tracking-tight text-foreground">Environments</h1>
                    <p className="text-muted-foreground text-lg font-medium">Control tower for cross-lifecycle system states.</p>
                </div>
            </header>

            <section className="space-y-6">
                <div className="flex items-center gap-3">
                    <h2 className="text-2xl font-black tracking-tighter">Production Stack</h2>
                    <Badge className="bg-red-500 hover:bg-red-600 text-[10px] font-black uppercase py-0.5 px-3 rounded-full">Mission Critical</Badge>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {production.map(renderCard)}
                </div>
            </section>

            <section className="space-y-6">
                <h2 className="text-2xl font-black tracking-tighter">Internal & Testing</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {nonProduction.map(renderCard)}
                    <Card className="border-2 border-dashed bg-transparent flex items-center justify-center p-8 opacity-40 hover:opacity-100 transition-opacity cursor-pointer">
                        <div className="flex flex-col items-center gap-2">
                            <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center font-black text-2xl">+</div>
                            <span className="text-sm font-bold uppercase tracking-widest">Provision Env</span>
                        </div>
                    </Card>
                </div>
            </section>
        </div>
    );
};

export default Environments;
