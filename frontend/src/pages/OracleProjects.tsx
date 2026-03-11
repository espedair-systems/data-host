import React from 'react';
import { Link } from 'react-router-dom';
import {
    Database,
    ChevronRight,
    Server,
    ShieldCheck,
    Globe,
    Box as BoxIcon
} from 'lucide-react';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { cn } from '@/lib/utils';

const OracleProjects: React.FC = () => {
    const instances = [
        { id: 'ORCL_PROD', name: 'Production ERP', host: 'db-prod-01.internal', port: 1521, status: 'Connected' },
        { id: 'ERP_TEST', name: 'ERP Staging', host: 'db-test-01.internal', port: 1521, status: 'Connected' },
        { id: 'HR_LEGACY', name: 'Legacy HR Sys', host: 'hr-legacy.internal', port: 1521, status: 'Disconnected' }
    ];

    return (
        <div className="p-6 space-y-10 max-w-7xl mx-auto animate-in fade-in duration-500">
            <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-4 font-medium">
                <Link to="/" className="hover:text-foreground transition-colors">Registry</Link>
                <ChevronRight className="h-4 w-4" />
                <Link to="/ingestion" className="hover:text-foreground transition-colors">Ingestion</Link>
                <ChevronRight className="h-4 w-4" />
                <span className="text-foreground font-bold">Oracle Projects</span>
            </nav>

            <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 shrink-0">
                <div className="flex items-center gap-4">
                    <div className="p-3.5 rounded-2xl bg-red-500/10 text-red-600 shadow-sm border border-red-500/20 shadow-green-500/5">
                        <Database className="h-9 w-9" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-black tracking-tight text-foreground">Oracle Projects</h1>
                        <p className="text-muted-foreground mt-1 font-medium">Coordinate federated Oracle Database instances and enterprise SIDs.</p>
                    </div>
                </div>
            </header>

            <div className="rounded-2xl border bg-card/40 backdrop-blur-sm overflow-hidden shadow-sm">
                <Table>
                    <TableHeader className="bg-muted/50 border-b-none">
                        <TableRow className="hover:bg-transparent border-none">
                            <TableHead className="w-[180px] h-14 px-6 uppercase text-[10px] font-black tracking-widest text-muted-foreground/60">SID / Instance</TableHead>
                            <TableHead className="h-14 px-6 uppercase text-[10px] font-black tracking-widest text-muted-foreground/60">Cluster Alias</TableHead>
                            <TableHead className="h-14 px-6 uppercase text-[10px] font-black tracking-widest text-muted-foreground/60">Host Endpoint</TableHead>
                            <TableHead className="h-14 px-6 uppercase text-[10px] font-black tracking-widest text-muted-foreground/60 text-right">Port</TableHead>
                            <TableHead className="h-14 px-6 uppercase text-[10px] font-black tracking-widest text-muted-foreground/60">Operational</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {instances.map((db) => (
                            <TableRow key={db.id} className="group hover:bg-muted/30 transition-colors border-muted/20">
                                <TableCell className="px-6 py-5">
                                    <div className="flex items-center gap-2">
                                        <div className="p-1.5 rounded-md bg-foreground/5 text-muted-foreground group-hover:text-red-500 transition-colors border border-black/5">
                                            {db.id.includes('PROD') ? <Server className="h-3.5 w-3.5" /> : <BoxIcon className="h-3.5 w-3.5" />}
                                        </div>
                                        <code className="text-[11px] font-mono font-bold text-muted-foreground group-hover:text-foreground transition-colors px-2 py-0.5 rounded-lg bg-muted/20 border border-muted/30 uppercase">
                                            {db.id}
                                        </code>
                                    </div>
                                </TableCell>
                                <TableCell className="px-6 py-5">
                                    <span className="text-sm font-bold tracking-tight text-foreground/80 group-hover:text-foreground transition-colors uppercase">
                                        {db.name}
                                    </span>
                                </TableCell>
                                <TableCell className="px-6 py-5">
                                    <div className="flex items-center gap-2 text-muted-foreground/60 group-hover:text-muted-foreground transition-colors">
                                        <Globe className="h-3 w-3" />
                                        <span className="text-[11px] font-mono">{db.host}</span>
                                    </div>
                                </TableCell>
                                <TableCell className="px-6 py-5 text-right font-black text-xs text-muted-foreground group-hover:text-primary transition-colors tabular-nums">
                                    {db.port}
                                </TableCell>
                                <TableCell className="px-6 py-5">
                                    <Badge
                                        variant="outline"
                                        className={cn(
                                            "font-black text-[9px] uppercase tracking-[0.15em] py-0.5 px-3 border-none shadow-sm",
                                            db.status === 'Connected' ? "bg-green-500/10 text-green-600 hover:bg-green-500/15" : "bg-red-500/10 text-red-600 hover:bg-red-500/15"
                                        )}
                                    >
                                        {db.status}
                                    </Badge>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>

            <footer className="pt-4 flex items-center justify-center gap-2 text-[10px] text-muted-foreground/30 font-black uppercase tracking-[0.2em]">
                <ShieldCheck className="h-3 w-3" />
                Enterprise OCI topology is being synchronized across active listeners
            </footer>
        </div>
    );
};

export default OracleProjects;
