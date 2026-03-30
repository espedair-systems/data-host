import React, { useState, useEffect } from 'react';
import { 
    TableProperties, 
    Search, 
    Filter, 
    ChevronRight, 
    Shield, 
    Layers,
    Clock,
    Tag,
    Share2,
    ArrowLeft,
    CheckCircle2,
    AlertTriangle,
    Download
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { toast } from 'sonner';
import { useSidebar } from '@/context/SidebarContext';

interface ReferenceAttribute {
    name: string;
    data_type: string;
    nullable: boolean;
    description?: string;
    allowed_values?: string[];
}

interface ReferenceCode {
    code: string;
    label: string;
    description?: string;
    status: string;
    effective_from?: string;
    effective_to?: string;
    sort_order?: number;
}

interface ReferenceDataset {
    id: number;
    package_id: number;
    dataset_id: string;
    dataset_name: string;
    description?: string;
    status: string;
    classification?: string;
    source_system?: string;
    update_frequency?: string;
    attributes?: ReferenceAttribute[];
    code_sets?: ReferenceCode[];
    records?: any[];
}

interface ReferenceDataPackage {
    id: number;
    name: string;
    version: string;
    description?: string;
    domain: string;
    source?: string;
    generated_at_utc: string;
    created_at_utc: string;
    governance: {
        data_owner: string;
        data_steward: string;
        approver?: string;
        approval_status: string;
        approval_date?: string;
    };
    datasets?: ReferenceDataset[];
}

import { useParams, useNavigate, useLocation } from 'react-router-dom';

const ReferenceDataPage: React.FC = () => {
    const { type, id } = useParams<{ type: string; id: string }>();
    const navigate = useNavigate();
    const location = useLocation();
    
    const [packages, setPackages] = useState<ReferenceDataPackage[]>([]);
    const [allDatasets, setAllDatasets] = useState<ReferenceDataset[]>([]);
    const [selectedPackage, setSelectedPackage] = useState<ReferenceDataPackage | null>(null);
    const [selectedDataset, setSelectedDataset] = useState<ReferenceDataset | null>(null);
    const [fullPackage, setFullPackage] = useState<ReferenceDataPackage | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [domainFilter, setDomainFilter] = useState('All');
    const [viewMode, setViewMode] = useState<'datasets' | 'packages'>('datasets');

    const { setContent } = useSidebar();

    // Handle initial routing and param changes
    useEffect(() => {
        if (type === 'package' && id && packages.length > 0) {
            const pkg = packages.find(p => p.id === parseInt(id));
            if (pkg) handlePackageSelect(pkg);
        } else if (type === 'dataset' && id && allDatasets.length > 0) {
            const ds = allDatasets.find(d => d.id === parseInt(id));
            if (ds) handleDatasetSelectFromAll(ds);
        } else if (location.pathname.endsWith('/list') || location.pathname.endsWith('/rdm')) {
            setSelectedPackage(null);
            setSelectedDataset(null);
            setFullPackage(null);
        }
    }, [type, id, packages, allDatasets, location.pathname]);

    useEffect(() => {
        fetchPackages();
        fetchAllDatasets();
    }, []);

    useEffect(() => {
        if (!selectedPackage) {
            setContent(null);
            return;
        }

        const domains = ['All', ...new Set(packages.map(p => p.domain))];

        setContent(
            <div className="space-y-8 animate-in fade-in slide-in-from-right-10 duration-700">
                <section className="space-y-3">
                    <div className="flex items-center gap-3 px-1">
                        <Search className="h-4 w-4 text-primary" />
                        <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground opacity-60">Deep Search</h3>
                    </div>
                    <Input 
                        placeholder="FILTER DATASETS..." 
                        className="h-12 rounded-2xl bg-muted/30 border-none font-black text-[11px] uppercase tracking-widest placeholder:text-muted-foreground/30 focus-visible:ring-1 focus-visible:ring-primary/20"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </section>

                <section className="space-y-3">
                    <div className="flex items-center gap-3 px-1">
                        <Filter className="h-4 w-4 text-primary" />
                        <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground opacity-60">Domain Segments</h3>
                    </div>
                    <div className="flex flex-wrap gap-2 p-1">
                        {domains.map(domain => (
                            <Badge 
                                key={domain} 
                                variant={domainFilter === domain ? 'default' : 'outline'}
                                className={`cursor-pointer rounded-lg px-2 py-0.5 text-[9px] font-black uppercase tracking-tighter transition-all ${
                                    domainFilter === domain ? 'bg-primary text-primary-foreground' : 'hover:bg-primary/10 hover:border-primary/20'
                                }`}
                                onClick={() => setDomainFilter(domain)}
                            >
                                {domain}
                            </Badge>
                        ))}
                    </div>
                </section>

                <div className="p-6 rounded-[2.5rem] bg-primary/5 border border-primary/10 space-y-4">
                    <div className="flex items-center gap-3">
                        <Shield className="h-4 w-4 text-primary" />
                        <h4 className="text-[10px] font-black uppercase tracking-widest text-primary">Governance Authority</h4>
                    </div>
                    <div className="space-y-3">
                        <div className="space-y-1">
                            <p className="text-[8px] font-black uppercase tracking-widest text-muted-foreground/60">Data Owner</p>
                            <p className="text-xs font-black text-foreground">{selectedPackage.governance.data_owner}</p>
                        </div>
                        <div className="space-y-1">
                            <p className="text-[8px] font-black uppercase tracking-widest text-muted-foreground/60">Data Steward</p>
                            <p className="text-xs font-black text-foreground">{selectedPackage.governance.data_steward}</p>
                        </div>
                        <div className="pt-2 flex items-center gap-2">
                             <Badge className="bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20 border-none rounded-lg font-black uppercase text-[8px] tracking-widest px-2">
                                {selectedPackage.governance.approval_status}
                             </Badge>
                             <span className="text-[9px] font-medium text-muted-foreground italic opacity-60">v{selectedPackage.version}</span>
                        </div>
                    </div>
                </div>
            </div>
        );

        return () => setContent(null);
    }, [selectedPackage, packages, searchQuery, domainFilter, setContent]);

    useEffect(() => {
        if (fullPackage && selectedDataset) {
            const detailed = fullPackage.datasets?.find(d => d.id === selectedDataset.id);
            if (detailed) {
                setSelectedDataset(detailed);
            }
        }
    }, [fullPackage]);

    const fetchPackages = async () => {
        setIsLoading(true);
        try {
            const response = await fetch('/api/rdm/list');
            if (response.ok) {
                const data = await response.json();
                setPackages(Array.isArray(data) ? data : []);
            } else {
                const errData = await response.json();
                toast.error(`API Error: ${errData.message || response.statusText}`);
            }
        } catch (err) {
            toast.error("Failed to load reference data packages");
        } finally {
            setIsLoading(false);
        }
    };

    const fetchAllDatasets = async () => {
        setIsLoading(true);
        try {
            const response = await fetch('/api/rdm/datasets');
            if (response.ok) {
                const data = await response.json();
                setAllDatasets(Array.isArray(data) ? data : []);
            } else {
                const errData = await response.json();
                toast.error(`API Error: ${errData.message || response.statusText}`);
            }
        } catch (err) {
            toast.error("Failed to load reference datasets");
        } finally {
            setIsLoading(false);
        }
    };

    const fetchPackageDetail = async (id: number) => {
        setIsLoading(true);
        try {
            const response = await fetch(`/api/rdm/${id}`);
            if (response.ok) {
                const data = await response.json();
                setFullPackage(data);
            }
        } catch (err) {
            toast.error("Failed to load package details");
        } finally {
            setIsLoading(false);
        }
    };

    const handlePackageSelect = (pkg: ReferenceDataPackage) => {
        setSelectedPackage(pkg);
        setSelectedDataset(null);
        fetchPackageDetail(pkg.id);
    };

    const handleDatasetSelectFromAll = async (dataset: ReferenceDataset) => {
        const pkg = packages.find(p => p.id === dataset.package_id);
        if (pkg) {
            setSelectedPackage(pkg);
            setSelectedDataset(dataset);
            await fetchPackageDetail(pkg.id);
        } else {
            setSelectedDataset(dataset);
        }
    };

    const onPackageClick = (pkg: ReferenceDataPackage) => {
        navigate(`/analysis/rdm/edit/package/${pkg.id}`);
    };

    const onDatasetClick = (dataset: ReferenceDataset) => {
        navigate(`/analysis/rdm/edit/dataset/${dataset.id}`);
    };

    const filteredPackages = packages.filter(p => 
        (domainFilter === 'All' || p.domain === domainFilter) &&
        (p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
         p.description?.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    const filteredAllDatasets = allDatasets.filter(d => 
        (d.dataset_name.toLowerCase().includes(searchQuery.toLowerCase()) || 
         d.dataset_id.toLowerCase().includes(searchQuery.toLowerCase()) ||
         d.description?.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    const filteredDatasets = fullPackage?.datasets?.filter(d => 
        d.dataset_name.toLowerCase().includes(searchQuery.toLowerCase()) || 
        d.dataset_id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        d.description?.toLowerCase().includes(searchQuery.toLowerCase())
    ) || [];

    if (isLoading && packages.length === 0) {
        return (
            <div className="h-full flex flex-col items-center justify-center space-y-8 animate-pulse">
                <div className="p-8 rounded-[3rem] bg-muted/20 border border-white/5 shadow-2xl">
                    <TableProperties className="h-16 w-16 text-primary opacity-20 rotate-12" />
                </div>
                <div className="space-y-3 text-center">
                    <p className="text-[10px] font-black uppercase tracking-[0.5em] text-muted-foreground animate-bounce">Synchronizing Registry</p>
                    <h2 className="text-2xl font-black italic tracking-tighter uppercase opacity-50">Master Data Stream</h2>
                </div>
            </div>
        );
    }

    return (
        <div className="h-full flex flex-col p-10 space-y-10 overflow-hidden bg-background">
            {/* Header Section */}
            {selectedDataset ? (
                <header className="flex items-center justify-between shrink-0 mb-2">
                    <div className="flex items-center gap-6">
                        <Button 
                            variant="ghost" 
                            size="icon" 
                            onClick={() => selectedPackage && navigate(`/analysis/rdm/edit/package/${selectedPackage.id}`)}
                            className="rounded-2xl hover:bg-primary/10 hover:text-primary transition-all w-12 h-12"
                        >
                            <ArrowLeft className="h-6 w-6" />
                        </Button>
                        <div>
                            <div className="flex items-center gap-2 mb-1">
                                 <Badge variant="outline" className="rounded-md border-primary/20 bg-primary/5 text-primary text-[8px] font-black uppercase tracking-widest px-1.5 py-0">Blueprint</Badge>
                                 <span className="text-[9px] font-black text-muted-foreground/40 uppercase tracking-[0.2em] italic">{selectedDataset.dataset_id}</span>
                            </div>
                            <h1 className="text-3xl font-black italic tracking-tighter uppercase leading-none text-foreground">
                                {selectedDataset.dataset_name}
                            </h1>
                        </div>
                    </div>
                    <div className="flex items-center gap-4">
                        <Button variant="outline" className="rounded-2xl h-12 px-6 border-border/40 font-black uppercase text-[10px] tracking-widest hover:bg-primary/5 hover:text-primary transition-all group">
                            <Download className="mr-3 h-4 w-4 text-primary group-hover:-translate-y-0.5 transition-transform" /> Export Master
                        </Button>
                    </div>
                </header>
            ) : (
                <header className="flex items-center justify-between shrink-0">
                    <div className="flex items-center gap-6">
                        <div className="p-5 rounded-[2rem] bg-primary/10 text-primary shadow-2xl shadow-primary/20 rotate-3 group hover:rotate-0 transition-all duration-500">
                            <TableProperties className="h-8 w-8" />
                        </div>
                        <div>
                            <div className="flex items-center gap-3 mb-2">
                                 <Badge variant="outline" className="rounded-lg border-primary/20 bg-primary/5 text-primary text-[8px] font-black uppercase tracking-widest px-2 py-0">REF-DATA-PROTO</Badge>
                                 <span className="text-[10px] font-black text-muted-foreground/40 uppercase tracking-[0.2em] italic">01 // AUTHORITATIVE_SOURCES</span>
                            </div>
                            <h1 className="text-5xl font-black italic tracking-tighter uppercase leading-none">
                                Structural Registry
                            </h1>
                        </div>
                    </div>
                    <div className="flex items-center gap-6">
                        <div className="flex bg-muted/20 p-1 rounded-2xl border border-white/5">
                            <Button 
                                variant={viewMode === 'datasets' ? 'default' : 'ghost'} 
                                onClick={() => setViewMode('datasets')}
                                className={`rounded-xl h-10 px-4 text-[9px] font-black uppercase tracking-widest transition-all ${viewMode === 'datasets' ? 'shadow-lg shadow-primary/20' : 'hover:bg-white/5'}`}
                            >
                                Datasets
                            </Button>
                            <Button 
                                variant={viewMode === 'packages' ? 'default' : 'ghost'} 
                                onClick={() => setViewMode('packages')}
                                className={`rounded-xl h-10 px-4 text-[9px] font-black uppercase tracking-widest transition-all ${viewMode === 'packages' ? 'shadow-lg shadow-primary/20' : 'hover:bg-white/5'}`}
                            >
                                Packages
                            </Button>
                        </div>
                        <Button variant="outline" className="rounded-2xl h-14 px-8 border-white/5 bg-white/5 backdrop-blur-md font-black uppercase text-[10px] tracking-widest hover:bg-white/10 group">
                            <Share2 className="mr-3 h-4 w-4 text-primary group-hover:scale-125 transition-transform" /> Export Master CSV
                        </Button>
                    </div>
                </header>
            )}

            {!selectedPackage ? (
                /* List view based on viewMode */
                <ScrollArea className="flex-grow rounded-[3.5rem] border border-white/5 bg-muted/10 p-2 shadow-inner">
                    <div className="p-8 flex flex-col gap-4">
                        <div className="grid grid-cols-12 gap-4 px-8 py-4 mb-2 opacity-30 text-[8px] font-black uppercase tracking-[0.2em]">
                            <div className="col-span-6">Name / Description</div>
                            <div className="col-span-2">Domain / ID</div>
                            <div className="col-span-3">Status / Classification</div>
                            <div className="col-span-1 text-right">View</div>
                        </div>

                        {viewMode === 'packages' ? (
                            filteredPackages.map(pkg => (
                                <button
                                    key={pkg.id}
                                    onClick={() => onPackageClick(pkg)}
                                    className="group relative text-left overflow-hidden rounded-3xl border border-white/5 bg-neutral-900/50 p-6 transition-all duration-300 hover:border-primary/50 hover:bg-neutral-900/80 hover:shadow-xl hover:shadow-primary/5 hover:-translate-y-1"
                                >
                                    <div className="grid grid-cols-12 gap-4 items-center">
                                        <div className="col-span-6 space-y-1">
                                            <h3 className="text-xl font-black italic tracking-tight uppercase leading-none group-hover:text-primary transition-colors">{pkg.name}</h3>
                                            <p className="text-[10px] text-muted-foreground/60 line-clamp-1 font-medium italic">{pkg.description || "No classification metadata provided."}</p>
                                        </div>
                                        <div className="col-span-2">
                                            <Badge className="rounded-lg bg-primary/20 text-primary border-none text-[8px] font-black tracking-widest uppercase px-2">{pkg.domain}</Badge>
                                        </div>
                                        <div className="col-span-3">
                                            <div className="flex items-center gap-2 text-[10px] font-black text-muted-foreground/40 italic">
                                                <Clock className="h-3 w-3" />
                                                {pkg.created_at_utc?.split('T')[0] || "2026-03-29"}
                                            </div>
                                        </div>
                                        <div className="col-span-1 flex justify-end">
                                            <div className="h-10 w-10 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-300">
                                                <ChevronRight className="h-5 w-5" />
                                            </div>
                                        </div>
                                    </div>
                                </button>
                            ))
                        ) : (
                            filteredAllDatasets.map(dataset => (
                                <button
                                    key={dataset.id}
                                    onClick={() => onDatasetClick(dataset)}
                                    className="group relative text-left overflow-hidden rounded-[2rem] border border-border/40 bg-card/40 p-6 transition-all duration-500 hover:border-primary/40 hover:bg-card hover:shadow-2xl hover:scale-[1.01]"
                                >
                                    <div className="grid grid-cols-12 gap-4 items-center">
                                        <div className="col-span-6 space-y-1">
                                            <h3 className="text-base font-black italic tracking-tight uppercase leading-none group-hover:text-primary transition-colors">{dataset.dataset_name}</h3>
                                            <p className="text-[9px] text-muted-foreground/40 font-black tracking-widest uppercase mt-1 truncate">{dataset.description || "Reference dataset."}</p>
                                        </div>
                                        <div className="col-span-2">
                                            <Badge variant="outline" className="rounded-md border-border/40 text-muted-foreground/60 text-[8px] font-black tracking-widest uppercase px-2">{dataset.dataset_id}</Badge>
                                        </div>
                                        <div className="col-span-3 flex items-center gap-3">
                                            <Badge className="rounded-md bg-primary/10 text-primary border-none text-[8px] font-black tracking-widest uppercase px-2 py-0.5">ACTIVE</Badge>
                                            <div className="text-[8px] text-muted-foreground/40 font-black uppercase tracking-widest">{dataset.classification || "INTERNAL"}</div>
                                        </div>
                                        <div className="col-span-1 flex justify-end">
                                            <div className="p-2 rounded-xl group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-300">
                                                <ChevronRight className="h-4 w-4 text-muted-foreground/40 group-hover:text-primary-foreground" />
                                            </div>
                                        </div>
                                    </div>
                                </button>
                            ))
                        )}

                        {((viewMode === 'packages' && packages.length === 0) || (viewMode === 'datasets' && allDatasets.length === 0)) && (
                            <div className="h-80 flex flex-col items-center justify-center text-center space-y-5 grayscale opacity-30">
                                <AlertTriangle className="h-16 w-16 mb-4" />
                                <h3 className="text-xl font-bold uppercase tracking-widest">No Records Ingested</h3>
                                <p className="max-w-md text-sm italic font-medium">Authoritative reference data must be committed via the High-Contrast Ingestion Protocol before they appear in the master registry.</p>
                            </div>
                        )}
                    </div>
                </ScrollArea>
            ) : (
                /* Detailed Package View / Full-Page Explorer */
                <div className="flex-grow flex gap-10 overflow-hidden relative h-full">
                    {/* Only show Dataset Collection Sidebar if NO dataset is selected */}
                    {!selectedDataset && (
                        <div className="w-[450px] shrink-0 flex flex-col space-y-6 animate-in slide-in-from-left-10 duration-700">
                            <Button 
                                variant="ghost" 
                                onClick={() => navigate('/analysis/rdm/list')}
                                className="w-fit flex items-center gap-3 text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 hover:text-primary hover:bg-transparent -ml-2 transition-colors"
                            >
                                <ArrowLeft className="h-4 w-4" /> Return to Inventory
                            </Button>

                            <div className="p-8 rounded-[3rem] bg-muted/10 border border-white/5 shadow-inner flex flex-col min-h-0 h-full">
                                <div className="flex items-center gap-3 mb-6">
                                    <Layers className="h-4 w-4 text-primary" />
                                    <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground opacity-60">Dataset Collection</h3>
                                </div>

                                <ScrollArea className="flex-grow -mr-4 pr-4">
                                    <div className="space-y-4">
                                        {filteredDatasets.map(dataset => (
                                            <button
                                                key={dataset.id}
                                                onClick={() => setSelectedDataset(dataset)}
                                                className="w-full text-left p-6 rounded-[2rem] border transition-all group relative overflow-hidden border-border/40 bg-card/40 hover:bg-card hover:border-primary/40 hover:shadow-xl"
                                            >
                                                <div className="flex justify-between items-start mb-2">
                                                    <h4 className="text-base font-black uppercase italic tracking-tight group-hover:text-primary transition-colors">{dataset.dataset_name}</h4>
                                                    <Badge className="rounded-md border-none bg-primary/10 text-primary px-2 text-[8px] font-black uppercase tracking-widest py-0.5">{dataset.status}</Badge>
                                                </div>
                                                <p className="text-[9px] text-muted-foreground/40 font-black uppercase tracking-widest truncate mt-1 mb-3">{dataset.description || "Reference dataset."}</p>
                                                <div className="flex items-center gap-4">
                                                    <div className="flex items-center gap-1.5 font-black text-[9px] text-muted-foreground/40 uppercase tracking-widest">
                                                        <Tag className="h-3 w-3" /> {dataset.dataset_id}
                                                    </div>
                                                    {dataset.code_sets && (
                                                        <div className="flex items-center gap-1.5 font-black text-[9px] text-primary/60 uppercase tracking-widest">
                                                            <CheckCircle2 className="h-3 w-3" /> {dataset.code_sets.length} Codes
                                                        </div>
                                                    )}
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                </ScrollArea>
                            </div>
                        </div>
                    )}

                    {/* Right: Dataset Detail Analysis (Becomes FULL PAGE if selectedDataset exists) */}
                    <div className={`flex-grow overflow-hidden relative ${selectedDataset ? '' : 'rounded-[3.5rem] bg-card/40 border border-border/40 p-12 shadow-2xl animate-in slide-in-from-right-10 duration-1000'}`}>
                        {!selectedDataset && (
                            <div className="absolute top-0 right-0 p-16 opacity-[0.03] pointer-events-none">
                                <TableProperties className="h-96 w-96 text-white rotate-6" />
                            </div>
                        )}

                        {!selectedDataset ? (
                            <div className="h-full flex flex-col items-center justify-center p-32 text-center border-2 border-dashed border-muted-foreground/10 rounded-[4rem] bg-muted/5">
                                <Search className="h-16 w-16 text-muted-foreground/10 mb-8" />
                                <h3 className="text-3xl font-black uppercase italic tracking-tighter opacity-20 mt-4">Architectural Selection Required</h3>
                                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground/30 mt-3">Select a dataset from the collection to perform deep structural analysis.</p>
                            </div>
                        ) : (
                            <ScrollArea className="h-full -mr-4 pr-4 custom-scrollbar">
                                <div className="space-y-6 pb-12 relative z-10 max-w-7xl mx-auto">
                                    {/* Primary Value Explorer (Code Sets) */}
                                    <section className="space-y-4 animate-in fade-in zoom-in-95 duration-1000">
                                        <div className="flex items-center justify-between px-2">
                                            <div className="flex items-center gap-2">
                                                <Tag className="h-4 w-4 text-primary" />
                                                <h4 className="text-[11px] font-black uppercase tracking-[0.4em] text-muted-foreground opacity-30">Authoritative Code Registry</h4>
                                            </div>
                                            <Badge className="rounded-md border-none bg-muted text-muted-foreground/60 text-[8px] font-black tracking-widest uppercase px-3 py-1">
                                                {(selectedDataset?.code_sets?.length || selectedDataset?.records?.length || 0)} ENTRIES
                                            </Badge>
                                        </div>

                                        <div className="rounded-[3.5rem] border border-border/40 bg-card/40 overflow-hidden shadow-2xl relative group/table h-full p-2">
                                            <div className="overflow-x-auto p-4 pt-2 custom-scrollbar">
                                                <table className="w-full text-left border-collapse">
                                                    <thead>
                                                        <tr className="border-b border-border/40">
                                                            <th className="py-4 px-6 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60 w-[20%]">Structural Code</th>
                                                            <th className="py-4 px-6 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60 w-[30%]">Label</th>
                                                            <th className="py-4 px-6 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60 w-[40%]">Semantic Definition</th>
                                                            <th className="py-4 px-6 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60 text-right w-[10%]">Action</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody className="divide-y divide-border/20">
                                                        {/* Priority 1: Use code_sets if available */}
                                                        {selectedDataset?.code_sets && selectedDataset.code_sets.length > 0 ? (
                                                            selectedDataset.code_sets.map((code, cidx) => (
                                                                <tr key={cidx} className="group/row hover:bg-muted/40 cursor-pointer transition-colors duration-200">
                                                                    <td className="py-4 px-6 font-black text-primary text-sm uppercase tracking-tight">{code.code}</td>
                                                                    <td className="py-4 px-6 font-medium text-foreground text-sm">{code.label}</td>
                                                                    <td className="py-4 px-6 text-xs font-medium text-muted-foreground/70 truncate max-w-xs">{code.description || "—"}</td>
                                                                    <td className="py-3 px-6 text-right">
                                                                        <div className="p-2 rounded-xl group-hover/row:bg-primary group-hover/row:text-primary-foreground text-muted-foreground/40 transition-colors inline-block text-center mr-2">
                                                                            <ChevronRight className="h-4 w-4" />
                                                                        </div>
                                                                    </td>
                                                                </tr>
                                                            ))
                                                        ) : (
                                                            /* Priority 2: Fallback to records if no code_sets */
                                                            selectedDataset?.records?.map((record, ridx) => {
                                                                // Heuristic: identify code and label from records
                                                                const keys = Object.keys(record);
                                                                const codeKey = keys.find(k => k.toLowerCase().includes('code')) || keys[0];
                                                                const labelKey = keys.find(k => k.toLowerCase().includes('label') || k.toLowerCase().includes('name')) || keys[1];
                                                                const descKey = keys.find(k => k.toLowerCase().includes('desc')) || keys[2];
                                                                
                                                                return (
                                                                    <tr key={ridx} className="group/row hover:bg-muted/40 cursor-pointer transition-colors duration-200">
                                                                        <td className="py-4 px-6 font-black text-primary text-sm uppercase tracking-tight">{String(record[codeKey] || "N/A")}</td>
                                                                        <td className="py-4 px-6 font-medium text-foreground text-sm">{String(record[labelKey] || "N/A")}</td>
                                                                        <td className="py-4 px-6 text-xs font-medium text-muted-foreground/70 truncate max-w-xs">{String(record[descKey] || "—")}</td>
                                                                        <td className="py-3 px-6 text-right">
                                                                            <div className="p-2 rounded-xl group-hover/row:bg-primary group-hover/row:text-primary-foreground text-muted-foreground/40 transition-colors inline-block text-center mr-2">
                                                                                <ChevronRight className="h-4 w-4" />
                                                                            </div>
                                                                        </td>
                                                                    </tr>
                                                                );
                                                            })
                                                        )}
                                                    </tbody>
                                                </table>
                                                {(!selectedDataset?.code_sets?.length && !selectedDataset?.records?.length) && (
                                                    <div className="p-32 text-center opacity-20 flex flex-col items-center gap-6">
                                                        <Search className="h-20 w-20" />
                                                        <p className="text-[11px] font-black uppercase tracking-[0.5em]">No reference values cataloged</p>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </section>
                                </div>
                            </ScrollArea>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default ReferenceDataPage;
