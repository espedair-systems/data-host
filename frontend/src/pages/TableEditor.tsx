import React, { useState, useEffect } from 'react';
import {
    Typography, Paper, Box, Breadcrumbs, Link, Button, TextField,
    Grid, CircularProgress, Stack, IconButton, Card, CardContent
} from '@mui/material';
import { Link as RouterLink, useSearchParams, useNavigate } from 'react-router-dom';
import {
    Save as SaveIcon,
    ArrowBack as BackIcon,
    Delete as DeleteIcon,
    Add as AddIcon
} from '@mui/icons-material';

const TableEditor: React.FC = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const moduleName = searchParams.get('module');
    const tableName = searchParams.get('table');

    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [editedTable, setEditedTable] = useState<any>(null);

    useEffect(() => {
        if (moduleName) {
            setLoading(true);
            fetch('/api/site/schemas')
                .then(res => res.json())
                .then(data => {
                    const module = data.find((s: any) => s.name === moduleName);
                    if (module) {
                        const table = module?.schemaStats?.tableDetail?.find((t: any) => t.name === tableName);
                        if (table) {
                            setEditedTable(JSON.parse(JSON.stringify(table))); // Deep clone for editing
                        }
                    }
                    setLoading(false);
                })
                .catch(() => setLoading(false));
        }
    }, [moduleName, tableName]);

    const handleSave = async () => {
        if (!moduleName || !tableName || !editedTable) return;

        setSaving(true);
        try {
            const response = await fetch(`/api/site/schemas/${moduleName}/table`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    tableName: editedTable.name,
                    type: editedTable.type,
                    description: editedTable.description,
                    columns: editedTable.columns
                })
            });

            if (response.ok) {
                navigate(-1); // Go back on success
            } else {
                console.error('Failed to save table');
            }
        } catch (error) {
            console.error('Error saving table:', error);
        } finally {
            setSaving(false);
        }
    };

    const updateColumn = (index: number, field: string, value: string) => {
        if (!editedTable) return;
        const newCols = [...editedTable.columns];
        newCols[index] = { ...newCols[index], [field]: value };
        setEditedTable({ ...editedTable, columns: newCols });
    };

    if (loading) return (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 8 }}>
            <CircularProgress />
        </Box>
    );

    if (!editedTable) return (
        <Box sx={{ p: 4 }}>
            <Typography variant="h6" color="error">Table not found</Typography>
            <Button startIcon={<BackIcon />} onClick={() => navigate(-1)}>Go Back</Button>
        </Box>
    );

    return (
        <Box>
            <Breadcrumbs aria-label="breadcrumb" sx={{ mb: 2 }}>
                <Link component={RouterLink} color="inherit" to="/">Registry</Link>
                <Link component={RouterLink} color="inherit" to="/schema">Schema</Link>
                <Link component={RouterLink} color="inherit" to={`/schema?details=data/schema/${moduleName}`}>{moduleName}</Link>
                <Typography color="text.primary">Edit {tableName}</Typography>
            </Breadcrumbs>

            <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                    <Typography variant="h4" sx={{ fontWeight: 700 }}>
                        Edit Table: {tableName}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        Module: {moduleName}
                    </Typography>
                </Box>
                <Stack direction="row" spacing={2}>
                    <Button variant="outlined" startIcon={<BackIcon />} onClick={() => navigate(-1)} disabled={saving}>
                        Cancel
                    </Button>
                    <Button
                        variant="contained"
                        startIcon={saving ? <CircularProgress size={20} color="inherit" /> : <SaveIcon />}
                        color="primary"
                        onClick={handleSave}
                        disabled={saving}
                    >
                        {saving ? 'Saving...' : 'Save Changes'}
                    </Button>
                </Stack>
            </Box>

            <Grid container spacing={3}>
                <Grid size={{ xs: 12 }}>
                    <Paper sx={{ p: 3, mb: 3 }}>
                        <Typography variant="h6" gutterBottom sx={{ fontWeight: 700 }}>
                            Table Metadata
                        </Typography>
                        <Stack spacing={3}>
                            <TextField
                                label="Table Name"
                                fullWidth
                                value={editedTable.name}
                                size="small"
                                disabled
                            />
                            <TextField
                                label="Table Type"
                                fullWidth
                                value={editedTable.type || 'BASE TABLE'}
                                size="small"
                                onChange={(e) => setEditedTable({ ...editedTable, type: e.target.value })}
                            />
                            <TextField
                                label="Description"
                                fullWidth
                                multiline
                                rows={3}
                                value={editedTable.description || ''}
                                size="small"
                                onChange={(e) => setEditedTable({ ...editedTable, description: e.target.value })}
                            />
                        </Stack>
                    </Paper>

                    <Paper sx={{ p: 3 }}>
                        <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Typography variant="h6" sx={{ fontWeight: 700 }}>
                                Columns ({editedTable.columns?.length || 0})
                            </Typography>
                            <Button startIcon={<AddIcon />} size="small" variant="outlined">
                                Add Column
                            </Button>
                        </Box>

                        <Stack spacing={2}>
                            {editedTable.columns?.map((col: any, idx: number) => (
                                <Card key={idx} variant="outlined">
                                    <CardContent sx={{ p: '16px !important' }}>
                                        <Grid container spacing={2} alignItems="center">
                                            <Grid size={{ xs: 4 }}>
                                                <TextField
                                                    label="Name"
                                                    fullWidth
                                                    size="small"
                                                    value={col.name}
                                                    onChange={(e) => updateColumn(idx, 'name', e.target.value)}
                                                />
                                            </Grid>
                                            <Grid size={{ xs: 3 }}>
                                                <TextField
                                                    label="Type"
                                                    fullWidth
                                                    size="small"
                                                    value={col.type}
                                                    onChange={(e) => updateColumn(idx, 'type', e.target.value)}
                                                />
                                            </Grid>
                                            <Grid size={{ xs: 4 }}>
                                                <TextField
                                                    label="Comment"
                                                    fullWidth
                                                    size="small"
                                                    value={col.description || ''}
                                                    onChange={(e) => updateColumn(idx, 'description', e.target.value)}
                                                />
                                            </Grid>
                                            <Grid size={{ xs: 1 }}>
                                                <IconButton color="error" size="small">
                                                    <DeleteIcon fontSize="small" />
                                                </IconButton>
                                            </Grid>
                                        </Grid>
                                    </CardContent>
                                </Card>
                            ))}
                        </Stack>
                    </Paper>
                </Grid>
            </Grid>
        </Box>
    );
};

export default TableEditor;
