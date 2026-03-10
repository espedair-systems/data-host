import React from 'react';
import { Box, Typography, Paper, Breadcrumbs, Link, Grid, Divider, List, ListItem, ListItemText, ListItemIcon, Button } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import {
    Storage as OracleIcon,
    History as HistoryIcon,
    CheckCircle as SuccessIcon,
    Error as ErrorIcon,
    Dns as InstanceIcon
} from '@mui/icons-material';

const OracleDashboard: React.FC = () => {
    const stats = [
        { label: 'Ingested Tables', value: '156' },
        { label: 'Active SIDs', value: '2' },
        { label: 'Schemas Syncing', value: '5' },
        { label: 'Last Export', value: '4 hours ago' }
    ];

    const recentActivity = [
        { sid: 'ORCL_PROD', schema: 'HR_APP', status: 'success', time: '2026-03-08 15:10' },
        { sid: 'ERP_TEST', schema: 'PAYROLL', status: 'success', time: '2026-03-08 09:45' },
        { sid: 'ORCL_PROD', schema: 'SALES', status: 'error', time: '2026-03-07 20:15' }
    ];

    return (
        <Box sx={{ p: 1 }}>
            <Breadcrumbs aria-label="breadcrumb" sx={{ mb: 2 }}>
                <Link component={RouterLink} color="inherit" to="/">Registry</Link>
                <Link component={RouterLink} color="inherit" to="/ingestion">Ingestion</Link>
                <Typography color="text.primary">Oracle Dashboard</Typography>
            </Breadcrumbs>

            <Box sx={{ mb: 4, display: 'flex', alignItems: 'center', gap: 2 }}>
                <OracleIcon color="secondary" sx={{ fontSize: 40 }} />
                <Box>
                    <Typography variant="h4" sx={{ fontWeight: 700, mb: 0 }}>
                        Oracle Dashboard
                    </Typography>
                    <Typography variant="body1" sx={{ color: 'text.secondary' }}>
                        Manage and monitor metadata ingestion from Oracle Database instances.
                    </Typography>
                </Box>
            </Box>

            <Grid container spacing={3} sx={{ mb: 4 }}>
                {stats.map((stat) => (
                    <Grid key={stat.label} size={{ xs: 12, sm: 6, md: 3 }}>
                        <Paper variant="outlined" sx={{ p: 2, textAlign: 'center', borderRadius: 2 }}>
                            <Typography variant="h4" sx={{ fontWeight: 700, color: 'secondary.main' }}>
                                {stat.value}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                {stat.label}
                            </Typography>
                        </Paper>
                    </Grid>
                ))}
            </Grid>

            <Grid container spacing={3}>
                <Grid size={{ xs: 12, md: 8 }}>
                    <Paper variant="outlined" sx={{ p: 0, borderRadius: 2 }}>
                        <Box sx={{ p: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                            <HistoryIcon color="action" />
                            <Typography variant="h6" sx={{ fontWeight: 600 }}>Recent Ingestion Activity</Typography>
                        </Box>
                        <Divider />
                        <List disablePadding>
                            {recentActivity.map((activity, index) => (
                                <React.Fragment key={index}>
                                    <ListItem sx={{ py: 2 }}>
                                        <ListItemIcon>
                                            {activity.status === 'success' ? <SuccessIcon color="success" /> : <ErrorIcon color="error" />}
                                        </ListItemIcon>
                                        <ListItemText
                                            primary={`${activity.sid}.${activity.schema}`}
                                            secondary={activity.time}
                                        />
                                        <Typography variant="caption" sx={{ fontWeight: 600, color: activity.status === 'success' ? 'success.main' : 'error.main' }}>
                                            {activity.status.toUpperCase()}
                                        </Typography>
                                    </ListItem>
                                    {index < recentActivity.length - 1 && <Divider />}
                                </React.Fragment>
                            ))}
                        </List>
                    </Paper>
                </Grid>
                <Grid size={{ xs: 12, md: 4 }}>
                    <Paper variant="outlined" sx={{ p: 3, borderRadius: 2, bgcolor: 'secondary.main', color: 'white', position: 'relative' }}>
                        <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>Legacy & Enterprise</Typography>
                        <Typography variant="body2" sx={{ mb: 3, opacity: 0.9 }}>
                            Import metadata from complex Oracle schemas to map your enterprise data model.
                        </Typography>
                        <Button
                            component={RouterLink}
                            to="/ingestion/oracle/new"
                            variant="contained"
                            sx={{ bgcolor: 'white', color: 'secondary.main', '&:hover': { bgcolor: 'grey.100' } }}
                        >
                            New Connection
                        </Button>
                        <InstanceIcon sx={{ fontSize: 80, opacity: 0.15, position: 'absolute', right: 10, bottom: 0 }} />
                    </Paper>
                </Grid>
            </Grid>
        </Box>
    );
};

export default OracleDashboard;
