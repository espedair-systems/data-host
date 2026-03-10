import React from 'react';
import { Box, Typography, Paper, Breadcrumbs, Link, Stack, Button, TextField, Divider, Alert } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import { Storage as MySQLIcon } from '@mui/icons-material';

const MySQLIngestion: React.FC = () => {
    return (
        <Box sx={{ p: 1 }}>
            <Breadcrumbs aria-label="breadcrumb" sx={{ mb: 2 }}>
                <Link component={RouterLink} color="inherit" to="/">Registry</Link>
                <Link component={RouterLink} color="inherit" to="/ingestion">Ingestion</Link>
                <Typography color="text.primary">MySQL</Typography>
            </Breadcrumbs>

            <Box sx={{ mb: 4, display: 'flex', alignItems: 'center', gap: 2 }}>
                <MySQLIcon sx={{ fontSize: 40, color: '#00758F' }} />
                <Box>
                    <Typography variant="h4" sx={{ fontWeight: 700, mb: 0 }}>
                        MySQL Ingestion
                    </Typography>
                    <Typography variant="body1" sx={{ color: 'text.secondary' }}>
                        Extract schema definitions from MySQL and MariaDB databases.
                    </Typography>
                </Box>
            </Box>

            <Paper variant="outlined" sx={{ p: 4, borderRadius: 2, bgcolor: 'background.paper' }}>
                <Stack spacing={4}>
                    <Alert severity="info" sx={{ borderRadius: 2 }}>
                        Ensure your MySQL user has <strong>SELECT</strong> privileges on the <code>information_schema</code> database.
                    </Alert>

                    <Box>
                        <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                            Connection Settings
                        </Typography>
                        <Stack spacing={3} sx={{ mt: 2 }}>
                            <Stack direction="row" spacing={2}>
                                <TextField label="Host" placeholder="mysql-db.internal" fullWidth variant="outlined" />
                                <TextField label="Port" placeholder="3306" sx={{ width: 120 }} variant="outlined" />
                            </Stack>
                            <TextField
                                label="Database (Schema) Name"
                                placeholder="production_db"
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
                            <TextField label="Username" placeholder="root" fullWidth variant="outlined" />
                            <TextField label="Password" type="password" fullWidth variant="outlined" />
                        </Stack>
                    </Box>

                    <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
                        <Button variant="outlined" color="inherit">
                            Test Connection
                        </Button>
                        <Button variant="contained" sx={{ px: 4, bgcolor: '#00758F', '&:hover': { bgcolor: '#005F73' } }}>
                            Import MySQL Schema
                        </Button>
                    </Box>
                </Stack>
            </Paper>
        </Box>
    );
};

export default MySQLIngestion;
