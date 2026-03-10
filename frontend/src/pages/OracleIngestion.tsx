import React from 'react';
import { Box, Typography, Paper, Breadcrumbs, Link, Stack, Button, TextField, Divider, Alert, FormControl, FormLabel, RadioGroup, FormControlLabel, Radio } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import { Storage as OracleIcon } from '@mui/icons-material';

const OracleIngestion: React.FC = () => {
    const [connectionType, setConnectionType] = React.useState('sid');

    return (
        <Box sx={{ p: 1 }}>
            <Breadcrumbs aria-label="breadcrumb" sx={{ mb: 2 }}>
                <Link component={RouterLink} color="inherit" to="/">Registry</Link>
                <Link component={RouterLink} color="inherit" to="/ingestion">Ingestion</Link>
                <Typography color="text.primary">Oracle</Typography>
            </Breadcrumbs>

            <Box sx={{ mb: 4, display: 'flex', alignItems: 'center', gap: 2 }}>
                <OracleIcon color="secondary" sx={{ fontSize: 40 }} />
                <Box>
                    <Typography variant="h4" sx={{ fontWeight: 700, mb: 0 }}>
                        Oracle Ingestion
                    </Typography>
                    <Typography variant="body1" sx={{ color: 'text.secondary' }}>
                        Extract schema definitions from Oracle Database instances.
                    </Typography>
                </Box>
            </Box>

            <Paper variant="outlined" sx={{ p: 4, borderRadius: 2, bgcolor: 'background.paper' }}>
                <Stack spacing={4}>
                    <Alert severity="info" sx={{ borderRadius: 2 }}>
                        Ensure the database user has <strong>SELECT</strong> privileges on <code>ALL_TAB_COLUMNS</code>, <code>ALL_CONSTRAINTS</code>, and metadata views.
                    </Alert>

                    <Box>
                        <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                            Connection Settings
                        </Typography>
                        <Stack spacing={3} sx={{ mt: 2 }}>
                            <Stack direction="row" spacing={2}>
                                <TextField label="Host" placeholder="db.example.com" fullWidth variant="outlined" />
                                <TextField label="Port" placeholder="1521" sx={{ width: 120 }} variant="outlined" />
                            </Stack>

                            <FormControl>
                                <FormLabel sx={{ mb: 1, fontWeight: 500 }}>Identification Method</FormLabel>
                                <RadioGroup
                                    row
                                    value={connectionType}
                                    onChange={(e) => setConnectionType(e.target.value)}
                                >
                                    <FormControlLabel value="sid" control={<Radio size="small" />} label="SID" />
                                    <FormControlLabel value="service" control={<Radio size="small" />} label="Service Name" />
                                </RadioGroup>
                            </FormControl>

                            <TextField
                                label={connectionType === 'sid' ? "SID" : "Service Name"}
                                placeholder={connectionType === 'sid' ? "ORCL" : "orcl.example.com"}
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
                            label="Schema (Owner)"
                            placeholder="e.g. HR"
                            fullWidth
                            variant="outlined"
                            sx={{ mt: 1 }}
                        />
                    </Box>

                    <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
                        <Button variant="outlined" color="inherit">
                            Test Connection
                        </Button>
                        <Button variant="contained" color="secondary" sx={{ px: 4 }}>
                            Import Metadata
                        </Button>
                    </Box>
                </Stack>
            </Paper>
        </Box>
    );
};

export default OracleIngestion;
