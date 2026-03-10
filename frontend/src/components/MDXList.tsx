import React, { useState, useEffect } from 'react';
import {
    Box,
    Typography,
    List,
    ListItem,
    ListItemText,
    Paper,
    CircularProgress,
    Divider,
    Chip
} from '@mui/material';
import {
    MenuBook as BookIcon,
    School as SchoolIcon
} from '@mui/icons-material';

interface MDXItem {
    title: string;
    description: string;
    fileName: string;
}

interface MDXListProps {
    apiUrl: string;
    title: string;
    subtitle: string;
    type: 'guidelines' | 'training';
}

const MDXList: React.FC<MDXListProps> = ({ apiUrl, title, subtitle, type }) => {
    const [items, setItems] = useState<MDXItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        setLoading(true);
        fetch(apiUrl)
            .then(res => {
                if (!res.ok) throw new Error('Failed to fetch content');
                return res.json();
            })
            .then(data => {
                setItems(data);
                setLoading(false);
            })
            .catch(err => {
                setError(err.message);
                setLoading(false);
            });
    }, [apiUrl]);

    if (loading) return (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 8 }}>
            <CircularProgress />
        </Box>
    );

    if (error) return (
        <Box sx={{ p: 4, textAlign: 'center' }}>
            <Typography color="error">Error: {error}</Typography>
        </Box>
    );

    return (
        <Box sx={{ p: 4 }}>
            <Box sx={{ mb: 4, display: 'flex', alignItems: 'center', gap: 2 }}>
                {type === 'training' ? (
                    <SchoolIcon color="primary" sx={{ fontSize: 40 }} />
                ) : (
                    <BookIcon color="primary" sx={{ fontSize: 40 }} />
                )}
                <Box>
                    <Typography variant="h4" sx={{ fontWeight: 700 }}>{title}</Typography>
                    <Typography variant="body1" color="text.secondary">
                        {subtitle}
                    </Typography>
                </Box>
            </Box>

            <Paper variant="outlined" sx={{ borderRadius: 2 }}>
                <List disablePadding>
                    {items.map((item, index) => (
                        <React.Fragment key={item.fileName}>
                            <ListItem sx={{ py: 3, px: 4 }}>
                                <ListItemText
                                    primary={
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
                                            <Typography variant="h6" sx={{ fontWeight: 600 }}>{item.title}</Typography>
                                            <Chip label={item.fileName} size="small" variant="outlined" sx={{ opacity: 0.7 }} />
                                        </Box>
                                    }
                                    secondary={
                                        <Typography variant="body1" color="text.secondary">
                                            {item.description || 'No description provided.'}
                                        </Typography>
                                    }
                                />
                            </ListItem>
                            {index < items.length - 1 && <Divider />}
                        </React.Fragment>
                    ))}
                    {items.length === 0 && (
                        <Box sx={{ p: 8, textAlign: 'center' }}>
                            <Typography color="text.secondary">No items found in the source directory.</Typography>
                        </Box>
                    )}
                </List>
            </Paper>
        </Box>
    );
};

export default MDXList;
