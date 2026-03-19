import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Cloud,
    Database,
    Github,
    Zap,
    Server,
    ExternalLink,
    Search,
    Filter,
    Plus,
    LayoutGrid,
    Globe
} from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';

const PlatformsPage: React.FC = () => {
    const navigate = useNavigate();

    const platforms = [
        {
            id: 'gcp',
            name: 'Google Cloud (GCP)',
            icon: <Cloud className="h-10 w-10 text-blue-500" />,
            status: 'Active',
            type: 'Cloud Provider',
            path: '/platforms/gcp',
            description: 'Enterprise data warehousing, BigQuery, and GCS integrations.',
            color: 'bg-blue-500/10'
        },
        {
            id: 'aws',
            name: 'Amazon Web Services',
            icon: <Cloud className="h-10 w-10 text-orange-500" />,
            status: 'TBC',
            type: 'Cloud Provider',
            path: '/platforms/aws',
            description: 'S3 storage buckets, Redshift, and RDS database ecosystems.',
            color: 'bg-orange-500/10'
        },
        {
            id: 'snowflake',
            name: 'Snowflake',
            icon: <Database className="h-10 w-10 text-cyan-400" />,
            status: 'TBC',
            type: 'Data Warehouse',
            path: '/platforms/snowflake',
            description: 'Cloud native data warehouse for elite analytical workflows.',
            color: 'bg-cyan-500/10'
        },
        {
            id: 'servicenow',
            name: 'Service Now',
            icon: <Zap className="h-10 w-10 text-emerald-500" />,
            status: 'Placeholder',
            type: 'Enterprise IT',
            path: '/platforms/servicenow/cmdb',
            description: 'Configuration Management Database (CMDB) and IT infrastructure.',
            color: 'bg-emerald-500/10'
        },
        {
            id: 'github',
            name: 'GitHub',
            icon: <Github className="h-10 w-10 text-slate-800 dark:text-slate-200" />,
            status: 'Active',
            type: 'Code Repository',
            path: '/platforms/github',
            description: 'Metadata extraction for repository structures and CI/CD assets.',
            color: 'bg-slate-500/10'
        },
        {
            id: 'datacenter',
            name: 'Data Center',
            icon: <Server className="h-10 w-10 text-indigo-500" />,
            status: 'Active',
            type: 'On-Premises',
            path: '/platforms/on-premises/databases',
            description: 'Legacy and private cloud relational database deployments.',
            color: 'bg-indigo-500/10'
        }
    ];

    return (
        <div className="space-y-10 animate-in fade-in slide-in-from-bottom-6 duration-700 max-w-7xl mx-auto p-6">
            <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-10 border-b border-white/5">
                <div className="space-y-3">
                    <div className="flex items-center gap-2 text-primary font-black uppercase tracking-[0.3em] text-[10px]">
                        <Globe className="h-3.5 w-3.5" />
                        Infrastructure Matrix
                    </div>
                    <h1 className="text-5xl font-black tracking-tighter italic uppercase">
                        Platform <span className="text-muted-foreground/20 not-italic">Catalog</span>
                    </h1>
                    <p className="text-muted-foreground text-lg italic max-w-2xl font-medium leading-relaxed">
                        Federated management of your global architectural nodes. Connect, monitor, and extract metadata across your entire estate.
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <Button className="h-12 px-8 rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-2xl shadow-primary/20 hover:scale-105 transition-all">
                        <Plus className="mr-2 h-4 w-4" />
                        New Connection
                    </Button>
                </div>
            </header>

            {/* Matrix Filters */}
            <div className="flex flex-wrap items-center justify-between gap-4 bg-muted/20 p-2 rounded-3xl border border-white/5 backdrop-blur-md">
                <div className="relative group flex-1 max-w-md">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/40 group-focus-within:text-primary transition-colors" />
                    <Input
                        placeholder="Search infrastructure nodes..."
                        className="h-12 pl-12 rounded-2xl border-none bg-muted/40 font-bold text-xs focus-visible:ring-1 focus-visible:ring-primary/20"
                    />
                </div>
                <div className="flex items-center gap-2 pr-2">
                    <Button variant="ghost" size="sm" className="rounded-xl font-bold text-[10px] uppercase tracking-widest opacity-50 hover:opacity-100 h-10 px-4">
                        <Filter className="mr-2 h-3.5 w-3.5" />
                        Sort: Priority
                    </Button>
                    <div className="h-6 w-px bg-white/5 mx-2" />
                    <div className="flex bg-muted/40 p-1 rounded-xl">
                        <Button size="icon" variant="ghost" className="h-8 w-8 rounded-lg bg-background text-primary shadow-sm"><LayoutGrid className="h-4 w-4" /></Button>
                        <Button size="icon" variant="ghost" className="h-8 w-8 rounded-lg text-muted-foreground/30"><div className="h-4 w-4 rounded-sm border-2 border-current" /></Button>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {platforms.map((platform) => (
                    <Card
                        key={platform.id}
                        className="group relative overflow-hidden border-none bg-card/40 hover:bg-card/80 transition-all duration-500 cursor-pointer rounded-[2.5rem] shadow-2xl hover:shadow-primary/5 hover:translate-y-[-4px]"
                        onClick={() => navigate(platform.path)}
                    >
                        <div className={`absolute top-0 right-0 w-32 h-32 blur-[60px] rounded-full -mr-16 -mt-16 opacity-30 ${platform.color}`} />

                        <CardHeader className="p-8 pb-4">
                            <div className="flex justify-between items-start">
                                <div className="p-4 rounded-[1.5rem] bg-background shadow-inner border border-white/5 group-hover:scale-110 transition-transform duration-500">
                                    {platform.icon}
                                </div>
                                <Badge
                                    variant="outline"
                                    className={cn(
                                        "px-3 py-1 rounded-full font-black text-[9px] uppercase tracking-widest border-none transition-all",
                                        platform.status === 'Active' ? "bg-emerald-500/10 text-emerald-500" :
                                            platform.status === 'TBC' ? "bg-amber-500/10 text-amber-500" :
                                                "bg-muted text-muted-foreground"
                                    )}
                                >
                                    {platform.status}
                                </Badge>
                            </div>
                        </CardHeader>
                        <CardContent className="p-8 pt-4">
                            <div className="space-y-4">
                                <div>
                                    <p className="text-[10px] font-black text-primary uppercase tracking-[0.2em] mb-1">{platform.type}</p>
                                    <h3 className="text-2xl font-black tracking-tight">{platform.name}</h3>
                                </div>
                                <p className="text-sm text-muted-foreground italic font-medium leading-relaxed">
                                    {platform.description}
                                </p>
                                <div className="pt-4 flex items-center justify-between">
                                    <div className="flex items-center gap-1">
                                        <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                                        <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Metadata Ready</span>
                                    </div>
                                    <Button variant="ghost" size="icon" className="h-10 w-10 rounded-2xl bg-muted/50 hover:bg-primary/20 hover:text-primary transition-all opacity-0 group-hover:opacity-100">
                                        <ExternalLink className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <footer className="pt-20 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-6 opacity-40">
                <div className="text-[10px] font-black uppercase tracking-[0.4em] italic">Infrastructure Matrix Core v4.2</div>
                <div className="flex items-center gap-8">
                    {['Resilience', 'Observability', 'Security'].map(label => (
                        <div key={label} className="flex items-center gap-2">
                            <div className="h-1 w-1 rounded-full bg-emerald-500" />
                            <span className="text-[9px] font-bold uppercase tracking-widest">{label}</span>
                        </div>
                    ))}
                </div>
            </footer>
        </div>
    );
};

export default PlatformsPage;

function cn(...classes: (string | boolean | undefined)[]) {
    return classes.filter(Boolean).join(' ');
}
