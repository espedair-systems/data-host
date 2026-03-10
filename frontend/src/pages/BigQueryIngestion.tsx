import React from 'react';
import { Box, Typography, Paper, Breadcrumbs, Link, Stack, Button, TextField, Divider, Alert } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import { Storage as BigQueryIcon } from '@mui/icons-material';

const BigQueryIngestion: React.FC = () => {
    return (
        <Box sx={{ p: 1 }}>
            <Breadcrumbs aria-label="breadcrumb" sx={{ mb: 2 }}>
                <Link component={RouterLink} color="inherit" to="/">Registry</Link>
                <Link component={RouterLink} color="inherit" to="/ingestion">Ingestion</Link>
                <Typography color="text.primary">BigQuery</Typography>
            </Breadcrumbs>

            <Box sx={{ mb: 4, display: 'flex', alignItems: 'center', gap: 2 }}>
                <BigQueryIcon color="primary" sx={{ fontSize: 40 }} />
                <Box>
                    <Typography variant="h4" sx={{ fontWeight: 700, mb: 0 }}>
                        BigQuery Ingestion
                    </Typography>
                    <Typography variant="body1" sx={{ color: 'text.secondary' }}>
                        Extract schema definitions directly from Google BigQuery datasets.
                    </Typography>
                </Box>
            </Box>

            <Paper variant="outlined" sx={{ p: 4, borderRadius: 2, bgcolor: 'background.paper' }}>
                <Stack spacing={4}>
                    <Alert severity="info" sx={{ borderRadius: 2 }}>
                        Ensure your service account has <strong>BigQuery Metadata Viewer</strong> permissions for the target dataset.
                    </Alert>

                    <Box>
                        <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                            Connection Details
                        </Typography>
                        <Stack spacing={3} sx={{ mt: 2 }}>
                            <TextField
                                label="GCP Project ID"
                                placeholder="e.g. my-awesome-project"
                                fullWidth
                                variant="outlined"
                            />
                            <TextField
                                label="Dataset ID"
                                placeholder="e.g. analytics_v1"
                                fullWidth
                                variant="outlined"
                            />
                        </Stack>
                    </Box>

                    <Divider />

                    <Box>
                        <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                            Authentication
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                            Provide your service account JSON key content.
                        </Typography>
                        <TextField
                            label="Service Account Key (JSON)"
                            placeholder='{ "type": "service_account", ... }'
                            fullWidth
                            multiline
                            rows={6}
                            variant="outlined"
                        />
                    </Box>

                    <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
                        <Button variant="outlined" color="inherit">
                            Test Connection
                        </Button>
                        <Button variant="contained" color="primary" sx={{ px: 4 }}>
                            Import Dataset Schema
                        </Button>
                    </Box>
                </Stack>
            </Paper>
        </Box>
    );
};

export default BigQueryIngestion;
