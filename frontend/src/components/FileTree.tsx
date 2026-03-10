import React, { useState, useEffect } from 'react';
import {
    List,
    ListItemButton,
    ListItemIcon,
    ListItemText,
    Collapse,
    CircularProgress,
    Typography,
    Box
} from '@mui/material';
import {
    Folder as FolderIcon,
    ExpandLess,
    ExpandMore,
    Description as FileIcon,
    InfoOutlined as DetailsIcon
} from '@mui/icons-material';
import { useNavigate, useSearchParams, useLocation } from 'react-router-dom';

interface SchemaNode {
    name: string;
    path: string;
    isDir: boolean;
    hasData: boolean;
    children?: SchemaNode[];
}

interface FileTreeProps {
    apiUrl: string;
    title?: string;
}

const FileTreeItem: React.FC<{ node: SchemaNode; level: number }> = ({ node, level }) => {
    const [open, setOpen] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();
    const [searchParams] = useSearchParams();
    const hasChildren = node.children && node.children.length > 0;

    const handleClick = () => {
        if (hasChildren || node.hasData) {
            setOpen(!open);
        }
    };

    return (
        <>
            <ListItemButton
                onClick={handleClick}
                sx={{ pl: level * 2 + 2, py: 0.5 }}
            >
                <ListItemIcon sx={{ minWidth: 32 }}>
                    {node.isDir ? <FolderIcon fontSize="small" color="primary" /> : <FileIcon fontSize="small" />}
                </ListItemIcon>
                <ListItemText
                    primary={node.name}
                    primaryTypographyProps={{
                        variant: 'body2',
                        fontWeight: node.hasData ? 700 : 400
                    }}
                />
                {(hasChildren || node.hasData) ? (open ? <ExpandLess fontSize="small" /> : <ExpandMore fontSize="small" />) : null}
            </ListItemButton>
            {(hasChildren || node.hasData) && (
                <Collapse in={open} timeout="auto" unmountOnExit>
                    <List component="div" disablePadding>
                        {node.hasData && (
                            <ListItemButton
                                onClick={() => navigate(`/schema?details=${node.path}`)}
                                selected={searchParams.get('details') === node.path && !location.pathname.includes('/map')}
                                sx={{ pl: (level + 1) * 2 + 2, py: 0.3 }}
                            >
                                <ListItemIcon sx={{ minWidth: 32 }}>
                                    <DetailsIcon fontSize="small" sx={{ color: 'text.secondary' }} />
                                </ListItemIcon>
                                <ListItemText
                                    primary="Details"
                                    primaryTypographyProps={{
                                        variant: 'caption',
                                        fontWeight: (searchParams.get('details') === node.path && !location.pathname.includes('/map')) ? 700 : 400
                                    }}
                                />
                            </ListItemButton>
                        )}
                        {hasChildren && node.children!.map((child) => (
                            <FileTreeItem key={child.path} node={child} level={level + 1} />
                        ))}
                    </List>
                </Collapse>
            )}
        </>
    );
};

const FileTree: React.FC<FileTreeProps> = ({ apiUrl, title }) => {
    const [tree, setTree] = useState<SchemaNode[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        setLoading(true);
        fetch(apiUrl)
            .then(res => {
                if (!res.ok) throw new Error('Failed to fetch file tree');
                return res.json();
            })
            .then(data => {
                setTree(data);
                setLoading(false);
            })
            .catch(err => {
                setError(err.message);
                setLoading(false);
            });
    }, [apiUrl]);

    if (loading) return (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
            <CircularProgress size={24} />
        </Box>
    );

    return (
        <Box sx={{ width: '100%' }}>
            {title && (
                <Typography variant="overline" sx={{ px: 2, display: 'block', color: 'text.secondary', fontWeight: 700 }}>
                    {title}
                </Typography>
            )}
            {error ? (
                <Typography color="error" variant="caption" sx={{ p: 2, display: 'block' }}>
                    Error: {error}
                </Typography>
            ) : tree.length === 0 ? (
                <Typography variant="caption" sx={{ p: 2, display: 'block', color: 'text.secondary' }}>
                    Empty directory.
                </Typography>
            ) : (
                <List component="div" disablePadding>
                    {tree.map((node) => (
                        <FileTreeItem key={node.path} node={node} level={0} />
                    ))}
                </List>
            )}
        </Box>
    );
};

export default FileTree;
