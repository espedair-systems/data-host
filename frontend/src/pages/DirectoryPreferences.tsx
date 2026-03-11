import React from 'react';
import { Link } from 'react-router-dom';
import {
    Save as SaveIcon,
    ChevronRight,
    CheckCircle2,
    AlertTriangle,
    Layout
} from 'lucide-react';
import { useDirectoryPreferences } from '../context/DirectoryPreferenceContext';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle
} from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';

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
        toast.success("Preferences updated", {
            description: `You have selected ${selected.length} categories of interest.`
        });
    };

    const handleSelectAll = () => setSelected(allCategories);
    const handleClearAll = () => setSelected([]);

    return (
        <div className="p-6 space-y-6 max-w-5xl mx-auto">
            <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
                <Link to="/" className="hover:text-foreground transition-colors">Registry</Link>
                <ChevronRight className="h-4 w-4" />
                <span className="text-foreground font-medium">Directory Preferences</span>
            </nav>

            <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 shrink-0">
                <div className="flex items-center gap-4">
                    <div className="p-3 rounded-2xl bg-primary/10 text-primary shadow-sm border border-primary/20">
                        <Layout className="h-10 w-10" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-extrabold tracking-tight text-foreground">Directory Preferences</h1>
                        <p className="text-muted-foreground mt-1 font-medium">
                            Personalize your data registry view by choosing relevant content areas.
                        </p>
                    </div>
                </div>
                <Button
                    onClick={handleSave}
                    className="gap-2 px-6 h-11 rounded-xl shadow-lg shadow-primary/20"
                >
                    <SaveIcon className="h-4 w-4" />
                    Save Selection
                </Button>
            </header>

            <Card className="border-none shadow-xl bg-card/60 backdrop-blur-sm relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -m-12 blur-2xl" />
                <CardHeader className="pb-4 border-b">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div>
                            <CardTitle className="text-xl font-bold">Categories of Interest</CardTitle>
                            <CardDescription>Select the content types that appear in your explorer.</CardDescription>
                        </div>
                        <div className="flex items-center gap-2">
                            <Button variant="ghost" size="sm" onClick={handleSelectAll} className="text-xs font-bold hover:bg-primary/5 hover:text-primary">
                                SELECT ALL
                            </Button>
                            <Separator orientation="vertical" className="h-4" />
                            <Button variant="ghost" size="sm" onClick={handleClearAll} className="text-xs font-bold hover:bg-destructive/5 hover:text-destructive">
                                CLEAR ALL
                            </Button>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="pt-8">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-y-6 gap-x-8">
                        {allCategories.map((category) => (
                            <div key={category} className="flex items-center space-x-3 group animate-in fade-in slide-in-from-left-2 duration-300">
                                <Checkbox
                                    id={`cat - ${category} `}
                                    checked={selected.includes(category)}
                                    onCheckedChange={() => handleToggle(category)}
                                    className="data-[state=checked]:bg-primary h-5 w-5 rounded-md border-2 transition-all hover:border-primary/50"
                                />
                                <Label
                                    htmlFor={`cat - ${category} `}
                                    className="text-base font-medium leading-none cursor-pointer select-none group-hover:text-primary transition-colors"
                                >
                                    {category}
                                </Label>
                            </div>
                        ))}
                    </div>

                    {selected.length === 0 && (
                        <div className="mt-12 p-6 rounded-2xl bg-destructive/5 border border-destructive/20 flex items-start gap-4 animate-in zoom-in-95 duration-500">
                            <div className="p-2 rounded-lg bg-destructive/10 text-destructive shrink-0">
                                <AlertTriangle className="h-5 w-5" />
                            </div>
                            <div className="space-y-1 pt-1 text-sm">
                                <p className="font-bold text-destructive">Viewing Restriction Active</p>
                                <p className="text-destructive/80 leading-relaxed max-w-lg">
                                    Selecting no categories will result in an empty directory view.
                                    We recommend keeping at least 2-3 categories active to stay updated.
                                </p>
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>

            <footer className="pt-4 flex items-center gap-3 text-xs text-muted-foreground/60 font-medium">
                <CheckCircle2 className="h-4 w-4" />
                <span>Changes will be applied instantly to your local profile across all registry nodes.</span>
            </footer>
        </div>
    );
};

export default DirectoryPreferences;
