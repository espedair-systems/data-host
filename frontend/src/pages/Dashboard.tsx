import React from 'react';
import { Typography, Paper, Box } from '@mui/material';

const Dashboard: React.FC = () => {
    return (
        <Box>
            <Typography variant="h4" gutterBottom>
                Dashboard
            </Typography>
            <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column' }}>
                <Typography>Welcome to the Data Host Dashboard.</Typography>
            </Paper>
        </Box>
    );
};

export default Dashboard;
