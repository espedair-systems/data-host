import React from 'react';
import { Box, Typography, Paper, Breadcrumbs, Link, Grid, Divider, List, ListItem, ListItemText, ListItemIcon, Button } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import {
    Storage as MySQLIcon,
    History as HistoryIcon,
    CheckCircle as SuccessIcon,
    Error as ErrorIcon,
    Speed as PerformanceIcon
} from '@mui/icons-material';

const MySQLDashboard: React.FC = () => {
    const stats = [
        { label: 'Ingested Tables', value: '189' },
        { label: 'Active Clusters', value: '3' },
        { label: 'Databases Syncing', value: '7' },
        { label: 'Metadata Size', value: '14 MB' }
    ];

    const recentActivity = [
        { host: 'mysql-prod-01', db: 'customer_db', status: 'success', time: '2026-03-08 17:50' },
        { host: 'mariadb-staging', db: 'tests', status: 'success', time: '2026-03-08 12:30' },
        { host: 'mysql-prod-02', db: 'inventory', status: 'error', time: '2026-03-07 22:10' }
    ];

    return (
        <Box sx={{ p: 1 }}>
            <Breadcrumbs aria-label="breadcrumb" sx={{ mb: 2 }}>
                <Link component={RouterLink} color="inherit" to="/">Registry</Link>
                <Link component={RouterLink} color="inherit" to="/ingestion">Ingestion</Link>
                <Typography color="text.primary">MySQL Dashboard</Typography>
            </Breadcrumbs>

            <Box sx={{ mb: 4, display: 'flex', alignItems: 'center', gap: 2 }}>
                <MySQLIcon sx={{ fontSize: 40, color: '#00758F' }} />
                <Box>
                    <Typography variant="h4" sx={{ fontWeight: 700, mb: 0 }}>
                        MySQL Dashboard
                    </Typography>
                    <Typography variant="body1" sx={{ color: 'text.secondary' }}>
                        Manage and monitor metadata ingestion from MySQL and MariaDB instances.
                    </Typography>
                </Box>
            </Box>

            <Grid container spacing={3} sx={{ mb: 4 }}>
                {stats.map((stat) => (
                    <Grid key={stat.label} size={{ xs: 12, sm: 6, md: 3 }}>
                        <Paper variant="outlined" sx={{ p: 2, textAlign: 'center', borderRadius: 2 }}>
                            <Typography variant="h4" sx={{ fontWeight: 700, color: '#00758F' }}>
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
                            <Typography variant="h6" sx={{ fontWeight: 600 }}>Recent Metadata Syncs</Typography>
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
                                            primary={`${activity.host} / ${activity.db}`}
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
                    <Paper variant="outlined" sx={{ p: 3, borderRadius: 2, bgcolor: '#00758F', color: 'white', position: 'relative' }}>
                        <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>Fast & Flexible</Typography>
                        <Typography variant="body2" sx={{ mb: 3, opacity: 0.9 }}>
                            Keep your MySQL registry up to date with automated schema discovery and tracking.
                        </Typography>
                        <Button
                            component={RouterLink}
                            to="/ingestion/mysql/new"
                            variant="contained"
                            sx={{ bgcolor: 'white', color: '#00758F', '&:hover': { bgcolor: 'grey.100' } }}
                        >
                            Sync MySQL
                        </Button>
                        <PerformanceIcon sx={{ fontSize: 80, opacity: 0.15, position: 'absolute', right: 10, bottom: 0 }} />
                    </Paper>
                </Grid>
            </Grid>
        </Box>
    );
};

export default MySQLDashboard;
