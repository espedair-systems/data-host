import React from 'react';
import { Link } from 'react-router-dom';
import { Shapes, Box, Cpu, Workflow, GitBranch, Layers, ChevronRight } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const ModelPage: React.FC = () => {
    return (
        <div className="p-6 space-y-8 animate-in fade-in duration-500">
            <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-4 font-medium italic">
                <Link to="/" className="hover:text-foreground transition-colors uppercase tracking-widest text-[10px]">Registry</Link>
                <ChevronRight className="h-3 w-3" />
                <span className="text-foreground font-black uppercase tracking-widest text-[10px]">Model</span>
                <ChevronRight className="h-3 w-3" />
                <span className="text-foreground/40 font-black uppercase tracking-widest text-[10px]">Dashboard</span>
            </nav>
            <header className="flex flex-col gap-2">
                <div className="flex items-center justify-between">
                    <div className="flex flex-col gap-2">
                        <div className="flex items-center gap-2 text-primary font-bold tracking-tight mb-1">
                            <Shapes className="h-5 w-5" />
                            <span className="text-xs uppercase tracking-widest">Architectural Lab</span>
                        </div>
                        <h1 className="text-4xl font-black tracking-tight text-foreground text-shadow-sm">Domain Modeling</h1>
                        <p className="text-muted-foreground text-lg">Designing and evolving the structural heart of the data mesh.</p>
                    </div>
                    <Badge variant="outline" className="rounded-2xl h-10 px-6 border-blue-500/20 bg-blue-500/5 text-blue-500 font-black uppercase tracking-tighter">
                        v2.4 Prototype
                    </Badge>
                </div>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                    { label: 'Active Entities', val: '142', icon: <Box className="h-4 w-4" />, trend: '+4 this week' },
                    { label: 'Relationships', val: '86', icon: <Workflow className="h-4 w-4" />, trend: 'Stable' },
                    { label: 'Projections', val: '12', icon: <GitBranch className="h-4 w-4" />, trend: '2 Pending' },
                    { label: 'Compute Nodes', val: '4', icon: <Cpu className="h-4 w-4" />, trend: 'Optimum' },
                ].map((stat, i) => (
                    <Card key={i} className="border-none shadow-2xl bg-card rounded-[40px] p-8 border border-white/5 group hover:bg-primary/5 transition-all">
                        <div className="flex flex-col gap-4">
                            <div className="p-2 w-fit rounded-xl bg-muted group-hover:bg-primary/20 group-hover:text-primary transition-colors text-muted-foreground">
                                {stat.icon}
                            </div>
                            <div>
                                <h3 className="text-4xl font-black tracking-tighter">{stat.val}</h3>
                                <p className="text-[10px] font-bold text-muted-foreground/50 uppercase tracking-widest mt-1">{stat.label}</p>
                            </div>
                            <p className="text-[9px] font-black tracking-widest uppercase text-emerald-500">{stat.trend}</p>
                        </div>
                    </Card>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <Card className="border-none shadow-2xl bg-card/50 backdrop-blur-md rounded-[40px] border border-white/5 overflow-hidden">
                    <CardHeader className="p-8 border-b border-white/5 flex flex-row items-center justify-between">
                        <div>
                            <CardTitle className="text-xl font-black uppercase tracking-tight">Logical Blueprints</CardTitle>
                            <CardDescription className="text-[10px] font-bold uppercase tracking-widest">Core structural definitions</CardDescription>
                        </div>
                        <Button variant="outline" size="sm" className="rounded-xl font-black uppercase text-[9px] tracking-widest px-6 h-9">New Draft</Button>
                    </CardHeader>
                    <CardContent className="p-8 space-y-4">
                        {[
                            { name: 'Core.Accounting', items: 24, status: 'Production', color: 'bg-emerald-500' },
                            { name: 'Analytics.Behavior', items: 12, status: 'Draft', color: 'bg-amber-500' },
                            { name: 'Security.Identity', items: 8, status: 'Production', color: 'bg-emerald-500' },
                        ].map((m, i) => (
                            <div key={i} className="flex items-center justify-between p-4 rounded-3xl bg-muted/30 hover:bg-muted/50 transition-all border border-transparent hover:border-primary/10 cursor-pointer">
                                <div className="flex items-center gap-4">
                                    <div className="p-2.5 bg-card rounded-2xl shadow-sm">
                                        <Layers className="h-5 w-5 text-primary" />
                                    </div>
                                    <div>
                                        <p className="font-black text-sm">{m.name}</p>
                                        <p className="text-[10px] text-muted-foreground font-bold tracking-widest uppercase">{m.items} Elements</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className={cn("w-2 h-2 rounded-full", m.color)} />
                                    <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">{m.status}</span>
                                </div>
                            </div>
                        ))}
                    </CardContent>
                </Card>

                <Card className="border-none shadow-2xl bg-card/10 rounded-[40px] border border-primary/20 relative overflow-hidden flex flex-col items-center justify-center p-12 text-center group">
                    <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                    <div className="p-6 rounded-full bg-primary/10 text-primary mb-6 ring-8 ring-primary/5 group-hover:scale-110 transition-transform">
                        <Workflow className="h-10 w-10" />
                    </div>
                    <h2 className="text-2xl font-black uppercase tracking-tight mb-2">Visual Modeler</h2>
                    <p className="text-muted-foreground text-sm italic mb-8 max-w-xs">Start a visual design session to map out new domain entities and relationships.</p>
                    <Button className="rounded-2xl h-14 px-10 bg-primary font-black uppercase tracking-widest text-xs shadow-xl shadow-primary/20 hover:scale-105 active:scale-95 transition-all">
                        Launch Designer
                    </Button>
                </Card>
            </div>
        </div>
    );
};

export default ModelPage;
