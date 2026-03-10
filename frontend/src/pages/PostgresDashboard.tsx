import React from 'react';
import { Box, Typography, Paper, Breadcrumbs, Link, Grid, Divider, List, ListItem, ListItemText, ListItemIcon, Button } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import {
    Storage as PostgresIcon,
    History as HistoryIcon,
    CheckCircle as SuccessIcon,
    Error as ErrorIcon,
    Layers as SchemaIcon
} from '@mui/icons-material';

const PostgresDashboard: React.FC = () => {
    const stats = [
        { label: 'Ingested Tables', value: '284' },
        { label: 'Active Databases', value: '12' },
        { label: 'Schemas Exported', value: '38' },
        { label: 'Last Scan', value: '1 hour ago' }
    ];

    const recentActivity = [
        { db: 'analytics_dw', schema: 'public', status: 'success', time: '2026-03-08 16:45' },
        { db: 'users_service', schema: 'auth', status: 'success', time: '2026-03-08 14:10' },
        { db: 'order_service', schema: 'staging', status: 'error', time: '2026-03-08 11:20' }
    ];

    return (
        <Box sx={{ p: 1 }}>
            <Breadcrumbs aria-label="breadcrumb" sx={{ mb: 2 }}>
                <Link component={RouterLink} color="inherit" to="/">Registry</Link>
                <Link component={RouterLink} color="inherit" to="/ingestion">Ingestion</Link>
                <Typography color="text.primary">Postgres Dashboard</Typography>
            </Breadcrumbs>

            <Box sx={{ mb: 4, display: 'flex', alignItems: 'center', gap: 2 }}>
                <PostgresIcon color="primary" sx={{ fontSize: 40 }} />
                <Box>
                    <Typography variant="h4" sx={{ fontWeight: 700, mb: 0 }}>
                        Postgres Dashboard
                    </Typography>
                    <Typography variant="body1" sx={{ color: 'text.secondary' }}>
                        Manage and monitor metadata ingestion from PostgreSQL databases.
                    </Typography>
                </Box>
            </Box>

            <Grid container spacing={3} sx={{ mb: 4 }}>
                {stats.map((stat) => (
                    <Grid key={stat.label} size={{ xs: 12, sm: 6, md: 3 }}>
                        <Paper variant="outlined" sx={{ p: 2, textAlign: 'center', borderRadius: 2 }}>
                            <Typography variant="h4" sx={{ fontWeight: 700, color: 'primary.main' }}>
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
                                            primary={`${activity.db}.${activity.schema}`}
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
                    <Paper variant="outlined" sx={{ p: 3, borderRadius: 2, bgcolor: 'primary.main', color: 'white', position: 'relative' }}>
                        <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>Reliable & Scalable</Typography>
                        <Typography variant="body2" sx={{ mb: 3, opacity: 0.9 }}>
                            Connect to your PostgreSQL instances to surface deep data relationships.
                        </Typography>
                        <Button
                            component={RouterLink}
                            to="/ingestion/postgres/new"
                            variant="contained"
                            sx={{ bgcolor: 'white', color: 'primary.main', '&:hover': { bgcolor: 'grey.100' } }}
                        >
                            Connect DB
                        </Button>
                        <SchemaIcon sx={{ fontSize: 80, opacity: 0.15, position: 'absolute', right: 10, bottom: 0 }} />
                    </Paper>
                </Grid>
            </Grid>
        </Box>
    );
};

export default PostgresDashboard;
