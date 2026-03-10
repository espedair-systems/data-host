import React from 'react';
import { Box, Typography, Paper, Breadcrumbs, Link, Grid, Divider, List, ListItem, ListItemText, ListItemIcon, Button } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import {
    CloudQueue as GCSIcon,
    History as HistoryIcon,
    CheckCircle as SuccessIcon,
    Error as ErrorIcon,
    Storage as BucketIcon
} from '@mui/icons-material';

const GCSDashboard: React.FC = () => {
    const stats = [
        { label: 'Active Buckets', value: '42' },
        { label: 'Files Scanned', value: '12.4k' },
        { label: 'Schemas Inferred', value: '156' },
        { label: 'Total Volume', value: '4.2 TB' }
    ];

    const recentActivity = [
        { bucket: 'marketing-assets-prod', object: 'events_2026_03.parquet', status: 'success', time: '2026-03-08 20:45' },
        { bucket: 'raw-data-ingest', object: 'user_logs_v2.json', status: 'success', time: '2026-03-08 18:10' },
        { bucket: 'temporary-exports', object: 'failed_dump.csv', status: 'error', time: '2026-03-08 14:20' }
    ];

    return (
        <Box sx={{ p: 1 }}>
            <Breadcrumbs aria-label="breadcrumb" sx={{ mb: 2 }}>
                <Link component={RouterLink} color="inherit" to="/">Registry</Link>
                <Link component={RouterLink} color="inherit" to="/ingestion">Ingestion</Link>
                <Typography color="text.primary">Cloud Storage Dashboard</Typography>
            </Breadcrumbs>

            <Box sx={{ mb: 4, display: 'flex', alignItems: 'center', gap: 2 }}>
                <GCSIcon color="primary" sx={{ fontSize: 40 }} />
                <Box>
                    <Typography variant="h4" sx={{ fontWeight: 700, mb: 0 }}>
                        Cloud Storage Dashboard
                    </Typography>
                    <Typography variant="body1" sx={{ color: 'text.secondary' }}>
                        Manage metadata discovery and object scanning for Google Cloud Storage.
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
                            <Typography variant="h6" sx={{ fontWeight: 600 }}>Recent Object Scans</Typography>
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
                                            primary={`${activity.bucket}/${activity.object}`}
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
                        <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>Object Schema Discovery</Typography>
                        <Typography variant="body2" sx={{ mb: 3, opacity: 0.9 }}>
                            Automatically infer schema definitions from semi-structured data in your buckets.
                        </Typography>
                        <Button
                            component={RouterLink}
                            to="/ingestion/gcs/connections"
                            variant="contained"
                            sx={{ bgcolor: 'white', color: 'primary.main', '&:hover': { bgcolor: 'grey.100' } }}
                        >
                            Manage Connections
                        </Button>
                        <BucketIcon sx={{ fontSize: 80, opacity: 0.15, position: 'absolute', right: 10, bottom: 0 }} />
                    </Paper>
                </Grid>
            </Grid>
        </Box>
    );
};

export default GCSDashboard;
