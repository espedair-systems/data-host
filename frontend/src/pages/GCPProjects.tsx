import React from 'react';
import { Box, Typography, Paper, Breadcrumbs, Link, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Chip } from '@mui/material';
import { Link as RouterLink, useLocation } from 'react-router-dom';
import { CloudQueue as GCPLogoIcon } from '@mui/icons-material';

const GCPProjects: React.FC = () => {
    const location = useLocation();
    const isGCS = location.pathname.includes('/gcs');
    const typeLabel = isGCS ? 'Cloud Storage' : 'BigQuery';

    // Placeholder data common to GCP
    const projects = [
        { id: 'marketing-prod', name: 'Marketing Production', datasets: 5, tables: 24, lastSample: '2026-03-08' },
        { id: 'finance-data', name: 'Finance Analytics', datasets: 2, tables: 12, lastSample: '2026-03-08' },
        { id: 'ops-backend', name: 'Operations Backend', datasets: 8, tables: 56, lastSample: '2026-03-07' },
        { id: 'sandbox-jon', name: 'Developer Sandbox', datasets: 1, tables: 3, lastSample: '2026-02-15' }
    ];

    return (
        <Box sx={{ p: 1 }}>
            <Breadcrumbs aria-label="breadcrumb" sx={{ mb: 2 }}>
                <Link component={RouterLink} color="inherit" to="/">Registry</Link>
                <Link component={RouterLink} color="inherit" to="/ingestion">Ingestion</Link>
                <Typography color="text.primary">{typeLabel} Projects</Typography>
            </Breadcrumbs>

            <Box sx={{ mb: 4, display: 'flex', alignItems: 'center', gap: 2 }}>
                <GCPLogoIcon color="primary" sx={{ fontSize: 40 }} />
                <Box>
                    <Typography variant="h4" sx={{ fontWeight: 700, mb: 0 }}>
                        {typeLabel} Projects
                    </Typography>
                    <Typography variant="body1" sx={{ color: 'text.secondary' }}>
                        Manage GCP projects shared between BigQuery and Cloud Storage.
                    </Typography>
                </Box>
            </Box>

            <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 2 }}>
                <Table>
                    <TableHead sx={{ bgcolor: 'action.hover' }}>
                        <TableRow>
                            <TableCell sx={{ fontWeight: 700 }}>Project ID</TableCell>
                            <TableCell sx={{ fontWeight: 700 }}>Name</TableCell>
                            <TableCell sx={{ fontWeight: 700 }} align="right">{isGCS ? 'Buckets' : 'Datasets'}</TableCell>
                            <TableCell sx={{ fontWeight: 700 }} align="right">{isGCS ? 'Files' : 'Tables'}</TableCell>
                            <TableCell sx={{ fontWeight: 700 }}>Last Scanned</TableCell>
                            <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {projects.map((project) => (
                            <TableRow key={project.id} hover>
                                <TableCell sx={{ fontFamily: 'monospace' }}>{project.id}</TableCell>
                                <TableCell>{project.name}</TableCell>
                                <TableCell align="right">{project.datasets}</TableCell>
                                <TableCell align="right">{project.tables}</TableCell>
                                <TableCell>{project.lastSample}</TableCell>
                                <TableCell>
                                    <Chip
                                        label="Active"
                                        size="small"
                                        color="success"
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

export default GCPProjects;
