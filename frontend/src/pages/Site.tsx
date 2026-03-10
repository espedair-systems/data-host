import { Box, Typography, Paper, Chip } from '@mui/material';
import { useSearchParams } from 'react-router-dom';
import SchemaDashboard from '../components/SchemaDashboard';
import SelectionDashboard from '../components/SelectionDashboard';
import GuidelineEditor from '../components/GuidelineEditor';
import TrainingEditor from '../components/TrainingEditor';
import { Storage as StorageIcon } from '@mui/icons-material';

const Site: React.FC = () => {
    const [searchParams] = useSearchParams();
    const mode = searchParams.get('mode') || 'view';

    const renderContent = () => {
        switch (mode) {
            case 'guidelines':
                return (
                    <SelectionDashboard
                        configUrl="/api/site/selection"
                        apiUrl="/api/guidelines"
                        title="Guidelines Explorer"
                        subtitle="Discover documentation modules, structural rules, and system guides"
                    />
                );
            case 'categories':
                return (
                    <GuidelineEditor />
                );
            case 'training-categories':
                return (
                    <TrainingEditor />
                );
            case 'training':
                return (
                    <SelectionDashboard
                        configUrl="/api/site/training-selection"
                        apiUrl="/api/training"
                        title="Training Explorer"
                        subtitle="Exploring educational MDX modules for data services"
                    />
                );
            case 'schema':
                const selectedSchema = searchParams.get('schema');
                if (selectedSchema) {
                    return (
                        <Box sx={{ p: 4 }}>
                            <Paper variant="outlined" sx={{ p: 6, textAlign: 'center', borderRadius: 4, bgcolor: 'action.hover' }}>
                                <StorageIcon sx={{ fontSize: 80, color: 'primary.main', mb: 2, opacity: 0.5 }} />
                                <Typography variant="h3" sx={{ fontWeight: 800, textTransform: 'capitalize', mb: 1 }}>
                                    {selectedSchema}
                                </Typography>
                                <Typography variant="h6" color="text.secondary" gutterBottom>
                                    Schema Integrity Check
                                </Typography>
                                <Box sx={{ mt: 4, display: 'inline-flex', gap: 2 }}>
                                    <Chip label="Isolated Preview" color="primary" variant="outlined" />
                                    <Chip label="Data Management" color="secondary" variant="outlined" />
                                    <Chip label="API Synchronization" color="info" variant="outlined" />
                                </Box>
                                <Typography variant="body1" sx={{ mt: 6, fontStyle: 'italic', color: 'text.disabled' }}>
                                    Select components or datasets for this specific schema in the explorer...
                                </Typography>
                            </Paper>
                        </Box>
                    );
                }
                return (
                    <SchemaDashboard />
                );
            case 'view':
            default:
                return (
                    <iframe
                        src="/"
                        title="Internal Site Preview"
                        style={{
                            width: '100%',
                            height: '100%',
                            border: 'none',
                            display: 'block'
                        }}
                    />
                );
        }
    };

    return (
        <Box sx={{
            width: '100%',
            height: 'calc(100vh - 64px)',
            overflow: 'auto',
            bgcolor: 'background.paper',
            position: 'relative'
        }}>
            {renderContent()}
        </Box>
    );
};

export default Site;
