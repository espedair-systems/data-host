import React from 'react';
import { Box, Typography, Paper, Breadcrumbs, Link, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Chip } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import { AccountTree as TreeIcon } from '@mui/icons-material';

const MongoProjects: React.FC = () => {
    const clusters = [
        { id: 'Atlas-Prod-X', name: 'User Data Cluster', version: '6.0.4', collections: 112, status: 'Active' },
        { id: 'Local-Dev', name: 'Integration Test Env', version: '7.0.1', collections: 24, status: 'Active' },
        { id: 'Archives-S3', name: 'Archived Metadata', version: 'N/A', collections: 450, status: 'Standby' }
    ];

    return (
        <Box sx={{ p: 1 }}>
            <Breadcrumbs aria-label="breadcrumb" sx={{ mb: 2 }}>
                <Link component={RouterLink} color="inherit" to="/">Registry</Link>
                <Link component={RouterLink} color="inherit" to="/ingestion">Ingestion</Link>
                <Typography color="text.primary">MongoDB Projects</Typography>
            </Breadcrumbs>

            <Box sx={{ mb: 4, display: 'flex', alignItems: 'center', gap: 2 }}>
                <TreeIcon sx={{ fontSize: 40, color: '#47A248' }} />
                <Box>
                    <Typography variant="h4" sx={{ fontWeight: 700, mb: 0 }}>
                        MongoDB Projects
                    </Typography>
                    <Typography variant="body1" sx={{ color: 'text.secondary' }}>
                        Connected MongoDB clusters and inferenced collection groups.
                    </Typography>
                </Box>
            </Box>

            <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 2 }}>
                <Table>
                    <TableHead sx={{ bgcolor: 'action.hover' }}>
                        <TableRow>
                            <TableCell sx={{ fontWeight: 700 }}>Cluster ID</TableCell>
                            <TableCell sx={{ fontWeight: 700 }}>Deployment Name</TableCell>
                            <TableCell sx={{ fontWeight: 700 }}>Version</TableCell>
                            <TableCell sx={{ fontWeight: 700 }} align="right">Collections</TableCell>
                            <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {clusters.map((c) => (
                            <TableRow key={c.id} hover>
                                <TableCell sx={{ fontFamily: 'monospace' }}>{c.id}</TableCell>
                                <TableCell>{c.name}</TableCell>
                                <TableCell>{c.version}</TableCell>
                                <TableCell align="right">{c.collections}</TableCell>
                                <TableCell>
                                    <Chip
                                        label={c.status}
                                        size="small"
                                        color={c.status === 'Active' ? 'success' : 'default'}
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

export default MongoProjects;
