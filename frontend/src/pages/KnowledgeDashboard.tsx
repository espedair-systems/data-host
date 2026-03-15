import { Brain, Sparkles, BookOpen, Search, Zap } from 'lucide-react';
import { Card, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const KnowledgeDashboard: React.FC = () => {
    return (
        <div className="p-6 space-y-10 max-w-6xl mx-auto animate-in fade-in duration-500">
            <header className="flex flex-col gap-2">
                <div className="flex items-center gap-2 text-indigo-500 font-bold tracking-tight mb-1">
                    <Brain className="h-5 w-5" />
                    <span className="text-xs uppercase tracking-widest">Cognitive Layer</span>
                </div>
                <h1 className="text-4xl font-black tracking-tight text-foreground">Knowledge Base</h1>
                <p className="text-muted-foreground text-lg">Central hub for system intelligence, guidelines, and training data.</p>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                    { title: 'Guidelines', icon: <BookOpen className="h-5 w-5 text-blue-500" />, count: '24' },
                    { title: 'Training Sets', icon: <Sparkles className="h-5 w-5 text-purple-500" />, count: '12' },
                    { title: 'Search Queries', icon: <Search className="h-5 w-5 text-emerald-500" />, count: '1.2k' },
                ].map((stat, i) => (
                    <Card key={i} className="border-none shadow-xl bg-card/60 backdrop-blur-md rounded-[2rem] p-6 border border-white/5">
                        <div className="flex items-center justify-between mb-4">
                            <div className="w-12 h-12 rounded-2xl bg-muted flex items-center justify-center">
                                {stat.icon}
                            </div>
                            <Badge variant="outline" className="rounded-full bg-primary/10 text-primary border-primary/20">Active</Badge>
                        </div>
                        <div className="space-y-1">
                            <span className="text-3xl font-black">{stat.count}</span>
                            <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">{stat.title}</p>
                        </div>
                    </Card>
                ))}
            </div>

            <Card className="border-none shadow-2xl bg-primary/5 rounded-[3rem] p-12 text-center border border-primary/10">
                <div className="max-w-md mx-auto space-y-6">
                    <div className="w-20 h-20 rounded-[2rem] bg-primary/20 flex items-center justify-center mx-auto mb-8">
                        <Zap className="h-10 w-10 text-primary" />
                    </div>
                    <CardTitle className="text-2xl font-black uppercase tracking-tight">Intelligence Engine</CardTitle>
                    <CardDescription className="text-base font-medium leading-relaxed">
                        The Knowledge Dashboard is currently being populated with semantic mappings and policy enforcements.
                        Stay tuned for deep-dive analytics.
                    </CardDescription>
                </div>
            </Card>
        </div>
    );
};

export default KnowledgeDashboard;
