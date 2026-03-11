import React from 'react';
import { Link } from 'react-router-dom';
import {
    Box as BoxIcon,
    Server,
    Database,
    Shield,
    ChevronRight,
    Activity,
    Layers
} from 'lucide-react';
import {
    Card,
    CardContent,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

const GCVEPage: React.FC = () => {
    const services = [
        { title: 'Hosts', icon: <Server className="h-5 w-5" />, count: '12 ESXi', status: 'Healthy', color: 'text-blue-500', bg: 'bg-blue-500/10' },
        { title: 'vCenter', icon: <Layers className="h-5 w-5" />, count: '2 Instances', status: 'Healthy', color: 'text-indigo-500', bg: 'bg-indigo-500/10' },
        { title: 'vSAN', icon: <Database className="h-5 w-5" />, count: '84 TB', status: 'Optimized', color: 'text-cyan-500', bg: 'bg-cyan-500/10' },
        { title: 'NSX-T', icon: <Shield className="h-5 w-5" />, count: 'Connected', status: 'Secure', color: 'text-emerald-500', bg: 'bg-emerald-500/10' }
    ];

    return (
        <div className="p-6 space-y-10 max-w-7xl mx-auto animate-in fade-in duration-500">
            <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-4 font-medium">
                <Link to="/" className="hover:text-foreground transition-colors">Registry</Link>
                <ChevronRight className="h-4 w-4" />
                <span className="text-foreground font-bold">Google Cloud VMware Engine</span>
            </nav>

            <header className="relative overflow-hidden rounded-[2rem] p-10 bg-gradient-to-br from-[#0077C8] to-[#4285F4] text-white shadow-2xl shadow-blue-500/20 group">
                <div className="absolute inset-0 bg-black/10 backdrop-blur-[2px]" />
                <div className="relative z-10 space-y-4">
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 rounded-xl bg-white/20 backdrop-blur-md border border-white/20">
                            <BoxIcon className="h-8 w-8" />
                        </div>
                        <h1 className="text-5xl font-black tracking-tight drop-shadow-sm">GCVE</h1>
                    </div>
                    <p className="text-white/80 text-xl font-medium max-w-2xl leading-relaxed">
                        Dedicated enterprise VMware clusters running natively on Google Cloud infrastructure.
                    </p>
                </div>
                <Activity className="absolute top-1/2 -right-20 -translate-y-1/2 h-96 w-96 text-white/5 rotate-12 group-hover:scale-110 transition-transform duration-1000 ease-out" />
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {services.map((service) => (
                    <Card key={service.title} className="group border-none shadow-md bg-card/60 backdrop-blur-sm transition-all hover:shadow-xl hover:-translate-y-1 overflow-hidden relative">
                        <CardContent className="p-6 space-y-6">
                            <div className="flex items-center gap-4">
                                <div className={cn("p-3 rounded-2xl shadow-sm border border-black/5 transition-colors group-hover:scale-110 duration-300", service.bg, service.color)}>
                                    {service.icon}
                                </div>
                                <h3 className="text-lg font-black tracking-tight text-foreground">{service.title}</h3>
                            </div>

                            <div className="space-y-1">
                                <div className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/50">Cluster Metric</div>
                                <div className="text-3xl font-black tracking-tighter text-foreground">{service.count}</div>
                            </div>

                            <div className="pt-4 border-t border-muted/30 flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <div className="h-2 w-2 rounded-full bg-cyan-500 animate-pulse shadow-[0_0_8px_rgba(6,182,212,0.5)]" />
                                    <span className="text-[10px] font-black uppercase tracking-widest text-cyan-600/80">{service.status}</span>
                                </div>
                                <Badge variant="ghost" className="text-[9px] font-bold opacity-0 group-hover:opacity-100 transition-opacity">
                                    Diagnostics
                                </Badge>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <footer className="pt-6 flex items-center justify-center gap-3 text-[10px] text-muted-foreground/30 font-black uppercase tracking-[0.3em]">
                <Activity className="h-3 w-3" />
                SDDC Control Plane Operational
            </footer>
        </div>
    );
};

export default GCVEPage;
