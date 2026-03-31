import { useEffect, useState, useMemo } from 'react';
import { 
  Box, 
  Search, 
  ArrowLeft, 
  Shield, 
  User, 
  Clock, 
  Globe, 
  Layers, 
  Server, 
  Zap, 
  FileText, 
  Target,
  ChevronRight,
  Database
} from 'lucide-react';

interface DataProductCatalog {
  id: number;
  catalog_name: string;
  description: string;
  source: string;
  generated_at_utc: string;
  platform: string;
}

interface DataProduct {
  id: number;
  product_id: string;
  product_group: string;
  lifecycle_status: string;
  owner: string;
  steward: string;
  producer_system: string;
  sla: string;
  refresh_expectation: string;
  product_name: string;
  surface: string;
  delivery_type: string;
  transformation_tier: string;
  description: string;
  consumer_requirement: string;
  primary_consumers: string[];
  evidence_anchors: {
    source: string;
    location: string;
    detail: string;
  }[];
}

export default function DataProducts() {
  const [catalogs, setCatalogs] = useState<DataProductCatalog[]>([]);
  const [selectedCatalog, setSelectedCatalog] = useState<DataProductCatalog | null>(null);
  const [products, setProducts] = useState<DataProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [productsLoading, setProductsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchCatalogs();
  }, []);

  const fetchCatalogs = () => {
    setLoading(true);
    fetch('/api/data-product/list')
      .then(res => res.json())
      .then(data => {
        setCatalogs(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  const fetchProducts = (catalogId: number) => {
    setProductsLoading(true);
    fetch(`/api/data-product/${catalogId}/products`)
      .then(res => res.json())
      .then(data => {
        setProducts(Array.isArray(data) ? data : []);
        setProductsLoading(false);
      })
      .catch(() => setProductsLoading(false));
  };

  const filteredProducts = useMemo(() => {
    if (!searchTerm) return products;
    const lower = searchTerm.toLowerCase();
    return products.filter(p => 
      p.product_name.toLowerCase().includes(lower) || 
      p.product_id.toLowerCase().includes(lower) ||
      p.description.toLowerCase().includes(lower) ||
      p.owner.toLowerCase().includes(lower)
    );
  }, [products, searchTerm]);

  if (loading) return (
    <div className="p-8 flex items-center justify-center min-h-[400px]">
      <div className="flex flex-col items-center gap-4">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        <p className="text-muted-foreground animate-pulse font-medium">Loading catalogs...</p>
      </div>
    </div>
  );

  if (selectedCatalog) {
    return (
      <div className="p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
        <div className="flex flex-col gap-6">
          <button 
            onClick={() => setSelectedCatalog(null)}
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors w-fit group"
          >
            <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
            Back to Data Product Index
          </button>

          <div className="flex flex-col md:flex-row justify-between items-start gap-6 border-b pb-8">
            <div className="space-y-4 max-w-3xl">
              <div className="flex items-center gap-3">
                <div className="bg-primary/10 p-2.5 rounded-2xl shadow-sm">
                  <Box className="h-8 w-8 text-primary" />
                </div>
                <div>
                  <h1 className="text-4xl font-extrabold tracking-tight">
                    {selectedCatalog.catalog_name}
                  </h1>
                  <div className="flex gap-3 text-sm text-muted-foreground mt-1">
                    <span className="flex items-center gap-1.5 bg-muted/50 px-2.5 py-0.5 rounded-full border border-border/50">
                      <Globe className="h-3.5 w-3.5" />
                      {selectedCatalog.platform}
                    </span>
                    <span className="flex items-center gap-1.5 opacity-80">
                      <Clock className="h-3.5 w-3.5" />
                      Updated {new Date(selectedCatalog.generated_at_utc).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>
              <p className="text-lg text-muted-foreground leading-relaxed">
                {selectedCatalog.description}
              </p>
            </div>

            <div className="relative w-full md:w-80 shrink-0">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input 
                type="text"
                placeholder="Filter data products..."
                className="w-full pl-10 pr-4 py-2.5 bg-muted/30 border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all font-medium"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </div>

        {productsLoading ? (
          <div className="py-24 flex flex-col items-center gap-4 opacity-50">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            <p className="font-medium text-sm">Syncing platform products...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6">
            {filteredProducts.length === 0 ? (
              <div className="text-center py-24 bg-card border rounded-3xl border-dashed">
                <Search className="h-12 w-12 mx-auto mb-4 opacity-10" />
                <p className="text-xl font-bold">No data products found</p>
                <p className="text-muted-foreground mt-1">Try adjusting your search criteria</p>
              </div>
            ) : (
              filteredProducts.map(p => (
                <div key={p.product_id} className="group bg-card border rounded-3xl p-6 shadow-sm hover:shadow-xl transition-all duration-300 hover:border-primary/30 flex flex-col gap-6 overflow-hidden relative">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-bl-full -mr-16 -mt-16 group-hover:scale-110 transition-transform duration-700 blur-2xl"></div>
                  
                  <div className="flex flex-col lg:flex-row justify-between items-start gap-6 relative z-10">
                    <div className="space-y-3 flex-grow">
                      <div className="flex flex-wrap items-center gap-3">
                        <h3 className="text-2xl font-black tracking-tight group-hover:text-primary transition-colors">
                          {p.product_name}
                        </h3>
                        <span className="bg-primary/10 text-primary text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-lg border border-primary/20">
                          {p.product_group}
                        </span>
                        <span className={`text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-lg border ${
                          p.lifecycle_status === 'active' ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20' : 
                          'bg-amber-500/10 text-amber-600 border-amber-500/20'
                        }`}>
                          {p.lifecycle_status}
                        </span>
                      </div>
                      <p className="text-muted-foreground text-sm max-w-4xl line-clamp-2 leading-relaxed font-medium">
                        {p.description}
                      </p>
                    </div>

                    <div className="flex flex-wrap lg:flex-nowrap gap-2 shrink-0">
                       <div className="px-4 py-2 bg-muted/30 border rounded-2xl flex flex-col items-center justify-center min-w-[100px] hover:bg-background transition-colors cursor-default">
                          <span className="text-[10px] uppercase font-bold text-muted-foreground/60">Delivery</span>
                          <span className="text-xs font-black capitalize">{p.delivery_type.replace('-', ' ')}</span>
                       </div>
                       {p.transformation_tier && (
                         <div className={`px-4 py-2 border rounded-2xl flex flex-col items-center justify-center min-w-[100px] hover:shadow-sm transition-all cursor-default ${
                           p.transformation_tier === 'gold' ? 'bg-amber-400/10 border-amber-400/30 text-amber-600' :
                           p.transformation_tier === 'silver' ? 'bg-slate-400/10 border-slate-400/30 text-slate-600' :
                           'bg-orange-800/10 border-orange-800/30 text-orange-800'
                         }`}>
                            <span className="text-[10px] uppercase font-bold opacity-60">Tier</span>
                            <span className="text-xs font-black capitalize">{p.transformation_tier}</span>
                         </div>
                       )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 p-4 bg-muted/20 rounded-2xl border border-border/50 relative z-10 transition-colors group-hover:bg-muted/40">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-background rounded-xl border shadow-sm text-primary">
                        <User className="h-4 w-4" />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-wide">Steward</span>
                        <span className="text-sm font-black truncate">{p.steward}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-background rounded-xl border shadow-sm text-primary font-bold">
                        <Target className="h-4 w-4" />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-wide">Surface</span>
                        <span className="text-sm font-black truncate">{p.surface}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-background rounded-xl border shadow-sm text-primary">
                        <Zap className="h-4 w-4" />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-wide">SLA</span>
                        <span className="text-sm font-black truncate">{p.sla || 'Best Effort'}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-background rounded-xl border shadow-sm text-primary">
                        <Server className="h-4 w-4" />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-wide">Producer</span>
                        <span className="text-sm font-black truncate">{p.producer_system || 'N/A'}</span>
                      </div>
                    </div>
                  </div>

                  {p.primary_consumers && p.primary_consumers.length > 0 && (
                    <div className="flex flex-wrap gap-2 items-center text-xs relative z-10">
                      <span className="text-muted-foreground font-bold uppercase tracking-widest text-[9px]">Primary Consumers:</span>
                      {p.primary_consumers.map((c, i) => (
                        <span key={i} className="px-2 py-0.5 rounded-md bg-muted/40 border border-border/50 font-bold hover:bg-background transition-colors cursor-pointer">
                          {c}
                        </span>
                      ))}
                    </div>
                  )}

                  {p.evidence_anchors && p.evidence_anchors.length > 0 && (
                    <div className="border-t pt-4 space-y-3 relative z-10">
                      <h4 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-1.5">
                        <FileText className="h-3 w-3" />
                        Evidence Anchors
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {p.evidence_anchors.map((a, i) => (
                          <div key={i} className="p-3 bg-background border rounded-xl flex items-start gap-3 hover:border-primary/20 transition-all group/anchor shadow-sm">
                            <div className="p-1.5 rounded bg-muted/30 text-muted-foreground group-hover/anchor:text-primary transition-colors">
                              <Shield className="h-3 w-3" />
                            </div>
                            <div className="space-y-0.5">
                              <div className="flex gap-2 items-center">
                                <span className="text-[10px] font-black uppercase text-primary/80">{a.source}</span>
                                <span className="text-[10px] font-mono text-muted-foreground/60">{a.location}</span>
                              </div>
                              <p className="text-xs font-medium text-foreground/80 leading-snug">
                                {a.detail}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col md:flex-row justify-between items-end gap-6 border-b pb-8">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <div className="bg-primary text-primary-foreground p-1.5 rounded-xl shadow-lg ring-4 ring-primary/5">
              <Box className="h-6 w-6" />
            </div>
            <h1 className="text-4xl font-extrabold tracking-tight">Data Product Catalog</h1>
          </div>
          <p className="text-xl text-muted-foreground font-medium">Authoritative directory of platform-published data assets and access surfaces.</p>
        </div>
      </div>

      <div className="bg-card border rounded-3xl overflow-hidden shadow-sm animate-in slide-in-from-bottom-2 duration-1000">
        {catalogs.length === 0 ? (
          <div className="py-24 text-center bg-muted/5">
            <Box className="h-16 w-16 mx-auto mb-6 text-muted-foreground/20" />
            <h3 className="text-2xl font-bold mb-2">No catalogs registered</h3>
            <p className="text-muted-foreground max-w-xs mx-auto">Populate the registry with platform data product definitions to begin exploration.</p>
          </div>
        ) : (
          <div className="divide-y divide-border/50">
            {catalogs.map(c => (
              <div 
                key={c.id} 
                onClick={() => {
                  setSelectedCatalog(c);
                  fetchProducts(c.id);
                }}
                className="group flex flex-col md:flex-row items-start md:items-center gap-4 md:gap-8 p-8 hover:bg-muted/30 transition-all duration-300 cursor-pointer active:bg-muted/50"
              >
                <div className="bg-primary/10 text-primary p-4 rounded-2xl group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-300 shadow-sm shrink-0">
                  <Layers className="h-7 w-7" />
                </div>
                
                <div className="flex-grow grid grid-cols-1 md:grid-cols-12 gap-4 items-center w-full">
                  <div className="md:col-span-5 space-y-1.5">
                    <h3 className="font-extrabold text-2xl leading-tight group-hover:text-primary transition-colors">
                      {c.catalog_name}
                    </h3>
                    <div className="flex gap-2">
                       <span className="bg-primary/5 text-primary text-[10px] uppercase font-black tracking-widest px-2.5 py-1 rounded-lg border border-primary/10 shadow-sm">
                        {c.platform}
                      </span>
                    </div>
                  </div>
                  
                  <div className="md:col-span-4">
                    <p className="text-muted-foreground text-sm font-medium line-clamp-2 leading-relaxed group-hover:text-foreground/80 transition-colors">
                      {c.description}
                    </p>
                  </div>
                  
                  <div className="md:col-span-3 flex justify-end items-center gap-6 text-xs font-bold text-muted-foreground">
                    <span className="flex items-center gap-1.5 whitespace-nowrap bg-muted/30 px-3 py-2 rounded-xl border border-transparent group-hover:border-border transition-all">
                      <Clock className="h-3.5 w-3.5" />
                      {new Date(c.generated_at_utc).toLocaleDateString()}
                    </span>
                    <div className="hidden md:block transition-all duration-500 opacity-0 -translate-x-4 group-hover:opacity-100 group-hover:translate-x-0">
                      <div className="bg-primary text-primary-foreground p-2 rounded-full shadow-lg">
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

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-6 bg-primary/5 border border-primary/10 rounded-3xl space-y-2">
           <Zap className="h-5 w-5 text-primary" />
           <h4 className="font-bold text-lg">Instant Access</h4>
           <p className="text-sm text-primary/70 leading-relaxed font-medium">Verify SLA and subscription requirements for any platform data asset in real-time.</p>
        </div>
        <div className="p-6 bg-muted/30 border rounded-3xl space-y-2">
           <Database className="h-5 w-5 text-muted-foreground" />
           <h4 className="font-bold text-lg">Standardized Tiers</h4>
           <p className="text-sm text-muted-foreground leading-relaxed font-medium">Discover products across Bronze, Silver, and Gold transformation tiers with unified metadata.</p>
        </div>
        <div className="p-6 bg-muted/30 border rounded-3xl space-y-2">
           <Shield className="h-5 w-5 text-muted-foreground" />
           <h4 className="font-bold text-lg">Evidence Anchors</h4>
           <p className="text-sm text-muted-foreground leading-relaxed font-medium">Tracing functionality linking logical products back to technical implementation and audit trails.</p>
        </div>
      </div>
    </div>
  );
}
