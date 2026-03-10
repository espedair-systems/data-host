import React, { useMemo } from 'react';
import {
    Typography,
    Box,
    Grid,
    Chip,
} from '@mui/material';
import { useSearchParams } from 'react-router-dom';
import directoryData from '../data/directory.json';
import DirectoryCard from '../components/DirectoryCard';
import { useDirectoryPreferences } from '../context/DirectoryPreferenceContext';

const Directory: React.FC = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const activeTag = searchParams.get('tag');
    const { preferredCategories } = useDirectoryPreferences();

    const filteredItems = useMemo(() => {
        return directoryData.filter((item: any) => {
            // Case 1: "Preferred" mode - show items that match ANY preferred category
            if (activeTag === 'Preferred') {
                return Array.isArray(item.tags) &&
                    item.tags.some((tag: string) => preferredCategories.includes(tag));
            }

            // Case 2: Standard tag filter (or "All")
            const matchesTags =
                !activeTag ||
                (Array.isArray(item.tags) && item.tags.includes(activeTag));

            return matchesTags;
        });
    }, [activeTag, preferredCategories]);

    const handleClearFilter = () => {
        setSearchParams({});
    };

    return (
        <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Box>
                    <Typography variant="h4" gutterBottom sx={{ fontWeight: 700, mb: 0 }}>
                        {activeTag ? `Registry: ${activeTag}` : 'Registry Directory'}
                    </Typography>
                    <Typography variant="body1" sx={{ color: 'text.secondary' }}>
                        {activeTag
                            ? `Showing items tagged with "${activeTag}"`
                            : 'Discover and manage your data registry items.'}
                    </Typography>
                </Box>
                {activeTag && (
                    <Chip
                        label="Clear Filter"
                        onDelete={handleClearFilter}
                        onClick={handleClearFilter}
                        color="primary"
                        variant="outlined"
                    />
                )}
            </Box>

            <Grid container spacing={3}>
                {filteredItems.map((item) => (
                    <Grid size={{ xs: 12, sm: 6, md: 4 }} key={item.id}>
                        <DirectoryCard item={item} />
                    </Grid>
                ))}
                {filteredItems.length === 0 && (
                    <Grid size={{ xs: 12 }}>
                        <Box sx={{ p: 8, textAlign: 'center', opacity: 0.6 }}>
                            <Typography variant="h5" gutterBottom>No items found.</Typography>
                            <Typography variant="body1">Try selecting a different category from the sidebar.</Typography>
                        </Box>
                    </Grid>
                )}
            </Grid>
        </Box>
    );
};

export default Directory;
