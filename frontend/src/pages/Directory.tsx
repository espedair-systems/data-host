import React, { useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { X, Search, Filter } from 'lucide-react';
import directoryData from '../data/directory.json';
import DirectoryCard from '../components/DirectoryCard';
import { useDirectoryPreferences } from '../context/DirectoryPreferenceContext';
import { Button } from '@/components/ui/button';

const Directory: React.FC = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const activeTag = searchParams.get('tag');
    const { preferredCategories } = useDirectoryPreferences();

    const filteredItems = useMemo(() => {
        return directoryData.filter((item: any) => {
            if (activeTag === 'Preferred') {
                return Array.isArray(item.tags) &&
                    item.tags.some((tag: string) => preferredCategories.includes(tag));
            }

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
        <div className="space-y-8 p-1">
            <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div className="space-y-1">
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-primary/10 text-primary">
                            <Search className="h-5 w-5" />
                        </div>
                        <h1 className="text-3xl font-extrabold tracking-tight">
                            {activeTag ? (
                                <span className="flex items-center gap-2">
                                    Registry <span className="text-primary/40">/</span> {activeTag}
                                </span>
                            ) : (
                                'Registry Directory'
                            )}
                        </h1>
                    </div>
                    <p className="text-muted-foreground text-lg">
                        {activeTag
                            ? `Showing curated items filtered by "${activeTag}"`
                            : 'Discover and manage your distributed data registry infrastructure.'}
                    </p>
                </div>

                {activeTag && (
                    <Button
                        variant="secondary"
                        size="sm"
                        onClick={handleClearFilter}
                        className="rounded-full gap-2 px-4 h-9 font-bold bg-primary/5 hover:bg-primary/10 text-primary border border-primary/20"
                    >
                        <X className="h-4 w-4" />
                        Clear Filter
                    </Button>
                )}
            </header>

            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                {filteredItems.map((item) => (
                    <DirectoryCard key={item.id} item={item} />
                ))}

                {filteredItems.length === 0 && (
                    <div className="col-span-full py-24 flex flex-col items-center justify-center text-center space-y-4">
                        <div className="p-6 rounded-full bg-muted/30 border-2 border-dashed">
                            <Filter className="h-12 w-12 text-muted-foreground/30" />
                        </div>
                        <div className="space-y-1">
                            <h2 className="text-xl font-bold text-foreground">No Results Found</h2>
                            <p className="text-muted-foreground max-w-xs">
                                Try selecting a different category or clearing your current filter to see more items.
                            </p>
                        </div>
                        <Button
                            variant="outline"
                            className="mt-4"
                            onClick={handleClearFilter}
                        >
                            Reset Registry View
                        </Button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Directory;
