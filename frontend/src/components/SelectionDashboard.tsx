import React, { useState, useEffect } from 'react';
import {
    Box,
    Typography,
    Paper,
    Chip,
    CircularProgress,
    Stack,
    FormControlLabel,
    Checkbox,
    FormGroup,
    TextField,
    InputAdornment,
    IconButton
} from '@mui/material';
import {
    FilterList as FilterIcon,
    Search as SearchIcon,
    Description as DocIcon,
    Launch as LaunchIcon,
    BookmarkBorder as SectionIcon,
    LocalOffer as TagIcon
} from '@mui/icons-material';

interface GuidelineEntry {
    title: string;
    description: string;
    link: string;
    icon: string;
    tags: string[];
    section: string;
    fileName?: string; // Optinal filename if matched from MDX source
}

interface MDXSource {
    title: string;
    description: string;
    fileName: string;
}

interface SelectionDashboardProps {
    apiUrl: string;
    configUrl: string;
    title: string;
    subtitle: string;
}

const SelectionDashboard: React.FC<SelectionDashboardProps> = ({ apiUrl, configUrl, title, subtitle }) => {
    const [data, setData] = useState<GuidelineEntry[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [search, setSearch] = useState('');
    const [selectedSections, setSelectedSections] = useState<string[]>([]);
    const [selectedTags, setSelectedTags] = useState<string[]>([]);

    useEffect(() => {
        setLoading(true);
        Promise.all([
            fetch(configUrl).then(res => res.json()),
            fetch(apiUrl).then(res => res.json())
        ])
            .then(([rawConfig, mdxData]: [any, MDXSource[]]) => {
                // Normalize config data (Training has it under .codelabs, Guidelines is a plain array)
                const configEntries: GuidelineEntry[] = Array.isArray(rawConfig)
                    ? rawConfig
                    : (rawConfig.codelabs || []);

                // Merge config with MDX source info where links match filename
                const merged = configEntries.map(item => {
                    // Try to match link to filename
                    // Links are often like /guidelines/intro or /training/module
                    const linkPart = item.link.split('/').filter(Boolean).pop();
                    const fileName = linkPart + '.mdx';
                    const source = mdxData.find(m => m.fileName === fileName);

                    return {
                        ...item,
                        // If it's training, the icon might be in appEmoji
                        icon: item.icon || (item as any).appEmoji || '📄',
                        // If it's training, the section might be in appName or we use a default
                        section: item.section || (item as any).appName || 'Uncategorized',
                        fileName: source?.fileName
                    };
                });

                // Add items that are in MDX source but NOT in config as "Drafts"
                const configuredFiles = new Set(merged.map(m => m.fileName));
                const drafts = mdxData
                    .filter(m => !configuredFiles.has(m.fileName))
                    .map(m => ({
                        title: m.title,
                        description: m.description,
                        link: '#',
                        icon: '📝',
                        tags: ['Draft', 'Source Only'],
                        section: 'Designed Docs',
                        fileName: m.fileName
                    }));

                setData([...merged, ...drafts]);
                setLoading(false);
            })
            .catch(err => {
                setError(err.message);
                setLoading(false);
            });
    }, [apiUrl, configUrl]);

    const sections = Array.from(new Set(data.map(item => item.section)));
    const allTags = Array.from(new Set(data.flatMap(item => item.tags)));

    const filteredData = data.filter(item => {
        const matchesSearch = item.title.toLowerCase().includes(search.toLowerCase()) ||
            item.description.toLowerCase().includes(search.toLowerCase()) ||
            item.fileName?.toLowerCase().includes(search.toLowerCase());
        const matchesSection = selectedSections.length === 0 || selectedSections.includes(item.section);
        const matchesTags = selectedTags.length === 0 || selectedTags.some(tag => item.tags.includes(tag));
        return matchesSearch && matchesSection && matchesTags;
    });

    const toggleSection = (section: string) => {
        setSelectedSections(prev =>
            prev.includes(section) ? prev.filter(s => s !== section) : [...prev, section]
        );
    };

    const toggleTag = (tag: string) => {
        setSelectedTags(prev =>
            prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
        );
    };

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
        <Box sx={{ display: 'flex', height: '100%', bgcolor: 'background.default' }}>
            {/* Left Sidebar: Selection Criteria */}
            <Box sx={{
                width: 300,
                borderRight: '1px solid',
                borderColor: 'divider',
                p: 3,
                overflowY: 'auto',
                bgcolor: 'background.paper'
            }}>
                <Stack spacing={4}>
                    <Box>
                        <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1.5, display: 'flex', alignItems: 'center', gap: 1 }}>
                            <FilterIcon fontSize="small" color="primary" /> SEARCH
                        </Typography>
                        <TextField
                            fullWidth
                            size="small"
                            placeholder="Search guidelines or files..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <SearchIcon fontSize="small" />
                                    </InputAdornment>
                                ),
                            }}
                        />
                    </Box>

                    <Box>
                        <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                            <SectionIcon fontSize="small" color="primary" /> CATEGORIES
                        </Typography>
                        <FormGroup>
                            {sections.map(section => (
                                <FormControlLabel
                                    key={section}
                                    control={
                                        <Checkbox
                                            size="small"
                                            checked={selectedSections.includes(section)}
                                            onChange={() => toggleSection(section)}
                                        />
                                    }
                                    label={<Typography variant="body2">{section}</Typography>}
                                />
                            ))}
                        </FormGroup>
                    </Box>

                    <Box>
                        <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                            <TagIcon fontSize="small" color="primary" /> TAGS
                        </Typography>
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                            {allTags.map(tag => (
                                <Chip
                                    key={tag}
                                    label={tag}
                                    size="small"
                                    onClick={() => toggleTag(tag)}
                                    color={selectedTags.includes(tag) ? "primary" : "default"}
                                    variant={selectedTags.includes(tag) ? "filled" : "outlined"}
                                    sx={{ cursor: 'pointer' }}
                                />
                            ))}
                        </Box>
                    </Box>
                </Stack>
            </Box>

            {/* Main Area: Expanded List */}
            <Box sx={{ flexGrow: 1, p: 4, overflowY: 'auto' }}>
                <Box sx={{ mb: 4, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Box>
                        <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>{title}</Typography>
                        <Typography variant="body1" color="text.secondary">
                            {subtitle}
                        </Typography>
                    </Box>
                    <Chip label={`${filteredData.length} matches`} color="primary" variant="outlined" />
                </Box>

                <Stack spacing={2}>
                    {filteredData.map((item, index) => (
                        <Paper
                            key={index}
                            variant="outlined"
                            sx={{
                                p: 3,
                                borderRadius: 2,
                                transition: 'all 0.2s',
                                position: 'relative',
                                borderLeft: item.fileName ? '4px solid' : '1px solid',
                                borderLeftColor: item.section === 'Designed Docs' ? 'warning.main' : 'primary.main',
                                bgcolor: item.section === 'Designed Docs' ? 'action.hover' : 'background.paper',
                                '&:hover': {
                                    borderColor: 'primary.main',
                                    boxShadow: (theme) => `0 4px 12px ${theme.palette.primary.main}15`
                                }
                            }}
                        >
                            <Box sx={{ display: 'flex', gap: 2 }}>
                                <Box sx={{
                                    fontSize: 32,
                                    width: 60,
                                    height: 60,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    bgcolor: 'action.selected',
                                    borderRadius: 2,
                                    opacity: item.section === 'Designed Docs' ? 0.6 : 1
                                }}>
                                    {item.icon}
                                </Box>
                                <Box sx={{ flexGrow: 1 }}>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                        <Box>
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                                <Typography variant="h6" sx={{ fontWeight: 700 }}>{item.title}</Typography>
                                                {item.fileName && (
                                                    <Chip
                                                        label={item.fileName}
                                                        size="small"
                                                        variant="outlined"
                                                        sx={{ height: 20, fontSize: '0.65rem', opacity: 0.7 }}
                                                    />
                                                )}
                                            </Box>
                                            <Typography variant="caption" sx={{ color: 'primary.main', fontWeight: 600, textTransform: 'uppercase' }}>
                                                {item.section}
                                            </Typography>
                                        </Box>
                                        <IconButton
                                            size="small"
                                            component="a"
                                            href={item.link}
                                            target="_blank"
                                            disabled={item.link === '#'}
                                            sx={{ color: 'primary.main' }}
                                        >
                                            <LaunchIcon fontSize="small" />
                                        </IconButton>
                                    </Box>
                                    <Typography variant="body2" color="text.secondary" sx={{ mt: 1, mb: 2, maxWidth: 800 }}>
                                        {item.description}
                                    </Typography>
                                    <Box sx={{ display: 'flex', gap: 1 }}>
                                        {item.tags.map(tag => (
                                            <Chip key={tag} label={tag} size="small" variant="outlined" sx={{ opacity: 0.8, borderRadius: 1 }} />
                                        ))}
                                    </Box>
                                </Box>
                            </Box>
                        </Paper>
                    ))}
                    {filteredData.length === 0 && (
                        <Box sx={{ py: 10, textAlign: 'center', bgcolor: 'action.hover', borderRadius: 2 }}>
                            <DocIcon sx={{ fontSize: 60, color: 'text.disabled', mb: 2 }} />
                            <Typography color="text.secondary" variant="h6">No matches found</Typography>
                            <Typography color="text.disabled" variant="body2">Try adjusting your filters or searching for specific filenames</Typography>
                        </Box>
                    )}
                </Stack>
            </Box>
        </Box>
    );
};

export default SelectionDashboard;
