import React from 'react';
import { Box, Typography, Paper, Breadcrumbs, Link, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Chip, IconButton } from '@mui/material';
import { Link as RouterLink, useLocation } from 'react-router-dom';
import { Error as ErrorIcon, ChevronRight as ViewIcon } from '@mui/icons-material';

const PlatformIssues: React.FC = () => {
    const location = useLocation();
    const platformType = location.pathname.split('/')[2];

    const platformLabels: Record<string, string> = {
        gcp: 'GCP',
        aws: 'AWS',
        gcve: 'GCVE',
        saas: 'SaaS'
    };

    const typeLabel = platformLabels[platformType] || 'Platform';
    const parentPath = `/platforms/${platformType}`;

    const issues = [
        { id: 'ISS-001', severity: 'High', service: typeLabel === 'AWS' ? 'EC2' : 'Compute', message: 'Quota exceeded for regional resources', time: '2026-03-09 05:12' },
        { id: 'ISS-002', severity: 'Medium', service: typeLabel === 'AWS' ? 'S3' : 'Storage', message: 'Permissions denied on root assets', time: '2026-03-08 22:10' },
        { id: 'ISS-003', severity: 'Low', service: 'IAM', message: 'User access patterns abnormal', time: '2026-03-08 18:45' }
    ];

    const getSeverityColor = (severity: string) => {
        switch (severity.toLowerCase()) {
            case 'high': return 'error';
            case 'medium': return 'warning';
            case 'low': return 'info';
            default: return 'default';
        }
    };

    return (
        <Box sx={{ p: 1 }}>
            <Breadcrumbs aria-label="breadcrumb" sx={{ mb: 2 }}>
                <Link component={RouterLink} color="inherit" to="/">Registry</Link>
                <Link component={RouterLink} color="inherit" to={parentPath}>{typeLabel}</Link>
                <Typography color="text.primary">Issues</Typography>
            </Breadcrumbs>

            <Box sx={{ mb: 4, display: 'flex', alignItems: 'center', gap: 2 }}>
                <ErrorIcon color="error" sx={{ fontSize: 40 }} />
                <Box>
                    <Typography variant="h4" sx={{ fontWeight: 700, mb: 0 }}>
                        {typeLabel} Platform Issues
                    </Typography>
                    <Typography variant="body1" sx={{ color: 'text.secondary' }}>
                        Active alerts and system warnings across {typeLabel} services.
                    </Typography>
                </Box>
            </Box>

            <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 2 }}>
                <Table>
                    <TableHead sx={{ bgcolor: 'action.hover' }}>
                        <TableRow>
                            <TableCell sx={{ fontWeight: 700 }}>Issue ID</TableCell>
                            <TableCell sx={{ fontWeight: 700 }}>Severity</TableCell>
                            <TableCell sx={{ fontWeight: 700 }}>Service</TableCell>
                            <TableCell sx={{ fontWeight: 700 }}>Message</TableCell>
                            <TableCell sx={{ fontWeight: 700 }}>Detected At</TableCell>
                            <TableCell sx={{ fontWeight: 700 }} align="right">Action</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {issues.map((issue) => (
                            <TableRow key={issue.id} hover>
                                <TableCell sx={{ fontFamily: 'monospace' }}>{issue.id}</TableCell>
                                <TableCell>
                                    <Chip
                                        label={issue.severity}
                                        size="small"
                                        color={getSeverityColor(issue.severity) as any}
                                        variant="outlined"
                                        sx={{ minWidth: 80 }}
                                    />
                                </TableCell>
                                <TableCell sx={{ fontWeight: 600 }}>{issue.service}</TableCell>
                                <TableCell>{issue.message}</TableCell>
                                <TableCell>{issue.time}</TableCell>
                                <TableCell align="right">
                                    <IconButton size="small">
                                        <ViewIcon fontSize="small" />
                                    </IconButton>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
        </Box>
    );
};

export default PlatformIssues;
