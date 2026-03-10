import React from 'react';
import { Box, Typography, Paper, Breadcrumbs, Link, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Chip } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import { Computer as ServerIcon } from '@mui/icons-material';

const MSSQLProjects: React.FC = () => {
    const servers = [
        { id: 'SQL-PROD-01', name: 'Primary SQL Farm', version: '2022', databases: 12, status: 'Online' },
        { id: 'SQL-DEV-02', name: 'Sandbox Instances', version: '2019', databases: 5, status: 'Online' },
        { id: 'SQL-AZURE-01', name: 'Azure SQL Elastic', version: 'v12', databases: 1, status: 'Offline' }
    ];

    return (
        <Box sx={{ p: 1 }}>
            <Breadcrumbs aria-label="breadcrumb" sx={{ mb: 2 }}>
                <Link component={RouterLink} color="inherit" to="/">Registry</Link>
                <Link component={RouterLink} color="inherit" to="/ingestion">Ingestion</Link>
                <Typography color="text.primary">MS SQL Projects</Typography>
            </Breadcrumbs>

            <Box sx={{ mb: 4, display: 'flex', alignItems: 'center', gap: 2 }}>
                <ServerIcon color="info" sx={{ fontSize: 40 }} />
                <Box>
                    <Typography variant="h4" sx={{ fontWeight: 700, mb: 0 }}>
                        MS SQL Projects
                    </Typography>
                    <Typography variant="body1" sx={{ color: 'text.secondary' }}>
                        Registered Microsoft SQL Server instances and Azure SQL endpoints.
                    </Typography>
                </Box>
            </Box>

            <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 2 }}>
                <Table>
                    <TableHead sx={{ bgcolor: 'action.hover' }}>
                        <TableRow>
                            <TableCell sx={{ fontWeight: 700 }}>Instance ID</TableCell>
                            <TableCell sx={{ fontWeight: 700 }}>Friendly Name</TableCell>
                            <TableCell sx={{ fontWeight: 700 }}>Version</TableCell>
                            <TableCell sx={{ fontWeight: 700 }} align="right">DBs</TableCell>
                            <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {servers.map((s) => (
                            <TableRow key={s.id} hover>
                                <TableCell sx={{ fontFamily: 'monospace' }}>{s.id}</TableCell>
                                <TableCell>{s.name}</TableCell>
                                <TableCell>{s.version}</TableCell>
                                <TableCell align="right">{s.databases}</TableCell>
                                <TableCell>
                                    <Chip
                                        label={s.status}
                                        size="small"
                                        color={s.status === 'Online' ? 'success' : 'error'}
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

export default MSSQLProjects;
