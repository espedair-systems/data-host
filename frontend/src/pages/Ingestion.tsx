import React from 'react';
import { Box, Typography, Paper, Breadcrumbs, Link, Stack, Button, TextField, Divider } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import { CloudUpload as UploadIcon } from '@mui/icons-material';

const IngestionPage: React.FC = () => {
    return (
        <Box sx={{ p: 1 }}>
            <Breadcrumbs aria-label="breadcrumb" sx={{ mb: 2 }}>
                <Link component={RouterLink} color="inherit" to="/">Registry</Link>
                <Typography color="text.primary">Schema Ingestion</Typography>
            </Breadcrumbs>

            <Box sx={{ mb: 4 }}>
                <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
                    Schema Ingestion
                </Typography>
                <Typography variant="body1" sx={{ color: 'text.secondary' }}>
                    Import and register new data schemas into the registry.
                </Typography>
            </Box>

            <Paper variant="outlined" sx={{ p: 4, borderRadius: 2, bgcolor: 'background.paper' }}>
                <Stack spacing={4}>
                    <Box>
                        <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                            Upload Schema File
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                            Drag and drop your JSON schema file or click to browse. Supported format: <code>schema.json</code>
                        </Typography>

                        <Box sx={{
                            border: '2px dashed',
                            borderColor: 'divider',
                            borderRadius: 2,
                            p: 6,
                            textAlign: 'center',
                            cursor: 'pointer',
                            '&:hover': { bgcolor: 'action.hover', borderColor: 'primary.main' }
                        }}>
                            <UploadIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
                            <Typography variant="h6">Drop file here</Typography>
                            <Typography variant="body2" color="text.secondary">or click to upload</Typography>
                        </Box>
                    </Box>

                    <Divider />

                    <Box>
                        <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                            Manual Registration
                        </Typography>
                        <Stack spacing={3} sx={{ mt: 2 }}>
                            <TextField
                                label="Module Name"
                                placeholder="e.g. blog-service"
                                fullWidth
                                variant="outlined"
                            />
                            <TextField
                                label="Schema Source URL"
                                placeholder="https://api.example.com/v1/schema"
                                fullWidth
                                variant="outlined"
                            />
                            <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                                <Button variant="contained" color="primary" size="large" sx={{ px: 4 }}>
                                    Register Schema
                                </Button>
                            </Box>
                        </Stack>
                    </Box>
                </Stack>
            </Paper>
        </Box>
    );
};

export default IngestionPage;
