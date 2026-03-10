import React from 'react';
import { Box, Typography, Breadcrumbs, Link, Paper } from '@mui/material';
import { Link as RouterLink, useSearchParams } from 'react-router-dom';
import { Construction as ConstructionIcon } from '@mui/icons-material';

const MapPage: React.FC = () => {
    const [searchParams] = useSearchParams();
    const detailsPath = searchParams.get('details');
    const moduleName = detailsPath?.split('/').pop() || 'Module';

    return (
        <Box sx={{ height: 'calc(100vh - 140px)', display: 'flex', flexDirection: 'column' }}>
            <Breadcrumbs aria-label="breadcrumb" sx={{ mb: 2 }}>
                <Link component={RouterLink} color="inherit" to="/">Registry</Link>
                <Link component={RouterLink} color="inherit" to="/schema">Schema</Link>
                <Typography color="text.primary" sx={{ textTransform: 'capitalize' }}>
                    {moduleName} Map
                </Typography>
            </Breadcrumbs>

            <Paper
                variant="outlined"
                sx={{
                    flexGrow: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    bgcolor: 'background.default',
                    borderStyle: 'dashed',
                    borderRadius: 2,
                    p: 4
                }}
            >
                <ConstructionIcon sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
                <Typography variant="h4" sx={{ fontWeight: 700, mb: 1, textTransform: 'capitalize' }}>
                    {moduleName} Map Feature
                </Typography>
                <Typography variant="h6" color="primary" sx={{ mb: 3 }}>
                    TODO: Interactive Schema Visualization
                </Typography>
                <Typography color="text.secondary" align="center" sx={{ maxWidth: 500 }}>
                    The relationship map for <strong>{moduleName}</strong> is currently under development.
                    This view will eventually feature interactive Cytoscape graphs showing table dependencies
                    and foreign key relationships.
                </Typography>
            </Paper>
        </Box>
    );
};

export default MapPage;
