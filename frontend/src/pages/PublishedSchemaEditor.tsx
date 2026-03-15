import React, { useState, useEffect } from 'react';
import {
    ArrowLeft,
    Save,
    Trash2,
    AlertCircle,
    CheckCircle2,
    Database,
    ShieldCheck,
    RefreshCcw,
    FileCode,
    Terminal,
    Table as TableIcon,
    Link2,
    Settings,
    Code,
    Plus,
    X,
    ChevronRight,
    Type,
    Check,
    Binary,
    Layers,
    ListFilter,
    FunctionSquare,
    Tags,
    Eye,
    Key,
    Zap,
    Hash,
    MoreHorizontal,
    Activity
} from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardFooter, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

const PublishedSchemaEditor: React.FC = () => {
    const { asset, file } = useParams<{ asset: string, file: string }>();
    const navigate = useNavigate();
    const [jsonContent, setJsonContent] = useState('');
    const [data, setData] = useState<any>(null);
    const [masterSchema, setMasterSchema] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);
    const [activeTab, setActiveTab] = useState('visual');
    const [visualSection, setVisualSection] = useState('tables');

    const fetchAll = async () => {
        if (!asset || !file) return;
        setLoading(true);
        try {
            const [fileResp, schemaResp] = await Promise.all([
                fetch(`/api/site/published-data/${asset}/${file}`),
                fetch(`/api/site/master-schema`)
            ]);

            if (!fileResp.ok) throw new Error(`Failed to load ${file}`);
            if (!schemaResp.ok) throw new Error(`Failed to load master schema`);

            const fileData = await fileResp.json();
            const schemaData = await schemaResp.json();

            // Ensure arrays exist
            if (!fileData.tables) fileData.tables = [];
            if (!fileData.relations) fileData.relations = [];
            if (!fileData.functions) fileData.functions = [];
            if (!fileData.viewpoints) fileData.viewpoints = [];
            if (!fileData.enums) fileData.enums = [];

            setData(fileData);
            setJsonContent(JSON.stringify(fileData, null, 4));
            setMasterSchema(schemaData);
            setError(null);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        if (!asset || !file) return;
        setSaving(true);
        setSuccess(false);
        setError(null);
        try {
            const contentToSave = activeTab === 'raw' ? JSON.parse(jsonContent) : data;

            const resp = await fetch(`/api/site/published-data/${asset}/${file}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(contentToSave)
            });

            if (!resp.ok) {
                const errData = await resp.json();
                throw new Error(errData.message || 'Failed to save file');
            }

            setSuccess(true);
            setJsonContent(JSON.stringify(contentToSave, null, 4));
            setTimeout(() => setSuccess(false), 3000);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setSaving(false);
        }
    };

    const updateField = (field: string, value: any) => {
        setData((prev: any) => ({ ...prev, [field]: value }));
    };

    // --- Table & Column Actions ---
    const addTable = () => {
        const newTable = {
            name: `new_table_${(data?.tables?.length || 0) + 1}`,
            type: "BASE TABLE",
            columns: [{ name: "id", type: "integer", nullable: false }],
            indexes: [],
            constraints: [],
            triggers: [],
            comment: ""
        };
        setData((prev: any) => ({
            ...prev,
            tables: [...(prev.tables || []), newTable]
        }));
    };

    const removeTable = (idx: number) => {
        const updatedTables = data.tables.filter((_: any, i: number) => i !== idx);
        setData({ ...data, tables: updatedTables });
    };

    const addColumn = (tableIdx: number) => {
        const updatedTables = [...data.tables];
        updatedTables[tableIdx].columns = [
            ...(updatedTables[tableIdx].columns || []),
            { name: `new_col_${(updatedTables[tableIdx].columns?.length || 0) + 1}`, type: "varchar", nullable: true }
        ];
        setData({ ...data, tables: updatedTables });
    };

    const updateColumn = (tableIdx: number, colIdx: number, field: string, value: any) => {
        const updatedTables = [...data.tables];
        updatedTables[tableIdx].columns[colIdx] = {
            ...updatedTables[tableIdx].columns[colIdx],
            [field]: value
        };
        setData({ ...data, tables: updatedTables });
    };

    const removeColumn = (tableIdx: number, colIdx: number) => {
        const updatedTables = [...data.tables];
        updatedTables[tableIdx].columns = updatedTables[tableIdx].columns.filter((_: any, i: number) => i !== colIdx);
        setData({ ...data, tables: updatedTables });
    };

    const addConstraint = (tableIdx: number) => {
        const updatedTables = [...data.tables];
        const newConstraint = { name: `fk_${updatedTables[tableIdx].name}_new`, type: "FOREIGN KEY", def: "FOREIGN KEY (col) REFERENCES other(id)", table: updatedTables[tableIdx].name };
        updatedTables[tableIdx].constraints = [...(updatedTables[tableIdx].constraints || []), newConstraint];
        setData({ ...data, tables: updatedTables });
    };

    const removeConstraint = (tableIdx: number, cIdx: number) => {
        const updatedTables = [...data.tables];
        updatedTables[tableIdx].constraints = updatedTables[tableIdx].constraints.filter((_: any, i: number) => i !== cIdx);
        setData({ ...data, tables: updatedTables });
    };

    const addIndex = (tableIdx: number) => {
        const updatedTables = [...data.tables];
        const newIdx = { name: `${updatedTables[tableIdx].name}_idx_new`, def: "CREATE INDEX ...", table: updatedTables[tableIdx].name, columns: [] };
        updatedTables[tableIdx].indexes = [...(updatedTables[tableIdx].indexes || []), newIdx];
        setData({ ...data, tables: updatedTables });
    };

    const removeIndex = (tableIdx: number, iIdx: number) => {
        const updatedTables = [...data.tables];
        updatedTables[tableIdx].indexes = updatedTables[tableIdx].indexes.filter((_: any, i: number) => i !== iIdx);
        setData({ ...data, tables: updatedTables });
    };

    const addTrigger = (tableIdx: number) => {
        const updatedTables = [...data.tables];
        const newTrigger = { name: `${updatedTables[tableIdx].name}_audit_trg`, def: "BEFORE INSERT...", comment: "Audit trail" };
        updatedTables[tableIdx].triggers = [...(updatedTables[tableIdx].triggers || []), newTrigger];
        setData({ ...data, tables: updatedTables });
    };

    const removeTrigger = (tableIdx: number, tIdx: number) => {
        const updatedTables = [...data.tables];
        updatedTables[tableIdx].triggers = updatedTables[tableIdx].triggers.filter((_: any, i: number) => i !== tIdx);
        setData({ ...data, tables: updatedTables });
    };

    // --- Global Label Actions ---
    const addLabel = () => {
        const newLabel = { name: "new_label", virtual: false };
        setData((prev: any) => ({
            ...prev,
            labels: [...(prev.labels || []), newLabel]
        }));
    };

    const removeLabel = (idx: number) => {
        const updated = (data.labels || []).filter((_: any, i: number) => i !== idx);
        setData({ ...data, labels: updated });
    };

    // --- Relation Actions ---
    const addRelation = () => {
        const newRel = {
            table: "",
            columns: [],
            parent_table: "",
            parent_columns: [],
            cardinality: "zero_or_more",
            parent_cardinality: "exactly_one",
            def: "",
            virtual: false
        };
        setData((prev: any) => ({
            ...prev,
            relations: [...(prev.relations || []), newRel]
        }));
    };

    const updateRelation = (idx: number, field: string, value: any) => {
        const updated = [...data.relations];
        updated[idx] = { ...updated[idx], [field]: value };
        setData({ ...data, relations: updated });
    };

    const removeRelation = (idx: number) => {
        const updated = data.relations.filter((_: any, i: number) => i !== idx);
        setData({ ...data, relations: updated });
    };

    // --- Enum Actions ---
    const addEnum = () => {
        const newEnum = { name: `new_enum_${(data?.enums?.length || 0) + 1}`, values: ["VALUE1"] };
        setData((prev: any) => ({
            ...prev,
            enums: [...(prev.enums || []), newEnum]
        }));
    };

    const updateEnumName = (idx: number, name: string) => {
        const updated = [...data.enums];
        updated[idx].name = name;
        setData({ ...data, enums: updated });
    };

    const updateEnumValues = (idx: number, valuesStr: string) => {
        const updated = [...data.enums];
        updated[idx].values = valuesStr.split(',').map(v => v.trim()).filter(v => v !== "");
        setData({ ...data, enums: updated });
    };

    const removeEnum = (idx: number) => {
        const updated = (data.enums || []).filter((_: any, i: number) => i !== idx);
        setData({ ...data, enums: updated });
    };

    // --- Function Actions ---
    const addFunction = () => {
        const newFunc = { name: `new_func_${(data?.functions?.length || 0) + 1}`, return_type: "void", arguments: "", type: "scalar" };
        setData((prev: any) => ({
            ...prev,
            functions: [...(prev.functions || []), newFunc]
        }));
    };

    const updateFunction = (idx: number, field: string, value: any) => {
        const updated = [...(data.functions || [])];
        updated[idx] = { ...updated[idx], [field]: value };
        setData({ ...data, functions: updated });
    };

    const removeFunction = (idx: number) => {
        const updated = (data.functions || []).filter((_: any, i: number) => i !== idx);
        setData({ ...data, functions: updated });
    };

    // --- Viewpoint Actions ---
    const addViewpoint = () => {
        const newVp = { name: `new_viewpoint_${(data?.viewpoints?.length || 0) + 1}`, desc: "New Perspective", tables: [], distance: 1 };
        setData((prev: any) => ({
            ...prev,
            viewpoints: [...(prev.viewpoints || []), newVp]
        }));
    };

    const updateViewpoint = (idx: number, field: string, value: any) => {
        const updated = [...(data.viewpoints || [])];
        if (field === 'tables' && typeof value === 'string') {
            value = value.split(',').map(v => v.trim()).filter(v => v !== "");
        }
        updated[idx] = { ...updated[idx], [field]: value };
        setData({ ...data, viewpoints: updated });
    };

    const removeViewpoint = (idx: number) => {
        const updated = (data.viewpoints || []).filter((_: any, i: number) => i !== idx);
        setData({ ...data, viewpoints: updated });
    };

    useEffect(() => {
        fetchAll();
    }, [asset, file]);

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
                <RefreshCcw className="h-8 w-8 text-primary animate-spin" />
                <p className="text-sm font-black uppercase tracking-widest text-muted-foreground text-center animate-pulse">
                    Decoding schema architecture...<br />
                    <span className="text-[10px] font-medium opacity-50">Fetching Master Definitions</span>
                </p>
            </div>
        );
    }

    const TableEditor = () => (
        <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex items-center justify-between px-2">
                <h2 className="text-lg font-black italic uppercase tracking-tighter flex items-center gap-3 text-foreground">
                    <div className="w-8 h-8 rounded-xl bg-orange-500/10 flex items-center justify-center">
                        <TableIcon className="h-4 w-4 text-orange-600" />
                    </div>
                    Entity Definitions
                </h2>
                <Button
                    size="sm"
                    variant="outline"
                    onClick={addTable}
                    className="rounded-lg text-[10px] font-black uppercase tracking-widest gap-2 bg-card border-white/10 hover:bg-orange-50 transition-colors"
                >
                    <Plus className="h-3.5 w-3.5" /> Define New Entity
                </Button>
            </div>

            <Accordion type="multiple" className="space-y-4">
                {(data?.tables || []).map((table: any, idx: number) => (
                    <AccordionItem value={table.name} key={idx} className="border border-white/10 bg-card/60 backdrop-blur-md rounded-2xl overflow-hidden shadow-sm">
                        <AccordionTrigger className="px-6 hover:no-underline hover:bg-muted/30 group">
                            <div className="flex items-center gap-4 flex-grow text-left">
                                <div className="w-10 h-10 rounded-xl bg-muted/50 flex items-center justify-center group-hover:scale-110 transition-transform shadow-inner">
                                    <Database className="h-5 w-5 text-muted-foreground" />
                                </div>
                                <div className="flex flex-col">
                                    <span className="font-black text-sm uppercase tracking-tight text-foreground">{table.name}</span>
                                    <span className="text-[10px] font-black uppercase text-primary/60 tabular-nums">
                                        {table.columns?.length || 0} Columns &bull; {table.indexes?.length || 0} Indices &bull; {table.constraints?.length || 0} CNC
                                    </span>
                                </div>
                                <div className="ml-auto mr-4 flex gap-2">
                                    {table.type && <Badge variant="secondary" className="text-[8px] uppercase font-black tracking-widest italic">{table.type}</Badge>}
                                </div>
                            </div>
                        </AccordionTrigger>
                        <AccordionContent className="px-6 pb-6 pt-2">
                            <Tabs defaultValue="columns" className="w-full">
                                <div className="flex items-center justify-between mb-4 border-b border-white/5 pb-2">
                                    <TabsList className="bg-transparent h-8 p-0 gap-4">
                                        <TabsTrigger value="columns" className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:text-primary border-b-2 border-transparent data-[state=active]:border-primary rounded-none px-0 text-[10px] uppercase font-black tracking-widest h-8">Attributes</TabsTrigger>
                                        <TabsTrigger value="constraints" className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:text-primary border-b-2 border-transparent data-[state=active]:border-primary rounded-none px-0 text-[10px] uppercase font-black tracking-widest h-8">Constraints</TabsTrigger>
                                        <TabsTrigger value="indexes" className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:text-primary border-b-2 border-transparent data-[state=active]:border-primary rounded-none px-0 text-[10px] uppercase font-black tracking-widest h-8">Indexes</TabsTrigger>
                                        <TabsTrigger value="properties" className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:text-primary border-b-2 border-transparent data-[state=active]:border-primary rounded-none px-0 text-[10px] uppercase font-black tracking-widest h-8">Config</TabsTrigger>
                                    </TabsList>
                                    <Button variant="ghost" size="icon" className="h-6 w-6 text-destructive/40 hover:text-destructive hover:bg-destructive/5" onClick={() => removeTable(idx)}>
                                        <Trash2 className="h-3.5 w-3.5" />
                                    </Button>
                                </div>

                                <TabsContent value="columns" className="border-none p-0 mt-0">
                                    <div className="rounded-xl border border-white/10 overflow-hidden bg-background/30 shadow-inner">
                                        <Table>
                                            <TableHeader className="bg-muted/50">
                                                <TableRow>
                                                    <TableHead className="text-[9px] font-black uppercase tracking-widest px-4 h-8">Attr Name</TableHead>
                                                    <TableHead className="text-[9px] font-black uppercase tracking-widest h-8">Primitive</TableHead>
                                                    <TableHead className="text-[9px] font-black uppercase tracking-widest text-center h-8">Null</TableHead>
                                                    <TableHead className="text-[9px] font-black uppercase tracking-widest h-8">Default</TableHead>
                                                    <TableHead className="text-[9px] font-black uppercase tracking-widest h-8">Comment / Spec</TableHead>
                                                    <TableHead className="text-[9px] font-black uppercase tracking-widest h-8 text-right px-4">Ops</TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {table.columns?.map((col: any, cIdx: number) => (
                                                    <TableRow key={cIdx} className="hover:bg-muted/20 transition-colors border-white/5">
                                                        <TableCell className="font-bold text-xs py-2 px-4 italic text-foreground">
                                                            <Input
                                                                value={col.name}
                                                                onChange={(e) => updateColumn(idx, cIdx, 'name', e.target.value)}
                                                                className="h-7 text-xs bg-transparent border-none p-0 focus-visible:ring-0 italic"
                                                            />
                                                        </TableCell>
                                                        <TableCell className="py-2">
                                                            <div className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-primary/5 border border-primary/10 w-fit">
                                                                <Type className="h-2.5 w-2.5 text-primary/50" />
                                                                <Input
                                                                    value={col.type}
                                                                    onChange={(e) => updateColumn(idx, cIdx, 'type', e.target.value)}
                                                                    className="h-5 w-20 text-[10px] font-black uppercase bg-transparent border-none p-0 focus-visible:ring-0"
                                                                />
                                                            </div>
                                                        </TableCell>
                                                        <TableCell className="text-center py-2">
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                className="h-6 w-6"
                                                                onClick={() => updateColumn(idx, cIdx, 'nullable', !col.nullable)}
                                                            >
                                                                {col.nullable ? (
                                                                    <Check className="h-3 w-3 text-emerald-500" />
                                                                ) : (
                                                                    <X className="h-3 w-3 text-slate-300" />
                                                                )}
                                                            </Button>
                                                        </TableCell>
                                                        <TableCell className="py-2">
                                                            <Input
                                                                value={col.default || ''}
                                                                onChange={(e) => updateColumn(idx, cIdx, 'default', e.target.value)}
                                                                placeholder="NULL"
                                                                className="h-7 text-[10px] bg-background/50 border-white/5 font-mono"
                                                            />
                                                        </TableCell>
                                                        <TableCell className="py-2">
                                                            <Input
                                                                value={col.comment || ''}
                                                                onChange={(e) => updateColumn(idx, cIdx, 'comment', e.target.value)}
                                                                placeholder="Metadata description..."
                                                                className="h-7 text-[10px] bg-transparent border-none p-0 focus-visible:ring-0 text-muted-foreground italic"
                                                            />
                                                        </TableCell>
                                                        <TableCell className="text-right py-2 px-4">
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                className="h-6 w-6 rounded-md text-destructive opacity-20 hover:opacity-100"
                                                                onClick={() => removeColumn(idx, cIdx)}
                                                            >
                                                                <X className="h-3 w-3" />
                                                            </Button>
                                                        </TableCell>
                                                    </TableRow>
                                                ))}
                                                <TableRow className="border-none bg-muted/20">
                                                    <TableCell colSpan={5} className="py-1">
                                                        <Button
                                                            variant="ghost"
                                                            onClick={() => addColumn(idx)}
                                                            className="w-full h-8 text-[8px] font-black uppercase tracking-[0.2em] italic hover:bg-primary/5 hover:text-primary transition-colors"
                                                        >
                                                            <Plus className="h-3 w-3 mr-2" /> Append Attribute to {table.name}
                                                        </Button>
                                                    </TableCell>
                                                </TableRow>
                                                <TableRow className="border-none bg-background/10">
                                                    <TableCell colSpan={6} className="py-4 px-6">
                                                        <div className="space-y-1.5">
                                                            <Label className="text-[8px] font-black uppercase text-muted-foreground/40 tracking-widest">Referenced Host Tables (External Context)</Label>
                                                            <div className="flex flex-wrap gap-2 pt-1">
                                                                {(table.referenced_tables || []).map((t: string, ti: number) => (
                                                                    <Badge key={ti} variant="outline" className="text-[9px] py-1 border-white/5 bg-white/5 text-muted-foreground">{t}</Badge>
                                                                ))}
                                                                {(!table.referenced_tables || table.referenced_tables.length === 0) && <span className="text-[10px] italic text-muted-foreground/30">No direct host references</span>}
                                                            </div>
                                                        </div>
                                                    </TableCell>
                                                </TableRow>
                                            </TableBody>
                                        </Table>
                                    </div>
                                </TabsContent>

                                <TabsContent value="constraints" className="border-none p-0 mt-4">
                                    <div className="space-y-2">
                                        {(table.constraints || []).map((c: any, cIdx: number) => (
                                            <div key={cIdx} className="flex items-center gap-4 p-3 bg-muted/20 rounded-xl border border-white/5">
                                                <Key className="h-3.5 w-3.5 text-amber-500" />
                                                <Input
                                                    value={c.name}
                                                    onChange={(e) => {
                                                        const ut = [...data.tables];
                                                        ut[idx].constraints[cIdx].name = e.target.value;
                                                        setData({ ...data, tables: ut });
                                                    }}
                                                    className="h-7 text-xs flex-grow bg-transparent border-none p-0 focus-visible:ring-0 font-bold"
                                                />
                                                <Badge variant="outline" className="text-[8px] font-black uppercase">{c.type}</Badge>
                                                <Button variant="ghost" size="icon" className="h-6 w-6 text-destructive/40 hover:text-destructive" onClick={() => removeConstraint(idx, cIdx)}><X className="h-3 w-3" /></Button>
                                            </div>
                                        ))}
                                        <Button variant="outline" onClick={() => addConstraint(idx)} className="w-full h-8 text-[8px] font-black uppercase tracking-widest border-dashed border-white/10 bg-transparent hover:bg-amber-500/5 transition-colors">
                                            + Register Constraint
                                        </Button>
                                    </div>
                                </TabsContent>

                                <TabsContent value="indexes" className="border-none p-0 mt-4">
                                    <div className="space-y-2">
                                        {(table.indexes || []).map((idxObj: any, iIdx: number) => (
                                            <div key={iIdx} className="flex items-center gap-4 p-3 bg-muted/20 rounded-xl border border-white/5">
                                                <Hash className="h-3.5 w-3.5 text-blue-500" />
                                                <Input
                                                    value={idxObj.name}
                                                    onChange={(e) => {
                                                        const ut = [...data.tables];
                                                        ut[idx].indexes[iIdx].name = e.target.value;
                                                        setData({ ...data, tables: ut });
                                                    }}
                                                    className="h-7 text-xs flex-grow bg-transparent border-none p-0 focus-visible:ring-0 font-bold"
                                                />
                                                <div className="flex gap-1">
                                                    {(idxObj.columns || []).map((col: string, ci: number) => <Badge key={ci} variant="secondary" className="text-[7px] px-1 h-4">{col}</Badge>)}
                                                </div>
                                                <Button variant="ghost" size="icon" className="h-6 w-6 text-destructive/40 hover:text-destructive" onClick={() => removeIndex(idx, iIdx)}><X className="h-3 w-3" /></Button>
                                            </div>
                                        ))}
                                        <Button variant="outline" onClick={() => addIndex(idx)} className="w-full h-8 text-[8px] font-black uppercase tracking-widest border-dashed border-white/10 bg-transparent hover:bg-blue-500/5 transition-colors">
                                            + Add Performance Index
                                        </Button>
                                    </div>
                                </TabsContent>

                                <TabsContent value="triggers" className="border-none p-0 mt-4">
                                    <div className="space-y-2">
                                        {(table.triggers || []).map((trg: any, tIdx: number) => (
                                            <div key={tIdx} className="flex flex-col gap-2 p-4 bg-muted/20 rounded-xl border border-white/5 group relative">
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center gap-2">
                                                        <Activity className="h-3.5 w-3.5 text-pink-500" />
                                                        <Input
                                                            value={trg.name}
                                                            onChange={(e) => {
                                                                const ut = [...data.tables];
                                                                ut[idx].triggers[tIdx].name = e.target.value;
                                                                setData({ ...data, tables: ut });
                                                            }}
                                                            className="h-7 text-xs bg-transparent border-none p-0 focus-visible:ring-0 font-bold uppercase"
                                                        />
                                                    </div>
                                                    <Button variant="ghost" size="icon" className="h-6 w-6 text-destructive/40 hover:text-destructive" onClick={() => removeTrigger(idx, tIdx)}><Trash2 className="h-3 w-3" /></Button>
                                                </div>
                                                <Textarea
                                                    value={trg.def}
                                                    onChange={(e) => {
                                                        const ut = [...data.tables];
                                                        ut[idx].triggers[tIdx].def = e.target.value;
                                                        setData({ ...data, tables: ut });
                                                    }}
                                                    className="min-h-[60px] text-[10px] font-mono bg-background/50 border-white/5"
                                                />
                                            </div>
                                        ))}
                                        <Button variant="outline" onClick={() => addTrigger(idx)} className="w-full h-8 text-[8px] font-black uppercase tracking-widest border-dashed border-white/10 bg-transparent hover:bg-pink-500/5 transition-colors">
                                            + Install Trigger
                                        </Button>
                                    </div>
                                </TabsContent>

                                <TabsContent value="meta" className="border-none p-0 mt-4">
                                    <div className="grid grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <Label className="text-[9px] font-black uppercase text-muted-foreground/60 tracking-widest">Type Matrix</Label>
                                            <Input
                                                value={table.type || ''}
                                                onChange={(e) => {
                                                    const updatedTables = [...data.tables];
                                                    updatedTables[idx].type = e.target.value;
                                                    setData({ ...data, tables: updatedTables });
                                                }}
                                                className="bg-muted/20 border-white/5 h-9"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label className="text-[9px] font-black uppercase text-muted-foreground/60 tracking-widest">Functional Desc</Label>
                                            <Input
                                                value={table.comment || ''}
                                                onChange={(e) => {
                                                    const updatedTables = [...data.tables];
                                                    updatedTables[idx].comment = e.target.value;
                                                    setData({ ...data, tables: updatedTables });
                                                }}
                                                className="bg-muted/20 border-white/5 h-9"
                                            />
                                        </div>
                                        <div className="col-span-2 space-y-2">
                                            <Label className="text-[9px] font-black uppercase text-muted-foreground/60 tracking-widest">Engine DDL / Definition</Label>
                                            <Textarea
                                                value={table.def || ''}
                                                onChange={(e) => {
                                                    const updatedTables = [...data.tables];
                                                    updatedTables[idx].def = e.target.value;
                                                    setData({ ...data, tables: updatedTables });
                                                }}
                                                className="bg-muted/20 border-white/5 font-mono text-[10px] min-h-[80px]"
                                            />
                                        </div>
                                    </div>
                                </TabsContent>
                            </Tabs>
                        </AccordionContent>
                    </AccordionItem>
                ))}
                {data?.tables?.length === 0 && (
                    <Card className="border-dashed border-2 bg-transparent text-center p-12 rounded-[32px]">
                        <p className="text-sm italic text-muted-foreground opacity-40">No entities present in this scope.</p>
                    </Card>
                )}
            </Accordion>
        </div>
    );

    const RelationsEditor = () => {
        const cardinalityOptions = masterSchema?.$defs?.Relation?.properties?.cardinality?.enum || ["zero_or_one", "exactly_one", "zero_or_more", "one_or_more", ""];

        return (
            <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="flex items-center justify-between px-2">
                    <h2 className="text-lg font-black italic uppercase tracking-tighter flex items-center gap-3 text-foreground">
                        <div className="w-8 h-8 rounded-xl bg-blue-500/10 flex items-center justify-center">
                            <Link2 className="h-4 w-4 text-blue-600" />
                        </div>
                        Topology: Relations
                    </h2>
                    <Button
                        size="sm"
                        variant="outline"
                        onClick={addRelation}
                        className="rounded-lg text-[10px] font-black uppercase tracking-widest gap-2 bg-card border-white/10 hover:bg-blue-50 transition-colors"
                    >
                        <Plus className="h-3.5 w-3.5" /> New Mapping
                    </Button>
                </div>

                {(data?.relations || []).length === 0 ? (
                    <Card className="border-dashed border-2 bg-transparent text-center p-12 rounded-[32px]">
                        <p className="text-sm italic text-muted-foreground opacity-40">No relationships defined in this schema metadata chain.</p>
                    </Card>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {(data.relations).map((rel: any, idx: number) => (
                            <Card key={idx} className="border border-white/10 bg-card/40 backdrop-blur-md rounded-2xl overflow-hidden shadow-sm flex flex-col group relative">
                                <div className="p-4 border-b border-white/5 flex items-center gap-3 justify-between">
                                    <div className="flex items-center gap-2">
                                        <Badge className="bg-blue-500/10 text-blue-600 border-blue-500/20 text-[10px] font-black tabular-nums">{rel.table || '?'}</Badge>
                                        <ChevronRight className="h-3 w-3 text-muted-foreground/40" />
                                        <Badge className="bg-blue-500/10 text-blue-600 border-blue-500/20 text-[10px] font-black tabular-nums">{rel.parent_table || '?'}</Badge>
                                    </div>
                                    <Button variant="ghost" size="icon" className="h-6 w-6 text-destructive opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => removeRelation(idx)}>
                                        <Trash2 className="h-3 w-3" />
                                    </Button>
                                </div>
                                <CardContent className="p-4 space-y-4">
                                    <div className="grid grid-cols-2 gap-3">
                                        <div className="space-y-1.5">
                                            <Label className="text-[8px] font-black uppercase text-muted-foreground/60 tracking-widest">Client Table</Label>
                                            <Input value={rel.table} onChange={(e) => updateRelation(idx, 'table', e.target.value)} className="h-8 text-[10px] uppercase font-bold" />
                                        </div>
                                        <div className="space-y-1.5">
                                            <Label className="text-[8px] font-black uppercase text-muted-foreground/60 tracking-widest">Host Table</Label>
                                            <Input value={rel.parent_table} onChange={(e) => updateRelation(idx, 'parent_table', e.target.value)} className="h-8 text-[10px] uppercase font-bold" />
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-3">
                                        <div className="space-y-1.5">
                                            <Label className="text-[8px] font-black uppercase text-muted-foreground/60 tracking-widest">Cardinality</Label>
                                            <Select value={rel.cardinality} onValueChange={(v: string) => updateRelation(idx, 'cardinality', v)}>
                                                <SelectTrigger className="h-8 text-[9px] font-black uppercase">
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {cardinalityOptions.map((opt: string) => (
                                                        <SelectItem key={opt} value={opt} className="text-[9px] uppercase font-black">{opt || 'NONE'}</SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div className="space-y-1.5">
                                            <Label className="text-[8px] font-black uppercase text-muted-foreground/60 tracking-widest">Parent Card</Label>
                                            <Select value={rel.parent_cardinality} onValueChange={(v: string) => updateRelation(idx, 'parent_cardinality', v)}>
                                                <SelectTrigger className="h-8 text-[9px] font-black uppercase">
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {cardinalityOptions.map((opt: string) => (
                                                        <SelectItem key={opt} value={opt} className="text-[9px] uppercase font-black">{opt || 'NONE'}</SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-3">
                                        <div className="space-y-1.5">
                                            <Label className="text-[8px] font-black uppercase text-muted-foreground/60 tracking-widest">Relation Class</Label>
                                            <Select value={rel.type || 'physical'} onValueChange={(v: string) => updateRelation(idx, 'type', v)}>
                                                <SelectTrigger className="h-8 text-[9px] font-black uppercase">
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {["physical", "logical", "inferred"].map(t => <SelectItem key={t} value={t} className="text-[9px] uppercase font-black">{t}</SelectItem>)}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>
                                    <div className="space-y-1.5">
                                        <Label className="text-[8px] font-black uppercase text-muted-foreground/60 tracking-widest">Link Definition</Label>
                                        <Input value={rel.def} onChange={(e) => updateRelation(idx, 'def', e.target.value)} className="h-8 text-[10px] italic text-muted-foreground" />
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}
            </div>
        );
    };

    const EnumsEditor = () => (
        <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex items-center justify-between px-2">
                <h2 className="text-lg font-black italic uppercase tracking-tighter flex items-center gap-3 text-foreground">
                    <div className="w-8 h-8 rounded-xl bg-purple-500/10 flex items-center justify-center">
                        <MoreHorizontal className="h-4 w-4 text-purple-600" />
                    </div>
                    Enumeration Sets
                </h2>
                <Button
                    size="sm"
                    variant="outline"
                    onClick={addEnum}
                    className="rounded-lg text-[10px] font-black uppercase tracking-widest gap-2 bg-card border-white/10 hover:bg-purple-50 transition-colors"
                >
                    <Plus className="h-3.5 w-3.5" /> Define Enum
                </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {(data?.enums || []).map((enm: any, idx: number) => (
                    <Card key={idx} className="border border-white/10 bg-card/40 rounded-2xl flex flex-col">
                        <CardHeader className="p-4 pb-2 flex flex-row items-center justify-between">
                            <Input
                                value={enm.name}
                                onChange={(e) => updateEnumName(idx, e.target.value)}
                                className="h-8 font-black uppercase text-[11px] bg-transparent border-none p-0 focus-visible:ring-0"
                            />
                            <Button variant="ghost" size="icon" className="h-6 w-6 text-destructive/40" onClick={() => removeEnum(idx)}>
                                <X className="h-3 w-3" />
                            </Button>
                        </CardHeader>
                        <CardContent className="p-4 pt-0 space-y-3">
                            <Label className="text-[8px] font-black uppercase text-muted-foreground/60 tracking-widest">Allowed Values (CSV)</Label>
                            <Textarea
                                value={(enm.values || []).join(', ')}
                                onChange={(e) => updateEnumValues(idx, e.target.value)}
                                className="h-20 text-[10px] font-mono leading-relaxed bg-muted/20 border-white/5"
                            />
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );

    const MetadataEditor = () => (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="border-white/10 shadow-lg bg-card/40 backdrop-blur-sm rounded-[32px]">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-xs font-black uppercase tracking-widest text-primary flex items-center gap-2">
                            <Settings className="h-3 w-3" /> Core Manifest
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4 pt-2">
                        <div className="space-y-2">
                            <Label className="text-[10px] uppercase font-bold text-muted-foreground">Provider Namespace</Label>
                            <Input
                                value={data.name || ''}
                                onChange={(e) => updateField('name', e.target.value)}
                                className="bg-background/50 border-white/10 focus:ring-1 ring-primary/20 rounded-xl"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label className="text-[10px] uppercase font-bold text-muted-foreground">Publication Scope</Label>
                            <Textarea
                                value={data.desc || ''}
                                onChange={(e) => updateField('desc', e.target.value)}
                                className="bg-background/50 border-white/10 min-h-[120px] rounded-xl"
                            />
                        </div>
                    </CardContent>
                </Card>

                <div className="space-y-6">
                    <Card className="border-white/10 shadow-lg bg-card/40 rounded-[32px]">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-xs font-black uppercase tracking-widest text-emerald-500 flex items-center gap-2">
                                <Tags className="h-3 w-3" /> Global Labels
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="pt-2">
                            <div className="flex flex-wrap gap-2">
                                {(data?.labels || []).map((l: any, i: number) => (
                                    <Badge key={i} variant="secondary" className="gap-1 border-white/5 py-1.5 px-4 rounded-full">
                                        {l.name} {l.virtual && <span className="opacity-40 italic font-medium">(v)</span>}
                                        <X className="h-2 w-2 ml-1 cursor-pointer opacity-40 hover:opacity-100" onClick={() => removeLabel(i)} />
                                    </Badge>
                                ))}
                                <Button variant="ghost" size="sm" onClick={addLabel} className="h-8 text-[8px] uppercase tracking-widest border border-dashed border-white/20 rounded-full px-4">
                                    + Add Label
                                </Button>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-white/10 shadow-lg bg-card/40 rounded-[32px]">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-xs font-black uppercase tracking-widest text-purple-500 flex items-center gap-2">
                                <Binary className="h-3 w-3" /> Engine config
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="pt-2">
                            <div className="p-4 bg-[#0a0a0a] rounded-2xl border border-white/5 font-mono text-[10px] space-y-1 shadow-inner">
                                <p className="text-muted-foreground/40 italic">// dynamic service_config overrides</p>
                                <pre className="text-purple-400/80">{JSON.stringify(data.service_config || {}, null, 2)}</pre>
                            </div>
                            <Button variant="link" onClick={() => setActiveTab('raw')} className="text-[10px] p-0 h-auto mt-3 text-primary uppercase font-black tracking-widest hover:no-underline opacity-60 hover:opacity-100 transition-opacity">Edit Config in RAW Mode &rarr;</Button>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );

    const FunctionsEditor = () => (
        <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex items-center justify-between px-2">
                <h2 className="text-lg font-black italic uppercase tracking-tighter flex items-center gap-3 text-foreground">
                    <div className="w-8 h-8 rounded-xl bg-pink-500/10 flex items-center justify-center">
                        <FunctionSquare className="h-4 w-4 text-pink-600" />
                    </div>
                    Engine Functions
                </h2>
                <Button
                    size="sm"
                    variant="outline"
                    onClick={addFunction}
                    className="rounded-lg text-[10px] font-black uppercase tracking-widest gap-2 bg-card border-white/10 hover:bg-pink-50 transition-colors"
                >
                    <Plus className="h-3.5 w-3.5" /> Register Function
                </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {(data?.functions || []).map((fn: any, idx: number) => (
                    <Card key={idx} className="border border-white/10 bg-card/40 rounded-2xl flex flex-col group">
                        <CardHeader className="p-4 pb-2 flex flex-row items-center justify-between">
                            <div className="flex items-center gap-3 flex-grow">
                                <Zap className="h-3.5 w-3.5 text-pink-500" />
                                <Input
                                    value={fn.name}
                                    onChange={(e) => updateFunction(idx, 'name', e.target.value)}
                                    className="h-8 font-black uppercase text-[11px] bg-transparent border-none p-0 focus-visible:ring-0"
                                />
                            </div>
                            <Button variant="ghost" size="icon" className="h-6 w-6 text-destructive/40 group-hover:text-destructive group-hover:bg-destructive/5" onClick={() => removeFunction(idx)}>
                                <X className="h-3 w-3" />
                            </Button>
                        </CardHeader>
                        <CardContent className="p-4 pt-0 space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <Label className="text-[8px] font-black uppercase text-muted-foreground/60 tracking-widest">Return Type</Label>
                                    <Input value={fn.return_type} onChange={(e) => updateFunction(idx, 'return_type', e.target.value)} className="h-8 text-[10px] uppercase font-bold" />
                                </div>
                                <div className="space-y-1.5">
                                    <Label className="text-[8px] font-black uppercase text-muted-foreground/60 tracking-widest">Fn Type</Label>
                                    <Input value={fn.type} onChange={(e) => updateFunction(idx, 'type', e.target.value)} className="h-8 text-[10px] uppercase font-bold" />
                                </div>
                            </div>
                            <div className="space-y-1.5">
                                <Label className="text-[8px] font-black uppercase text-muted-foreground/60 tracking-widest">Arguments Signature</Label>
                                <Input value={fn.arguments} onChange={(e) => updateFunction(idx, 'arguments', e.target.value)} className="h-8 text-[10px] italic text-muted-foreground" placeholder="e.g. (p_id uuid, p_active bool)" />
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );

    const ViewpointsEditor = () => (
        <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex items-center justify-between px-2">
                <h2 className="text-lg font-black italic uppercase tracking-tighter flex items-center gap-3 text-foreground">
                    <div className="w-8 h-8 rounded-xl bg-teal-500/10 flex items-center justify-center">
                        <Eye className="h-4 w-4 text-teal-600" />
                    </div>
                    Business Perspectives
                </h2>
                <Button
                    size="sm"
                    variant="outline"
                    onClick={addViewpoint}
                    className="rounded-lg text-[10px] font-black uppercase tracking-widest gap-2 bg-card border-white/10 hover:bg-teal-50 transition-colors"
                >
                    <Plus className="h-3.5 w-3.5" /> Define Viewpoint
                </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {(data?.viewpoints || []).map((vp: any, idx: number) => (
                    <Card key={idx} className="border border-white/10 bg-card/40 rounded-3xl flex flex-col group">
                        <CardHeader className="p-6 pb-2 flex flex-row items-start justify-between">
                            <div className="space-y-1 flex-grow">
                                <div className="flex items-center gap-2">
                                    <Badge variant="outline" className="text-[8px] uppercase px-1.5 py-0">Viewpoint</Badge>
                                    <Input
                                        value={vp.name}
                                        onChange={(e) => updateViewpoint(idx, 'name', e.target.value)}
                                        className="h-8 font-black uppercase text-[14px] bg-transparent border-none p-0 focus-visible:ring-0 italic"
                                    />
                                </div>
                            </div>
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive/40" onClick={() => removeViewpoint(idx)}>
                                <Trash2 className="h-4 w-4" />
                            </Button>
                        </CardHeader>
                        <CardContent className="p-6 pt-2 space-y-5">
                            <div className="space-y-1.5">
                                <Label className="text-[8px] font-black uppercase text-muted-foreground/60 tracking-widest ml-1">Perspective Description</Label>
                                <Textarea
                                    value={vp.desc}
                                    onChange={(e) => updateViewpoint(idx, 'desc', e.target.value)}
                                    className="min-h-[80px] text-xs italic bg-muted/20 border-white/5 rounded-2xl"
                                />
                            </div>
                            <div className="space-y-1.5">
                                <Label className="text-[8px] font-black uppercase text-muted-foreground/60 tracking-widest ml-1">Scoped Entities (CSV)</Label>
                                <Input
                                    value={(vp.tables || []).join(', ')}
                                    onChange={(e) => updateViewpoint(idx, 'tables', e.target.value)}
                                    className="h-9 text-[10px] font-black uppercase bg-muted/20 border-white/5 rounded-xl"
                                    placeholder="TABLE1, TABLE2, ..."
                                />
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );

    const VisualEditor = () => (
        <div className="flex flex-col gap-6">
            <div className="flex gap-2 p-1.5 bg-muted/40 rounded-2xl w-fit border border-white/5">
                {[
                    { id: 'tables', label: 'Entities', icon: TableIcon },
                    { id: 'relations', label: 'Topology', icon: Link2 },
                    { id: 'enums', label: 'Enums', icon: MoreHorizontal },
                    { id: 'metadata', label: 'Manifest', icon: Settings },
                    { id: 'functions', label: 'Functions', icon: FunctionSquare },
                    { id: 'viewpoints', label: 'Perspective', icon: Eye }
                ].map(s => (
                    <Button
                        key={s.id}
                        variant={visualSection === s.id ? 'secondary' : 'ghost'}
                        onClick={() => setVisualSection(s.id)}
                        className={`rounded-xl text-[10px] font-black uppercase tracking-widest gap-2 h-10 px-6 transition-all ${visualSection === s.id ? 'shadow-md bg-card border-white/10 ring-1 ring-primary/5' : 'text-muted-foreground/60 hover:bg-white/5'}`}
                    >
                        <s.icon className={`h-3.5 w-3.5 ${visualSection === s.id ? 'text-primary' : ''}`} />
                        {s.label}
                    </Button>
                ))}
            </div>

            <div className="flex-grow">
                {visualSection === 'tables' && <TableEditor />}
                {visualSection === 'relations' && <RelationsEditor />}
                {visualSection === 'enums' && <EnumsEditor />}
                {visualSection === 'metadata' && <MetadataEditor />}
                {visualSection === 'functions' && <FunctionsEditor />}
                {visualSection === 'viewpoints' && <ViewpointsEditor />}
            </div>
        </div>
    );

    const RawEditor = () => (
        <Card className="border-none shadow-2xl bg-card overflow-hidden flex flex-col rounded-[40px] border border-white/10 h-[calc(100vh-320px)] animate-in slide-in-from-right-4 duration-500">
            <CardHeader className="bg-muted/30 border-b p-6 px-8 flex flex-row items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-primary/10 rounded-xl text-primary shadow-sm">
                        <FileCode className="h-5 w-5" />
                    </div>
                    <div>
                        <span className="text-[11px] font-black uppercase tracking-widest text-foreground">Source Buffer</span>
                        <p className="text-[8px] font-black text-muted-foreground/40 uppercase tracking-tighter leading-none mt-1">direct filesystem stream • utf-8 encoding</p>
                    </div>
                </div>
                <div className="flex gap-4">
                    <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20 text-[9px] font-black tabular-nums h-7 px-3 rounded-lg">
                        {jsonContent.length.toLocaleString()} BYTES
                    </Badge>
                </div>
            </CardHeader>
            <CardContent className="p-0 flex-grow relative bg-[#0a0a0a]">
                <textarea
                    className="w-full h-full p-12 font-mono text-sm bg-transparent outline-none resize-none text-white/90 leading-relaxed selection:bg-primary/40 scrollbar-hide"
                    value={jsonContent}
                    onChange={(e) => setJsonContent(e.target.value)}
                    spellCheck={false}
                />
            </CardContent>
            <CardFooter className="bg-muted/30 border-t p-5 px-10 flex justify-between items-center text-[9px] font-black uppercase text-muted-foreground/50 tracking-[0.2em]">
                <div className="flex gap-10">
                    <span className="flex items-center gap-2.5"><Terminal className="h-3.5 w-3.5 text-primary/60" /> LINUX SOURCE</span>
                    <span className="flex items-center gap-2.5"><Database className="h-3.5 w-3.5 text-primary/60" /> SCOPE: {asset}</span>
                </div>
                <div className="flex items-center gap-3 animate-pulse text-emerald-500/60">
                    <div className="w-1.5 h-1.5 rounded-full bg-current" />
                    BUFFER READY
                </div>
            </CardFooter>
        </Card>
    );

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500 max-w-[1600px] mx-auto pb-20">
            {/* Breadcrumbs / Header */}
            <div className="flex flex-col gap-5">
                <div className="flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/40 mb-1">
                    <div className="hover:text-primary cursor-pointer transition-colors flex items-center gap-2" onClick={() => navigate('/publish/schema-data')}>
                        <TableIcon className="h-3 w-3" /> Inventory
                    </div>
                    <ChevronRight className="h-3 w-3 opacity-20" />
                    <span className="opacity-20">{asset}</span>
                    <ChevronRight className="h-3 w-3 opacity-20" />
                    <span className="text-foreground/80 flex items-center gap-2">
                        <FileCode className="h-3 w-3 text-primary/60" /> {file}
                    </span>
                </div>

                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-8">
                        <Button
                            variant="outline"
                            size="icon"
                            className="rounded-[24px] h-16 w-16 border-white/10 hover:bg-muted shadow-2xl hover:shadow-primary/5 transition-all active:scale-90 group"
                            onClick={() => navigate('/publish/schema-data')}
                        >
                            <ArrowLeft className="h-7 w-7 group-hover:-translate-x-1.5 transition-transform" />
                        </Button>
                        <div>
                            <h1 className="text-5xl font-black italic uppercase tracking-tighter text-foreground leading-none mb-2">
                                SCHEMA <span className="text-primary tracking-normal not-italic underline decoration-primary/50 underline-offset-8">DIRECTOR</span>
                            </h1>
                            <p className="text-muted-foreground text-xs font-bold uppercase tracking-[0.2em] flex items-center gap-3 opacity-60">
                                <ShieldCheck className="h-4 w-4 text-emerald-500" />
                                Validating: <span className="text-foreground tracking-normal font-black">{masterSchema?.title || 'Data Services Schema'}</span>
                            </p>
                        </div>
                    </div>

                    <div className="flex gap-4 items-center">
                        <Tabs value={activeTab} className="bg-muted/40 p-1.5 rounded-[22px] border border-white/5 mr-4" onValueChange={setActiveTab}>
                            <TabsList className="bg-transparent border-none p-0 h-12">
                                <TabsTrigger value="visual" className="rounded-[18px] text-[10px] uppercase font-black tracking-widest gap-2.5 h-10 px-8 data-[state=active]:bg-card data-[state=active]:shadow-2xl data-[state=active]:text-primary transition-all">
                                    <Layers className="h-3.5 w-3.5" /> Visual
                                </TabsTrigger>
                                <TabsTrigger value="raw" className="rounded-[18px] text-[10px] uppercase font-black tracking-widest gap-2.5 h-10 px-8 data-[state=active]:bg-card data-[state=active]:shadow-2xl data-[state=active]:text-primary transition-all">
                                    <Code className="h-3.5 w-3.5" /> Source
                                </TabsTrigger>
                            </TabsList>
                        </Tabs>

                        {success && (
                            <div className="flex items-center gap-3 px-6 py-4 bg-emerald-500/10 text-emerald-600 rounded-3xl border border-emerald-500/20 text-[10px] font-black uppercase tracking-[0.2em] animate-in slide-in-from-right-6 shadow-2xl shadow-emerald-500/10">
                                <CheckCircle2 className="h-5 w-5" />
                                Updated
                            </div>
                        )}
                        <Button
                            className="rounded-[30px] h-16 px-12 font-black italic uppercase tracking-[0.15em] text-[12px] gap-4 shadow-[0_20px_50px_-20px_rgba(var(--primary),0.5)] hover:shadow-[0_20px_50px_-10px_rgba(var(--primary),0.8)] transition-all active:scale-95 group relative overflow-hidden"
                            onClick={handleSave}
                            disabled={saving}
                        >
                            <div className="absolute inset-0 bg-gradient-to-r from-primary/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                            {saving ? <RefreshCcw className="h-5 w-5 animate-spin" /> : <Save className="h-5 w-5" />}
                            Commit Mutation
                        </Button>
                    </div>
                </div>
            </div>

            {error && (
                <div className="p-8 bg-red-500/10 border border-red-500/20 rounded-[40px] text-red-500 text-sm font-black flex items-center justify-between gap-6 animate-in slide-in-from-top-6 shadow-2xl shadow-red-500/5">
                    <div className="flex items-center gap-6">
                        <div className="p-4 bg-red-500/20 rounded-2xl shadow-inner">
                            <AlertCircle className="h-8 w-8" />
                        </div>
                        <div className="space-y-1">
                            <p className="uppercase tracking-[0.3em] text-[11px] opacity-60">Critical Integrity Breach</p>
                            <p className="italic text-lg text-red-600/90">{error}</p>
                        </div>
                    </div>
                    <Button variant="ghost" size="sm" onClick={fetchAll} className="rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-red-500/10 h-12 px-8 border border-red-500/20">
                        <RefreshCcw className="h-4 w-4 mr-3" /> Recover Buffer
                    </Button>
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-12">
                {/* Editor Module */}
                <div className="lg:col-span-3">
                    {activeTab === 'visual' ? <VisualEditor /> : <RawEditor />}
                </div>

                {/* Sidebar Info */}
                <div className="hidden lg:flex flex-col gap-10">
                    <Card className="border-none shadow-2xl bg-primary/5 rounded-[50px] p-10 border border-primary/10 relative overflow-hidden backdrop-blur-xl">
                        <div className="absolute -top-10 -right-10 w-48 h-48 bg-primary/10 rounded-full blur-[80px]" />
                        <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-blue-500/5 rounded-full blur-[60px]" />

                        <h3 className="text-[11px] font-black uppercase tracking-[0.4em] text-primary mb-8 flex items-center gap-4">
                            <ShieldCheck className="h-5 w-5" /> Enforcement
                        </h3>
                        <p className="text-[11px] font-bold text-slate-500/80 leading-relaxed italic mb-10 border-l-4 border-primary/30 pl-6 py-2">
                            Every mutation is validated against the <span className="text-foreground underline decoration-primary/20 decoration-2 underline-offset-4">Draft 2020-12</span> JSON architecture protocol for strict integrity.
                        </p>
                        <div className="space-y-6">
                            <div className="flex items-center gap-5 p-5 bg-card/60 rounded-[30px] border border-white/10 shadow-sm group hover:border-primary/40 transition-all cursor-default hover:shadow-xl hover:shadow-primary/5">
                                <div className="w-12 h-12 rounded-[18px] bg-orange-500/10 flex items-center justify-center text-orange-600 group-hover:scale-110 transition-transform shadow-inner">
                                    <TableIcon className="h-6 w-6" />
                                </div>
                                <div className="space-y-0.5">
                                    <p className="text-[12px] font-black uppercase leading-none tabular-nums text-foreground">{data?.tables?.length || 0} Entities</p>
                                    <p className="text-[9px] text-muted-foreground uppercase tracking-widest font-bold">Graph Nodes</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-5 p-5 bg-card/60 rounded-[30px] border border-white/10 shadow-sm group hover:border-blue-500/40 transition-all cursor-default hover:shadow-xl hover:shadow-blue-500/5">
                                <div className="w-12 h-12 rounded-[18px] bg-blue-500/10 flex items-center justify-center text-blue-600 group-hover:scale-110 transition-transform shadow-inner">
                                    <Link2 className="h-6 w-6" />
                                </div>
                                <div className="space-y-0.5">
                                    <p className="text-[12px] font-black uppercase leading-none tabular-nums font-mono text-foreground">{data?.relations?.length || 0} Links</p>
                                    <p className="text-[9px] text-muted-foreground uppercase tracking-widest font-bold">Edge Topology</p>
                                </div>
                            </div>
                        </div>
                    </Card>

                    <Card className="border-none shadow-2xl bg-card rounded-[50px] p-10 border border-white/5 flex flex-col gap-8">
                        <div className="flex items-center justify-between">
                            <h3 className="text-[11px] font-black uppercase tracking-[0.3em] text-muted-foreground/40 flex items-center gap-4">
                                <ListFilter className="h-5 w-5 opacity-50" /> Context Map
                            </h3>
                            <Badge variant="outline" className="text-[10px] tabular-nums px-3 py-1 rounded-full bg-muted/50 border-white/10">v.1.2.4</Badge>
                        </div>
                        <ScrollArea className="h-[440px] pr-4 -mr-4">
                            <div className="space-y-2 p-1">
                                <p className="text-[10px] font-black text-primary uppercase mb-4 pl-3 tracking-[0.2em] italic border-l-2 border-primary">Core Entities</p>
                                {(data?.tables || []).map((table: any, i: number) => (
                                    <div key={i} className="flex items-center gap-4 py-4 px-5 rounded-[22px] hover:bg-muted cursor-pointer transition-all group border border-transparent hover:border-white/10 shadow-sm hover:shadow-md">
                                        <div className="w-10 h-10 rounded-[14px] bg-muted/80 flex items-center justify-center group-hover:bg-primary/15 transition-colors shadow-inner">
                                            <Database className="h-4.5 w-4.5 text-muted-foreground/30 group-hover:text-primary transition-colors" />
                                        </div>
                                        <div className="flex flex-col min-w-0">
                                            <span className="text-[12px] font-black text-foreground/80 truncate uppercase tracking-tight">{table.name}</span>
                                            <span className="text-[8px] font-bold text-muted-foreground/40 uppercase tracking-widest">{table.columns?.length || 0} Attr</span>
                                        </div>
                                        <ChevronRight className="h-4 w-4 ml-auto opacity-0 group-hover:opacity-100 transition-all translate-x-2 group-hover:translate-x-0 text-primary" />
                                    </div>
                                ))}
                                {(!data?.tables || data.tables.length === 0) && (
                                    <div className="p-10 text-center border-2 border-dashed border-white/5 rounded-[30px] my-6">
                                        <p className="text-[10px] italic text-muted-foreground/30 font-black uppercase tracking-[0.4em]">Scope Void</p>
                                    </div>
                                )}
                            </div>
                        </ScrollArea>

                        <Separator className="opacity-30" />

                        <div className="grid grid-cols-2 gap-4">
                            <Button variant="ghost" className="rounded-[20px] text-[10px] font-black uppercase tracking-[0.2em] h-14 hover:bg-primary/10 hover:text-primary transition-all group border border-white/5 bg-muted/20">
                                <RefreshCcw className="h-4 w-4 mr-2 group-hover:rotate-180 transition-transform duration-1000" />
                                Reset
                            </Button>
                            <Button variant="ghost" className="rounded-[20px] text-[10px] font-black uppercase tracking-[0.2em] h-14 text-red-500/60 hover:text-red-500 hover:bg-red-500/10 transition-all group border border-white/5 bg-muted/20">
                                <Trash2 className="h-4 w-4 mr-2 group-hover:scale-110 transition-transform" />
                                Wipe
                            </Button>
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default PublishedSchemaEditor;
