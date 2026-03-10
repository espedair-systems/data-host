import React from 'react';
import { Box, Typography, Paper, Breadcrumbs, Link, Stack, Button, TextField, Divider, Alert } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import { Storage as MSSQLIcon } from '@mui/icons-material';

const MSSQLIngestion: React.FC = () => {
    return (
        <Box sx={{ p: 1 }}>
            <Breadcrumbs aria-label="breadcrumb" sx={{ mb: 2 }}>
                <Link component={RouterLink} color="inherit" to="/">Registry</Link>
                <Link component={RouterLink} color="inherit" to="/ingestion">Ingestion</Link>
                <Typography color="text.primary">MS SQL</Typography>
            </Breadcrumbs>

            <Box sx={{ mb: 4, display: 'flex', alignItems: 'center', gap: 2 }}>
                <MSSQLIcon color="info" sx={{ fontSize: 40 }} />
                <Box>
                    <Typography variant="h4" sx={{ fontWeight: 700, mb: 0 }}>
                        MS SQL Ingestion
                    </Typography>
                    <Typography variant="body1" sx={{ color: 'text.secondary' }}>
                        Extract schema definitions from Microsoft SQL Server databases.
                    </Typography>
                </Box>
            </Box>

            <Paper variant="outlined" sx={{ p: 4, borderRadius: 2, bgcolor: 'background.paper' }}>
                <Stack spacing={4}>
                    <Alert severity="info" sx={{ borderRadius: 2 }}>
                        Ensure your SQL Server user has <strong>VIEW DEFINITION</strong> permissions or is a member of the <code>db_datareader</code> role.
                    </Alert>

                    <Box>
                        <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                            Connection Settings
                        </Typography>
                        <Stack spacing={3} sx={{ mt: 2 }}>
                            <Stack direction="row" spacing={2}>
                                <TextField label="Server / Host" placeholder="sql-db.example.com" fullWidth variant="outlined" />
                                <TextField label="Port" placeholder="1433" sx={{ width: 120 }} variant="outlined" />
                            </Stack>
                            <TextField
                                label="Database Name"
                                placeholder="MasterDB"
                                fullWidth
                                variant="outlined"
                            />
                            <TextField
                                label="Instance Name (Optional)"
                                placeholder="SQLEXPRESS"
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
                            <TextField label="Username" fullWidth variant="outlined" />
                            <TextField label="Password" type="password" fullWidth variant="outlined" />
                        </Stack>
                    </Box>

                    <Box>
                        <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                            Extraction Scope
                        </Typography>
                        <TextField
                            label="Schema (e.g. dbo)"
                            placeholder="dbo"
                            fullWidth
                            variant="outlined"
                            sx={{ mt: 1 }}
                        />
                    </Box>

                    <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
                        <Button variant="outlined" color="inherit">
                            Test Connection
                        </Button>
                        <Button variant="contained" color="info" sx={{ px: 4, color: 'white' }}>
                            Scan SQL Objects
                        </Button>
                    </Box>
                </Stack>
            </Paper>
        </Box>
    );
};

export default MSSQLIngestion;
