import React, { useState, useEffect } from 'react';
import { 
    Layers, 
    Search, 
    ChevronRight, 
    Filter, 
    Download, 
    Database,
    Info, 
    Clock,
    ArrowLeft,
    LinkIcon,
    Shield,
    UserCircle,
    Component,
    Zap
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { toast } from 'sonner';
import { useSidebar } from '@/context/SidebarContext';

interface BIMRelationship {
    data_concept_groups_data_concept_name: string;
    data_concept_is_grouped_by_data_concept_name: string;
    data_concept_is_grouped_by_data_domain_name: string;
    data_domain_groups_data_concept_name: string;
    created_at_utc: string;
}

interface BIMRoles {
    data_owner_user_name: string;
    data_owner_first_name: string;
    data_owner_last_name: string;
    data_owner_group_name: string;
    business_steward_user_name: string;
    business_steward_first_name: string;
    business_steward_last_name: string;
    business_steward_group_name: string;
    data_custodian_user_name: string;
    data_custodian_first_name: string;
    data_custodian_last_name: string;
    data_custodian_group_name: string;
    data_steward_user_name: string;
    data_steward_first_name: string;
    data_steward_last_name: string;
    data_steward_group_name: string;
}

interface BIMEntity {
    id: number;
    model_id: number;
    name: string;
    asset_type: string;
    description: string;
    information_confidentiality_classification: string;
    created_at: string;
    roles: BIMRoles;
    relationships: BIMRelationship[];
}

interface BIMStats {
    total_entities: number;
    data_domains: number;
    data_concepts: number;
    duplicates_removed: number;
}

interface BIMModel {
    id: number;
    name: string;
    description: string;
    source: string;
    generated_at_utc: string;
    created_at: string;
    stats: BIMStats;
}

const BusinessInformationModelPage: React.FC = () => {
    const [models, setModels] = useState<BIMModel[]>([]);
    const [selectedModel, setSelectedModel] = useState<BIMModel | null>(null);
    const [entities, setEntities] = useState<BIMEntity[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [typeFilter, setTypeFilter] = useState('All');
    const [classificationFilter, setClassificationFilter] = useState('All');

    const { setContent } = useSidebar();

    useEffect(() => {
        fetchModels();
    }, []);

    useEffect(() => {
        if (!selectedModel) {
            setContent(null);
            return;
        }

        setContent(
            <div className="space-y-8 animate-in fade-in slide-in-from-right-10 duration-700">
                <section className="space-y-3">
                    <div className="flex items-center gap-3 px-1">
                        <Search className="h-4 w-4 text-primary" />
                        <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground opacity-60">Search Entities</h3>
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
                            <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/60 mb-3">Entity Type</p>
                            <div className="flex flex-wrap gap-2">
                                {['All', 'Table', 'View', 'Set', 'Field'].map(type => (
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
                        <div className="h-px bg-border/40" />
                        <div>
                            <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/60 mb-3">Classification</p>
                            <div className="flex flex-wrap gap-2">
                                {['All', 'Public', 'Internal', 'Confidential', 'Restricted'].map(c => (
                                    <Badge 
                                        key={c} 
                                        variant={classificationFilter === c ? 'default' : 'outline'}
                                        className={`cursor-pointer rounded-lg px-2 py-0.5 text-[9px] font-black uppercase tracking-tighter transition-all ${
                                            classificationFilter === c ? 'bg-primary text-primary-foreground' : 'hover:bg-primary/10 hover:border-primary/20'
                                        }`}
                                        onClick={() => setClassificationFilter(c)}
                                    >
                                        {c}
                                    </Badge>
                                ))}
                            </div>
                        </div>
                    </div>
                </section>

                <div className="p-6 rounded-[2.5rem] bg-primary/5 border border-primary/10">
                    <div className="flex items-center gap-3 mb-3">
                        <Info className="h-4 w-4 text-primary" />
                        <h4 className="text-[10px] font-black uppercase tracking-widest text-primary">Model Metrics</h4>
                    </div>
                    <div className="space-y-2 text-[10px] font-medium text-muted-foreground italic leading-relaxed">
                        <p className="flex justify-between">Entities: <span className="font-black text-foreground not-italic">{selectedModel.stats.total_entities}</span></p>
                        <p className="flex justify-between">Data Domains: <span className="font-black text-foreground not-italic">{selectedModel.stats.data_domains}</span></p>
                        <p className="flex justify-between">Concepts: <span className="font-black text-foreground not-italic">{selectedModel.stats.data_concepts}</span></p>
                        <p className="flex justify-between">Duplicates: <span className="font-black text-foreground not-italic">{selectedModel.stats.duplicates_removed} Removed</span></p>
                    </div>
                </div>
            </div>
        );

        return () => setContent(null);
    }, [selectedModel, searchQuery, typeFilter, classificationFilter, setContent]);

    const fetchModels = async () => {
        setIsLoading(true);
        try {
            const response = await fetch('/api/bim/list');
            if (response.ok) {
                const data = await response.json();
                setModels(Array.isArray(data) ? data : []);
            }
        } catch (err) {
            toast.error("Failed to load BIM models");
        } finally {
            setIsLoading(false);
        }
    };

    const fetchEntities = async (modelId: number) => {
        setIsLoading(true);
        try {
            const response = await fetch(`/api/bim/${modelId}/entities`);
            if (response.ok) {
                const data = await response.json();
                setEntities(Array.isArray(data) ? data : []);
            }
        } catch (err) {
            toast.error("Failed to load entities");
        } finally {
            setIsLoading(false);
        }
    };

    const handleModelSelect = (model: BIMModel) => {
        setSelectedModel(model);
        fetchEntities(model.id);
    };

    const filteredEntities = entities.filter(e => {
        const matchesSearch = e.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
            e.description.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesType = typeFilter === 'All' || e.asset_type === typeFilter;
        const matchesClass = classificationFilter === 'All' || e.information_confidentiality_classification === classificationFilter;
        return matchesSearch && matchesType && matchesClass;
    });

    if (!selectedModel) {
        return (
            <div className="p-8 space-y-10 animate-in fade-in duration-700">
                <header className="flex flex-col gap-4">
                    <div className="flex items-center gap-4">
                        <div className="p-3 rounded-2xl bg-primary/10 text-primary border border-primary/20">
                            <Layers className="h-8 w-8" />
                        </div>
                        <div>
                            <h1 className="text-4xl font-black tracking-tighter uppercase italic">Business Information Models</h1>
                            <p className="text-muted-foreground font-medium italic">High-level semantic architectures of enterprise data domains.</p>
                        </div>
                    </div>
                </header>

                <div className="flex flex-col gap-4">
                    <div className="flex items-center justify-between px-6 py-4 bg-muted/20 rounded-2xl mb-2 border border-border/40">
                        <div className="flex gap-10">
                            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60 w-12">ID</span>
                            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60 w-64">Model Structure</span>
                            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60 w-32">Scale</span>
                            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60 w-48">Ingestion Source</span>
                        </div>
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60">Inventory Date</span>
                    </div>

                    {isLoading && models.length === 0 ? (
                        [1, 2, 3].map(i => <div key={i} className="h-20 bg-muted/20 animate-pulse rounded-2xl" />)
                    ) : (
                        models.map(m => (
                            <div 
                                key={m.id} 
                                className="group flex items-center justify-between p-6 bg-card/40 hover:bg-card border border-border/40 hover:border-primary/40 rounded-[2rem] cursor-pointer transition-all duration-500 hover:shadow-2xl hover:scale-[1.01]"
                                onClick={() => handleModelSelect(m)}
                            >
                                <div className="flex items-center gap-10">
                                    <div className="w-12">
                                        <Badge className="bg-muted text-muted-foreground/60 border-none text-[8px] font-black px-2 h-4 rounded uppercase tracking-tighter">
                                            #{m.id}
                                        </Badge>
                                    </div>
                                    <div className="w-64">
                                        <h3 className="text-base font-black tracking-tight uppercase italic group-hover:text-primary transition-colors">
                                            {m.name}
                                        </h3>
                                        <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/40 mt-1 truncate">
                                            {m.description || "NO ARCHITECTURAL CONTEXT PROVIDED"}
                                        </p>
                                    </div>
                                    <div className="w-32">
                                        <div className="flex items-center gap-2">
                                            <div className="p-1.5 rounded-lg bg-primary/10 text-primary">
                                                <Component className="h-3 w-3" />
                                            </div>
                                            <span className="text-sm font-black italic">{m.stats.total_entities} <span className="text-[9px] opacity-40 not-italic uppercase tracking-widest">Nodes</span></span>
                                        </div>
                                    </div>
                                    <div className="w-48 flex items-center gap-3">
                                        <div className="p-1.5 rounded-lg bg-blue-500/10 text-blue-600">
                                            <Database className="h-3 w-3" />
                                        </div>
                                        <span className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/60 italic truncate">
                                            {m.source.split('/').pop() || "EXTERNAL-PROTO"}
                                        </span>
                                    </div>
                                </div>
                                <div className="flex items-center gap-8">
                                    <div className="text-right">
                                        <div className="flex items-center gap-2 justify-end">
                                            <Clock className="h-3 w-3 text-muted-foreground/40" />
                                            <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 italic leading-none">
                                                {new Date(m.generated_at_utc).toLocaleDateString()}
                                            </span>
                                        </div>
                                        <div className="text-[7px] font-black uppercase tracking-[0.3em] text-primary/40 mt-1">Registry Verified</div>
                                    </div>
                                    <div className="p-2 rounded-xl bg-muted group-hover:bg-primary group-hover:text-primary-foreground transition-all">
                                        <ChevronRight className="h-4 w-4" />
                                    </div>
                                </div>
                            </div>
                        ))
                    )}

                    {!isLoading && models.length === 0 && (
                        <div className="flex flex-col items-center justify-center p-32 text-center border-2 border-dashed border-muted-foreground/10 rounded-[4rem] bg-muted/5">
                            <Layers className="h-16 w-16 text-muted-foreground/10 mb-8" />
                            <h3 className="text-3xl font-black uppercase italic tracking-tighter opacity-20">Registry Sync Required</h3>
                            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground/30 mt-3">No Information Models have been mapped to the registry.</p>
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
                        onClick={() => setSelectedModel(null)}
                        className="rounded-2xl hover:bg-primary/10 hover:text-primary transition-all"
                    >
                        <ArrowLeft className="h-6 w-6" />
                    </Button>
                    <div>
                        <div className="flex items-center gap-3">
                            <h1 className="text-3xl font-black tracking-tighter uppercase italic">{selectedModel.name}</h1>
                            <Badge className="bg-primary/10 text-primary border-none text-[10px] font-black px-4 h-7 rounded-xl uppercase tracking-widest leading-none">
                                {entities.length} Entities
                            </Badge>
                        </div>
                        <p className="text-muted-foreground text-sm font-medium mt-1 italic">{selectedModel.description}</p>
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
                {/* Main Content: Entity List */}
                <div className="flex-grow flex flex-col min-h-0">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-[11px] font-black uppercase tracking-[0.4em] text-muted-foreground opacity-30 flex items-center gap-3">
                            Model Nodes
                            <span className="h-px w-20 bg-muted-foreground/10" />
                        </h3>
                        <Badge className="bg-muted text-muted-foreground/60 border-none text-[8px] font-black px-3 h-5 rounded-md uppercase tracking-widest">
                            Showing {filteredEntities.length} Results
                        </Badge>
                    </div>
                    
                    <ScrollArea className="flex-grow rounded-[3.5rem] bg-card/40 border border-border/40 shadow-2xl overflow-hidden px-10 pt-2 pb-10">
                        <div className="space-y-4 pt-8">
                            {filteredEntities.map(e => (
                                <div key={e.id} className="group overflow-hidden rounded-[2rem] border border-border/40 bg-card/40 hover:bg-card hover:shadow-xl transition-all duration-500">
                                    <details className="cursor-pointer">
                                        <summary className="list-none p-6 flex items-center justify-between gap-6">
                                            <div className="flex items-center gap-6">
                                                <div className="p-3 rounded-2xl bg-muted/40 group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                                                    <Component className="h-5 w-5" />
                                                </div>
                                                <div>
                                                    <h4 className="text-lg font-black tracking-tight uppercase italic group-hover:text-primary transition-colors">
                                                        {e.name}
                                                    </h4>
                                                    <div className="flex items-center gap-3 mt-1">
                                                        <span className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/40 italic">{e.asset_type}</span>
                                                        <div className="w-1 h-1 rounded-full bg-muted-foreground/20" />
                                                        <span className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/40 italic">{e.information_confidentiality_classification}</span>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-4">
                                                <Badge className="bg-muted text-muted-foreground/40 border-none text-[8px] px-3 h-5 rounded-md uppercase tracking-widest">
                                                    {e.relationships?.length || 0} Relations
                                                </Badge>
                                                <div className="p-2 rounded-xl group-hover:bg-muted transition-colors rotate-0 group-open:rotate-90">
                                                    <ChevronRight className="h-4 w-4 text-muted-foreground/40" />
                                                </div>
                                            </div>
                                        </summary>
                                        <div className="px-6 pb-8 animate-in slide-in-from-top-2 duration-300">
                                            <div className="h-px bg-border/40 mx-auto w-full mb-8" />
                                            <div className="space-y-10">
                                                {/* Description */}
                                                <section className="space-y-4">
                                                    <h5 className="text-[10px] font-black uppercase tracking-[0.4em] text-primary/60 px-1">Architectural Description</h5>
                                                    <div className="p-10 rounded-[2.5rem] bg-primary/5 border border-primary/10 shadow-inner">
                                                        <p className="text-lg font-medium leading-relaxed italic text-foreground/80 first-letter:text-4xl first-letter:font-black first-letter:mr-2">
                                                            {e.description || "Historical data architecture node with no explicit semantic annotation."}
                                                        </p>
                                                    </div>
                                                </section>

                                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                                                    {/* Stewardship & Roles */}
                                                    <section className="space-y-4">
                                                        <h5 className="text-[10px] font-black uppercase tracking-[0.4em] text-muted-foreground/30 px-1">Governance Stack</h5>
                                                        <div className="space-y-4">
                                                            {[
                                                                { label: 'Data Owner', user: e.roles.data_owner_user_name, group: e.roles.data_owner_group_name, icon: Shield, color: 'text-indigo-500', bg: 'bg-indigo-500/10' },
                                                                { label: 'Business Steward', user: e.roles.business_steward_user_name, group: e.roles.business_steward_group_name, icon: UserCircle, color: 'text-amber-500', bg: 'bg-amber-500/10' },
                                                                { label: 'Data Custodian', user: e.roles.data_custodian_user_name, group: e.roles.data_custodian_group_name, icon: Database, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
                                                                { label: 'Data Steward', user: e.roles.data_steward_user_name, group: e.roles.data_steward_group_name, icon: Zap, color: 'text-blue-500', bg: 'bg-blue-500/10' },
                                                            ].map((role) => (
                                                                <div key={role.label} className="p-5 rounded-[2rem] bg-muted/20 border border-white/5 flex items-center gap-5 group/role hover:bg-muted/40 transition-all">
                                                                    <div className={`p-3 rounded-2xl ${role.bg} ${role.color} group-hover/role:scale-110 transition-transform shadow-lg`}>
                                                                        <role.icon className="h-4 w-4" />
                                                                    </div>
                                                                    <div className="flex-grow">
                                                                        <p className="text-[8px] font-black uppercase tracking-widest text-muted-foreground/40 mb-1">{role.label}</p>
                                                                        <div className="flex items-center justify-between">
                                                                            <p className="text-xs font-black italic tracking-tight">{role.user || 'UNASSIGNED_STAKEHOLDER'}</p>
                                                                            <Badge variant="outline" className="text-[8px] font-black uppercase tracking-tighter border-muted-foreground/10 text-muted-foreground/60 px-2 rounded-lg">
                                                                                {role.group || 'ROOT'}
                                                                            </Badge>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </section>

                                                    {/* Concept Relationships */}
                                                    <section className="space-y-4">
                                                        <h5 className="text-[10px] font-black uppercase tracking-[0.4em] text-indigo-600/40 px-1">Conceptual Graph</h5>
                                                        <div className="space-y-3">
                                                            {e.relationships && e.relationships.length > 0 ? (
                                                                e.relationships.map((rel, idx) => (
                                                                    <div key={idx} className="p-6 rounded-[2rem] bg-indigo-500/5 border border-indigo-500/10 hover:bg-indigo-500/10 transition-all group/rel">
                                                                        <div className="flex items-center gap-4 mb-4">
                                                                            <div className="p-2.5 rounded-xl bg-indigo-500/20 text-indigo-600 shadow-lg shadow-indigo-500/10">
                                                                                <LinkIcon className="h-4 w-4" />
                                                                            </div>
                                                                            <span className="text-[10px] font-black uppercase tracking-widest text-indigo-600 italic">Semantic Edge #{idx + 1}</span>
                                                                        </div>
                                                                        <div className="grid gap-2">
                                                                            {[
                                                                                { key: 'Groups', val: rel.data_concept_groups_data_concept_name },
                                                                                { key: 'Grouped By', val: rel.data_concept_is_grouped_by_data_concept_name },
                                                                                { key: 'Domain Group', val: rel.data_concept_is_grouped_by_data_domain_name },
                                                                                { key: 'Domain Relation', val: rel.data_domain_groups_data_concept_name }
                                                                            ].filter(v => v.val).map(pair => (
                                                                                <div key={pair.key} className="flex items-center justify-between text-[11px] font-medium leading-none">
                                                                                    <span className="text-muted-foreground/40 italic font-black uppercase text-[8px] tracking-widest">{pair.key}</span>
                                                                                    <span className="font-black italic text-foreground/80 group-hover/rel:text-indigo-600 transition-colors">{pair.val}</span>
                                                                                </div>
                                                                            ))}
                                                                        </div>
                                                                    </div>
                                                                ) )
                                                            ) : (
                                                                <div className="p-12 rounded-[2.5rem] border border-dashed border-muted-foreground/10 flex flex-col items-center justify-center gap-4 group/none hover:border-primary/20 transition-colors h-full">
                                                                    <div className="p-3 rounded-2xl bg-muted/5 text-muted-foreground/20 group-hover/none:text-primary transition-colors">
                                                                        <Layers className="h-8 w-8" />
                                                                    </div>
                                                                    <p className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground/20 italic text-center">No explicit conceptual mapping defined for this node.</p>
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

                            {filteredEntities.length === 0 && (
                                <div className="flex flex-col items-center justify-center p-32 text-center">
                                    <div className="p-10 rounded-[3rem] bg-muted/5 border-2 border-dashed border-muted-foreground/10 relative">
                                        <Search className="h-16 w-16 text-muted-foreground/10" />
                                    </div>
                                    <h3 className="text-2xl font-black uppercase italic tracking-tighter opacity-20 mt-8">Search Void</h3>
                                    <p className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground/30 mt-3">Adjust filters to explore architectural nodes.</p>
                                </div>
                            )}
                        </div>
                    </ScrollArea>
                </div>
            </div>
        </div>
    );
};

export default BusinessInformationModelPage;
