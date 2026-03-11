import React from 'react';
import { Link } from 'react-router-dom';
import {
    Cloud,
    MessageSquare,
    Shield,
    ChevronRight,
    Zap,
    Activity,
    Globe,
    Layers,
    Cpu
} from 'lucide-react';
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';

const SaaSPage: React.FC = () => {
    const services = [
        { title: 'Salesforce', icon: <Cloud className="h-5 w-5" />, count: 'Connected', status: 'Synced', color: 'text-blue-500', bg: 'bg-blue-500/10' },
        { title: 'Slack', icon: <MessageSquare className="h-5 w-5" />, count: '2 Workspaces', status: 'Healthy', color: 'text-purple-500', bg: 'bg-purple-500/10' },
        { title: 'Zendesk', icon: <Layers className="h-5 w-5" />, count: 'Integrated', status: 'Healthy', color: 'text-orange-500', bg: 'bg-orange-500/10' },
        { title: 'Auth0', icon: <Shield className="h-5 w-5" />, count: 'Protected', status: 'Online', color: 'text-emerald-500', bg: 'bg-emerald-500/10' }
    ];

    return (
        <div className="p-6 space-y-10 max-w-7xl mx-auto animate-in fade-in duration-700">
            <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-4 font-medium italic">
                <Link to="/" className="hover:text-foreground transition-colors uppercase tracking-widest text-[10px]">Registry</Link>
                <ChevronRight className="h-3 w-3" />
                <span className="text-foreground font-black uppercase tracking-widest text-[10px]">SaaS Solutions</span>
            </nav>

            <header className="relative overflow-hidden rounded-[2.5rem] p-12 text-white shadow-2xl transition-all hover:scale-[1.01] duration-500">
                <div className="absolute inset-0 bg-gradient-to-br from-[#1A1C2E] via-[#4B3E99] to-[#8257e5] z-0" />
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20 mix-blend-overlay z-10" />
                <div className="absolute -top-24 -right-24 h-96 w-96 bg-white/10 rounded-full blur-3xl" />
                <div className="absolute -bottom-24 -left-24 h-96 w-96 bg-purple-500/20 rounded-full blur-3xl" />

                <div className="relative z-20 space-y-4">
                    <div className="flex items-center gap-3">
                        <div className="p-3 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20">
                            <Cpu className="h-8 w-8 text-purple-200" />
                        </div>
                        <Badge variant="outline" className="bg-white/5 border-white/20 text-white font-black text-[9px] uppercase tracking-[0.3em] py-1 px-4 backdrop-blur-sm">Inventory Control</Badge>
                    </div>
                    <h1 className="text-5xl font-black tracking-tighter uppercase italic leading-[0.9]">
                        SaaS <span className="text-white/40 not-italic">Stack</span>
                    </h1>
                    <p className="text-purple-100/70 max-w-xl text-lg font-medium leading-relaxed tracking-tight italic">
                        Real-time orchestration and metadata mapping of enterprise SaaS endpoints and federated API services.
                    </p>
                </div>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 pt-4">
                {services.map((service) => (
                    <Card key={service.title} className="group border-slate-200 dark:border-slate-800 bg-card/40 backdrop-blur-sm hover:shadow-2xl transition-all duration-500 rounded-[2rem] overflow-hidden">
                        <CardHeader className="pb-4">
                            <div className="flex items-center justify-between space-y-0">
                                <div className={cn("p-4 rounded-[1.25rem] transition-all group-hover:scale-110 duration-300", service.bg, service.color)}>
                                    {service.icon}
                                </div>
                                <div className="h-10 w-10 relative opacity-10 group-hover:opacity-30 transition-opacity">
                                    <Activity className="h-10 w-10 absolute inset-0" />
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="space-y-1">
                                <CardTitle className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground/60 transition-colors group-hover:text-foreground">
                                    {service.title} Provider
                                </CardTitle>
                                <div className="text-2xl font-black tracking-tight text-foreground transition-colors group-hover:text-primary leading-none uppercase">
                                    {service.count}
                                </div>
                            </div>

                            <Separator className="bg-slate-100 dark:bg-slate-800" />

                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <div className={cn("h-1.5 w-1.5 rounded-full shadow-[0_0_8px_rgba(34,197,94,0.5)]", service.status === 'Synced' ? "bg-emerald-500" : "bg-blue-500")} />
                                    <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/80">{service.status}</span>
                                </div>
                                <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg opacity-0 group-hover:opacity-100 transition-all -translate-x-2 group-hover:translate-x-0">
                                    <Zap className="h-3.5 w-3.5 text-muted-foreground" />
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <div className="pt-12 grid grid-cols-1 md:grid-cols-3 gap-8">
                {[
                    { icon: <Globe className="h-4 w-4" />, label: "Edge Propagation", val: "Global" },
                    { icon: <Zap className="h-4 w-4" />, label: "Provisioning Speed", val: "< 120ms" },
                    { icon: <Shield className="h-4 w-4" />, label: "Encryption", val: "AES-256" }
                ].map((stat, i) => (
                    <div key={i} className="flex items-center gap-4 px-8 py-6 rounded-3xl border bg-muted/20 border-slate-200 dark:border-slate-800">
                        <div className="p-3 rounded-xl bg-card border shadow-sm text-muted-foreground">
                            {stat.icon}
                        </div>
                        <div className="space-y-0.5">
                            <div className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/50">{stat.label}</div>
                            <div className="text-sm font-black uppercase tracking-tight">{stat.val}</div>
                        </div>
                    </div>
                ))}
            </div>

            <footer className="pt-2 flex items-center justify-center gap-4 text-[9px] text-muted-foreground/20 font-black uppercase tracking-[0.5em]">
                <span className="h-px w-12 bg-muted-foreground/10" />
                SDP Protocol v4.0 (Enterprise)
                <span className="h-px w-12 bg-muted-foreground/10" />
            </footer>
        </div>
    );
};

export default SaaSPage;
