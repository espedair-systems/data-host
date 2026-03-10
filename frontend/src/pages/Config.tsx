import React from 'react';
import { Typography, Paper, Box, Breadcrumbs, Link } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';

const Config: React.FC = () => {
    return (
        <Box>
            <Breadcrumbs aria-label="breadcrumb" sx={{ mb: 2 }}>
                <Link component={RouterLink} color="inherit" to="/">
                    Registry
                </Link>
                <Typography color="text.primary">Config</Typography>
            </Breadcrumbs>

            <Typography variant="h4" gutterBottom sx={{ fontWeight: 700 }}>
                Configuration Management
            </Typography>

            <Paper sx={{ p: 4, textAlign: 'center', bgcolor: 'action.hover', border: '1px dashed', borderColor: 'divider' }}>
                <Typography variant="h6" color="text.secondary">
                    Interface for system configuration will be implemented here.
                </Typography>
            </Paper>
        </Box>
    );
};

export default Config;
