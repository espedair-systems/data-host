import React from 'react';
import { Box, Typography, Paper, Breadcrumbs, Link, Stack, Button, TextField, Divider, Alert, Slider, FormLabel } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import { Storage as MongoIcon } from '@mui/icons-material';

const MongoIngestion: React.FC = () => {
    const [sampleSize, setSampleSize] = React.useState<number>(100);

    return (
        <Box sx={{ p: 1 }}>
            <Breadcrumbs aria-label="breadcrumb" sx={{ mb: 2 }}>
                <Link component={RouterLink} color="inherit" to="/">Registry</Link>
                <Link component={RouterLink} color="inherit" to="/ingestion">Ingestion</Link>
                <Typography color="text.primary">MongoDB</Typography>
            </Breadcrumbs>

            <Box sx={{ mb: 4, display: 'flex', alignItems: 'center', gap: 2 }}>
                <MongoIcon sx={{ fontSize: 40, color: '#47A248' }} />
                <Box>
                    <Typography variant="h4" sx={{ fontWeight: 700, mb: 0 }}>
                        MongoDB Ingestion
                    </Typography>
                    <Typography variant="body1" sx={{ color: 'text.secondary' }}>
                        Infer schema definitions by sampling documents from MongoDB collections.
                    </Typography>
                </Box>
            </Box>

            <Paper variant="outlined" sx={{ p: 4, borderRadius: 2, bgcolor: 'background.paper' }}>
                <Stack spacing={4}>
                    <Alert severity="warning" sx={{ borderRadius: 2 }}>
                        MongoDB is schemaless. Ingestion works by <strong>sampling</strong> documents in each collection to generate a representative schema.
                    </Alert>

                    <Box>
                        <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                            Connection Details
                        </Typography>
                        <Stack spacing={3} sx={{ mt: 2 }}>
                            <TextField
                                label="Connection URI"
                                placeholder="mongodb+srv://user:pass@cluster.mongodb.net/test?retryWrites=true&w=majority"
                                fullWidth
                                variant="outlined"
                                helperText="Standard MongoDB connection string"
                            />
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
                            Sampling Strategy
                        </Typography>
                        <Box sx={{ px: 2, mt: 3 }}>
                            <FormLabel sx={{ mb: 1, display: 'block' }}>Documents to sample per collection: {sampleSize}</FormLabel>
                            <Slider
                                value={sampleSize}
                                onChange={(_, newValue) => setSampleSize(newValue as number)}
                                aria-labelledby="sample-size-slider"
                                valueLabelDisplay="auto"
                                step={100}
                                marks={[
                                    { value: 100, label: '100' },
                                    { value: 500, label: '500' },
                                    { value: 1000, label: '1k' },
                                    { value: 5000, label: '5k' }
                                ]}
                                min={100}
                                max={5000}
                                sx={{ color: '#47A248' }}
                            />
                            <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                                Higher sample sizes provide better accuracy for polymorphic collections but take longer to process.
                            </Typography>
                        </Box>
                    </Box>

                    <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
                        <Button variant="outlined" color="inherit">
                            Test Connection
                        </Button>
                        <Button variant="contained" sx={{ px: 4, bgcolor: '#47A248', '&:hover': { bgcolor: '#3d8b3e' } }}>
                            Run Schema Inference
                        </Button>
                    </Box>
                </Stack>
            </Paper>
        </Box>
    );
};

export default MongoIngestion;
