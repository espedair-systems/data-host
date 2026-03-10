import React from 'react';
import { Box, Typography, Paper, Breadcrumbs, Link, Stack, Button, TextField, Divider, Alert } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import { Storage as PostgresIcon } from '@mui/icons-material';

const PostgresIngestion: React.FC = () => {
    return (
        <Box sx={{ p: 1 }}>
            <Breadcrumbs aria-label="breadcrumb" sx={{ mb: 2 }}>
                <Link component={RouterLink} color="inherit" to="/">Registry</Link>
                <Link component={RouterLink} color="inherit" to="/ingestion">Ingestion</Link>
                <Typography color="text.primary">Postgres</Typography>
            </Breadcrumbs>

            <Box sx={{ mb: 4, display: 'flex', alignItems: 'center', gap: 2 }}>
                <PostgresIcon color="primary" sx={{ fontSize: 40 }} />
                <Box>
                    <Typography variant="h4" sx={{ fontWeight: 700, mb: 0 }}>
                        Postgres Ingestion
                    </Typography>
                    <Typography variant="body1" sx={{ color: 'text.secondary' }}>
                        Extract schema definitions from PostgreSQL databases.
                    </Typography>
                </Box>
            </Box>

            <Paper variant="outlined" sx={{ p: 4, borderRadius: 2, bgcolor: 'background.paper' }}>
                <Stack spacing={4}>
                    <Alert severity="info" sx={{ borderRadius: 2 }}>
                        The ingestion process uses <code>information_schema</code> and <code>pg_catalog</code> to extract table metadata and relationships.
                    </Alert>

                    <Box>
                        <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                            Connection Settings
                        </Typography>
                        <Stack spacing={3} sx={{ mt: 2 }}>
                            <Stack direction="row" spacing={2}>
                                <TextField label="Host" placeholder="localhost" fullWidth variant="outlined" />
                                <TextField label="Port" placeholder="5432" sx={{ width: 120 }} variant="outlined" />
                            </Stack>
                            <TextField
                                label="Database Name"
                                placeholder="my_database"
                                fullWidth
                                variant="outlined"
                            />
                        </Stack>
                    </Box>

                    <Divider />

                    <Box>
                        <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                            Credentials
                        </Typography>
                        <Stack direction="row" spacing={2} sx={{ mt: 2 }}>
                            <TextField label="Username" placeholder="postgres" fullWidth variant="outlined" />
                            <TextField label="Password" type="password" fullWidth variant="outlined" />
                        </Stack>
                    </Box>

                    <Box>
                        <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                            Extraction Scope
                        </Typography>
                        <TextField
                            label="Schema Name"
                            placeholder="public"
                            fullWidth
                            variant="outlined"
                            sx={{ mt: 1 }}
                        />
                    </Box>

                    <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
                        <Button variant="outlined" color="inherit">
                            Test Connection
                        </Button>
                        <Button variant="contained" color="primary" sx={{ px: 4 }}>
                            Import Postgres Schema
                        </Button>
                    </Box>
                </Stack>
            </Paper>
        </Box>
    );
};

export default PostgresIngestion;
