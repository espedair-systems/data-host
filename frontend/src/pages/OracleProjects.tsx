import React from 'react';
import { Box, Typography, Paper, Breadcrumbs, Link, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Chip } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import { Dns as InstanceIcon } from '@mui/icons-material';

const OracleProjects: React.FC = () => {
    // Placeholder data
    const instances = [
        { id: 'ORCL_PROD', name: 'Production ERP', host: 'db-prod-01.internal', port: 1521, status: 'Connected' },
        { id: 'ERP_TEST', name: 'ERP Staging', host: 'db-test-01.internal', port: 1521, status: 'Connected' },
        { id: 'HR_LEGACY', name: 'Legacy HR Sys', host: 'hr-legacy.internal', port: 1521, status: 'Disconnected' }
    ];

    return (
        <Box sx={{ p: 1 }}>
            <Breadcrumbs aria-label="breadcrumb" sx={{ mb: 2 }}>
                <Link component={RouterLink} color="inherit" to="/">Registry</Link>
                <Link component={RouterLink} color="inherit" to="/ingestion">Ingestion</Link>
                <Typography color="text.primary">Oracle Projects</Typography>
            </Breadcrumbs>

            <Box sx={{ mb: 4, display: 'flex', alignItems: 'center', gap: 2 }}>
                <InstanceIcon color="secondary" sx={{ fontSize: 40 }} />
                <Box>
                    <Typography variant="h4" sx={{ fontWeight: 700, mb: 0 }}>
                        Oracle Projects
                    </Typography>
                    <Typography variant="body1" sx={{ color: 'text.secondary' }}>
                        Connected Oracle Database instances and SIDs.
                    </Typography>
                </Box>
            </Box>

            <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 2 }}>
                <Table>
                    <TableHead sx={{ bgcolor: 'action.hover' }}>
                        <TableRow>
                            <TableCell sx={{ fontWeight: 700 }}>SID / ID</TableCell>
                            <TableCell sx={{ fontWeight: 700 }}>Connection Name</TableCell>
                            <TableCell sx={{ fontWeight: 700 }}>Host</TableCell>
                            <TableCell sx={{ fontWeight: 700 }} align="right">Port</TableCell>
                            <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {instances.map((db) => (
                            <TableRow key={db.id} hover>
                                <TableCell sx={{ fontFamily: 'monospace' }}>{db.id}</TableCell>
                                <TableCell>{db.name}</TableCell>
                                <TableCell>{db.host}</TableCell>
                                <TableCell align="right">{db.port}</TableCell>
                                <TableCell>
                                    <Chip
                                        label={db.status}
                                        size="small"
                                        color={db.status === 'Connected' ? 'success' : 'error'}
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

export default OracleProjects;
