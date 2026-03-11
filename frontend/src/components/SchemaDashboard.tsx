import React, { useState, useEffect } from 'react';
import {
    Database as SchemaIcon,
    CheckCircle as ValidIcon,
    XCircle as MissingIcon,
    AlertTriangle as WarningIcon,
    Folder as PathIcon,
    ChevronDown as ExpandMoreIcon,
    ChevronUp as ExpandLessIcon,
    AlertCircle as ErrorIcon,
    Loader2
} from 'lucide-react';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from '@/components/ui/collapsible';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/components/ui/tooltip';

interface SchemaStats {
    tables: number;
    columns: number;
    indexes: number;
    constraints: number;
}

interface CollectionStats {
    count: number;
}

interface ValidationResult {
    valid: boolean;
    errors: string[];
}

interface SchemaItem {
    name: string;
    contentPath: string;
    dataPath: string;
    hasSchema: boolean;
    hasCollections: boolean;
    schemaStats?: SchemaStats;
    collectionStats?: CollectionStats;
    validation?: ValidationResult;
}

const Row: React.FC<{ schema: SchemaItem }> = ({ schema }) => {
    const [open, setOpen] = useState(false);

    return (
        <Collapsible
            open={open}
            onOpenChange={setOpen}
            asChild
        >
            <>
                <TableRow className="group">
                    <TableCell className="w-[50px]">
                        <CollapsibleTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                                {open ? <ExpandLessIcon className="h-4 w-4" /> : <ExpandMoreIcon className="h-4 w-4" />}
                            </Button>
                        </CollapsibleTrigger>
                    </TableCell>
                    <TableCell className="font-semibold capitalize">
                        {schema.name}
                    </TableCell>
                    <TableCell>
                        {schema.hasSchema ? (
                            <div className="flex items-center gap-2">
                                <Badge variant="secondary" className="bg-green-500/10 text-green-600 hover:bg-green-500/20 border-green-500/20 gap-1 px-2">
                                    <ValidIcon className="h-3 w-3" /> Available
                                </Badge>
                                {schema.validation && !schema.validation.valid && (
                                    <TooltipProvider>
                                        <Tooltip>
                                            <TooltipTrigger>
                                                <ErrorIcon className="h-4 w-4 text-destructive" />
                                            </TooltipTrigger>
                                            <TooltipContent>
                                                JSON Schema Validation Failed
                                            </TooltipContent>
                                        </Tooltip>
                                    </TooltipProvider>
                                )}
                            </div>
                        ) : (
                            <Badge variant="outline" className="text-destructive border-destructive/30 gap-1 px-2">
                                <MissingIcon className="h-3 w-3" /> Missing
                            </Badge>
                        )}
                    </TableCell>
                    <TableCell>
                        {schema.hasCollections ? (
                            <Badge variant="secondary" className="bg-green-500/10 text-green-600 hover:bg-green-500/20 border-green-500/20 gap-1 px-2">
                                <ValidIcon className="h-3 w-3" /> Available
                            </Badge>
                        ) : (
                            <Badge variant="outline" className="text-warning border-warning/30 gap-1 px-2">
                                <WarningIcon className="h-3 w-3 text-amber-500" /> Missing
                            </Badge>
                        )}
                    </TableCell>
                    <TableCell>
                        {schema.hasSchema && schema.validation?.valid ? (
                            <div className="flex items-center gap-1.5 text-sm text-green-600 font-medium">
                                <ValidIcon className="h-4 w-4" /> Fully Configured
                            </div>
                        ) : schema.hasSchema ? (
                            <div className="flex items-center gap-1.5 text-sm text-destructive font-medium">
                                <ErrorIcon className="h-4 w-4" /> Validation Failed
                            </div>
                        ) : (
                            <div className="text-sm text-amber-600 font-medium">
                                Incomplete Data
                            </div>
                        )}
                    </TableCell>
                </TableRow>
                <CollapsibleContent asChild>
                    <TableRow className="bg-muted/30">
                        <TableCell colSpan={5} className="p-0">
                            <div className="p-6 space-y-8">
                                <div className="space-y-3">
                                    <h4 className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                                        FILESYSTEM INTEGRATION
                                    </h4>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                                        <div className="space-y-1.5">
                                            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                                                <PathIcon className="h-3 w-3" /> Content Path
                                            </div>
                                            <code className="text-xs bg-muted px-2 py-1 rounded block truncate">
                                                {schema.contentPath}
                                            </code>
                                        </div>
                                        <div className="space-y-1.5">
                                            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                                                <PathIcon className="h-3 w-3" /> Data Path
                                            </div>
                                            <code className="text-xs bg-muted px-2 py-1 rounded block truncate">
                                                {schema.dataPath}
                                            </code>
                                        </div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                                    <div className="space-y-3">
                                        <h4 className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                                            SCHEMA STATISTICS
                                        </h4>
                                        {schema.schemaStats ? (
                                            <div className="flex gap-8">
                                                <div className="space-y-0.5">
                                                    <div className="text-2xl font-bold text-primary">{schema.schemaStats.tables}</div>
                                                    <div className="text-[10px] text-muted-foreground uppercase">Tables</div>
                                                </div>
                                                <div className="space-y-0.5">
                                                    <div className="text-2xl font-bold text-primary">{schema.schemaStats.columns}</div>
                                                    <div className="text-[10px] text-muted-foreground uppercase">Columns</div>
                                                </div>
                                                <div className="space-y-0.5">
                                                    <div className="text-2xl font-bold text-primary">{schema.schemaStats.indexes}</div>
                                                    <div className="text-[10px] text-muted-foreground uppercase">Indexes</div>
                                                </div>
                                            </div>
                                        ) : (
                                            <p className="text-sm text-muted-foreground italic">No schema data found</p>
                                        )}
                                    </div>

                                    <div className="space-y-3">
                                        <h4 className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                                            COLLECTION STATISTICS
                                        </h4>
                                        {schema.collectionStats ? (
                                            <div className="space-y-0.5">
                                                <div className="text-2xl font-bold text-secondary">{schema.collectionStats.count}</div>
                                                <div className="text-[10px] text-muted-foreground uppercase">Total Collections</div>
                                            </div>
                                        ) : (
                                            <p className="text-sm text-muted-foreground italic">No collections data found</p>
                                        )}
                                    </div>
                                </div>

                                {schema.validation && !schema.validation.valid && (
                                    <div className="space-y-3">
                                        <h4 className="text-[10px] font-bold text-destructive uppercase tracking-widest">
                                            VALIDATION ERRORS
                                        </h4>
                                        <div className="space-y-2">
                                            {schema.validation.errors.map((error, idx) => (
                                                <Alert key={idx} variant="destructive" className="py-2">
                                                    <ErrorIcon className="h-4 w-4" />
                                                    <AlertDescription className="text-xs">
                                                        {error}
                                                    </AlertDescription>
                                                </Alert>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </TableCell>
                    </TableRow>
                </CollapsibleContent>
            </>
        </Collapsible>
    );
};

const SchemaDashboard: React.FC = () => {
    const [schemas, setSchemas] = useState<SchemaItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        fetch('/api/site/schemas')
            .then(res => {
                if (!res.ok) throw new Error('Failed to fetch schema dashboard');
                return res.json();
            })
            .then(data => {
                setSchemas(data);
                setLoading(false);
            })
            .catch(err => {
                setError(err.message);
                setLoading(false);
            });
    }, []);

    if (loading) return (
        <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-sm text-muted-foreground">Analyzing schema health...</p>
        </div>
    );

    if (error) return (
        <div className="p-8 text-center">
            <Alert variant="destructive" className="max-w-md mx-auto">
                <ErrorIcon className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
            </Alert>
        </div>
    );

    return (
        <div className="space-y-8 max-w-6xl mx-auto">
            <div className="flex items-center gap-4">
                <div className="p-3 rounded-2xl bg-primary/10">
                    <SchemaIcon className="h-10 w-10 text-primary" />
                </div>
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Schema Integrity & Health</h1>
                    <p className="text-muted-foreground mt-1">
                        Validating JSON schema compliance and filesystem synchronization for data services
                    </p>
                </div>
            </div>

            <div className="rounded-xl border bg-card overflow-hidden">
                <Table>
                    <TableHeader className="bg-muted/50">
                        <TableRow>
                            <TableHead className="w-[50px]"></TableHead>
                            <TableHead className="font-bold">Schema Module</TableHead>
                            <TableHead className="font-bold">File Integrity</TableHead>
                            <TableHead className="font-bold">Data Collections</TableHead>
                            <TableHead className="font-bold">Validation Status</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {schemas.map((s) => (
                            <Row key={s.name} schema={s} />
                        ))}
                        {schemas.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={5} className="h-40 text-center text-muted-foreground italic">
                                    No recursive 'schema' folders found in content.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
};

export default SchemaDashboard;
