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
    Chip,
    Tabs,
    Tab
} from '@mui/material';
import {
    Save as SaveIcon,
    Add as AddIcon,
    Delete as DeleteIcon,
    Edit as EditIcon,
    Category as CategoryIcon,
    School as CodelabIcon,
    Badge as RoleIcon
} from '@mui/icons-material';

interface TrainingCategory {
    id: string;
    title: string;
    emoji: string;
    description: string;
}

interface TrainingRole {
    id: string;
    title: string;
    emoji: string;
}

interface CodelabEntry {
    title: string;
    description: string;
    link: string;
    appEmoji: string;
    appName: string;
    duration: string;
    date: string;
    tags: string[];
}

interface TrainingConfig {
    categories: TrainingCategory[];
    roles: TrainingRole[];
    codelabs: CodelabEntry[];
}

const TrainingEditor: React.FC = () => {
    const [config, setConfig] = useState<TrainingConfig | null>(null);
    const [tab, setTab] = useState(0); // 0: Codelabs, 1: Categories, 2: Roles
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
        fetch('/api/site/training-selection')
            .then(res => {
                if (!res.ok) throw new Error('Failed to fetch training config');
                return res.json();
            })
            .then(json => {
                setConfig(json);
                setLoading(false);
            })
            .catch(err => {
                setError(err.message);
                setLoading(false);
            });
    }, []);

    const handleSave = () => {
        if (!config) return;
        setSaving(true);
        fetch('/api/site/training-selection', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(config)
        })
            .then(res => {
                if (!res.ok) throw new Error('Failed to save training config');
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

    const handleTabChange = (_: any, newValue: number) => {
        setTab(newValue);
        setEditingIndex(null);
    };

    const getCurrentArray = (): (CodelabEntry | TrainingCategory | TrainingRole)[] => {
        if (!config) return [];
        if (tab === 0) return config.codelabs;
        if (tab === 1) return config.categories;
        return config.roles;
    };

    const updateCurrentArray = (newArr: any[]) => {
        if (!config) return;
        const newConfig = { ...config };
        if (tab === 0) newConfig.codelabs = newArr as CodelabEntry[];
        else if (tab === 1) newConfig.categories = newArr as TrainingCategory[];
        else newConfig.roles = newArr as TrainingRole[];
        setConfig(newConfig);
    };

    const handleEntryChange = (index: number, field: string, value: any) => {
        const arr = [...getCurrentArray()] as any[];
        if (field === 'tags') {
            arr[index][field] = value.split(',').map((t: string) => t.trim());
        } else {
            arr[index][field] = value;
        }
        updateCurrentArray(arr);
    };

    const addEntry = () => {
        if (!config) return;
        const arr = [...getCurrentArray()] as any[];
        let newEntry;
        if (tab === 0) {
            newEntry = {
                title: 'New Module',
                description: 'Description...',
                link: '#',
                appEmoji: '📚',
                appName: 'Level',
                duration: '10 min',
                date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
                tags: []
            };
        } else if (tab === 1) {
            newEntry = { id: 'new-cat', title: 'New Category', emoji: '📁', description: '' };
        } else {
            newEntry = { id: 'new-role', title: 'New Role', emoji: '👤' };
        }
        arr.push(newEntry);
        updateCurrentArray(arr);
        setEditingIndex(arr.length - 1);
    };

    const deleteEntry = (index: number) => {
        if (window.confirm('Delete this item?')) {
            const arr = getCurrentArray().filter((_, i) => i !== index);
            updateCurrentArray(arr);
            if (editingIndex === index) setEditingIndex(null);
        }
    };

    if (loading) return (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 8 }}>
            <CircularProgress />
        </Box>
    );

    if (!config) return (
        <Box sx={{ p: 4 }}>
            <Alert severity="error" onClose={() => window.location.reload()}>
                {error || 'No configuration loaded. Check backend connectivity.'}
            </Alert>
        </Box>
    );

    const items = getCurrentArray();

    return (
        <Box sx={{ p: 4, height: '100%', overflowY: 'auto' }}>
            <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <CategoryIcon color="primary" sx={{ fontSize: 40 }} />
                    <Box>
                        <Typography variant="h4" sx={{ fontWeight: 700 }}>Training Config Editor</Typography>
                        <Typography variant="body1" color="text.secondary">
                            Managing /src/config/training.json
                        </Typography>
                    </Box>
                </Box>
                <Stack direction="row" spacing={2}>
                    <Button variant="outlined" startIcon={<AddIcon />} onClick={addEntry}>Add Item</Button>
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

            <Tabs value={tab} onChange={handleTabChange} sx={{ mb: 3 }}>
                <Tab icon={<CodelabIcon />} iconPosition="start" label="Modules (Codelabs)" />
                <Tab icon={<CategoryIcon />} iconPosition="start" label="Categories" />
                <Tab icon={<RoleIcon />} iconPosition="start" label="Roles" />
            </Tabs>

            <Box sx={{ display: 'flex', gap: 4 }}>
                <Box sx={{ width: '30%' }}>
                    <Paper variant="outlined" sx={{ height: '65vh', overflowY: 'auto' }}>
                        <List>
                            {items.map((item: any, index: number) => (
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
                                            <ListItemIcon sx={{ minWidth: 40 }}>{item.emoji || item.appEmoji}</ListItemIcon>
                                            <ListItemText
                                                primary={item.title}
                                                secondary={item.id || item.appName}
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
                                <EditIcon color="primary" /> Editing {tab === 0 ? 'Module' : (tab === 1 ? 'Category' : 'Role')}: {items[editingIndex].title}
                            </Typography>
                            <Divider sx={{ mb: 3 }} />

                            <Stack spacing={3}>
                                {tab === 0 ? (
                                    <>
                                        <Stack direction="row" spacing={2}>
                                            <TextField
                                                label="Title"
                                                fullWidth
                                                value={(items[editingIndex] as CodelabEntry).title}
                                                onChange={(e) => handleEntryChange(editingIndex, 'title', e.target.value)}
                                            />
                                            <TextField
                                                label="Badge Emoji"
                                                sx={{ width: 120 }}
                                                value={(items[editingIndex] as CodelabEntry).appEmoji}
                                                onChange={(e) => handleEntryChange(editingIndex, 'appEmoji', e.target.value)}
                                            />
                                        </Stack>
                                        <TextField
                                            label="Description"
                                            fullWidth
                                            multiline
                                            rows={2}
                                            value={(items[editingIndex] as CodelabEntry).description}
                                            onChange={(e) => handleEntryChange(editingIndex, 'description', e.target.value)}
                                        />
                                        <Stack direction="row" spacing={2}>
                                            <TextField
                                                label="Link Path"
                                                fullWidth
                                                value={(items[editingIndex] as CodelabEntry).link}
                                                onChange={(e) => handleEntryChange(editingIndex, 'link', e.target.value)}
                                            />
                                            <TextField
                                                label="Level Label"
                                                fullWidth
                                                value={(items[editingIndex] as CodelabEntry).appName}
                                                onChange={(e) => handleEntryChange(editingIndex, 'appName', e.target.value)}
                                            />
                                        </Stack>
                                        <Stack direction="row" spacing={2}>
                                            <TextField
                                                label="Duration (e.g. 15 min)"
                                                fullWidth
                                                value={(items[editingIndex] as CodelabEntry).duration}
                                                onChange={(e) => handleEntryChange(editingIndex, 'duration', e.target.value)}
                                            />
                                            <TextField
                                                label="Last Updated Date"
                                                fullWidth
                                                value={(items[editingIndex] as CodelabEntry).date}
                                                onChange={(e) => handleEntryChange(editingIndex, 'date', e.target.value)}
                                            />
                                        </Stack>
                                        <TextField
                                            label="Tags (Comma separated ids/tags)"
                                            fullWidth
                                            value={(items[editingIndex] as CodelabEntry).tags.join(', ')}
                                            onChange={(e) => handleEntryChange(editingIndex, 'tags', e.target.value)}
                                        />
                                        <Box>
                                            <Typography variant="caption" color="text.secondary">Tag Preview:</Typography>
                                            <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
                                                {(items[editingIndex] as CodelabEntry).tags.map((tag, idx) => (
                                                    <Chip key={idx} label={tag} size="small" />
                                                ))}
                                            </Stack>
                                        </Box>
                                    </>
                                ) : (
                                    <>
                                        <Stack direction="row" spacing={2}>
                                            <TextField
                                                label="ID"
                                                fullWidth
                                                value={(items[editingIndex] as (TrainingCategory | TrainingRole)).id}
                                                onChange={(e) => handleEntryChange(editingIndex, 'id', e.target.value)}
                                            />
                                            <TextField
                                                label="Title"
                                                fullWidth
                                                value={(items[editingIndex] as (TrainingCategory | TrainingRole)).title}
                                                onChange={(e) => handleEntryChange(editingIndex, 'title', e.target.value)}
                                            />
                                            <TextField
                                                label="Emoji"
                                                sx={{ width: 120 }}
                                                value={(items[editingIndex] as (TrainingCategory | TrainingRole)).emoji}
                                                onChange={(e) => handleEntryChange(editingIndex, 'emoji', e.target.value)}
                                            />
                                        </Stack>
                                        {tab === 1 && (
                                            <TextField
                                                label="Description"
                                                fullWidth
                                                multiline
                                                value={(items[editingIndex] as TrainingCategory).description}
                                                onChange={(e) => handleEntryChange(editingIndex, 'description', e.target.value)}
                                            />
                                        )}
                                    </>
                                )}
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
                            <CodelabIcon sx={{ fontSize: 60, color: 'text.disabled', mb: 2 }} />
                            <Typography color="text.secondary">Select a training item to start editing</Typography>
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

export default TrainingEditor;
