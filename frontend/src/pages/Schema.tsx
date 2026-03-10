import React, { useState, useEffect } from 'react';
import {
    Typography, Paper, Box, Breadcrumbs, Link, Chip, Divider, Grid, CircularProgress,
    Accordion, AccordionSummary, AccordionDetails, Stack, Button
} from '@mui/material';
import { Link as RouterLink, useSearchParams, useNavigate } from 'react-router-dom';
import {
    ExpandMore as ExpandMoreIcon,
    Storage as SchemaIcon,
    TableChart as TableIcon,
    Edit as EditIcon
} from '@mui/icons-material';

const Schema: React.FC = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const detailsPath = searchParams.get('details');
    const [schemas, setSchemas] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [selectedCollectionId, setSelectedCollectionId] = useState<string | null>(null);

    useEffect(() => {
        setLoading(true);
        fetch('/api/site/schemas')
            .then(res => res.json())
            .then(data => {
                setSchemas(data);
                setLoading(false);
            })
            .catch(() => setLoading(false));
    }, []);

    const selectedModule = schemas.find((s: any) => {
        const name = detailsPath?.split('/').pop();
        return s.name === name;
    });

    const activeCollection = selectedModule?.collections?.find((c: any) => c.id === selectedCollectionId);

    const filteredTables = selectedModule?.schemaStats?.tableDetail?.filter((table: any) => {
        if (!selectedCollectionId) return true;
        return activeCollection?.tables?.includes(table.name);
    }) || [];

    if (detailsPath) {
        if (loading) return (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 8 }}>
                <CircularProgress />
            </Box>
        );

        return (
            <Box>
                <Breadcrumbs aria-label="breadcrumb" sx={{ mb: 2 }}>
                    <Link component={RouterLink} color="inherit" to="/">
                        Registry
                    </Link>
                    <Link component={RouterLink} color="inherit" to="/schema">
                        Schema
                    </Link>
                    <Typography color="text.primary" sx={{ textTransform: 'capitalize' }}>
                        {detailsPath.split('/').pop()}
                    </Typography>
                </Breadcrumbs>

                <Box sx={{ mb: 4, display: 'flex', alignItems: 'center', gap: 2 }}>
                    <SchemaIcon color="primary" sx={{ fontSize: 40 }} />
                    <Box>
                        <Typography variant="h4" sx={{ fontWeight: 700, textTransform: 'capitalize' }}>
                            {detailsPath.split('/').pop()} Data Model
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            Namespace: {detailsPath}
                        </Typography>
                    </Box>
                </Box>

                {/* Collections Filter */}
                {selectedModule?.collections && selectedModule.collections.length > 0 && (
                    <Box sx={{ mb: 4 }}>
                        <Typography variant="subtitle2" color="text.secondary" gutterBottom sx={{ fontWeight: 700 }}>
                            COLLECTIONS
                        </Typography>
                        <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', gap: 1 }}>
                            <Chip
                                label="All Entities"
                                onClick={() => setSelectedCollectionId(null)}
                                color={selectedCollectionId === null ? "primary" : "default"}
                                variant={selectedCollectionId === null ? "filled" : "outlined"}
                                size="small"
                                sx={{ borderRadius: 1 }}
                            />
                            {selectedModule.collections.map((c: any) => (
                                <Chip
                                    key={c.id}
                                    label={`${c.emoji} ${c.title} `}
                                    onClick={() => setSelectedCollectionId(c.id)}
                                    color={selectedCollectionId === c.id ? "primary" : "default"}
                                    variant={selectedCollectionId === c.id ? "filled" : "outlined"}
                                    size="small"
                                    sx={{ borderRadius: 1 }}
                                />
                            ))}
                        </Stack>
                        {activeCollection && (
                            <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                                {activeCollection.description}
                            </Typography>
                        )}
                    </Box>
                )}

                <Box sx={{ mb: 2 }}>
                    <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1, fontWeight: 700 }}>
                        <TableIcon color="action" /> {selectedCollectionId ? activeCollection?.title : 'Model Entities'} ({filteredTables.length})
                    </Typography>
                    <Divider sx={{ mb: 2 }} />
                </Box>

                <Box>
                    {filteredTables.length > 0 ? (
                        filteredTables.map((table: any) => (
                            <Accordion key={table.name} variant="outlined" sx={{ mb: 1, borderRadius: '8px !important', '&:before': { display: 'none' } }}>
                                <AccordionSummary
                                    expandIcon={<ExpandMoreIcon />}
                                    sx={{ '& .MuiAccordionSummary-content': { alignItems: 'center', justifyContent: 'space-between' } }}
                                >
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                        <TableIcon fontSize="small" color="primary" />
                                        <Typography sx={{ fontWeight: 600 }}>{table.name}</Typography>
                                        <Chip size="small" label="Table" variant="outlined" sx={{ ml: 1 }} />
                                    </Box>
                                    <Button
                                        size="small"
                                        startIcon={<EditIcon sx={{ fontSize: 16 }} />}
                                        variant="text"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            navigate(`/schema/edit?module=${selectedModule.name}&table=${table.name}`);
                                        }}
                                        sx={{ mr: 2, textTransform: 'none', fontWeight: 600 }}
                                    >
                                        Edit Table
                                    </Button>
                                </AccordionSummary>
                                <AccordionDetails sx={{ bgcolor: 'action.hover', borderTop: '1px solid', borderColor: 'divider', p: 0 }}>
                                    <Box sx={{ p: 2, bgcolor: 'background.paper', borderBottom: '1px solid', borderColor: 'divider' }}>
                                        <Grid container spacing={2}>
                                            <Grid size={{ xs: 12, sm: 4 }}>
                                                <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700, display: 'block' }}>
                                                    TABLE TYPE
                                                </Typography>
                                                <Typography variant="body2">{table.type || 'Standard'}</Typography>
                                            </Grid>
                                            {table.description && (
                                                <Grid size={{ xs: 12, sm: 8 }}>
                                                    <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700, display: 'block' }}>
                                                        DESCRIPTION
                                                    </Typography>
                                                    <Typography variant="body2">{table.description}</Typography>
                                                </Grid>
                                            )}
                                        </Grid>
                                    </Box>
                                    <Box sx={{ p: 2 }}>
                                        <Typography variant="overline" sx={{ fontWeight: 700, color: 'text.secondary', mb: 1, display: 'block' }}>
                                            Columns ({table.columns?.length || 0})
                                        </Typography>
                                        <Grid container spacing={0} sx={{ borderLeft: '1px solid', borderTop: '1px solid', borderColor: 'divider' }}>
                                            {/* Header */}
                                            <Grid size={{ xs: 3 }} sx={{ p: 1, bgcolor: 'action.hover', borderRight: '1px solid', borderBottom: '1px solid', borderColor: 'divider' }}>
                                                <Typography variant="caption" sx={{ fontWeight: 700 }}>NAME</Typography>
                                            </Grid>
                                            <Grid size={{ xs: 3 }} sx={{ p: 1, bgcolor: 'action.hover', borderRight: '1px solid', borderBottom: '1px solid', borderColor: 'divider' }}>
                                                <Typography variant="caption" sx={{ fontWeight: 700 }}>TYPE</Typography>
                                            </Grid>
                                            <Grid size={{ xs: 6 }} sx={{ p: 1, bgcolor: 'action.hover', borderRight: '1px solid', borderBottom: '1px solid', borderColor: 'divider' }}>
                                                <Typography variant="caption" sx={{ fontWeight: 700 }}>DESCRIPTION</Typography>
                                            </Grid>

                                            {/* Rows */}
                                            {table.columns?.map((col: any) => (
                                                <React.Fragment key={col.name}>
                                                    <Grid size={{ xs: 3 }} sx={{ p: 1, borderRight: '1px solid', borderBottom: '1px solid', borderColor: 'divider' }}>
                                                        <Typography variant="body2" sx={{ fontFamily: 'monospace', fontWeight: 600 }}>{col.name}</Typography>
                                                    </Grid>
                                                    <Grid size={{ xs: 3 }} sx={{ p: 1, borderRight: '1px solid', borderBottom: '1px solid', borderColor: 'divider' }}>
                                                        <Chip
                                                            size="small"
                                                            label={col.type}
                                                            sx={{
                                                                height: 20,
                                                                fontSize: '0.65rem',
                                                                fontFamily: 'monospace',
                                                                bgcolor: 'action.selected'
                                                            }}
                                                        />
                                                    </Grid>
                                                    <Grid size={{ xs: 6 }} sx={{ p: 1, borderRight: '1px solid', borderBottom: '1px solid', borderColor: 'divider' }}>
                                                        <Typography variant="caption" color="text.secondary">
                                                            {col.description || '--'}
                                                        </Typography>
                                                    </Grid>
                                                </React.Fragment>
                                            ))}
                                        </Grid>
                                    </Box>
                                </AccordionDetails>
                            </Accordion>
                        ))
                    ) : (
                        <Paper sx={{ p: 4, textAlign: 'center', bgcolor: 'action.hover', border: '1px dashed', borderColor: 'divider' }}>
                            <Typography color="text.secondary">No table definitions found in this module {selectedCollectionId ? 'for this collection' : ''}.</Typography>
                        </Paper>
                    )}
                </Box>
            </Box>
        );
    }

    return (
        <Box>
            <Breadcrumbs aria-label="breadcrumb" sx={{ mb: 2 }}>
                <Link component={RouterLink} color="inherit" to="/">
                    Registry
                </Link>
                <Typography color="text.primary">Schema</Typography>
            </Breadcrumbs>

            <Typography variant="h4" gutterBottom sx={{ fontWeight: 700 }}>
                Data Model Registry
            </Typography>

            <Paper sx={{ p: 4, textAlign: 'center', bgcolor: 'action.hover', border: '1px dashed', borderColor: 'divider' }}>
                <SchemaIcon sx={{ fontSize: 60, color: 'text.disabled', mb: 2 }} />
                <Typography variant="h6" color="text.secondary">
                    Select a module from the Data Schema Tree to explore its domain entities, data relationships, and business logic.
                </Typography>
            </Paper>
        </Box>
    );
};

export default Schema;
