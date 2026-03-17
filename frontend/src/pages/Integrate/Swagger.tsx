import React from 'react';
import { Cable, ShieldCheck, Zap } from 'lucide-react';
import { Card } from '@/components/ui/card';

const SwaggerPage: React.FC = () => {
    // Note: We use an iframe to embed the native Swagger UI served by the backend.
    // This avoids large bundle sizes and React 19 compatibility issues with swagger-ui-react.
    return (
        <div className="p-6 space-y-8 animate-in fade-in duration-500 h-full flex flex-col">
            <header className="flex flex-col gap-2 shrink-0">
                <div className="flex items-center gap-2 text-primary font-bold tracking-tight mb-1">
                    <Cable className="h-5 w-5" />
                    <span className="text-xs uppercase tracking-widest">Integration</span>
                </div>
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-4xl font-black tracking-tight text-foreground">API Documentation</h1>
                        <p className="text-muted-foreground text-lg">Comprehensive Swagger/OpenAPI reference for DataHost services.</p>
                    </div>
                    <div className="flex gap-3">
                        <Card className="bg-primary/5 border-primary/10 px-4 py-2 flex items-center gap-2">
                            <ShieldCheck className="h-4 w-4 text-primary" />
                            <span className="text-xs font-bold text-primary uppercase tracking-tighter">Auth Required</span>
                        </Card>
                        <Card className="bg-green-500/5 border-green-500/10 px-4 py-2 flex items-center gap-2">
                            <Zap className="h-4 w-4 text-green-500" />
                            <span className="text-xs font-bold text-green-500 uppercase tracking-tighter">Live API</span>
                        </Card>
                    </div>
                </div>
            </header>

            <div className="flex-grow min-h-0">
                <Card className="w-full h-full border-none shadow-xl bg-white overflow-hidden rounded-2xl flex flex-col">
                    <div className="bg-muted/30 px-6 py-3 border-b border-muted flex items-center justify-between shrink-0">
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full bg-red-400" />
                            <div className="w-3 h-3 rounded-full bg-yellow-400" />
                            <div className="w-3 h-3 rounded-full bg-green-400" />
                        </div>
                        <span className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">Interactive API Sandbox</span>
                    </div>
                    <div className="flex-grow w-full relative">
                        <iframe
                            src="/swagger/index.html"
                            className="absolute inset-0 w-full h-full border-none"
                            title="Swagger UI"
                        />
                    </div>
                </Card>
            </div>
        </div>
    );
};

export default SwaggerPage;
