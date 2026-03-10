import React, { useState } from 'react';
import {
    Box, Typography, Paper, Breadcrumbs, Link, Table, TableBody, TableCell,
    TableContainer, TableHead, TableRow, Chip, Button, IconButton,
    Dialog, DialogTitle, DialogContent, DialogActions, TextField, Stack
} from '@mui/material';
import { Link as RouterLink, useLocation } from 'react-router-dom';
import {
    CloudQueue as GCPIcon,
    Delete as DeleteIcon,
    Add as AddIcon
} from '@mui/icons-material';

interface GCPConnection {
    id: string;
    name: string;
    description?: string;
    projectId: string;
    serviceAccount: string;
    status: 'Active' | 'Error' | 'Pending';
}

const GCPConnections: React.FC = () => {
    const location = useLocation();
    const isGCS = location.pathname.includes('/gcs');
    const isPlatform = location.pathname.includes('/platforms/');
    const platformType = location.pathname.split('/')[2];
    const platformLabels: Record<string, string> = { gcp: 'GCP', aws: 'AWS', gcve: 'GCVE', saas: 'SaaS' };
    const typeLabel = isPlatform ? (platformLabels[platformType] || 'Platform') : (isGCS ? 'Cloud Storage' : 'BigQuery');
    const parentPath = isPlatform ? `/platforms/${platformType}` : '/ingestion';
    const parentLabel = isPlatform ? (platformLabels[platformType] || 'Platform') : 'Ingestion';

    const [connections, setConnections] = useState<GCPConnection[]>([
        { id: '1', name: 'Marketing Data', description: 'Production GCP assets for analytics', projectId: 'bq-prod-123', serviceAccount: 'gcp-reader@prod.iam.gserviceaccount.com', status: 'Active' },
        { id: '2', name: 'Log Archive', description: 'Internal system logs storage', projectId: 'internal-logs', serviceAccount: 'log-collector@internal.iam.gserviceaccount.com', status: 'Active' },
        { id: '3', name: 'Test Lab', description: 'Development and testing playground', projectId: 'test-lab-321', serviceAccount: 'dev-user@test.iam.gserviceaccount.com', status: 'Error' }
    ]);

    const [open, setOpen] = useState(false);
    const [newConn, setNewConn] = useState({ name: '', description: '', projectId: '', serviceAccount: '' });

    const handleOpen = () => setOpen(true);
    const handleClose = () => {
        setOpen(false);
        setNewConn({ name: '', description: '', projectId: '', serviceAccount: '' });
    };

    const handleAdd = () => {
        const id = Math.random().toString(36).substr(2, 9);
        setConnections([...connections, {
            id,
            name: newConn.name || 'New Connection',
            description: newConn.description,
            projectId: newConn.projectId || 'project-id',
            serviceAccount: newConn.serviceAccount || 'service-account@iam.gserviceaccount.com',
            status: 'Active'
        }]);
        handleClose();
    };

    const handleDelete = (id: string) => {
        setConnections(connections.filter(c => c.id !== id));
    };

    return (
        <Box sx={{ p: 1 }}>
            <Breadcrumbs aria-label="breadcrumb" sx={{ mb: 2 }}>
                <Link component={RouterLink} color="inherit" to="/">Registry</Link>
                <Link component={RouterLink} color="inherit" to={parentPath}>{parentLabel}</Link>
                <Typography color="text.primary">Connections</Typography>
            </Breadcrumbs>

            <Box sx={{ mb: 4, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <GCPIcon color="primary" sx={{ fontSize: 40 }} />
                    <Box>
                        <Typography variant="h4" sx={{ fontWeight: 700, mb: 0 }}>
                            {typeLabel} Connections
                        </Typography>
                        <Typography variant="body1" sx={{ color: 'text.secondary' }}>
                            Manage shared Google Cloud service account connections.
                        </Typography>
                    </Box>
                </Box>
                <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={handleOpen}
                    sx={{ borderRadius: 2 }}
                >
                    Add Connection
                </Button>
            </Box>

            <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 2 }}>
                <Table>
                    <TableHead sx={{ bgcolor: 'action.hover' }}>
                        <TableRow>
                            <TableCell sx={{ fontWeight: 700 }}>Connection Details</TableCell>
                            <TableCell sx={{ fontWeight: 700 }}>Project ID</TableCell>
                            <TableCell sx={{ fontWeight: 700 }}>Service Account</TableCell>
                            <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
                            <TableCell sx={{ fontWeight: 700 }} align="right">Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {connections.map((conn) => (
                            <TableRow key={conn.id} hover>
                                <TableCell>
                                    <Typography variant="body2" sx={{ fontWeight: 600 }}>{conn.name}</Typography>
                                    {conn.description && (
                                        <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                                            {conn.description}
                                        </Typography>
                                    )}
                                </TableCell>
                                <TableCell sx={{ fontFamily: 'monospace' }}>{conn.projectId}</TableCell>
                                <TableCell>{conn.serviceAccount}</TableCell>
                                <TableCell>
                                    <Chip
                                        label={conn.status}
                                        size="small"
                                        color={conn.status === 'Active' ? 'success' : conn.status === 'Error' ? 'error' : 'default'}
                                        variant="outlined"
                                        sx={{ height: 20 }}
                                    />
                                </TableCell>
                                <TableCell align="right">
                                    <IconButton size="small" color="error" onClick={() => handleDelete(conn.id)}>
                                        <DeleteIcon fontSize="small" />
                                    </IconButton>
                                </TableCell>
                            </TableRow>
                        ))}
                        {connections.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={5} align="center" sx={{ py: 4 }}>
                                    <Typography color="text.secondary italic">No connections registered.</Typography>
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </TableContainer>

            <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
                <DialogTitle sx={{ fontWeight: 700 }}>Add GCP Connection</DialogTitle>
                <DialogContent>
                    <Stack spacing={3} sx={{ mt: 1 }}>
                        <TextField
                            label="Connection Name"
                            fullWidth
                            value={newConn.name}
                            onChange={(e) => setNewConn({ ...newConn, name: e.target.value })}
                        />
                        <TextField
                            label="Description"
                            fullWidth
                            multiline
                            rows={2}
                            placeholder="Optional description of this connection..."
                            value={newConn.description}
                            onChange={(e) => setNewConn({ ...newConn, description: e.target.value })}
                        />
                        <TextField
                            label="GCP Project ID"
                            fullWidth
                            value={newConn.projectId}
                            onChange={(e) => setNewConn({ ...newConn, projectId: e.target.value })}
                        />
                        <TextField
                            label="Service Account Email"
                            fullWidth
                            value={newConn.serviceAccount}
                            onChange={(e) => setNewConn({ ...newConn, serviceAccount: e.target.value })}
                        />
                        <TextField
                            label="JSON Key File"
                            type="file"
                            fullWidth
                            InputLabelProps={{ shrink: true }}
                        />
                    </Stack>
                </DialogContent>
                <DialogActions sx={{ p: 3 }}>
                    <Button onClick={handleClose} color="inherit">Cancel</Button>
                    <Button onClick={handleAdd} variant="contained">Save Connection</Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default GCPConnections;
