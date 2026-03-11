import React, { useState, useEffect } from 'react';
import {
    Folder as FolderIcon,
    ChevronRight,
    ChevronDown,
    File as FileIcon,
    Info as DetailsIcon,
    Loader2
} from 'lucide-react';
import { useNavigate, useSearchParams, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

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
        <div className="flex flex-col">
            <Button
                variant="ghost"
                size="sm"
                onClick={handleClick}
                className={cn(
                    "h-8 w-full justify-start px-2 py-1 gap-2 overflow-hidden",
                    level > 0 && "px-2"
                )}
                style={{ paddingLeft: `${level * 12 + 8}px` }}
            >
                <div className="shrink-0 flex items-center justify-center w-4 h-4">
                    {node.isDir ? (
                        <FolderIcon className="h-4 w-4 text-blue-500 fill-blue-500/20" />
                    ) : (
                        <FileIcon className="h-4 w-4 text-muted-foreground" />
                    )}
                </div>
                <span className={cn(
                    "text-sm truncate",
                    node.hasData ? "font-semibold" : "font-normal"
                )}>
                    {node.name}
                </span>
                {(hasChildren || node.hasData) && (
                    <div className="ml-auto shrink-0">
                        {open ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
                    </div>
                )}
            </Button>

            {open && (hasChildren || node.hasData) && (
                <div className="flex flex-col">
                    {node.hasData && (
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => navigate(`/schema?details=${node.path}`)}
                            className={cn(
                                "h-7 w-full justify-start px-2 py-0 gap-2 overflow-hidden",
                                searchParams.get('details') === node.path && !location.pathname.includes('/map')
                                    ? "bg-secondary text-secondary-foreground font-semibold"
                                    : "text-muted-foreground"
                            )}
                            style={{ paddingLeft: `${(level + 1) * 12 + 8}px` }}
                        >
                            <DetailsIcon className="h-3 w-3 shrink-0" />
                            <span className="text-xs">Details</span>
                        </Button>
                    )}
                    {hasChildren && node.children!.map((child) => (
                        <FileTreeItem key={child.path} node={child} level={level + 1} />
                    ))}
                </div>
            )}
        </div>
    );
};

const FileTree: React.FC<FileTreeProps> = ({ apiUrl, title }) => {
    const [tree, setTree] = useState<SchemaNode[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
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
        <div className="flex items-center justify-center p-4">
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
        </div>
    );

    return (
        <div className="w-full flex flex-col">
            {title && (
                <div className="px-3 py-1 text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                    {title}
                </div>
            )}
            <div className="flex flex-col">
                {error ? (
                    <div className="px-3 py-2 text-xs text-destructive">
                        Error: {error}
                    </div>
                ) : tree.length === 0 ? (
                    <div className="px-3 py-2 text-xs text-muted-foreground italic">
                        Empty directory.
                    </div>
                ) : (
                    tree.map((node) => (
                        <FileTreeItem key={node.path} node={node} level={0} />
                    ))
                )}
            </div>
        </div>
    );
};

export default FileTree;
