import React from 'react';
import { Construction, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface MockPageProps {
    title: string;
    parent?: string;
    icon?: React.ReactNode;
}

const MockPage: React.FC<MockPageProps> = ({ title, parent, icon }) => {
    return (
        <div className="p-6 space-y-10 max-w-7xl mx-auto animate-in fade-in duration-500">
            <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-4 font-medium italic">
                <Link to="/" className="hover:text-foreground transition-colors uppercase tracking-widest text-[10px]">Registry</Link>
                {parent && (
                    <>
                        <ChevronRight className="h-3 w-3" />
                        <span className="uppercase tracking-widest text-[10px]">{parent}</span>
                    </>
                )}
                <ChevronRight className="h-3 w-3" />
                <span className="text-foreground font-black uppercase tracking-widest text-[10px]">{title}</span>
            </nav>

            <header className="flex items-center gap-6">
                <div className="p-4 rounded-2xl bg-primary/10 text-primary shadow-sm border border-primary/20">
                    {icon || <Construction className="h-10 w-10 shrink-0" />}
                </div>
                <h1 className="text-4xl font-black tracking-tighter uppercase italic leading-none">
                    {title} <span className="text-muted-foreground/30 not-italic">Workspace</span>
                </h1>
            </header>

            <Card className="rounded-[40px] border-slate-200 dark:border-slate-800 bg-card/60 backdrop-blur-xl shadow-2xl relative overflow-hidden">
                <CardContent className="p-20 text-center space-y-8">
                    <div className="w-24 h-24 rounded-full bg-primary/5 flex items-center justify-center mx-auto ring-8 ring-primary/5">
                        <Construction className="h-12 w-12 text-primary animate-bounce" />
                    </div>
                    <div className="space-y-4">
                        <h2 className="text-2xl font-black uppercase italic tracking-tight">Under Construction</h2>
                        <p className="text-muted-foreground max-w-md mx-auto italic">
                            This specialized workspace is currently being provisioned. Advanced functional logic for <span className="text-foreground font-bold">{title}</span> will be available in the next deployment cycle.
                        </p>
                    </div>
                    <Button variant="outline" className="rounded-xl font-black uppercase text-[10px] tracking-widest px-10 h-12">
                        View Roadmap
                    </Button>
                </CardContent>
            </Card>
        </div>
    );
};

export default MockPage;
