import React, { useState, useEffect } from 'react';
import {
    Box,
    Typography,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Chip,
    CircularProgress,
    Tooltip,
    IconButton,
    Collapse,
    Stack,
    Alert
} from '@mui/material';
import {
    Storage as SchemaIcon,
    CheckCircle as ValidIcon,
    Cancel as MissingIcon,
    Warning as WarningIcon,
    FolderOpen as PathIcon,
    KeyboardArrowDown as ExpandMoreIcon,
    KeyboardArrowUp as ExpandLessIcon,
    ErrorOutline as ErrorIcon
} from '@mui/icons-material';

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
        <>
            <TableRow hover sx={{ '& > *': { borderBottom: 'unset' } }}>
                <TableCell width="50">
                    <IconButton size="small" onClick={() => setOpen(!open)}>
                        {open ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                    </IconButton>
                </TableCell>
                <TableCell>
                    <Typography variant="subtitle1" sx={{ fontWeight: 600, textTransform: 'capitalize' }}>
                        {schema.name}
                    </Typography>
                </TableCell>
                <TableCell>
                    {schema.hasSchema ? (
                        <Stack direction="row" spacing={1} alignItems="center">
                            <Chip size="small" icon={<ValidIcon />} label="Available" color="success" variant="outlined" />
                            {schema.validation && !schema.validation.valid && (
                                <Tooltip title="JSON Schema Validation Failed">
                                    <ErrorIcon color="error" fontSize="small" />
                                </Tooltip>
                            )}
                        </Stack>
                    ) : (
                        <Chip size="small" icon={<MissingIcon />} label="Missing" color="error" variant="outlined" />
                    )}
                </TableCell>
                <TableCell>
                    {schema.hasCollections ? (
                        <Chip size="small" icon={<ValidIcon />} label="Available" color="success" variant="outlined" />
                    ) : (
                        <Chip size="small" icon={<WarningIcon />} label="Missing" color="warning" variant="outlined" />
                    )}
                </TableCell>
                <TableCell>
                    {schema.hasSchema && schema.validation?.valid ? (
                        <Typography variant="body2" color="success.main" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                            <ValidIcon fontSize="inherit" /> Fully Configured
                        </Typography>
                    ) : schema.hasSchema ? (
                        <Typography variant="body2" color="error.main" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                            <ErrorIcon fontSize="inherit" /> Validation Failed
                        </Typography>
                    ) : (
                        <Typography variant="body2" color="warning.main">
                            Incomplete Data
                        </Typography>
                    )}
                </TableCell>
            </TableRow>
            <TableRow>
                <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={6}>
                    <Collapse in={open} timeout="auto" unmountOnExit>
                        <Box sx={{ margin: 2, p: 2, bgcolor: 'action.hover', borderRadius: 1 }}>
                            <Stack spacing={3}>
                                <Box>
                                    <Typography variant="h6" gutterBottom component="div" sx={{ fontWeight: 700, fontSize: '0.9rem', color: 'text.secondary' }}>
                                        FILESYSTEM INTEGRATION
                                    </Typography>
                                    <Stack direction="row" spacing={4}>
                                        <Box>
                                            <Typography variant="caption" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                                <PathIcon fontSize="inherit" /> Content Path
                                            </Typography>
                                            <Typography variant="body2" sx={{ fontFamily: 'monospace', mt: 0.5 }}>{schema.contentPath}</Typography>
                                        </Box>
                                        <Box>
                                            <Typography variant="caption" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                                <PathIcon fontSize="inherit" /> Data Path
                                            </Typography>
                                            <Typography variant="body2" sx={{ fontFamily: 'monospace', mt: 0.5 }}>{schema.dataPath}</Typography>
                                        </Box>
                                    </Stack>
                                </Box>

                                <Stack direction="row" spacing={8}>
                                    <Box>
                                        <Typography variant="h6" gutterBottom component="div" sx={{ fontWeight: 700, fontSize: '0.9rem', color: 'text.secondary' }}>
                                            SCHEMA STATISTICS
                                        </Typography>
                                        {schema.schemaStats ? (
                                            <Stack direction="row" spacing={2}>
                                                <Box>
                                                    <Typography variant="h4" color="primary">{schema.schemaStats.tables}</Typography>
                                                    <Typography variant="caption">Tables</Typography>
                                                </Box>
                                                <Box>
                                                    <Typography variant="h4" color="primary">{schema.schemaStats.columns}</Typography>
                                                    <Typography variant="caption">Columns</Typography>
                                                </Box>
                                                <Box>
                                                    <Typography variant="h4" color="primary">{schema.schemaStats.indexes}</Typography>
                                                    <Typography variant="caption">Indexes</Typography>
                                                </Box>
                                            </Stack>
                                        ) : (
                                            <Typography variant="body2" color="text.secondary italic">No schema data found</Typography>
                                        )}
                                    </Box>

                                    <Box>
                                        <Typography variant="h6" gutterBottom component="div" sx={{ fontWeight: 700, fontSize: '0.9rem', color: 'text.secondary' }}>
                                            COLLECTION STATISTICS
                                        </Typography>
                                        {schema.collectionStats ? (
                                            <Box>
                                                <Typography variant="h4" color="secondary">{schema.collectionStats.count}</Typography>
                                                <Typography variant="caption">Total Collections</Typography>
                                            </Box>
                                        ) : (
                                            <Typography variant="body2" color="text.secondary italic">No collections data found</Typography>
                                        )}
                                    </Box>
                                </Stack>

                                {schema.validation && !schema.validation.valid && (
                                    <Box>
                                        <Typography variant="h6" gutterBottom component="div" sx={{ fontWeight: 700, fontSize: '0.9rem', color: 'error.main' }}>
                                            VALIDATION ERRORS
                                        </Typography>
                                        <Stack spacing={1}>
                                            {schema.validation.errors.map((error, idx) => (
                                                <Alert key={idx} severity="error" variant="outlined" sx={{ py: 0 }}>
                                                    {error}
                                                </Alert>
                                            ))}
                                        </Stack>
                                    </Box>
                                )}
                            </Stack>
                        </Box>
                    </Collapse>
                </TableCell>
            </TableRow>
        </>
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
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 8 }}>
            <CircularProgress />
        </Box>
    );

    if (error) return (
        <Box sx={{ p: 4, textAlign: 'center' }}>
            <Typography color="error">Error: {error}</Typography>
        </Box>
    );

    return (
        <Box sx={{ p: 4 }}>
            <Box sx={{ mb: 4, display: 'flex', alignItems: 'center', gap: 2 }}>
                <SchemaIcon color="primary" sx={{ fontSize: 40 }} />
                <Box>
                    <Typography variant="h4" sx={{ fontWeight: 700 }}>Schema Integrity & Health</Typography>
                    <Typography variant="body1" color="text.secondary">
                        Validating JSON schema compliance and filesystem synchronization for data services
                    </Typography>
                </Box>
            </Box>

            <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 2 }}>
                <Table>
                    <TableHead sx={{ bgcolor: 'action.hover' }}>
                        <TableRow>
                            <TableCell />
                            <TableCell sx={{ fontWeight: 700 }}>Schema Module</TableCell>
                            <TableCell sx={{ fontWeight: 700 }}>File Integrity</TableCell>
                            <TableCell sx={{ fontWeight: 700 }}>Data Collections</TableCell>
                            <TableCell sx={{ fontWeight: 700 }}>Validation Status</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {schemas.map((s) => (
                            <Row key={s.name} schema={s} />
                        ))}
                        {schemas.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={5} align="center" sx={{ py: 8 }}>
                                    <Typography color="text.secondary">No recursive 'schema' folders found in content.</Typography>
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </TableContainer>
        </Box>
    );
};

export default SchemaDashboard;
