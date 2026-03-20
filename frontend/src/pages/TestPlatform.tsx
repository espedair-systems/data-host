import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Database,
    ArrowLeft,
    Zap,
    LayoutDashboard,
    Binary,
    Layers
} from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

const TestPlatform: React.FC = () => {
    const navigate = useNavigate();

    const erds = [
        {
            id: 'erd1',
            name: 'ERD1: Blog Engine',
            schema: 'blog_app',
            description: 'Relational structure for authors, posts, categories, and hierarchical comments.',
            color: 'bg-emerald-500/10',
            icon: <Layers className="h-8 w-8 text-emerald-500" />
        },
        {
            id: 'erd2',
            name: 'ERD2: Retail Matrix',
            schema: 'Retail Operations',
            description: 'Supply chain, inventory hubs, and omnichannel sales metadata.',
            color: 'bg-indigo-500/10',
            icon: <Binary className="h-8 w-8 text-indigo-500" />
        },
        {
            id: 'erd3',
            name: 'ERD3: Logistic Node',
            schema: 'Global Logistics',
            description: 'Real-time routing, freight manifests, and carrier network blueprints.',
            color: 'bg-emerald-500/10',
            icon: <Zap className="h-8 w-8 text-emerald-500" />
        }
    ];

    const handleErdClick = (erdId: string, schemaName: string) => {
        if (erdId === 'erd1') {
            navigate('/platforms/test/erd1');
        } else if (erdId === 'erd2') {
            navigate('/platforms/test/erd2');
        } else {
            navigate(`/model/entities?schema=${encodeURIComponent(schemaName)}`);
        }
    };

    return (
        <div className="space-y-10 animate-in fade-in slide-in-from-bottom-6 duration-700 max-w-6xl mx-auto p-6">
            <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-8 border-b border-white/5">
                <div className="space-y-3">
                    <Button
                        variant="ghost"
                        size="sm"
                        className="p-0 h-6 hover:bg-transparent text-muted-foreground hover:text-primary font-bold text-[10px] uppercase tracking-widest gap-1"
                        onClick={() => navigate('/platforms')}
                    >
                        <ArrowLeft className="h-3 w-3" />
                        Infrastructure Catalog
                    </Button>
                    <div className="flex items-center gap-2 text-red-500 font-black uppercase tracking-[0.3em] text-[10px]">
                        <Zap className="h-3.5 w-3.5 fill-current" />
                        Validation Sandbox
                    </div>
                    <h1 className="text-5xl font-black tracking-tighter italic uppercase">
                        Test <span className="text-muted-foreground/20 not-italic">Environment</span>
                    </h1>
                    <p className="text-muted-foreground text-lg italic max-w-2xl font-medium leading-relaxed">
                        Experimental modeling playground. Select an ERD blueprint to launch the visual engine with pre-configured schemas.
                    </p>
                </div>
                <div>
                    <Badge variant="outline" className="bg-red-500/5 text-red-500 border-red-500/20 px-4 py-2 rounded-xl font-black text-[10px] uppercase tracking-widest">
                        Isolated Instance
                    </Badge>
                </div>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {erds.map((erd) => (
                    <Card
                        key={erd.id}
                        className="group relative overflow-hidden border border-white/5 bg-card/60 hover:bg-card/90 transition-all duration-300 cursor-pointer rounded-[2rem] shadow-xl hover:shadow-primary/5 hover:translate-y-[-2px]"
                        onClick={() => handleErdClick(erd.id, erd.schema)}
                    >
                        <div className={`absolute top-0 right-0 w-24 h-24 blur-[40px] rounded-full -mr-12 -mt-12 opacity-20 ${erd.color}`} />

                        <CardHeader className="p-8 pb-4">
                            <div className="p-4 rounded-2xl bg-background/50 border border-white/5 w-fit group-hover:scale-110 transition-transform duration-500">
                                {erd.icon}
                            </div>
                        </CardHeader>

                        <CardContent className="p-8 pt-4">
                            <div className="space-y-4">
                                <div className="space-y-1">
                                    <p className="text-[9px] font-black text-primary uppercase tracking-[0.2em]">Blueprint Profile</p>
                                    <h3 className="text-xl font-black tracking-tight group-hover:text-primary transition-colors">{erd.name}</h3>
                                </div>
                                <p className="text-xs text-muted-foreground italic font-medium leading-relaxed line-clamp-2">
                                    {erd.description}
                                </p>
                                <div className="pt-4 flex items-center justify-between border-t border-white/5 mt-4">
                                    <div className="flex items-center gap-1.5">
                                        <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                        <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">Sandbox Ready</span>
                                    </div>
                                    <Button variant="ghost" size="icon" className="h-8 w-8 rounded-xl bg-muted/50 text-muted-foreground transition-all group-hover:bg-primary group-hover:text-primary-foreground">
                                        <LayoutDashboard className="h-3.5 w-3.5" />
                                    </Button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <div className="p-10 rounded-[3rem] bg-muted/10 border border-white/5 flex flex-col items-center text-center gap-6">
                <div className="w-16 h-16 rounded-full bg-background flex items-center justify-center border border-white/5 shadow-inner">
                    <Database className="h-6 w-6 text-muted-foreground/40" />
                </div>
                <div className="space-y-2">
                    <h4 className="text-lg font-black tracking-tight">Manual Schema Push</h4>
                    <p className="text-sm text-muted-foreground max-w-md italic">
                        Need to test a custom JSON blueprint? Drop your schema file here to generate an ephemeral ERD rendering.
                    </p>
                </div>
                <Button variant="secondary" className="rounded-2xl font-black text-[10px] uppercase tracking-widest h-11 px-8 shadow-2xl">
                    Open Ingestion Queue
                </Button>
            </div>
        </div>
    );
};

export default TestPlatform;
