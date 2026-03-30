import React, { useState, useEffect } from 'react';
import { 
    BookMarked, 
    Search, 
    ChevronRight, 
    Filter, 
    Download, 
    Layers,
    Tag, 
    Info, 
    ExternalLink,
    Clock,
    FileText,
    ArrowLeft,
    LinkIcon
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { toast } from 'sonner';
import { useSidebar } from '@/context/SidebarContext';

interface RelatedDomain {
    id: number;
    relates_to_name: string;
    relates_to_full_name: string;
    relates_to_asset_type: string;
    relates_to_community: string;
    relates_to_domain: string;
    relates_to_asset_id: string;
}

interface GlossaryTerm {
    asset_id: string;
    glossary_id: number;
    full_name: string;
    name: string;
    definition: string;
    status: string;
    domain: string;
    community: string;
    domain_type: string;
    domain_id: string;
    asset_type: string;
    source_sheet: string;
    created_at: string;
    related_data_domains?: RelatedDomain[];
}

interface BusinessGlossary {
    id: number;
    name: string;
    description: string;
    source_file: string;
    generated_at_utc: string;
    original_rows: number;
    unique_terms: number;
    duplicates_removed: number;
    created_at: string;
}

const BusinessGlossaryPage: React.FC = () => {
    const [glossaries, setGlossaries] = useState<BusinessGlossary[]>([]);
    const [selectedGlossary, setSelectedGlossary] = useState<BusinessGlossary | null>(null);
    const [terms, setTerms] = useState<GlossaryTerm[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('All');
    const [typeFilter, setTypeFilter] = useState('All');

    const { setContent } = useSidebar();

    useEffect(() => {
        fetchGlossaries();
    }, []);

    useEffect(() => {
        if (!selectedGlossary) {
            setContent(null);
            return;
        }

        setContent(
            <div className="space-y-8 animate-in fade-in slide-in-from-right-10 duration-700">
                <section className="space-y-3">
                    <div className="flex items-center gap-3 px-1">
                        <Search className="h-4 w-4 text-primary" />
                        <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground opacity-60">Search Terms</h3>
                    </div>
                    <Input 
                        placeholder="FILTER BY TEXT..." 
                        className="h-12 rounded-2xl bg-muted/30 border-none font-black text-[11px] uppercase tracking-widest placeholder:text-muted-foreground/30 focus-visible:ring-1 focus-visible:ring-primary/20"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </section>

                <section className="space-y-3">
                    <div className="flex items-center gap-3 px-1">
                        <Filter className="h-4 w-4 text-primary" />
                        <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground opacity-60">Filter Settings</h3>
                    </div>
                    <div className="p-5 rounded-3xl bg-muted/10 border border-border/40 space-y-6">
                        <div>
                            <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/60 mb-3">Term Status</p>
                            <div className="flex flex-wrap gap-2">
                                {['All', 'Approved', 'Draft', 'Deprecated'].map(status => (
                                    <Badge 
                                        key={status} 
                                        variant={statusFilter === status ? 'default' : 'outline'}
                                        className={`cursor-pointer rounded-lg px-2 py-0.5 text-[9px] font-black uppercase tracking-tighter transition-all ${
                                            statusFilter === status ? 'bg-primary text-primary-foreground' : 'hover:bg-primary/10 hover:border-primary/20'
                                        }`}
                                        onClick={() => setStatusFilter(status)}
                                    >
                                        {status}
                                    </Badge>
                                ))}
                            </div>
                        </div>
                        <div className="h-px bg-border/40" />
                        <div>
                            <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/60 mb-3">Category</p>
                            <div className="flex flex-wrap gap-2">
                                {['All', 'Business Term', 'KRI', 'KPI'].map(type => (
                                    <Badge 
                                        key={type} 
                                        variant={typeFilter === type ? 'default' : 'outline'}
                                        className={`cursor-pointer rounded-lg px-2 py-0.5 text-[9px] font-black uppercase tracking-tighter transition-all ${
                                            typeFilter === type ? 'bg-primary text-primary-foreground' : 'hover:bg-primary/10 hover:border-primary/20'
                                        }`}
                                        onClick={() => setTypeFilter(type)}
                                    >
                                        {type}
                                    </Badge>
                                ))}
                            </div>
                        </div>
                    </div>
                </section>

                <div className="p-6 rounded-[2.5rem] bg-primary/5 border border-primary/10">
                    <div className="flex items-center gap-3 mb-3">
                        <Info className="h-4 w-4 text-primary" />
                        <h4 className="text-[10px] font-black uppercase tracking-widest text-primary">Glossary Metadata</h4>
                    </div>
                    <div className="space-y-2 text-[10px] font-medium text-muted-foreground italic leading-relaxed">
                        <p className="flex justify-between">ID: <span className="font-black text-foreground not-italic">{selectedGlossary.id}</span></p>
                        <p className="flex justify-between">Release: <span className="font-black text-foreground not-italic">{selectedGlossary.generated_at_utc.split('T')[0]}</span></p>
                        <p className="flex justify-between">Index: <span className="font-black text-foreground not-italic">{selectedGlossary.unique_terms} Terms</span></p>
                    </div>
                </div>
            </div>
        );

        return () => setContent(null);
    }, [selectedGlossary, searchQuery, statusFilter, typeFilter, setContent]);

    const fetchGlossaries = async () => {
        setIsLoading(true);
        try {
            const response = await fetch('/api/glossary/list');
            if (response.ok) {
                const data = await response.json();
                setGlossaries(Array.isArray(data) ? data : []);
            }
        } catch (err) {
            toast.error("Failed to load glossaries");
        } finally {
            setIsLoading(false);
        }
    };

    const fetchTerms = async (glossaryId: number) => {
        setIsLoading(true);
        try {
            const response = await fetch(`/api/glossary/${glossaryId}/terms`);
            if (response.ok) {
                const data = await response.json();
                setTerms(Array.isArray(data) ? data : []);
            }
        } catch (err) {
            toast.error("Failed to load terms");
        } finally {
            setIsLoading(false);
        }
    };

    const handleGlossarySelect = (glossary: BusinessGlossary) => {
        setSelectedGlossary(glossary);
        fetchTerms(glossary.id);
    };

    const filteredTerms = terms.filter(t => {
        const matchesSearch = t.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
            t.definition.toLowerCase().includes(searchQuery.toLowerCase()) ||
            t.full_name.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesStatus = statusFilter === 'All' || t.status === statusFilter;
        const matchesType = typeFilter === 'All' || t.asset_type === typeFilter;
        return matchesSearch && matchesStatus && matchesType;
    });

    if (!selectedGlossary) {
        return (
            <div className="p-8 space-y-10 animate-in fade-in duration-700">
                <header className="flex flex-col gap-4">
                    <div className="flex items-center gap-4">
                        <div className="p-3 rounded-2xl bg-primary/10 text-primary border border-primary/20">
                            <BookMarked className="h-8 w-8" />
                        </div>
                        <div>
                            <h1 className="text-4xl font-black tracking-tighter uppercase italic">Business Glossaries</h1>
                            <p className="text-muted-foreground font-medium italic">Unified definitions of enterprise data assets.</p>
                        </div>
                    </div>
                </header>

                <div className="flex flex-col gap-4">
                    <div className="flex items-center justify-between px-6 py-4 bg-muted/20 rounded-2xl mb-2 border border-border/40">
                        <div className="flex gap-10">
                            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60 w-12">ID</span>
                            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60 w-64">Repository Name</span>
                            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60 w-32">Unique Terms</span>
                            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60 w-48">Source Control</span>
                        </div>
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60">Registry Date</span>
                    </div>

                    {isLoading && glossaries.length === 0 ? (
                        [1, 2, 3].map(i => <div key={i} className="h-20 bg-muted/20 animate-pulse rounded-2xl" />)
                    ) : (
                        glossaries.map(g => (
                            <div 
                                key={g.id} 
                                className="group flex items-center justify-between p-6 bg-card/40 hover:bg-card border border-border/40 hover:border-primary/40 rounded-[2rem] cursor-pointer transition-all duration-500 hover:shadow-2xl hover:scale-[1.01]"
                                onClick={() => handleGlossarySelect(g)}
                            >
                                <div className="flex items-center gap-10">
                                    <div className="w-12">
                                        <Badge className="bg-muted text-muted-foreground/60 border-none text-[8px] font-black px-2 h-4 rounded uppercase tracking-tighter">
                                            #{g.id}
                                        </Badge>
                                    </div>
                                    <div className="w-64">
                                        <h3 className="text-base font-black tracking-tight uppercase italic group-hover:text-primary transition-colors">
                                            {g.name}
                                        </h3>
                                        <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/40 mt-1 truncate">
                                            {g.description || "NO METADATA DESCRIPTION"}
                                        </p>
                                    </div>
                                    <div className="w-32">
                                        <div className="flex items-center gap-2">
                                            <div className="p-1.5 rounded-lg bg-primary/10 text-primary">
                                                <Layers className="h-3 w-3" />
                                            </div>
                                            <span className="text-sm font-black italic">{g.unique_terms} <span className="text-[9px] opacity-40 not-italic uppercase tracking-widest">Sets</span></span>
                                        </div>
                                    </div>
                                    <div className="w-48 flex items-center gap-3">
                                        <div className="p-1.5 rounded-lg bg-orange-500/10 text-orange-600">
                                            <FileText className="h-3 w-3" />
                                        </div>
                                        <span className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/60 italic truncate">
                                            {g.source_file.split('\\').pop() || "SYSTEM GEN"}
                                        </span>
                                    </div>
                                </div>
                                <div className="flex items-center gap-8">
                                    <div className="text-right">
                                        <div className="flex items-center gap-2 justify-end">
                                            <Clock className="h-3 w-3 text-muted-foreground/40" />
                                            <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 italic leading-none">
                                                {new Date(g.generated_at_utc).toLocaleDateString()}
                                            </span>
                                        </div>
                                        <div className="text-[7px] font-black uppercase tracking-[0.3em] text-primary/40 mt-1">Verified Sync</div>
                                    </div>
                                    <div className="p-2 rounded-xl bg-muted group-hover:bg-primary group-hover:text-primary-foreground transition-all">
                                        <ChevronRight className="h-4 w-4" />
                                    </div>
                                </div>
                            </div>
                        ))
                    )}

                    {!isLoading && glossaries.length === 0 && (
                        <div className="flex flex-col items-center justify-center p-32 text-center border-2 border-dashed border-muted-foreground/10 rounded-[4rem] bg-muted/5">
                            <BookMarked className="h-16 w-16 text-muted-foreground/10 mb-8" />
                            <h3 className="text-3xl font-black uppercase italic tracking-tighter opacity-20">Registry Exhausted</h3>
                            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground/30 mt-3">No glossaries have been ingested into the system.</p>
                        </div>
                    )}
                </div>
            </div>
        );
    }

    return (
        <div className="h-full flex flex-col p-6 space-y-6 animate-in slide-in-from-bottom-4 duration-500">
            <header className="flex items-center justify-between border-b pb-6 shrink-0">
                <div className="flex items-center gap-6">
                    <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={() => setSelectedGlossary(null)}
                        className="rounded-2xl hover:bg-primary/10 hover:text-primary transition-all"
                    >
                        <ArrowLeft className="h-6 w-6" />
                    </Button>
                    <div>
                        <div className="flex items-center gap-3">
                            <h1 className="text-3xl font-black tracking-tighter uppercase italic">{selectedGlossary.name}</h1>
                            <Badge className="bg-primary/10 text-primary border-none text-[10px] font-black px-4 h-7 rounded-xl uppercase tracking-widest leading-none">
                                {terms.length} Terms
                            </Badge>
                        </div>
                        <p className="text-muted-foreground text-sm font-medium mt-1 italic">{selectedGlossary.description}</p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <Button variant="outline" className="rounded-2xl h-12 px-6 font-black uppercase text-[10px] tracking-widest border-border/40">
                        <Download className="h-4 w-4 mr-3" />
                        Export
                    </Button>
                </div>
            </header>

            <div className="flex-grow flex gap-10 overflow-hidden min-h-0">
                {/* Main Content: Expandable Term List */}
                <div className="flex-grow flex flex-col min-h-0">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-[11px] font-black uppercase tracking-[0.4em] text-muted-foreground opacity-30 flex items-center gap-3">
                            Repository Index
                            <span className="h-px w-20 bg-muted-foreground/10" />
                        </h3>
                        <Badge className="bg-muted text-muted-foreground/60 border-none text-[8px] font-black px-3 h-5 rounded-md uppercase tracking-widest">
                            Showing {filteredTerms.length} Results
                        </Badge>
                    </div>
                    
                    <ScrollArea className="flex-grow rounded-[3.5rem] bg-card/40 border border-border/40 shadow-2xl overflow-hidden px-10 pt-2 pb-10">
                        <div className="space-y-4 pt-8">
                            {filteredTerms.map(t => (
                                <div key={t.asset_id} className="group overflow-hidden rounded-[2rem] border border-border/40 bg-card/40 hover:bg-card hover:shadow-xl transition-all duration-500">
                                    <details className="cursor-pointer">
                                        <summary className="list-none p-6 flex items-center justify-between gap-6">
                                            <div className="flex items-center gap-6">
                                                <div className="p-3 rounded-2xl bg-muted/40 group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                                                    <Tag className="h-5 w-5" />
                                                </div>
                                                <div>
                                                    <h4 className="text-lg font-black tracking-tight uppercase italic group-hover:text-primary transition-colors">
                                                        {t.name}
                                                    </h4>
                                                    <div className="flex items-center gap-3 mt-1">
                                                        <span className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/40 italic">{t.domain}</span>
                                                        <div className="w-1 h-1 rounded-full bg-muted-foreground/20" />
                                                        <span className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/40 italic">{t.community}</span>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-4">
                                                <Badge className={`border-none text-[8px] px-3 h-5 rounded-md uppercase tracking-widest ${
                                                    t.status === 'Approved' ? 'bg-emerald-500/10 text-emerald-600' : 'bg-muted text-muted-foreground'
                                                }`}>
                                                    {t.status}
                                                </Badge>
                                                <div className="p-2 rounded-xl group-hover:bg-muted transition-colors rotate-0 group-open:rotate-90">
                                                    <ChevronRight className="h-4 w-4 text-muted-foreground/40" />
                                                </div>
                                            </div>
                                        </summary>
                                        <div className="px-6 pb-8 animate-in slide-in-from-top-2 duration-300">
                                            <div className="h-px bg-border/40 mx-auto w-full mb-8" />
                                            <div className="space-y-10">
                                                {/* Full Width Definition */}
                                                <section className="space-y-4">
                                                    <h5 className="text-[10px] font-black uppercase tracking-[0.4em] text-primary/60 px-1">Semantic Definition</h5>
                                                    <div className="p-10 rounded-[2.5rem] bg-primary/5 border border-primary/10 shadow-inner">
                                                        <p className="text-lg font-medium leading-relaxed italic text-foreground/80 first-letter:text-4xl first-letter:font-black first-letter:mr-2">
                                                            {t.definition || "No definitive semantic context has been provided for this term repository entry."}
                                                        </p>
                                                    </div>
                                                </section>

                                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                                                    {/* Technical Metadata */}
                                                    <section className="space-y-4">
                                                        <h5 className="text-[10px] font-black uppercase tracking-[0.4em] text-muted-foreground/30 px-1">Infrastructure Trace</h5>
                                                        <div className="grid grid-cols-2 gap-4">
                                                            <div className="p-5 rounded-3xl bg-muted/20 border border-white/5 group/meta hover:bg-muted/40 transition-colors">
                                                                <p className="text-[8px] font-black uppercase text-muted-foreground/40 tracking-widest mb-2">Asset Identity</p>
                                                                <p className="text-[11px] font-black font-mono truncate text-muted-foreground group-hover/meta:text-foreground">{t.asset_id}</p>
                                                            </div>
                                                            <div className="p-5 rounded-3xl bg-muted/20 border border-white/5 group/meta hover:bg-muted/40 transition-colors">
                                                                <p className="text-[8px] font-black uppercase text-muted-foreground/40 tracking-widest mb-2">Source Origin</p>
                                                                <p className="text-[11px] font-black italic text-muted-foreground group-hover/meta:text-foreground">{t.source_sheet}</p>
                                                            </div>
                                                            <div className="p-5 rounded-3xl bg-muted/20 border border-white/5 group/meta hover:bg-muted/40 transition-colors">
                                                                <p className="text-[8px] font-black uppercase text-muted-foreground/40 tracking-widest mb-2">Domain Type</p>
                                                                <p className="text-[11px] font-black uppercase tracking-tighter text-muted-foreground group-hover/meta:text-foreground">{t.domain_type}</p>
                                                            </div>
                                                            <div className="p-5 rounded-3xl bg-muted/20 border border-white/5 group/meta hover:bg-muted/40 transition-colors">
                                                                <p className="text-[8px] font-black uppercase text-muted-foreground/40 tracking-widest mb-2">Sync Stamp</p>
                                                                <p className="text-[11px] font-black italic text-muted-foreground group-hover/meta:text-foreground">{new Date(t.created_at).toLocaleDateString()}</p>
                                                            </div>
                                                        </div>
                                                    </section>

                                                    {/* Related Domains */}
                                                    <section className="space-y-4">
                                                        <h5 className="text-[10px] font-black uppercase tracking-[0.4em] text-amber-600/40 px-1">Federated Relations</h5>
                                                        <div className="space-y-3">
                                                            {t.related_data_domains && t.related_data_domains.length > 0 ? (
                                                                t.related_data_domains.map(rd => (
                                                                    <div key={rd.id} className="p-5 rounded-2xl bg-amber-500/5 border border-amber-500/10 flex items-center justify-between group/rd hover:bg-amber-500/10 transition-all cursor-pointer">
                                                                        <div className="flex items-center gap-4">
                                                                            <div className="p-2 rounded-xl bg-amber-500/20 text-amber-600 shadow-lg shadow-amber-500/10">
                                                                                <LinkIcon className="h-4 w-4" />
                                                                            </div>
                                                                            <div>
                                                                                <p className="text-[10px] font-black uppercase tracking-tight leading-none group-hover/rd:text-amber-600">{rd.relates_to_name}</p>
                                                                                <p className="text-[8px] font-black uppercase tracking-widest text-muted-foreground/40 mt-2 italic">{rd.relates_to_asset_type} • {rd.relates_to_community}</p>
                                                                            </div>
                                                                        </div>
                                                                        <ExternalLink className="h-4 w-4 text-amber-500/20 group-hover/rd:text-amber-500 group-hover/rd:translate-x-1 transition-all" />
                                                                    </div>
                                                                ))
                                                            ) : (
                                                                <div className="p-12 rounded-[2.5rem] border border-dashed border-muted-foreground/10 flex flex-col items-center justify-center gap-4 group/none hover:border-primary/20 transition-colors">
                                                                    <div className="p-3 rounded-2xl bg-muted/5 text-muted-foreground/20 group-hover/none:text-primary transition-colors">
                                                                        <Layers className="h-8 w-8" />
                                                                    </div>
                                                                    <p className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground/20 italic">No detectible relations mapped</p>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </section>
                                                </div>
                                            </div>
                                        </div>
                                    </details>
                                </div>
                            ))}

                            {filteredTerms.length === 0 && (
                                <div className="flex flex-col items-center justify-center p-32 text-center">
                                    <div className="p-10 rounded-[3rem] bg-muted/5 border-2 border-dashed border-muted-foreground/10 relative">
                                        <Search className="h-16 w-16 text-muted-foreground/10" />
                                    </div>
                                    <h3 className="text-2xl font-black uppercase italic tracking-tighter opacity-20 mt-8">Search Void</h3>
                                    <p className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground/30 mt-3">Adjust filters or search query to locate business terms.</p>
                                </div>
                            )}
                        </div>
                    </ScrollArea>
                </div>
            </div>
        </div>
    );
};

export default BusinessGlossaryPage;
