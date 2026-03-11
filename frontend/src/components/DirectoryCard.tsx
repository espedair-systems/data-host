import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Card,
    CardContent,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';


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

    const handleNavigation = () => {
        if (item.internal) {
            navigate(item.link);
        } else {
            window.open(item.link, '_blank');
        }
    };

    return (
        <Card className="h-full flex flex-col group overflow-hidden border-border/50 hover:border-primary/50 transition-colors">
            <div
                className="flex-grow flex flex-col items-stretch cursor-pointer"
                onClick={handleNavigation}
            >
                {showImage && (
                    <div className="h-[140px] flex items-center justify-center p-4 bg-muted/30 group-hover:bg-muted/50 transition-colors">
                        <img
                            src={item.image!.replace('../', '/')}
                            alt={item.title}
                            className="max-h-full max-w-full object-contain"
                            onError={() => setImageError(true)}
                        />
                    </div>
                )}
                <CardContent className="flex-grow p-5">
                    <div className="flex justify-between items-center mb-2 gap-2">
                        <h3 className="text-lg font-semibold leading-tight tracking-tight">
                            {item.title}
                        </h3>
                        <div className="flex gap-1 shrink-0">
                            {item.featured && (
                                <Badge variant="default" className="h-5 px-1.5 text-[10px] uppercase font-bold">
                                    Featured
                                </Badge>
                            )}
                            {item.internal && (
                                <Badge variant="secondary" className="h-5 px-1.5 text-[10px] uppercase font-bold">
                                    Internal
                                </Badge>
                            )}
                        </div>
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-3 mb-4">
                        {item.description}
                    </p>
                    <div className="flex flex-wrap gap-1.5 mt-auto">
                        {item.tags?.map((tag) => (
                            <Badge key={tag} variant="outline" className="font-normal text-xs px-2 py-0">
                                {tag}
                            </Badge>
                        ))}
                    </div>
                </CardContent>
            </div>
        </Card>
    );
};

export default DirectoryCard;
