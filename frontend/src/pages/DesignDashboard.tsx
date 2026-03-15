import { Palette, Layout, Brush, Image } from 'lucide-react';
import { Card, CardTitle, CardDescription } from '@/components/ui/card';

const DesignDashboard: React.FC = () => {
    return (
        <div className="p-6 space-y-10 max-w-6xl mx-auto animate-in fade-in duration-500">
            <header className="flex flex-col gap-2">
                <div className="flex items-center gap-2 text-pink-500 font-bold tracking-tight mb-1">
                    <Palette className="h-5 w-5" />
                    <span className="text-xs uppercase tracking-widest">Visual Layer</span>
                </div>
                <h1 className="text-4xl font-black tracking-tight text-foreground">Design Systems</h1>
                <p className="text-muted-foreground text-lg">Managing visual tokens, component libraries, and interface standards.</p>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {[
                    { title: 'Tokens', icon: <Brush className="h-5 w-5 text-pink-500" />, val: '512' },
                    { title: 'Components', icon: <Layout className="h-5 w-5 text-indigo-500" />, val: '86' },
                    { title: 'Assets', icon: <Image className="h-5 w-5 text-amber-500" />, val: '1.4k' },
                    { title: 'Themes', icon: <Palette className="h-5 w-5 text-emerald-500" />, val: '4' },
                ].map((stat, i) => (
                    <Card key={i} className="border-none shadow-xl bg-card rounded-[2rem] p-6 border border-white/5 relative overflow-hidden group">
                        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                        <div className="relative z-10 flex flex-col gap-4">
                            <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center">
                                {stat.icon}
                            </div>
                            <div className="space-y-0.5">
                                <span className="text-2xl font-black tracking-tighter">{stat.val}</span>
                                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{stat.title}</p>
                            </div>
                        </div>
                    </Card>
                ))}
            </div>

            <Card className="border-none shadow-2xl bg-gradient-to-br from-indigo-500/5 to-pink-500/5 rounded-[3rem] p-12 text-center border border-white/5">
                <div className="max-w-md mx-auto space-y-6">
                    <div className="w-20 h-20 rounded-full bg-pink-500/10 flex items-center justify-center mx-auto mb-8 animate-pulse">
                        <Palette className="h-10 w-10 text-pink-500" />
                    </div>
                    <CardTitle className="text-2xl font-black uppercase tracking-tight italic">Design Studio <span className="not-italic text-sm text-muted-foreground/40 font-medium">Coming Soon</span></CardTitle>
                    <CardDescription className="text-base font-medium leading-relaxed">
                        The Design Management console is being integrated with the site generator.
                        Soon you will be able to manage branding and UI schemas directly from here.
                    </CardDescription>
                </div>
            </Card>
        </div>
    );
};

export default DesignDashboard;
