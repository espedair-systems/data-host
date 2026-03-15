import React from 'react';
import { Rocket, Send, Globe, ArrowUpRight } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

const PublishPage: React.FC = () => {
    return (
        <div className="p-6 space-y-8 animate-in fade-in duration-500">
            <header className="flex flex-col gap-2">
                <div className="flex items-center gap-2 text-primary font-bold tracking-tight mb-1">
                    <Rocket className="h-5 w-5" />
                    <span className="text-xs uppercase tracking-widest">Astro Integration</span>
                </div>
                <h1 className="text-4xl font-black tracking-tight text-foreground">Site Publication</h1>
                <p className="text-muted-foreground text-lg">Manage and deploy your curated data assets to the public-facing portal.</p>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <Card className="border-none shadow-md bg-card/50 backdrop-blur-sm">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Globe className="h-5 w-5 text-blue-500" />
                            Live Portal
                        </CardTitle>
                        <CardDescription>Current status of the published environment.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center justify-between p-4 bg-emerald-500/5 border border-emerald-500/20 rounded-xl">
                            <span className="text-sm font-bold text-emerald-600">Status: Operational</span>
                            <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                        </div>
                        <Button className="w-full gap-2 rounded-xl" variant="outline">
                            Visit Site <ArrowUpRight className="h-4 w-4" />
                        </Button>
                    </CardContent>
                </Card>

                <Card className="border-none shadow-md bg-card/50 backdrop-blur-sm lg:col-span-2">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Send className="h-5 w-5 text-primary" />
                            Deployment Pipeline
                        </CardTitle>
                        <CardDescription>Trigger a new build of the Astro-based frontend.</CardDescription>
                    </CardHeader>
                    <CardContent className="flex flex-col items-center justify-center py-8 text-center bg-muted/20 rounded-xl border border-dashed m-6">
                        <p className="text-sm text-muted-foreground mb-4">No pending changes in the curation queue.</p>
                        <Button disabled className="rounded-xl font-bold">
                            Start Production Build
                        </Button>
                    </CardContent>
                </Card>
                <Card className="border-none shadow-md bg-card/50 backdrop-blur-sm">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60">Site Metrics</CardTitle>
                    </CardHeader>
                    <CardContent className="grid grid-cols-2 gap-4">
                        <div className="p-3 bg-muted/30 rounded-xl">
                            <p className="text-xl font-black">2.4k</p>
                            <p className="text-[9px] font-bold text-muted-foreground uppercase">Visitors</p>
                        </div>
                        <div className="p-3 bg-muted/30 rounded-xl">
                            <p className="text-xl font-black">84</p>
                            <p className="text-[9px] font-bold text-muted-foreground uppercase">Assets</p>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default PublishPage;
