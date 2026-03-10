import React from 'react';
import { Box, Typography, Paper, Breadcrumbs, Link, Grid, Divider, List, ListItem, ListItemText, ListItemIcon, Button } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import {
    Storage as BigQueryIcon,
    History as HistoryIcon,
    CheckCircle as SuccessIcon,
    Error as ErrorIcon,
    CloudQueue as ProjectIcon
} from '@mui/icons-material';

const BigQueryDashboard: React.FC = () => {
    // Placeholder data
    const stats = [
        { label: 'Ingested Tables', value: '42' },
        { label: 'Active Projects', value: '3' },
        { label: 'Total Columns', value: '1,204' },
        { label: 'Last Sync', value: '2 hours ago' }
    ];

    const recentActivity = [
        { project: 'marketing-prod', dataset: 'web_analytics', status: 'success', time: '2026-03-08 14:20' },
        { project: 'finance-data', dataset: 'erp_v2', status: 'success', time: '2026-03-08 10:15' },
        { project: 'ops-backend', dataset: 'logistics', status: 'error', time: '2026-03-07 18:30' }
    ];

    return (
        <Box sx={{ p: 1 }}>
            <Breadcrumbs aria-label="breadcrumb" sx={{ mb: 2 }}>
                <Link component={RouterLink} color="inherit" to="/">Registry</Link>
                <Link component={RouterLink} color="inherit" to="/ingestion">Ingestion</Link>
                <Typography color="text.primary">BigQuery Dashboard</Typography>
            </Breadcrumbs>

            <Box sx={{ mb: 4, display: 'flex', alignItems: 'center', gap: 2 }}>
                <BigQueryIcon color="primary" sx={{ fontSize: 40 }} />
                <Box>
                    <Typography variant="h4" sx={{ fontWeight: 700, mb: 0 }}>
                        BigQuery Dashboard
                    </Typography>
                    <Typography variant="body1" sx={{ color: 'text.secondary' }}>
                        Overview of Google BigQuery ingestion status and metadata.
                    </Typography>
                </Box>
            </Box>

            <Grid container spacing={3} sx={{ mb: 4 }}>
                {stats.map((stat) => (
                    <Grid size={{ xs: 12, sm: 6, md: 3 }} key={stat.label}>
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
                                            primary={`${activity.project}.${activity.dataset}`}
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
                        <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>Need more data?</Typography>
                        <Typography variant="body2" sx={{ mb: 3, opacity: 0.9 }}>
                            Connect additional BigQuery datasets to expand your registry insight.
                        </Typography>
                        <Button
                            component={RouterLink}
                            to="/ingestion/bigquery/new"
                            variant="contained"
                            sx={{ bgcolor: 'white', color: 'primary.main', '&:hover': { bgcolor: 'grey.100' } }}
                        >
                            Add Connection
                        </Button>
                        <ProjectIcon sx={{ fontSize: 80, opacity: 0.15, position: 'absolute', right: 10, bottom: 0 }} />
                    </Paper>
                </Grid>
            </Grid>
        </Box>
    );
};

export default BigQueryDashboard;
