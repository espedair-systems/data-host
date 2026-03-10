import React, { useEffect, useState } from 'react';
import {
    Typography,
    Paper,
    Box,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Link,
    CircularProgress,
} from '@mui/material';
import { Launch as LaunchIcon } from '@mui/icons-material';

interface MountPoint {
    path: string;
    source_path: string;
}

interface Config {
    Port: number;
    FrontendPath: string;
    DataPath: string;
    Mounts: MountPoint[];
}

const Mounts: React.FC = () => {
    const [config, setConfig] = useState<Config | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch('/api/config')
            .then((res) => res.json())
            .then((data) => {
                setConfig(data);
                setLoading(false);
            })
            .catch((err) => {
                console.error('Error fetching config:', err);
                setLoading(false);
            });
    }, []);

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Box>
            <Typography variant="h4" gutterBottom>
                Managed Mount Points
            </Typography>
            <Typography variant="body1" sx={{ mb: 3, color: 'text.secondary' }}>
                These directories are dynamically mounted to the web server based on your configuration.
            </Typography>

            <TableContainer component={Paper}>
                <Table sx={{ minWidth: 650 }} aria-label="mounts table">
                    <TableHead>
                        <TableRow sx={{ backgroundColor: 'action.hover' }}>
                            <TableCell sx={{ fontWeight: 'bold' }}>Web Path</TableCell>
                            <TableCell sx={{ fontWeight: 'bold' }}>Source Directory</TableCell>
                            <TableCell sx={{ fontWeight: 'bold' }}>Action</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        <TableRow>
                            <TableCell>/home</TableCell>
                            <TableCell>{config?.FrontendPath}</TableCell>
                            <TableCell>
                                <Link href="/home" target="_blank" sx={{ display: 'flex', alignItems: 'center' }}>
                                    Open SPA <LaunchIcon fontSize="small" sx={{ ml: 0.5 }} />
                                </Link>
                            </TableCell>
                        </TableRow>
                        <TableRow>
                            <TableCell>/</TableCell>
                            <TableCell>{config?.DataPath}</TableCell>
                            <TableCell>
                                <Link href="/" target="_blank" sx={{ display: 'flex', alignItems: 'center' }}>
                                    Open Root <LaunchIcon fontSize="small" sx={{ ml: 0.5 }} />
                                </Link>
                            </TableCell>
                        </TableRow>
                        {config?.Mounts?.map((mount, index) => (
                            <TableRow key={index}>
                                <TableCell sx={{ fontWeight: 'medium', color: 'primary.main' }}>
                                    {mount.path}
                                </TableCell>
                                <TableCell sx={{ fontFamily: 'monospace', fontSize: '0.875rem' }}>
                                    {mount.source_path}
                                </TableCell>
                                <TableCell>
                                    <Link href={mount.path} target="_blank" sx={{ display: 'flex', alignItems: 'center' }}>
                                        Visit <LaunchIcon fontSize="small" sx={{ ml: 0.5 }} />
                                    </Link>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
        </Box>
    );
};

export default Mounts;
