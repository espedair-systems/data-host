import React from 'react';
import {
    Box, Typography, Paper, Breadcrumbs, Link,
    FormGroup, FormControlLabel, Checkbox, Button, Divider
} from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import { Folder as DirectoryIcon, Save as SaveIcon } from '@mui/icons-material';
import { useDirectoryPreferences } from '../context/DirectoryPreferenceContext';

const DirectoryPreferences: React.FC = () => {
    const { allCategories, preferredCategories, setPreferredCategories } = useDirectoryPreferences();
    const [selected, setSelected] = React.useState<string[]>(preferredCategories);

    const handleToggle = (category: string) => {
        setSelected(prev =>
            prev.includes(category)
                ? prev.filter(c => c !== category)
                : [...prev, category]
        );
    };

    const handleSave = () => {
        setPreferredCategories(selected);
    };

    const handleSelectAll = () => setSelected(allCategories);
    const handleClearAll = () => setSelected([]);

    return (
        <Box sx={{ p: 1 }}>
            <Breadcrumbs aria-label="breadcrumb" sx={{ mb: 2 }}>
                <Link component={RouterLink} color="inherit" to="/">Registry</Link>
                <Typography color="text.primary">Directory Preferences</Typography>
            </Breadcrumbs>

            <Box sx={{ mb: 4, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <DirectoryIcon color="primary" sx={{ fontSize: 40 }} />
                    <Box>
                        <Typography variant="h4" sx={{ fontWeight: 700, mb: 0 }}>
                            Directory Preferences
                        </Typography>
                        <Typography variant="body1" sx={{ color: 'text.secondary' }}>
                            Select the categories you want to see in the directory and sidebar.
                        </Typography>
                    </Box>
                </Box>
                <Button
                    variant="contained"
                    startIcon={<SaveIcon />}
                    onClick={handleSave}
                    sx={{ borderRadius: 2 }}
                >
                    Save Changes
                </Button>
            </Box>

            <Paper variant="outlined" sx={{ p: 4, borderRadius: 3 }}>
                <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>Categories of Interest</Typography>
                <Divider sx={{ mb: 3 }} />

                <Box sx={{ mb: 3, display: 'flex', gap: 2 }}>
                    <Button size="small" onClick={handleSelectAll}>Select All</Button>
                    <Button size="small" onClick={handleClearAll}>Clear All</Button>
                </Box>

                <FormGroup sx={{ display: 'flex', flexDirection: 'row', gap: 4 }}>
                    {allCategories.map((category) => (
                        <FormControlLabel
                            key={category}
                            control={
                                <Checkbox
                                    checked={selected.includes(category)}
                                    onChange={() => handleToggle(category)}
                                />
                            }
                            label={category}
                            sx={{ minWidth: 150 }}
                        />
                    ))}
                </FormGroup>

                {selected.length === 0 && (
                    <Typography color="error" sx={{ mt: 2, fontStyle: 'italic' }}>
                        Warning: Selecting no categories will hide all items from the directory.
                    </Typography>
                )}
            </Paper>
        </Box>
    );
};

export default DirectoryPreferences;
