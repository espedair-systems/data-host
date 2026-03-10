import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Card,
    CardContent,
    CardMedia,
    Typography,
    Chip,
    Box,
    CardActionArea,
} from '@mui/material';

interface DirectoryItem {
    id: string;
    title: string;
    image?: string;
    featured?: boolean;
    internal?: boolean;
    tags?: string[];
    description: string;
    link: string;
}

interface DirectoryCardProps {
    item: DirectoryItem;
}

const DirectoryCard: React.FC<DirectoryCardProps> = ({ item }) => {
    const navigate = useNavigate();
    const [imageError, setImageError] = useState(false);

    // Skip if image is empty string or has failed to load
    const showImage = item.image && item.image !== "" && !imageError;

    return (
        <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            <CardActionArea
                onClick={() => {
                    if (item.internal) {
                        navigate(item.link);
                    } else {
                        window.open(item.link, '_blank');
                    }
                }}
                sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', alignItems: 'stretch' }}
            >
                {showImage && (
                    <CardMedia
                        component="img"
                        height="140"
                        image={item.image!.replace('../', '/')}
                        alt={item.title}
                        onError={() => setImageError(true)}
                        sx={{ objectFit: 'contain', p: 2, bgcolor: 'action.hover' }}
                    />
                )}
                <CardContent sx={{ flexGrow: 1 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                        <Typography gutterBottom variant="h6" component="div" sx={{ mb: 0 }}>
                            {item.title}
                        </Typography>
                        {item.featured && (
                            <Chip label="Featured" size="small" color="primary" sx={{ height: 20 }} />
                        )}
                        {item.internal && (
                            <Chip label="Internal" size="small" color="secondary" sx={{ height: 20 }} />
                        )}
                    </Box>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                        {item.description}
                    </Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                        {item.tags?.map((tag) => (
                            <Chip key={tag} label={tag} size="small" variant="outlined" />
                        ))}
                    </Box>
                </CardContent>
            </CardActionArea>
        </Card>
    );
};

export default DirectoryCard;
