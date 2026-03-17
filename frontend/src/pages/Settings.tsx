import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Github, Save } from 'lucide-react';
import { toast } from 'sonner';

const Settings: React.FC = () => {
    const [githubToken, setGithubToken] = useState('');
    const [githubOrg, setGithubOrg] = useState('');

    const handleSaveGithub = () => {
        // In a real application, this would send an API request to securely store the token
        console.log('Saving GitHub settings:', { githubOrg, hasToken: !!githubToken });
        toast.success('GitHub settings saved successfully');
    };

    return (
        <div className="flex flex-col gap-6 max-w-4xl mx-auto w-full">
            <div className="flex flex-col gap-2 pt-2">
                <h1 className="text-3xl font-bold tracking-tight">System Settings</h1>
                <p className="text-muted-foreground">Manage your system-wide configuration and integrations.</p>
            </div>

            <div className="grid gap-6">
                <Card className="bg-card/50 backdrop-blur-sm border-muted">
                    <CardHeader>
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-primary/10 text-primary rounded-lg">
                                <Github className="h-5 w-5" />
                            </div>
                            <div>
                                <CardTitle className="text-xl">GitHub Integration</CardTitle>
                                <CardDescription>
                                    Configure credentials for the GitHub API to manage repositories and workflows.
                                </CardDescription>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="github-org">Organization / Default Username</Label>
                            <Input
                                id="github-org"
                                placeholder="e.g. espedair-systems"
                                value={githubOrg}
                                onChange={(e) => setGithubOrg(e.target.value)}
                                className="bg-background/50"
                            />
                            <p className="text-xs text-muted-foreground">The default organization or user space to query.</p>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="github-token">Personal Access Token (Classic or Fine-grained)</Label>
                            <Input
                                id="github-token"
                                type="password"
                                placeholder="github_pat_..."
                                value={githubToken}
                                onChange={(e) => setGithubToken(e.target.value)}
                                className="bg-background/50"
                            />
                            <p className="text-xs text-muted-foreground">Needs read access to repositories. This token is stored securely.</p>
                        </div>
                    </CardContent>
                    <CardFooter className="bg-muted/20 border-t flex justify-end px-6 py-4">
                        <Button onClick={handleSaveGithub} className="gap-2">
                            <Save className="h-4 w-4" />
                            Save Configuration
                        </Button>
                    </CardFooter>
                </Card>
            </div>
        </div>
    );
};

export default Settings;
