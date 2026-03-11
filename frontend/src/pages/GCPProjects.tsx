import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
    ChevronRight,
    Terminal,
    Globe,
    ShieldCheck
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

const GCPProjects: React.FC = () => {
    const location = useLocation();
    const isGCS = location.pathname.includes('/gcs');
    const typeLabel = isGCS ? 'Cloud Storage' : 'BigQuery';

    // Placeholder data common to GCP
    const projects = [
        { id: 'marketing-prod', name: 'Marketing Production', datasets: 5, tables: 24, lastSample: '2026-03-08' },
        { id: 'finance-data', name: 'Finance Analytics', datasets: 2, tables: 12, lastSample: '2026-03-08' },
        { id: 'ops-backend', name: 'Operations Backend', datasets: 8, tables: 56, lastSample: '2026-03-07' },
        { id: 'sandbox-jon', name: 'Developer Sandbox', datasets: 1, tables: 3, lastSample: '2026-02-15' }
    ];

    return (
        <div className="p-6 space-y-10 max-w-7xl mx-auto animate-in fade-in duration-500 text-foreground">
            <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-4 font-medium">
                <Link to="/" className="hover:text-foreground transition-colors">Registry</Link>
                <ChevronRight className="h-4 w-4" />
                <Link to="/ingestion" className="hover:text-foreground transition-colors">Ingestion</Link>
                <ChevronRight className="h-4 w-4" />
                <span className="text-foreground font-bold">{typeLabel} Projects</span>
            </nav>

            <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 shrink-0">
                <div className="flex items-center gap-4">
                    <div className="p-3.5 rounded-2xl bg-indigo-500/10 text-indigo-500 shadow-sm border border-indigo-500/20 shadow-indigo-500/5">
                        <Terminal className="h-9 w-9" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-black tracking-tight">{typeLabel} Nodes</h1>
                        <p className="text-muted-foreground mt-1 font-medium">Coordinate federated projects across BigQuery clusters and storage assets.</p>
                    </div>
                </div>
            </header>

            <div className="rounded-2xl border bg-card/40 backdrop-blur-sm overflow-hidden shadow-sm">
                <Table>
                    <TableHeader className="bg-muted/50 border-b-none">
                        <TableRow className="hover:bg-transparent border-none">
                            <TableHead className="w-[200px] h-14 px-6 uppercase text-[10px] font-black tracking-widest text-muted-foreground/60">Node Identity</TableHead>
                            <TableHead className="h-14 px-6 uppercase text-[10px] font-black tracking-widest text-muted-foreground/60">Display Alias</TableHead>
                            <TableHead className="h-14 px-6 uppercase text-[10px] font-black tracking-widest text-muted-foreground/60 text-right">{isGCS ? 'Buckets' : 'Datasets'}</TableHead>
                            <TableHead className="h-14 px-6 uppercase text-[10px] font-black tracking-widest text-muted-foreground/60 text-right">{isGCS ? 'Objects' : 'Entities'}</TableHead>
                            <TableHead className="h-14 px-6 uppercase text-[10px] font-black tracking-widest text-muted-foreground/60">Final Scan</TableHead>
                            <TableHead className="h-14 px-6 uppercase text-[10px] font-black tracking-widest text-muted-foreground/60">Operational</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {projects.map((project) => (
                            <TableRow key={project.id} className="group hover:bg-muted/30 transition-colors border-muted/20">
                                <TableCell className="px-6 py-5">
                                    <div className="flex items-center gap-2">
                                        <div className="p-1.5 rounded-md bg-foreground/5 text-muted-foreground group-hover:text-primary transition-colors border border-black/5">
                                            <Globe className="h-3.5 w-3.5" />
                                        </div>
                                        <code className="text-[11px] font-mono font-bold text-muted-foreground group-hover:text-foreground transition-colors px-2 py-0.5 rounded-lg bg-muted/20 border border-muted/30">
                                            {project.id}
                                        </code>
                                    </div>
                                </TableCell>
                                <TableCell className="px-6 py-5">
                                    <span className="text-sm font-bold tracking-tight text-foreground/80 group-hover:text-foreground transition-colors">
                                        {project.name}
                                    </span>
                                </TableCell>
                                <TableCell className="px-6 py-5 text-right font-black text-xs text-muted-foreground group-hover:text-primary transition-colors tabular-nums">
                                    {project.datasets}
                                </TableCell>
                                <TableCell className="px-6 py-5 text-right font-black text-xs text-muted-foreground group-hover:text-primary transition-colors tabular-nums">
                                    {project.tables}
                                </TableCell>
                                <TableCell className="px-6 py-5">
                                    <span className="text-[11px] font-bold text-muted-foreground/60 tabular-nums">
                                        {project.lastSample}
                                    </span>
                                </TableCell>
                                <TableCell className="px-6 py-5">
                                    <Badge
                                        variant="outline"
                                        className="font-black text-[9px] uppercase tracking-[0.15em] py-0.5 px-3 border-none bg-green-500/10 text-green-600 hover:bg-green-500/15"
                                    >
                                        Active
                                    </Badge>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>

            <footer className="pt-4 flex items-center justify-center gap-2 text-[10px] text-muted-foreground/30 font-black uppercase tracking-[0.2em]">
                <ShieldCheck className="h-3 w-3" />
                Cross-project reconciliation active & encrypted
            </footer>
        </div>
    );
};

export default GCPProjects;
