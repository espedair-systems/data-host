import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
    Cloud,
    Plus,
    Trash2,
    ChevronRight,
    FileJson,
    Database,
    CheckCircle2,
    Shield
} from 'lucide-react';
import { cn } from '@/lib/utils';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { toast } from 'sonner';

interface GCPConnection {
    id: string;
    name: string;
    description?: string;
    projectId: string;
    serviceAccount: string;
    status: 'Active' | 'Error' | 'Pending';
}

const GCPConnections: React.FC = () => {
    const location = useLocation();
    const isGCS = location.pathname.includes('/gcs');
    const isPlatform = location.pathname.includes('/platforms/');
    const platformType = location.pathname.split('/')[2];
    const platformLabels: Record<string, string> = { gcp: 'GCP', aws: 'AWS', gcve: 'GCVE', saas: 'SaaS' };
    const typeLabel = isPlatform ? (platformLabels[platformType] || 'Platform') : (isGCS ? 'Cloud Storage' : 'BigQuery');
    const parentPath = isPlatform ? `/ platforms / ${platformType} ` : '/ingestion';
    const parentLabel = isPlatform ? (platformLabels[platformType] || 'Platform') : 'Ingestion';

    const [connections, setConnections] = useState<GCPConnection[]>([
        { id: '1', name: 'Marketing Data', description: 'Production GCP assets for analytics', projectId: 'bq-prod-123', serviceAccount: 'gcp-reader@prod.iam.gserviceaccount.com', status: 'Active' },
        { id: '2', name: 'Log Archive', description: 'Internal system logs storage', projectId: 'internal-logs', serviceAccount: 'log-collector@internal.iam.gserviceaccount.com', status: 'Active' },
        { id: '3', name: 'Test Lab', description: 'Development and testing playground', projectId: 'test-lab-321', serviceAccount: 'dev-user@test.iam.gserviceaccount.com', status: 'Error' }
    ]);

    const [open, setOpen] = useState(false);
    const [newConn, setNewConn] = useState({ name: '', description: '', projectId: '', serviceAccount: '' });

    const handleClose = () => {
        setOpen(false);
        setNewConn({ name: '', description: '', projectId: '', serviceAccount: '' });
    };

    const handleAdd = () => {
        const id = Math.random().toString(36).substr(2, 9);
        setConnections([...connections, {
            id,
            name: newConn.name || 'New Connection',
            description: newConn.description,
            projectId: newConn.projectId || 'project-id',
            serviceAccount: newConn.serviceAccount || 'service-account@iam.gserviceaccount.com',
            status: 'Active'
        }]);
        toast.success("Connection added", {
            description: `Successfully registered connection: ${newConn.name || 'New Connection'} `
        });
        handleClose();
    };

    const handleDelete = (id: string) => {
        const conn = connections.find(c => c.id === id);
        setConnections(connections.filter(c => c.id !== id));
        toast.error("Connection removed", {
            description: `Disconnected from ${conn?.name} `
        });
    };

    return (
        <div className="p-6 space-y-8 max-w-7xl mx-auto animate-in fade-in duration-500">
            <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-4 font-medium">
                <Link to="/" className="hover:text-foreground transition-colors">Registry</Link>
                <ChevronRight className="h-4 w-4" />
                <Link to={parentPath} className="hover:text-foreground transition-colors">{parentLabel}</Link>
                <ChevronRight className="h-4 w-4" />
                <span className="text-foreground font-bold">{typeLabel} Connections</span>
            </nav>

            <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 shrink-0">
                <div className="flex items-center gap-4">
                    <div className="p-3.5 rounded-2xl bg-primary/10 text-primary shadow-sm border border-primary/20">
                        <Cloud className="h-10 w-10" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-black tracking-tight text-foreground">{typeLabel} Connections</h1>
                        <p className="text-muted-foreground mt-1 font-medium">Manage shared endpoint connectivity and identity access.</p>
                    </div>
                </div>

                <Dialog open={open} onOpenChange={setOpen}>
                    <DialogTrigger asChild>
                        <Button className="gap-2 px-6 h-11 rounded-xl shadow-lg shadow-primary/20 font-bold">
                            <Plus className="h-5 w-5" />
                            Add Connection
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[425px] rounded-3xl p-8">
                        <DialogHeader>
                            <DialogTitle className="text-2xl font-black tracking-tight">Add GCP Connection</DialogTitle>
                            <DialogDescription>
                                Input project credentials to establish a secure data bridge.
                            </DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-6 py-4 mt-2">
                            <div className="space-y-2">
                                <Label htmlFor="name" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Connection Name</Label>
                                <Input
                                    id="name"
                                    placeholder="e.g. Analytics Data"
                                    className="bg-muted/50 border-none h-11 focus-visible:ring-1 focus-visible:ring-primary"
                                    value={newConn.name}
                                    onChange={(e) => setNewConn({ ...newConn, name: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="description" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Description</Label>
                                <Textarea
                                    id="description"
                                    placeholder="Purpose of this connection..."
                                    className="bg-muted/50 border-none resize-none focus-visible:ring-1 focus-visible:ring-primary"
                                    value={newConn.description}
                                    onChange={(e) => setNewConn({ ...newConn, description: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="projectId" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">GCP Project ID</Label>
                                <Input
                                    id="projectId"
                                    placeholder="project-id-123"
                                    className="bg-muted/50 border-none h-11 focus-visible:ring-1 focus-visible:ring-primary font-mono"
                                    value={newConn.projectId}
                                    onChange={(e) => setNewConn({ ...newConn, projectId: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="serviceAccount" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Service Account Email</Label>
                                <Input
                                    id="serviceAccount"
                                    placeholder="name@project.iam.gserviceaccount.com"
                                    className="bg-muted/50 border-none h-11 focus-visible:ring-1 focus-visible:ring-primary"
                                    value={newConn.serviceAccount}
                                    onChange={(e) => setNewConn({ ...newConn, serviceAccount: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">JSON Key File</Label>
                                <div className="p-4 border-2 border-dashed rounded-xl flex items-center gap-3 text-muted-foreground/60 hover:text-primary hover:border-primary/50 cursor-pointer transition-all bg-muted/20">
                                    <FileJson className="h-6 w-6" />
                                    <span className="text-sm font-bold uppercase tracking-tight">Click to upload .json key</span>
                                </div>
                            </div>
                        </div>
                        <DialogFooter className="mt-4">
                            <Button variant="ghost" onClick={handleClose} className="font-bold uppercase tracking-widest text-xs">Cancel</Button>
                            <Button onClick={handleAdd} className="font-bold px-8 rounded-xl">Save Connection</Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </header>

            <div className="rounded-2xl border bg-card/40 backdrop-blur-sm overflow-hidden shadow-sm">
                <Table>
                    <TableHeader className="bg-muted/50">
                        <TableRow className="hover:bg-transparent border-none">
                            <TableHead className="w-[300px] h-12 uppercase text-[10px] font-black tracking-widest text-muted-foreground/60 px-6">Connection Identity</TableHead>
                            <TableHead className="h-12 uppercase text-[10px] font-black tracking-widest text-muted-foreground/60 px-6">Project Context</TableHead>
                            <TableHead className="h-12 uppercase text-[10px] font-black tracking-widest text-muted-foreground/60 px-6">Identity Principal</TableHead>
                            <TableHead className="h-12 uppercase text-[10px] font-black tracking-widest text-muted-foreground/60 px-6">State</TableHead>
                            <TableHead className="h-12 text-right uppercase text-[10px] font-black tracking-widest text-muted-foreground/60 px-6">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {connections.map((conn) => (
                            <TableRow key={conn.id} className="group hover:bg-muted/30 transition-colors border-muted/20">
                                <TableCell className="px-6 py-5">
                                    <div className="flex flex-col gap-1">
                                        <div className="font-bold text-foreground group-hover:text-primary transition-colors">{conn.name}</div>
                                        <div className="text-xs text-muted-foreground font-medium">{conn.description}</div>
                                    </div>
                                </TableCell>
                                <TableCell className="px-6 py-5">
                                    <code className="text-[11px] font-mono font-bold bg-muted/60 p-1 rounded border border-muted-foreground/10 text-muted-foreground group-hover:text-foreground transition-colors">
                                        {conn.projectId}
                                    </code>
                                </TableCell>
                                <TableCell className="px-6 py-5">
                                    <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground group-hover:text-foreground transition-colors">
                                        <Shield className="h-3 w-3 opacity-40 shrink-0" />
                                        <span className="truncate max-w-[200px]">{conn.serviceAccount}</span>
                                    </div>
                                </TableCell>
                                <TableCell className="px-6 py-5">
                                    <Badge
                                        variant={conn.status === 'Active' ? "default" : conn.status === 'Error' ? "destructive" : "outline"}
                                        className={cn(
                                            "font-black text-[9px] uppercase tracking-widest py-0.5 px-2 bg-muted hover:bg-muted text-muted-foreground border-none",
                                            conn.status === 'Active' && "bg-green-500/10 text-green-600 hover:bg-green-500/15",
                                            conn.status === 'Error' && "bg-red-500/10 text-red-600 hover:bg-red-500/15"
                                        )}
                                    >
                                        {conn.status}
                                    </Badge>
                                </TableCell>
                                <TableCell className="px-6 py-5 text-right">
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="text-muted-foreground/40 hover:text-destructive hover:bg-destructive/5"
                                        onClick={() => handleDelete(conn.id)}
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>

                {connections.length === 0 && (
                    <div className="p-20 text-center flex flex-col items-center gap-4">
                        <div className="p-6 rounded-full bg-muted/30 border-2 border-dashed">
                            <Database className="h-12 w-12 text-muted-foreground/30" />
                        </div>
                        <div className="space-y-1">
                            <p className="text-lg font-bold text-muted-foreground">Isolated Topology</p>
                            <p className="text-sm text-muted-foreground/60 max-w-xs mx-auto leading-relaxed italic">
                                No infrastructure connections registered. Establish a data bridge to begin discovery.
                            </p>
                        </div>
                    </div>
                )}
            </div>

            <footer className="pt-4 flex items-center justify-center md:justify-start gap-3 text-xs text-muted-foreground/50 font-medium italic">
                <CheckCircle2 className="h-4 w-4" />
                <span>Encrypted connection descriptors stored across regional HSM clusters.</span>
            </footer>
        </div>
    );
};

export default GCPConnections;
