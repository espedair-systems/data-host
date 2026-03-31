import { useEffect, useState, useMemo } from 'react';
import { ChevronRight, ChevronDown, Book, Hash, Shield, User, ArrowLeft, Search, Layers, ListTree } from 'lucide-react';

interface Taxonomy {
  id: number;
  name: string;
  version: string;
  title: string;
  description: string;
  taxonomy_type: string;
  source: string;
  default_language: string;
  generated_at_utc: string;
}

interface Term {
  id: number;
  taxonomy_id: number;
  term_id: string;
  label: string;
  definition: string;
  status: string;
  term_type: string;
  language: string;
  parent_term_id: string;
  classification: string;
  owner: string;
  steward: string;
  children?: Term[];
}

export default function TaxonomyPage() {
  const [taxonomies, setTaxonomies] = useState<Taxonomy[]>([]);
  const [selectedTaxonomy, setSelectedTaxonomy] = useState<Taxonomy | null>(null);
  const [terms, setTerms] = useState<Term[]>([]);
  const [loading, setLoading] = useState(true);
  const [termsLoading, setTermsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchTaxonomies();
  }, []);

  const fetchTaxonomies = () => {
    setLoading(true);
    fetch('/api/taxonomy/list')
      .then(res => {
        if (!res.ok) throw new Error('Failed to fetch taxonomies');
        return res.json();
      })
      .then(data => {
        setTaxonomies(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setError('Failed to load taxonomies');
        setLoading(false);
      });
  };

  const fetchTerms = (taxonomyId: number) => {
    setTermsLoading(true);
    fetch(`/api/taxonomy/${taxonomyId}/terms`)
      .then(res => {
        if (!res.ok) throw new Error('Failed to fetch terms');
        return res.json();
      })
      .then(data => {
        setTerms(Array.isArray(data) ? data : []);
        setTermsLoading(false);
      })
      .catch(err => {
        console.error(err);
        setTermsLoading(false);
      });
  };

  const handleTaxonomyClick = (taxonomy: Taxonomy) => {
    setSelectedTaxonomy(taxonomy);
    fetchTerms(taxonomy.id);
  };

  const buildHierarchy = (flatTerms: Term[]) => {
    const termMap = new Map<string, Term>();
    flatTerms.forEach(term => termMap.set(term.term_id, { ...term, children: [] }));

    const rootTerms: Term[] = [];
    termMap.forEach(term => {
      if (term.parent_term_id && termMap.has(term.parent_term_id)) {
        termMap.get(term.parent_term_id)!.children!.push(term);
      } else {
        rootTerms.push(term);
      }
    });

    return rootTerms;
  };

  const filteredHierarchy = useMemo(() => {
    if (!searchTerm) return buildHierarchy(terms);

    const filterTerms = (termList: Term[]): Term[] => {
      return termList
        .map(term => ({ ...term, children: filterTerms(term.children || []) }))
        .filter(term => 
          term.label.toLowerCase().includes(searchTerm.toLowerCase()) || 
          term.term_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
          term.children!.length > 0
        );
    };

    return filterTerms(buildHierarchy(terms));
  }, [terms, searchTerm]);

  if (loading) return (
    <div className="p-8 flex items-center justify-center h-64">
      <div className="flex flex-col items-center gap-4">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        <p className="text-muted-foreground animate-pulse">Loading taxonomies...</p>
      </div>
    </div>
  );

  if (error) return (
    <div className="p-8 max-w-2xl mx-auto">
      <div className="bg-destructive/10 border border-destructive/20 rounded-xl p-6 text-center">
        <Shield className="h-12 w-12 text-destructive mx-auto mb-4" />
        <h2 className="text-xl font-semibold mb-2">Error</h2>
        <p className="text-destructive mb-6">{error}</p>
        <button 
          onClick={fetchTaxonomies}
          className="px-6 py-2 bg-destructive text-destructive-foreground rounded-lg hover:bg-destructive/90 transition-colors"
        >
          Try Again
        </button>
      </div>
    </div>
  );

  if (selectedTaxonomy) {
    return (
      <div className="p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
        <div className="flex flex-col gap-6">
          <button 
            onClick={() => setSelectedTaxonomy(null)}
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors w-fit group"
          >
            <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
            Back to Taxonomy Index
          </button>

          <div className="flex justify-between items-start border-b pb-8">
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <div className="bg-primary/10 p-2 rounded-xl">
                  <Layers className="h-8 w-8 text-primary" />
                </div>
                <div>
                  <h1 className="text-4xl font-extrabold tracking-tight">
                    {selectedTaxonomy.title || selectedTaxonomy.name}
                  </h1>
                  <div className="flex gap-4 text-sm text-muted-foreground mt-1">
                    <span className="flex items-center gap-1.5 bg-muted/50 px-2.5 py-0.5 rounded-full border">
                      <Hash className="h-3.5 w-3.5" />
                      {selectedTaxonomy.version}
                    </span>
                    <span className="flex items-center gap-1.5">
                      Type: {selectedTaxonomy.taxonomy_type}
                    </span>
                  </div>
                </div>
              </div>
              <p className="text-lg text-muted-foreground max-w-3xl leading-relaxed mt-4">
                {selectedTaxonomy.description}
              </p>
            </div>

            <div className="relative w-72">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input 
                type="text"
                placeholder="Search terms..."
                className="w-full pl-10 pr-4 py-2.5 bg-muted/30 border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </div>

        {termsLoading ? (
          <div className="flex flex-col items-center justify-center py-24 gap-4 opacity-70">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            <p className="text-sm font-medium">Synchronizing terms hierarchy...</p>
          </div>
        ) : (
          <div className="bg-card border rounded-2xl shadow-sm overflow-hidden gradient-card animate-in slide-in-from-bottom-4 duration-500">
            <div className="p-4 bg-muted/30 border-b flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-center gap-2 font-bold text-lg">
                <ListTree className="h-5 w-5 text-primary" />
                Business Terms Hierarchy
              </div>
              <div className="flex items-center gap-3">
                <div className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground bg-background border px-3 py-1 rounded-full shadow-sm">
                  {terms.length} Total Terms
                </div>
              </div>
            </div>
            <div className="p-6">
              {filteredHierarchy.length === 0 ? (
                <div className="text-center py-24 text-muted-foreground">
                  <Search className="h-16 w-16 mx-auto mb-6 opacity-10" />
                  <p className="text-xl font-bold">No results matching your query</p>
                  <p className="text-sm opacity-60 mt-1">Try refining your search or broadening the scope</p>
                </div>
              ) : (
                <div className="space-y-1">
                  {filteredHierarchy.map(term => (
                    <TermNode key={term.term_id} term={term} depth={0} />
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex justify-between items-end border-b pb-8">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="bg-primary text-primary-foreground p-1.5 rounded-lg shadow-lg">
              <Layers className="h-6 w-6" />
            </div>
            <h1 className="text-4xl font-extrabold tracking-tight">Business Taxonomies</h1>
          </div>
          <p className="text-xl text-muted-foreground">Comprehensive registry of organizational classification systems.</p>
        </div>
      </div>

      <div className="bg-card border rounded-3xl overflow-hidden shadow-sm animate-in slide-in-from-bottom-2 duration-1000">
        {taxonomies.length === 0 ? (
          <div className="py-24 text-center">
            <Layers className="h-16 w-16 mx-auto mb-6 text-muted-foreground/30" />
            <h3 className="text-2xl font-bold mb-2">No taxonomies found</h3>
            <p className="text-muted-foreground max-w-xs mx-auto">Start by ingesting a taxonomy file to populate the registry.</p>
          </div>
        ) : (
          <div className="divide-y divide-border/50">
            {taxonomies.map(t => (
              <div 
                key={t.id} 
                onClick={() => handleTaxonomyClick(t)}
                className="group flex flex-col md:flex-row items-start md:items-center gap-4 md:gap-8 p-6 hover:bg-muted/30 transition-all duration-300 cursor-pointer active:bg-muted/50"
              >
                <div className="bg-primary/10 text-primary p-3 rounded-2xl group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-300 shadow-sm shrink-0">
                  <Layers className="h-6 w-6" />
                </div>
                
                <div className="flex-grow grid grid-cols-1 md:grid-cols-12 gap-4 items-center w-full">
                  <div className="md:col-span-4 space-y-1">
                    <h3 className="font-bold text-xl leading-tight group-hover:text-primary transition-colors">
                      {t.title || t.name}
                    </h3>
                    <div className="flex gap-2">
                       <span className="bg-muted text-muted-foreground text-[10px] uppercase font-bold tracking-widest px-2 py-0.5 rounded-full border group-hover:bg-background transition-colors shadow-sm">
                        {t.version}
                      </span>
                      <span className="bg-primary/5 text-primary text-[10px] uppercase font-bold tracking-widest px-2 py-0.5 rounded-full border border-primary/10 shadow-sm">
                        {t.taxonomy_type}
                      </span>
                    </div>
                  </div>
                  
                  <div className="md:col-span-5">
                    <p className="text-muted-foreground text-sm line-clamp-1 group-hover:text-foreground/80 transition-colors">
                      {t.description}
                    </p>
                  </div>
                  
                  <div className="md:col-span-3 flex justify-end items-center gap-6 text-xs font-semibold text-muted-foreground">
                    <div className="hidden md:block transition-all duration-500 opacity-0 -translate-x-4 group-hover:opacity-100 group-hover:translate-x-0">
                      <div className="bg-primary text-primary-foreground p-1.5 rounded-full shadow-lg">
                        <ChevronRight className="h-4 w-4" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function TermNode({ term, depth }: { term: Term; depth: number }) {
  const [expanded, setExpanded] = useState(depth < 1);
  const hasChildren = term.children && term.children.length > 0;

  return (
    <div className="animate-in fade-in slide-in-from-left-2 duration-300">
      <div 
        className={`group flex items-start gap-3 p-3 rounded-xl transition-all cursor-pointer ${
          hasChildren ? 'hover:bg-muted/50' : 'hover:bg-primary/5'
        } ${expanded && hasChildren ? 'bg-muted/30 border-l-2 border-primary mb-1' : 'border-l-2 border-transparent'}`}
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center mt-1">
          {hasChildren ? (
            expanded ? <ChevronDown className="h-4 w-4 text-primary" /> : <ChevronRight className="h-4 w-4 text-muted-foreground" />
          ) : (
            <div className="w-4 h-4" />
          )}
        </div>
        
        <div className="flex-grow space-y-1.5 flex flex-col">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-2 overflow-hidden">
               <div className={`p-1 rounded bg-muted group-hover:bg-background transition-colors shadow-sm ${term.children && term.children.length > 0 ? 'text-primary' : 'text-muted-foreground'}`}>
                 <Book className="h-3 w-3" />
               </div>
               <span className={`font-bold transition-all truncate text-sm md:text-base ${expanded ? 'text-foreground' : 'text-foreground/80'}`}>
                {term.label}
              </span>
              <span className="text-[10px] font-mono text-muted-foreground/60 bg-muted/30 px-1.5 py-0.5 rounded border border-transparent group-hover:border-border transition-all">
                {term.term_id}
              </span>
            </div>
            
            <div className="flex gap-2 shrink-0">
               {term.term_type && (
                <span className="hidden sm:inline-block px-2 py-0.5 rounded bg-primary/5 text-primary text-[10px] font-bold border border-primary/10">
                  {term.term_type}
                </span>
              )}
              {term.classification && (
                <span className={`hidden md:inline-block px-2 py-0.5 rounded text-[10px] font-bold border ${
                  term.classification === 'Restricted' ? 'bg-red-500/10 text-red-600 border-red-500/20' : 
                  term.classification === 'Internal' ? 'bg-amber-500/10 text-amber-600 border-amber-500/20' :
                  'bg-emerald-500/10 text-emerald-600 border-emerald-500/20'
                }`}>
                  {term.classification}
                </span>
              )}
            </div>
          </div>
          
          <p className={`text-sm text-muted-foreground leading-relaxed line-clamp-2 transition-opacity duration-500 ${expanded ? 'opacity-100' : 'opacity-60'}`}>
            {term.definition}
          </p>

          <div className={`flex gap-4 pt-2 transition-all overflow-hidden ${expanded ? 'h-auto opacity-100 mt-2 border-t pt-3 border-muted/50' : 'h-0 opacity-0 overflow-hidden mt-0 pt-0 border-transparent'}`}>
             <span className="flex items-center gap-1.5 text-[11px] text-muted-foreground font-medium">
               <User className="h-3 w-3" />
               Steward: <span className="text-foreground">{term.steward || 'Not Assigned'}</span>
             </span>
             <span className="flex items-center gap-1.5 text-[11px] text-muted-foreground font-medium">
               <Hash className="h-3 w-3" />
               Status: <span className={`capitalize ${term.status === 'active' ? 'text-emerald-600' : 'text-amber-600'}`}>{term.status}</span>
             </span>
          </div>
        </div>
      </div>

      {hasChildren && expanded && (
        <div className="ml-8 border-l border-muted/50 pl-2 mt-1 space-y-1">
          {term.children?.map(child => (
            <TermNode key={child.term_id} term={child} depth={depth + 1} />
          ))}
        </div>
      )}
    </div>
  );
}
