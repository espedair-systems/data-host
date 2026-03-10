import React from 'react';
import { Box, Typography, Breadcrumbs, Link, Grid, Card, CardContent, Divider, Chip } from '@mui/material';
import { useLocation, Link as RouterLink } from 'react-router-dom';
import {
    CloudDone as ProdIcon,
    SettingsBackupRestore as StagingIcon,
    Construction as DevIcon,
    BugReport as TestIcon,
    Dns as EnvIcon
} from '@mui/icons-material';

const Environments: React.FC = () => {
    const location = useLocation();
    const isPlatform = location.pathname.includes('/platforms/');
    const platformType = location.pathname.split('/')[2];

    const platformLabels: Record<string, string> = {
        gcp: 'GCP',
        aws: 'AWS',
        gcve: 'GCVE',
        saas: 'SaaS'
    };

    const parentPath = isPlatform ? `/platforms/${platformType}` : '/';
    const parentLabel = isPlatform ? (platformLabels[platformType] || 'Platform') : 'Registry';

    const production = [
        { id: 'prod', name: 'Production', icon: <ProdIcon sx={{ color: '#4caf50' }} />, status: 'Stable', nodes: 12, uptime: '99.99%' },
        { id: 'staging', name: 'Staging', icon: <StagingIcon sx={{ color: '#2196f3' }} />, status: 'Synced', nodes: 4, uptime: '99.95%' }
    ];

    const nonProduction = [
        { id: 'dev', name: 'Development', icon: <DevIcon sx={{ color: '#ff9800' }} />, status: 'Active', nodes: 2, uptime: '98.5%' },
        { id: 'test', name: 'Test', icon: <TestIcon sx={{ color: '#f44336' }} />, status: 'Testing', nodes: 2, uptime: '99.2%' }
    ];

    const renderCard = (env: any) => (
        <Grid key={env.id} size={{ xs: 12, sm: 6 }}>
            <Card variant="outlined" sx={{ borderRadius: 3, height: '100%' }}>
                <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                            {env.icon}
                            <Typography variant="h6" sx={{ fontWeight: 700 }}>{env.name}</Typography>
                        </Box>
                        <Chip label={env.status} size="small" variant="outlined" color={env.id === 'prod' ? 'success' : 'primary'} />
                    </Box>
                    <Divider sx={{ mb: 2 }} />
                    <Grid container spacing={2}>
                        <Grid size={{ xs: 6 }}>
                            <Typography variant="caption" color="text.secondary">Active Nodes</Typography>
                            <Typography variant="body1" sx={{ fontWeight: 600 }}>{env.nodes}</Typography>
                        </Grid>
                        <Grid size={{ xs: 6 }}>
                            <Typography variant="caption" color="text.secondary">Monthly Uptime</Typography>
                            <Typography variant="body1" sx={{ fontWeight: 600 }}>{env.uptime}</Typography>
                        </Grid>
                    </Grid>
                </CardContent>
            </Card>
        </Grid>
    );

    return (
        <Box sx={{ p: 1 }}>
            <Breadcrumbs aria-label="breadcrumb" sx={{ mb: 2 }}>
                <Link component={RouterLink} color="inherit" to="/">Registry</Link>
                <Link component={RouterLink} color="inherit" to={parentPath}>{parentLabel}</Link>
                <Typography color="text.primary">Environments</Typography>
            </Breadcrumbs>

            <Box sx={{ mb: 4, display: 'flex', alignItems: 'center', gap: 2 }}>
                <EnvIcon color="primary" sx={{ fontSize: 40 }} />
                <Box>
                    <Typography variant="h4" sx={{ fontWeight: 700, mb: 0 }}>
                        Environments
                    </Typography>
                    <Typography variant="body1" sx={{ color: 'text.secondary' }}>
                        Monitor and manage system states across development lifecycles.
                    </Typography>
                </Box>
            </Box>

            <Typography variant="h5" sx={{ fontWeight: 700, mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                Production <Chip label="Mission Critical" size="small" sx={{ bgcolor: 'error.main', color: 'white', fontWeight: 700 }} />
            </Typography>
            <Grid container spacing={3} sx={{ mb: 6 }}>
                {production.map(renderCard)}
            </Grid>

            <Typography variant="h5" sx={{ fontWeight: 700, mb: 2 }}>
                Non-Production
            </Typography>
            <Grid container spacing={3}>
                {nonProduction.map(renderCard)}
            </Grid>
        </Box>
    );
};

export default Environments;
