import React from 'react';
import { Box, Typography, Paper, Breadcrumbs, Link, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Chip } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import { Speed as PerformanceIcon } from '@mui/icons-material';

const MySQLProjects: React.FC = () => {
    const servers = [
        { id: 'mysql-prod-01', name: 'Web Store Backend', host: 'mysql-01.aws.com', storage: '45 GB', status: 'Healthy' },
        { id: 'mariadb-staging', name: 'Dev Staging', host: 'maria-db.local', storage: '12 GB', status: 'Healthy' },
        { id: 'mysql-legacy', name: 'Old Inventory', host: 'legacy-sql.internal', storage: '8 GB', status: 'Maintenance' }
    ];

    return (
        <Box sx={{ p: 1 }}>
            <Breadcrumbs aria-label="breadcrumb" sx={{ mb: 2 }}>
                <Link component={RouterLink} color="inherit" to="/">Registry</Link>
                <Link component={RouterLink} color="inherit" to="/ingestion">Ingestion</Link>
                <Typography color="text.primary">MySQL Projects</Typography>
            </Breadcrumbs>

            <Box sx={{ mb: 4, display: 'flex', alignItems: 'center', gap: 2 }}>
                <PerformanceIcon sx={{ fontSize: 40, color: '#00758F' }} />
                <Box>
                    <Typography variant="h4" sx={{ fontWeight: 700, mb: 0 }}>
                        MySQL Projects
                    </Typography>
                    <Typography variant="body1" sx={{ color: 'text.secondary' }}>
                        Managed MySQL and MariaDB database deployments.
                    </Typography>
                </Box>
            </Box>

            <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 2 }}>
                <Table>
                    <TableHead sx={{ bgcolor: 'action.hover' }}>
                        <TableRow>
                            <TableCell sx={{ fontWeight: 700 }}>Host ID</TableCell>
                            <TableCell sx={{ fontWeight: 700 }}>Project Name</TableCell>
                            <TableCell sx={{ fontWeight: 700 }}>Endpoint</TableCell>
                            <TableCell sx={{ fontWeight: 700 }} align="right">Meta Size</TableCell>
                            <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {servers.map((s) => (
                            <TableRow key={s.id} hover>
                                <TableCell sx={{ fontFamily: 'monospace' }}>{s.id}</TableCell>
                                <TableCell>{s.name}</TableCell>
                                <TableCell>{s.host}</TableCell>
                                <TableCell align="right">{s.storage}</TableCell>
                                <TableCell>
                                    <Chip
                                        label={s.status}
                                        size="small"
                                        color={s.status === 'Healthy' ? 'success' : 'warning'}
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

export default MySQLProjects;
