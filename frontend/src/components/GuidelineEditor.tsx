import React, { useState, useEffect } from 'react';
import {
    Box,
    Typography,
    Paper,
    TextField,
    Button,
    Stack,
    IconButton,
    Divider,
    Alert,
    Snackbar,
    CircularProgress,
    List,
    ListItem,
    ListItemButton,
    ListItemIcon,
    ListItemText,
    Chip
} from '@mui/material';
import {
    Save as SaveIcon,
    Add as AddIcon,
    Delete as DeleteIcon,
    Edit as EditIcon,
    Category as CategoryIcon
} from '@mui/icons-material';

interface GuidelineEntry {
    title: string;
    description: string;
    link: string;
    icon: string;
    tags: string[];
    section: string;
}

const GuidelineEditor: React.FC = () => {
    const [data, setData] = useState<GuidelineEntry[]>([]);
    const [editingIndex, setEditingIndex] = useState<number | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({
        open: false,
        message: '',
        severity: 'success'
    });

    useEffect(() => {
        fetch('/api/site/selection')
            .then(res => res.json())
            .then(json => {
                setData(json);
                setLoading(false);
            })
            .catch(err => {
                setError(err.message);
                setLoading(false);
            });
    }, []);

    const handleSave = () => {
        setSaving(true);
        fetch('/api/site/selection', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        })
            .then(res => {
                if (!res.ok) throw new Error('Failed to save data');
                return res.json();
            })
            .then(() => {
                setSnackbar({ open: true, message: 'Changes saved successfully!', severity: 'success' });
                setSaving(false);
            })
            .catch(err => {
                setSnackbar({ open: true, message: err.message, severity: 'error' });
                setSaving(false);
            });
    };

    const handleEntryChange = (index: number, field: keyof GuidelineEntry, value: any) => {
        const newData = [...data];
        if (field === 'tags') {
            newData[index][field] = value.split(',').map((t: string) => t.trim());
        } else {
            (newData[index] as any)[field] = value;
        }
        setData(newData);
    };

    const addEntry = () => {
        const newEntry: GuidelineEntry = {
            title: 'New Guideline',
            description: 'Enter description...',
            link: '#',
            icon: '📖',
            tags: ['New'],
            section: 'Getting Started'
        };
        setData([...data, newEntry]);
        setEditingIndex(data.length);
    };

    const deleteEntry = (index: number) => {
        if (window.confirm('Are you sure you want to delete this entry?')) {
            const newData = data.filter((_, i) => i !== index);
            setData(newData);
            if (editingIndex === index) setEditingIndex(null);
        }
    };

    if (loading) return (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 8 }}>
            <CircularProgress />
        </Box>
    );

    return (
        <Box sx={{ p: 4, height: '100%', overflowY: 'auto' }}>
            <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <CategoryIcon color="primary" sx={{ fontSize: 40 }} />
                    <Box>
                        <Typography variant="h4" sx={{ fontWeight: 700 }}>Guidelines Config Editor</Typography>
                        <Typography variant="body1" color="text.secondary">
                            Managing /src/config/guidelines.json
                        </Typography>
                    </Box>
                </Box>
                <Stack direction="row" spacing={2}>
                    <Button
                        variant="outlined"
                        startIcon={<AddIcon />}
                        onClick={addEntry}
                    >
                        Add Entry
                    </Button>
                    <Button
                        variant="contained"
                        startIcon={saving ? <CircularProgress size={20} color="inherit" /> : <SaveIcon />}
                        disabled={saving}
                        onClick={handleSave}
                    >
                        Save Changes
                    </Button>
                </Stack>
            </Box>

            {error && <Alert severity="error" sx={{ mb: 4 }}>{error}</Alert>}

            <Box sx={{ display: 'flex', gap: 4 }}>
                <Box sx={{ width: '30%' }}>
                    <Paper variant="outlined" sx={{ height: '70vh', overflowY: 'auto' }}>
                        <List>
                            {data.map((item, index) => (
                                <React.Fragment key={index}>
                                    <ListItem
                                        secondaryAction={
                                            <IconButton edge="end" onClick={() => deleteEntry(index)} color="error" size="small">
                                                <DeleteIcon />
                                            </IconButton>
                                        }
                                        disablePadding
                                    >
                                        <ListItemButton
                                            selected={editingIndex === index}
                                            onClick={() => setEditingIndex(index)}
                                        >
                                            <ListItemIcon sx={{ minWidth: 40 }}>{item.icon}</ListItemIcon>
                                            <ListItemText
                                                primary={item.title}
                                                secondary={item.section}
                                                primaryTypographyProps={{ fontWeight: editingIndex === index ? 700 : 400 }}
                                            />
                                        </ListItemButton>
                                    </ListItem>
                                    <Divider />
                                </React.Fragment>
                            ))}
                        </List>
                    </Paper>
                </Box>

                <Box sx={{ flexGrow: 1 }}>
                    {editingIndex !== null ? (
                        <Paper variant="outlined" sx={{ p: 4 }}>
                            <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <EditIcon color="primary" /> Editing Entry: {data[editingIndex].title}
                            </Typography>
                            <Divider sx={{ mb: 3 }} />

                            <Stack spacing={3}>
                                <Stack direction="row" spacing={2}>
                                    <TextField
                                        label="Title"
                                        fullWidth
                                        value={data[editingIndex].title}
                                        onChange={(e) => handleEntryChange(editingIndex, 'title', e.target.value)}
                                    />
                                    <TextField
                                        label="Icon (Emoji)"
                                        sx={{ width: 120 }}
                                        value={data[editingIndex].icon}
                                        onChange={(e) => handleEntryChange(editingIndex, 'icon', e.target.value)}
                                    />
                                </Stack>

                                <TextField
                                    label="Description"
                                    fullWidth
                                    multiline
                                    rows={3}
                                    value={data[editingIndex].description}
                                    onChange={(e) => handleEntryChange(editingIndex, 'description', e.target.value)}
                                />

                                <Stack direction="row" spacing={2}>
                                    <TextField
                                        label="Link Path"
                                        fullWidth
                                        value={data[editingIndex].link}
                                        onChange={(e) => handleEntryChange(editingIndex, 'link', e.target.value)}
                                    />
                                    <TextField
                                        label="Category/Section"
                                        fullWidth
                                        value={data[editingIndex].section}
                                        onChange={(e) => handleEntryChange(editingIndex, 'section', e.target.value)}
                                    />
                                </Stack>

                                <TextField
                                    label="Tags (Comma separated)"
                                    fullWidth
                                    value={data[editingIndex].tags.join(', ')}
                                    onChange={(e) => handleEntryChange(editingIndex, 'tags', e.target.value)}
                                />

                                <Box>
                                    <Typography variant="caption" color="text.secondary">Tag Preview:</Typography>
                                    <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
                                        {data[editingIndex].tags.map((tag, idx) => (
                                            <Chip key={idx} label={tag} size="small" />
                                        ))}
                                    </Stack>
                                </Box>
                            </Stack>
                        </Paper>
                    ) : (
                        <Box sx={{
                            height: '50vh',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            border: '2px dashed',
                            borderColor: 'divider',
                            borderRadius: 2
                        }}>
                            <CategoryIcon sx={{ fontSize: 60, color: 'text.disabled', mb: 2 }} />
                            <Typography color="text.secondary">Select an entry from the list to start editing</Typography>
                        </Box>
                    )}
                </Box>
            </Box>

            <Snackbar
                open={snackbar.open}
                autoHideDuration={6000}
                onClose={() => setSnackbar({ ...snackbar, open: false })}
            >
                <Alert severity={snackbar.severity} sx={{ width: '100%' }}>
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </Box>
    );
};

export default GuidelineEditor;
