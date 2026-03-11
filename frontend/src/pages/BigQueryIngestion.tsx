import React from 'react';
import { Link } from 'react-router-dom';
import {
    Database,
    Info,
    ShieldCheck,
    ChevronRight,
    Zap,
    KeyRound,
    Search
} from 'lucide-react';
import {
    Card,
    CardContent
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { toast } from 'sonner';

const BigQueryIngestion: React.FC = () => {
    return (
        <div className="p-6 space-y-10 max-w-4xl mx-auto animate-in fade-in duration-500">
            <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-4 font-medium">
                <Link to="/" className="hover:text-foreground transition-colors">Registry</Link>
                <ChevronRight className="h-4 w-4" />
                <Link to="/ingestion" className="hover:text-foreground transition-colors">Ingestion</Link>
                <ChevronRight className="h-4 w-4" />
                <span className="text-foreground font-bold text-indigo-500">BigQuery Ingestion</span>
            </nav>

            <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 shrink-0">
                <div className="flex items-center gap-4">
                    <div className="p-3.5 rounded-2xl bg-[#4285F4]/10 text-[#4285F4] shadow-sm border border-[#4285F4]/20">
                        <Database className="h-10 w-10" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-black tracking-tight text-foreground">BigQuery Ingestion</h1>
                        <p className="text-muted-foreground mt-1 font-medium">Map automated schema definitions from GCP data clusters.</p>
                    </div>
                </div>
            </header>

            <Card className="border-none shadow-xl bg-card/60 backdrop-blur-sm shadow-indigo-500/5">
                <CardContent className="p-8 space-y-8">
                    <Alert className="bg-blue-500/5 border-blue-200/50 text-blue-700 rounded-xl">
                        <Info className="h-4 w-4" />
                        <AlertTitle className="font-bold">IAM Requirements</AlertTitle>
                        <AlertDescription className="text-xs font-semibold opacity-80">
                            Ensure your service account has <strong className="text-blue-900 underline underline-offset-2">BigQuery Metadata Viewer</strong> permissions for the target dataset.
                        </AlertDescription>
                    </Alert>

                    <div className="space-y-6">
                        <div className="flex items-center gap-2 border-b pb-4 border-muted/30">
                            <Search className="h-4 w-4 text-primary/60" />
                            <h3 className="text-sm font-black uppercase tracking-widest text-muted-foreground">Endpoint Identification</h3>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <Label htmlFor="projectId" className="text-xs font-bold uppercase tracking-wider text-muted-foreground/70">GCP Project ID</Label>
                                <Input
                                    id="projectId"
                                    placeholder="e.g. core-analytics-prod"
                                    className="bg-muted/30 border-none h-11 focus-visible:ring-1 focus-visible:ring-primary font-mono text-sm"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="datasetId" className="text-xs font-bold uppercase tracking-wider text-muted-foreground/70">Dataset ID</Label>
                                <Input
                                    id="datasetId"
                                    placeholder="e.g. user_telemetry_v1"
                                    className="bg-muted/30 border-none h-11 focus-visible:ring-1 focus-visible:ring-primary font-mono text-sm"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="space-y-6">
                        <div className="flex items-center gap-2 border-b pb-4 border-muted/30">
                            <KeyRound className="h-4 w-4 text-primary/60" />
                            <h3 className="text-sm font-black uppercase tracking-widest text-muted-foreground">Identity & Access</h3>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="jsonKey" className="text-xs font-bold uppercase tracking-wider text-muted-foreground/70">Service Account Key (JSON)</Label>
                            <Textarea
                                id="jsonKey"
                                placeholder='{ "type": "service_account", "project_id": "...", ... }'
                                className="bg-muted/30 border-none min-h-[200px] focus-visible:ring-1 focus-visible:ring-primary font-mono text-sm resize-none p-6 rounded-2xl"
                            />
                        </div>
                    </div>

                    <div className="flex items-center justify-between pt-4 border-t border-muted/30">
                        <Button
                            variant="ghost"
                            className="font-bold uppercase tracking-widest text-xs h-12 px-6 rounded-xl hover:bg-muted"
                            onClick={() => toast.info("Diagnostics started", { description: "Verifying credentials against GCP IAM..." })}
                        >
                            <Zap className="h-4 w-4 mr-2" />
                            Test Connection
                        </Button>
                        <Button
                            className="font-bold uppercase tracking-widest text-xs h-12 px-8 rounded-xl shadow-lg shadow-primary/20 bg-indigo-600 hover:bg-indigo-700"
                            onClick={() => toast.success("Ingestion queued", { description: "Analyzing BigQuery schema structure..." })}
                        >
                            Import Dataset Schema
                        </Button>
                    </div>
                </CardContent>
            </Card>

            <footer className="flex items-center justify-center gap-2 text-[10px] text-muted-foreground/40 font-black uppercase tracking-[0.2em]">
                <ShieldCheck className="h-3 w-3" />
                Secure tunneling via mTLS enabled for all ingestion vectors
            </footer>
        </div>
    );
};

export default BigQueryIngestion;
