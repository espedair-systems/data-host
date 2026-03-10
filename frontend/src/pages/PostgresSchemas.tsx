import React from 'react';
import { Box, Typography, Paper, Breadcrumbs, Link, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Chip } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import { Layers as SchemaIcon } from '@mui/icons-material';

const PostgresSchemas: React.FC = () => {
    // Placeholder data showing schemas and their connections
    const schemas = [
        { name: 'public', connection: 'Analytics Prod', host: 'pg-dw.internal', tables: 84, status: 'Synced' },
        { name: 'auth', connection: 'Users Service', host: 'pg-auth.internal', tables: 12, status: 'Synced' },
        { name: 'inventory', connection: 'Analytics Prod', host: 'pg-dw.internal', tables: 45, status: 'Pending' },
        { name: 'staging', connection: 'Staging Env', host: 'localhost', tables: 21, status: 'Error' }
    ];

    return (
        <Box sx={{ p: 1 }}>
            <Breadcrumbs aria-label="breadcrumb" sx={{ mb: 2 }}>
                <Link component={RouterLink} color="inherit" to="/">Registry</Link>
                <Link component={RouterLink} color="inherit" to="/ingestion">Ingestion</Link>
                <Typography color="text.primary">Postgres Schemas</Typography>
            </Breadcrumbs>

            <Box sx={{ mb: 4, display: 'flex', alignItems: 'center', gap: 2 }}>
                <SchemaIcon color="primary" sx={{ fontSize: 40 }} />
                <Box>
                    <Typography variant="h4" sx={{ fontWeight: 700, mb: 0 }}>
                        Postgres Schemas
                    </Typography>
                    <Typography variant="body1" sx={{ color: 'text.secondary' }}>
                        List of discovered available schemas across registered connections.
                    </Typography>
                </Box>
            </Box>

            <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 2 }}>
                <Table>
                    <TableHead sx={{ bgcolor: 'action.hover' }}>
                        <TableRow>
                            <TableCell sx={{ fontWeight: 700 }}>Schema Name</TableCell>
                            <TableCell sx={{ fontWeight: 700 }}>Connection</TableCell>
                            <TableCell sx={{ fontWeight: 700 }}>Host</TableCell>
                            <TableCell sx={{ fontWeight: 700 }} align="right">Tables</TableCell>
                            <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {schemas.map((s, index) => (
                            <TableRow key={index} hover>
                                <TableCell sx={{ fontWeight: 600 }}>{s.name}</TableCell>
                                <TableCell>{s.connection}</TableCell>
                                <TableCell sx={{ fontFamily: 'monospace', fontSize: '0.875rem' }}>{s.host}</TableCell>
                                <TableCell align="right">{s.tables}</TableCell>
                                <TableCell>
                                    <Chip
                                        label={s.status}
                                        size="small"
                                        color={s.status === 'Synced' ? 'success' : s.status === 'Error' ? 'error' : 'warning'}
                                        variant="outlined"
                                        sx={{ height: 20 }}
                                    />
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
        </Box>
    );
};

export default PostgresSchemas;
