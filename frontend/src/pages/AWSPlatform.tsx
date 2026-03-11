import React from 'react';
import { Link } from 'react-router-dom';
import {
    Cloud,
    Database,
    ShieldCheck,
    Activity,
    ChevronRight,
    Server,
    Layers
} from 'lucide-react';
import {
    Card,
    CardContent
} from '@/components/ui/card';
import { cn } from '@/lib/utils';

const AWSPage: React.FC = () => {
    const services = [
        { title: 'Compute', icon: <Server className="h-6 w-6" />, count: '28 EC2', status: 'Healthy', color: 'text-orange-500', bg: 'bg-orange-500/10' },
        { title: 'S3', icon: <Database className="h-6 w-6" />, count: '15 Buckets', status: 'Healthy', color: 'text-blue-500', bg: 'bg-blue-500/10' },
        { title: 'Redshift', icon: <Layers className="h-6 w-6" />, count: '3 Clusters', status: 'Healthy', color: 'text-purple-500', bg: 'bg-purple-500/10' },
        { title: 'IAM', icon: <ShieldCheck className="h-6 w-6" />, count: '124 Users', status: 'Protected', color: 'text-green-500', bg: 'bg-green-500/10' }
    ];

    return (
        <div className="p-6 space-y-6 max-w-7xl mx-auto">
            <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
                <Link to="/" className="hover:text-foreground transition-colors">Registry</Link>
                <ChevronRight className="h-4 w-4" />
                <span className="text-foreground font-medium">Amazon Web Services</span>
            </nav>

            <div className="relative overflow-hidden rounded-3xl p-8 md:p-12 bg-[#232F3E] text-white shadow-2xl shadow-orange-500/10 group">
                <div className="absolute top-0 right-0 -m-16 w-64 h-64 bg-orange-500/20 rounded-full blur-3xl group-hover:bg-orange-500/30 transition-all duration-500" />
                <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="space-y-4">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-orange-500 rounded-2xl shadow-lg shadow-orange-500/40">
                                <Cloud className="h-8 w-8 text-white" />
                            </div>
                            <h1 className="text-4xl md:text-5xl font-black tracking-tight">AWS</h1>
                        </div>
                        <p className="text-lg md:text-xl opacity-80 max-w-2xl font-medium leading-relaxed">
                            Unified monitoring and metadata for Amazon Web Services infrastructure,
                            real-time status, and service health overview.
                        </p>
                    </div>
                    <div className="shrink-0">
                        <div className="px-6 py-3 rounded-full bg-white/10 backdrop-blur-md border border-white/10 text-sm font-bold flex items-center gap-2 text-orange-400">
                            <Activity className="h-4 w-4 animate-pulse" />
                            SERVICE CONNECTED
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {services.map((service) => (
                    <Card key={service.title} className="group hover:shadow-xl hover:shadow-orange-500/5 transition-all duration-300 border-none bg-muted/30">
                        <CardContent className="p-6 space-y-6">
                            <div className="flex items-start justify-between">
                                <div className={cn("p-4 rounded-2xl transition-transform group-hover:scale-110", service.bg, service.color)}>
                                    {service.icon}
                                </div>
                                <div className="flex items-center gap-1.5 text-xs font-bold text-green-500 bg-green-500/10 px-2.5 py-1 rounded-full">
                                    <div className="h-1.5 w-1.5 rounded-full bg-current" />
                                    {service.status}
                                </div>
                            </div>

                            <div className="space-y-1">
                                <h3 className="text-sm font-bold uppercase tracking-widest text-muted-foreground/60">{service.title}</h3>
                                <p className="text-3xl font-black tracking-tight">{service.count}</p>
                            </div>

                            <div className="pt-4 border-t border-muted-foreground/10 flex items-center justify-between text-xs font-bold text-muted-foreground group-hover:text-primary transition-colors cursor-pointer">
                                <span>VIEW DETAILS</span>
                                <ChevronRight className="h-4 w-4" />
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
};

export default AWSPage;
