import React from 'react';
import { Link } from 'react-router-dom';
import { UserCheck, ShieldCheck, Activity, Users, ClipboardCheck, History, ChevronRight } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

const StewardPage: React.FC = () => {
    return (
        <div className="p-6 space-y-8 animate-in fade-in duration-500">
            <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-4 font-medium italic">
                <Link to="/" className="hover:text-foreground transition-colors uppercase tracking-widest text-[10px]">Registry</Link>
                <ChevronRight className="h-3 w-3" />
                <span className="text-foreground font-black uppercase tracking-widest text-[10px]">Steward</span>
                <ChevronRight className="h-3 w-3" />
                <span className="text-foreground/40 font-black uppercase tracking-widest text-[10px]">Dashboard</span>
            </nav>
            <header className="flex flex-col gap-2">
                <div className="flex items-center justify-between">
                    <div className="flex flex-col gap-2">
                        <div className="flex items-center gap-2 text-primary font-bold tracking-tight mb-1">
                            <UserCheck className="h-5 w-5" />
                            <span className="text-xs uppercase tracking-widest">Governance Hub</span>
                        </div>
                        <h1 className="text-4xl font-black tracking-tight text-foreground text-shadow-sm">Data Stewardship</h1>
                        <p className="text-muted-foreground text-lg">Overseeing data quality, ownership, and compliance lifecycle.</p>
                    </div>
                    <Badge variant="outline" className="rounded-2xl h-10 px-6 border-primary/20 bg-primary/5 text-primary font-black uppercase tracking-tighter">
                        Active Oversight
                    </Badge>
                </div>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Card className="border-none shadow-2xl bg-card rounded-[40px] p-8 border border-white/5 relative overflow-hidden">
                            <CardHeader className="p-0 mb-6">
                                <CardTitle className="text-[10px] font-bold uppercase tracking-[0.3em] text-muted-foreground/60 flex items-center gap-3">
                                    <ShieldCheck className="h-4 w-4 text-emerald-500" /> Compliance Rating
                                </CardTitle>
                            </CardHeader>
                            <div className="space-y-4">
                                <span className="text-5xl font-black tracking-tighter tabular-nums">94.2%</span>
                                <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                                    <div className="h-full bg-emerald-500 rounded-full" style={{ width: '94.2%' }} />
                                </div>
                                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest text-right">+2.1% from last audit</p>
                            </div>
                        </Card>

                        <Card className="border-none shadow-2xl bg-card rounded-[40px] p-8 border border-white/5 relative overflow-hidden">
                            <CardHeader className="p-0 mb-6">
                                <CardTitle className="text-[10px] font-bold uppercase tracking-[0.3em] text-muted-foreground/60 flex items-center gap-3">
                                    <Activity className="h-4 w-4 text-blue-500" /> Remediation Tasks
                                </CardTitle>
                            </CardHeader>
                            <div className="flex flex-col gap-2">
                                <span className="text-5xl font-black tracking-tighter tabular-nums">12</span>
                                <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest italic">Pending quality flags</p>
                            </div>
                        </Card>
                    </div>

                    <Card className="border-none shadow-2xl bg-card/50 backdrop-blur-md rounded-[40px] border border-white/5 overflow-hidden">
                        <CardHeader className="p-8 border-b border-white/5">
                            <CardTitle className="text-xl font-black uppercase tracking-tight">Recent Stewardship Actions</CardTitle>
                            <CardDescription className="text-[10px] font-bold uppercase tracking-widest">Audit logs and manual overrides</CardDescription>
                        </CardHeader>
                        <CardContent className="p-0">
                            {[
                                { user: 'Admin', action: 'Approved metadata change', object: 'Core.User', time: '2h ago' },
                                { user: 'System', action: 'Flagged missing documentation', object: 'Sales.Orders', time: '5h ago' },
                                { user: 'Librarian', action: 'Reassigned ownership', object: 'Finance.Ledger', time: '1d ago' },
                            ].map((log, i) => (
                                <div key={i} className="flex items-center justify-between p-6 hover:bg-white/5 transition-colors border-b border-white/5 last:border-0 group">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                                            <History className="h-5 w-5" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold text-foreground/80">{log.action}</p>
                                            <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/40">{log.object} • By {log.user}</p>
                                        </div>
                                    </div>
                                    <span className="text-[10px] font-bold text-muted-foreground italic">{log.time}</span>
                                </div>
                            ))}
                        </CardContent>
                    </Card>
                </div>

                <div className="space-y-8">
                    <Card className="border-none shadow-2xl bg-primary text-primary-foreground rounded-[40px] p-8 overflow-hidden relative">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-2xl" />
                        <CardHeader className="p-0 mb-6">
                            <CardTitle className="text-[10px] font-black uppercase tracking-[0.3em] opacity-70 flex items-center gap-2">
                                <Users className="h-4 w-4" /> Data Custodians
                            </CardTitle>
                        </CardHeader>
                        <div className="space-y-4">
                            <p className="text-xs italic opacity-80">8 active stewards assigned to 24 core domains.</p>
                            <Button className="w-full bg-white text-primary font-black uppercase text-[10px] tracking-widest h-12 rounded-2xl hover:bg-white/90">
                                Manage Teams
                            </Button>
                        </div>
                    </Card>

                    <Card className="border-none shadow-2xl bg-card rounded-[40px] p-8 border border-white/5">
                        <CardHeader className="p-0 mb-6">
                            <CardTitle className="text-[10px] font-bold uppercase tracking-[0.3em] text-muted-foreground/60 flex items-center gap-3">
                                <ClipboardCheck className="h-4 w-4" /> Health Score
                            </CardTitle>
                        </CardHeader>
                        <div className="space-y-6">
                            {[
                                { label: 'Completeness', val: 98 },
                                { label: 'Accuracy', val: 92 },
                                { label: 'Consistency', val: 89 }
                            ].map((s, i) => (
                                <div key={i} className="space-y-2">
                                    <div className="flex justify-between items-center text-[8px] font-black uppercase tracking-widest opacity-40">
                                        <span>{s.label}</span>
                                        <span>{s.val}%</span>
                                    </div>
                                    <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                                        <div className="h-full bg-primary/40 rounded-full" style={{ width: `${s.val}%` }} />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default StewardPage;
