import React from 'react';
import { Link } from 'react-router-dom';
import { Shield, Key, Eye, AlertTriangle, Fingerprint, ShieldAlert, ChevronRight } from 'lucide-react';
import { Card, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

const SecurePage: React.FC = () => {
    return (
        <div className="p-6 space-y-8 animate-in fade-in duration-500">
            <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-4 font-medium italic">
                <Link to="/" className="hover:text-foreground transition-colors uppercase tracking-widest text-[10px]">Registry</Link>
                <ChevronRight className="h-3 w-3" />
                <span className="text-foreground font-black uppercase tracking-widest text-[10px]">Secure</span>
                <ChevronRight className="h-3 w-3" />
                <span className="text-foreground/40 font-black uppercase tracking-widest text-[10px]">Dashboard</span>
            </nav>
            <header className="flex flex-col gap-2">
                <div className="flex items-center justify-between">
                    <div className="flex flex-col gap-2">
                        <div className="flex items-center gap-2 text-red-500 font-bold tracking-tight mb-1">
                            <Shield className="h-5 w-5" />
                            <span className="text-xs uppercase tracking-widest">Trust & Security</span>
                        </div>
                        <h1 className="text-4xl font-black tracking-tight text-foreground text-shadow-sm">Access Control</h1>
                        <p className="text-muted-foreground text-lg">Hardening the data perimeter with granular IAM and threat detection.</p>
                    </div>
                    <div className="flex gap-3">
                        <Badge variant="outline" className="rounded-2xl h-10 px-6 border-emerald-500/20 bg-emerald-500/5 text-emerald-500 font-black uppercase tracking-tighter">
                            Secure State
                        </Badge>
                    </div>
                </div>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <Card className="border-none shadow-2xl bg-card rounded-[40px] p-8 border border-white/5 relative overflow-hidden flex flex-col justify-between">
                    <div className="absolute top-0 left-0 w-full h-1 bg-red-600/50" />
                    <div>
                        <CardTitle className="text-[10px] font-bold uppercase tracking-[0.3em] text-muted-foreground/60 flex items-center gap-3 mb-6">
                            <AlertTriangle className="h-4 w-4 text-red-500" /> Security Incidents
                        </CardTitle>
                        <span className="text-6xl font-black tracking-tighter tabular-nums text-red-500">0</span>
                        <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest italic mt-2">Active threats detected</p>
                    </div>
                    <Button variant="outline" className="mt-8 border-red-500/20 text-red-500 hover:bg-red-500/10 font-bold uppercase text-[9px] tracking-widest rounded-xl">View Threat Map</Button>
                </Card>

                <Card className="lg:col-span-2 border-none shadow-2xl bg-slate-900 text-white rounded-[40px] p-10 overflow-hidden relative">
                    <div className="absolute bottom-0 right-0 w-96 h-96 bg-primary/10 rounded-full translate-x-32 translate-y-32 blur-[100px]" />
                    <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-12">
                        <div className="space-y-6">
                            <h3 className="text-2xl font-black uppercase tracking-tight">Identity Matrix</h3>
                            <div className="space-y-4">
                                {[
                                    { label: 'Total Principals', val: '842' },
                                    { label: 'Role Definitions', val: '24' },
                                    { label: 'Privileged Accounts', val: '12' },
                                ].map((row, i) => (
                                    <div key={i} className="flex justify-between items-end border-b border-white/10 pb-2">
                                        <span className="text-[10px] font-black uppercase tracking-widest opacity-40">{row.label}</span>
                                        <span className="font-mono font-bold text-primary">{row.val}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className="bg-white/5 rounded-[32px] p-8 space-y-6 flex flex-col items-center justify-center text-center">
                            <Fingerprint className="h-12 w-12 text-primary animate-pulse" />
                            <div>
                                <p className="text-sm font-bold opacity-80">MFA Coverage</p>
                                <p className="text-4xl font-black tracking-tighter">100%</p>
                            </div>
                        </div>
                    </div>
                </Card>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {[
                    { title: 'Zero Trust Policy', desc: 'Enforce continuous verification', icon: <ShieldAlert className="h-6 w-6" />, status: 'active' },
                    { title: 'API Key Rotation', desc: 'Auto-rotating production keys', icon: <Key className="h-6 w-6" />, status: 'scheduled' },
                    { title: 'Data Masking', desc: 'PII anonymization in non-prod', icon: <Eye className="h-6 w-6" />, status: 'active' },
                ].map((feature, i) => (
                    <Card key={i} className="border-none shadow-xl bg-card rounded-[32px] p-8 group hover:scale-[1.02] transition-all cursor-pointer">
                        <div className="flex flex-col gap-6">
                            <div className="w-12 h-12 rounded-2xl bg-muted flex items-center justify-center group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                                {feature.icon}
                            </div>
                            <div>
                                <div className="flex items-center gap-3 mb-1">
                                    <h4 className="text-lg font-black uppercase tracking-tight">{feature.title}</h4>
                                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                                </div>
                                <p className="text-sm text-muted-foreground italic">{feature.desc}</p>
                            </div>
                        </div>
                    </Card>
                ))}
            </div>
        </div>
    );
};

export default SecurePage;
