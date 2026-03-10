import React from 'react';
import { Box, Typography, Breadcrumbs, Link, Grid, Card, CardContent, Divider } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import { SettingsInputComponent as VMwareIcon, Storage as StorageIcon, Security as SecurityIcon, NetworkCheck as NetworkIcon } from '@mui/icons-material';

const GCVEPage: React.FC = () => {
    const services = [
        { title: 'Hosts', icon: <VMwareIcon />, count: '12 ESXi', status: 'Healthy' },
        { title: 'vCenter', icon: <NetworkIcon />, count: '2 Instances', status: 'Healthy' },
        { title: 'vSAN', icon: <StorageIcon />, count: '84 TB', status: 'Optimized' },
        { title: 'NSX-T', icon: <SecurityIcon />, count: 'Connected', status: 'Secure' }
    ];

    return (
        <Box sx={{ p: 1 }}>
            <Breadcrumbs aria-label="breadcrumb" sx={{ mb: 2 }}>
                <Link component={RouterLink} color="inherit" to="/">Registry</Link>
                <Typography color="text.primary">Google Cloud VMware Engine</Typography>
            </Breadcrumbs>

            <Box sx={{
                mb: 4,
                p: 4,
                borderRadius: 4,
                background: 'linear-gradient(135deg, #0077C8 0%, #4285F4 100%)',
                color: 'white',
                boxShadow: '0 8px 32px rgba(0, 119, 200, 0.3)'
            }}>
                <Typography variant="h3" sx={{ fontWeight: 800, mb: 1 }}>GCVE</Typography>
                <Typography variant="h6" sx={{ opacity: 0.9 }}>Management and monitoring for GCVE environments.</Typography>
            </Box>

            <Grid container spacing={3}>
                {services.map((service) => (
                    <Grid key={service.title} size={{ xs: 12, sm: 12, md: 3 }}>
                        <Card variant="outlined" sx={{ borderRadius: 3, '&:hover': { boxShadow: '0 4px 20px rgba(0,0,0,0.08)' } }}>
                            <CardContent>
                                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                                    <Box sx={{
                                        p: 1.5,
                                        borderRadius: 2,
                                        bgcolor: 'primary.light',
                                        color: 'primary.main',
                                        display: 'flex',
                                        mr: 2
                                    }}>
                                        {service.icon}
                                    </Box>
                                    <Typography variant="h6" sx={{ fontWeight: 700 }}>{service.title}</Typography>
                                </Box>
                                <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>{service.count}</Typography>
                                <Divider sx={{ my: 1.5 }} />
                                <Box sx={{ display: 'flex', alignItems: 'center', color: 'success.main', gap: 0.5 }}>
                                    <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: 'currentColor' }} />
                                    <Typography variant="caption" sx={{ fontWeight: 600 }}>{service.status}</Typography>
                                </Box>
                            </CardContent>
                        </Card>
                    </Grid>
                ))}
            </Grid>
        </Box>
    );
};

export default GCVEPage;
