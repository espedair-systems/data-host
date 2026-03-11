import React from 'react';
import { Link } from 'react-router-dom';
import {
    Gauge,
    ChevronRight,
    Globe,
    Server,
    ShieldCheck,
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

const MySQLProjects: React.FC = () => {
    const servers = [
        { id: 'mysql-prod-01', name: 'Web Store Backend', host: 'mysql-01.aws.com', storage: '45 GB', status: 'Healthy' },
        { id: 'mariadb-staging', name: 'Dev Staging', host: 'maria-db.local', storage: '12 GB', status: 'Healthy' },
        { id: 'mysql-legacy', name: 'Old Inventory', host: 'legacy-sql.internal', storage: '8 GB', status: 'Maintenance' }
    ];

    return (
        <div className="p-6 space-y-10 max-w-7xl mx-auto animate-in fade-in duration-500">
            <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-4 font-medium">
                <Link to="/" className="hover:text-foreground transition-colors">Registry</Link>
                <ChevronRight className="h-4 w-4" />
                <Link to="/ingestion" className="hover:text-foreground transition-colors">Ingestion</Link>
                <ChevronRight className="h-4 w-4" />
                <span className="text-foreground font-bold">MySQL Projects</span>
            </nav>

            <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 shrink-0">
                <div className="flex items-center gap-4">
                    <div className="p-3.5 rounded-2xl bg-cyan-500/10 text-cyan-600 shadow-sm border border-cyan-500/20 shadow-cyan-500/5">
                        <Gauge className="h-9 w-9" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-black tracking-tight text-foreground">MySQL Nodes</h1>
                        <p className="text-muted-foreground mt-1 font-medium">Coordinate federated MySQL and MariaDB project deployments.</p>
                    </div>
                </div>
            </header>

            <div className="rounded-2xl border bg-card/40 backdrop-blur-sm overflow-hidden shadow-sm">
                <Table>
                    <TableHeader className="bg-muted/50 border-b-none">
                        <TableRow className="hover:bg-transparent border-none">
                            <TableHead className="w-[180px] h-14 px-6 uppercase text-[10px] font-black tracking-widest text-muted-foreground/60">Logical UID</TableHead>
                            <TableHead className="h-14 px-6 uppercase text-[10px] font-black tracking-widest text-muted-foreground/60">Cluster Identity</TableHead>
                            <TableHead className="h-14 px-6 uppercase text-[10px] font-black tracking-widest text-muted-foreground/60">Network Endpoint</TableHead>
                            <TableHead className="h-14 px-6 uppercase text-[10px] font-black tracking-widest text-muted-foreground/60 text-right">Meta Size</TableHead>
                            <TableHead className="h-14 px-6 uppercase text-[10px] font-black tracking-widest text-muted-foreground/60">Operational</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {servers.map((s) => (
                            <TableRow key={s.id} className="group hover:bg-muted/30 transition-colors border-muted/20">
                                <TableCell className="px-6 py-5">
                                    <div className="flex items-center gap-2">
                                        <div className="p-1.5 rounded-md bg-foreground/5 text-muted-foreground group-hover:text-cyan-500 transition-colors border border-black/5">
                                            <Globe className="h-3.5 w-3.5" />
                                        </div>
                                        <code className="text-[11px] font-mono font-bold text-muted-foreground group-hover:text-foreground transition-colors px-2 py-0.5 rounded-lg bg-muted/20 border border-muted/30">
                                            {s.id}
                                        </code>
                                    </div>
                                </TableCell>
                                <TableCell className="px-6 py-5">
                                    <span className="text-sm font-bold tracking-tight text-foreground/80 group-hover:text-foreground transition-colors">
                                        {s.name}
                                    </span>
                                </TableCell>
                                <TableCell className="px-6 py-5">
                                    <div className="flex items-center gap-2 text-muted-foreground/60 text-xs font-mono group-hover:text-cyan-600 transition-colors">
                                        <Server className="h-3 w-3" />
                                        {s.host}
                                    </div>
                                </TableCell>
                                <TableCell className="px-6 py-5 text-right font-black text-xs text-muted-foreground group-hover:text-primary transition-colors tabular-nums">
                                    {s.storage}
                                </TableCell>
                                <TableCell className="px-6 py-5">
                                    <Badge
                                        variant="outline"
                                        className={cn(
                                            "font-black text-[9px] uppercase tracking-[0.15em] py-0.5 px-3 border-none",
                                            s.status === 'Healthy' ? "bg-green-500/10 text-green-600 hover:bg-green-500/15" : "bg-amber-500/10 text-amber-600 hover:bg-amber-500/15"
                                        )}
                                    >
                                        {s.status}
                                    </Badge>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>

            <footer className="pt-4 flex items-center justify-center gap-2 text-[10px] text-muted-foreground/30 font-black uppercase tracking-[0.2em]">
                <ShieldCheck className="h-3 w-3" />
                Relational project topology is being synchronized
            </footer>
        </div>
    );
};

export default MySQLProjects;
