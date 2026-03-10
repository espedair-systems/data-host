import React, { useState } from 'react';
import {
    Box, Typography, Paper, Breadcrumbs, Link, Table, TableBody, TableCell,
    TableContainer, TableHead, TableRow, Chip, Button, IconButton,
    Dialog, DialogTitle, DialogContent, DialogActions, TextField, Stack
} from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import {
    Storage as PostgresIcon,
    Delete as DeleteIcon,
    Add as AddIcon
} from '@mui/icons-material';

interface PostgresConnection {
    id: string;
    name: string;
    description?: string;
    host: string;
    database: string;
    status: 'Connected' | 'Error' | 'Pending';
}

const PostgresConnections: React.FC = () => {
    const [connections, setConnections] = useState<PostgresConnection[]>([
        { id: '1', name: 'Analytics Prod', description: 'Primary data warehouse for production analytics', host: 'pg-dw.internal', database: 'analytics_dw', status: 'Connected' },
        { id: '2', name: 'Users Service', description: 'User profile and authentication database', host: 'pg-auth.internal', database: 'users_service', status: 'Connected' },
        { id: '3', name: 'Staging Env', description: 'Testing environment for order fulfillment', host: 'localhost', database: 'order_service', status: 'Error' }
    ]);

    const [open, setOpen] = useState(false);
    const [newConn, setNewConn] = useState({ name: '', description: '', host: '', database: '', user: '', password: '' });

    const handleOpen = () => setOpen(true);
    const handleClose = () => {
        setOpen(false);
        setNewConn({ name: '', description: '', host: '', database: '', user: '', password: '' });
    };

    const handleAdd = () => {
        const id = Math.random().toString(36).substr(2, 9);
        setConnections([...connections, {
            id,
            name: newConn.name || 'New Connection',
            description: newConn.description,
            host: newConn.host || 'localhost',
            database: newConn.database || 'postgres',
            status: 'Connected'
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
                <Link component={RouterLink} color="inherit" to="/ingestion">Ingestion</Link>
                <Typography color="text.primary">Postgres Connections</Typography>
            </Breadcrumbs>

            <Box sx={{ mb: 4, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <PostgresIcon color="primary" sx={{ fontSize: 40 }} />
                    <Box>
                        <Typography variant="h4" sx={{ fontWeight: 700, mb: 0 }}>
                            Postgres Connections
                        </Typography>
                        <Typography variant="body1" sx={{ color: 'text.secondary' }}>
                            Manage your PostgreSQL database connection endpoints.
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
                            <TableCell sx={{ fontWeight: 700 }}>Host</TableCell>
                            <TableCell sx={{ fontWeight: 700 }}>Database</TableCell>
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
                                <TableCell sx={{ fontFamily: 'monospace' }}>{conn.host}</TableCell>
                                <TableCell>{conn.database}</TableCell>
                                <TableCell>
                                    <Chip
                                        label={conn.status}
                                        size="small"
                                        color={conn.status === 'Connected' ? 'success' : conn.status === 'Error' ? 'error' : 'default'}
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
                <DialogTitle sx={{ fontWeight: 700 }}>Add Postgres Connection</DialogTitle>
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
                        <Stack direction="row" spacing={2}>
                            <TextField
                                label="Host"
                                fullWidth
                                value={newConn.host}
                                onChange={(e) => setNewConn({ ...newConn, host: e.target.value })}
                            />
                            <TextField label="Port" defaultValue="5432" sx={{ width: 120 }} />
                        </Stack>
                        <TextField
                            label="Database"
                            fullWidth
                            value={newConn.database}
                            onChange={(e) => setNewConn({ ...newConn, database: e.target.value })}
                        />
                        <Stack direction="row" spacing={2}>
                            <TextField label="Username" fullWidth />
                            <TextField label="Password" type="password" fullWidth />
                        </Stack>
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

export default PostgresConnections;
