import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Directory from './pages/Directory';
import Mounts from './pages/Mounts';
import Site from './pages/Site';
import Schema from './pages/Schema';
import Config from './pages/Config';
import TableEditor from './pages/TableEditor';
import IngestionPage from './pages/Ingestion';
import BigQueryDashboard from './pages/BigQueryDashboard';
import GCPConnections from './pages/GCPConnections';
import GCPProjects from './pages/GCPProjects';
import GCSDashboard from './pages/GCSDashboard';
import OracleDashboard from './pages/OracleDashboard';
import OracleIngestion from './pages/OracleIngestion';
import OracleProjects from './pages/OracleProjects';
import PostgresDashboard from './pages/PostgresDashboard';
import PostgresConnections from './pages/PostgresConnections';
import PostgresSchemas from './pages/PostgresSchemas';
import MSSQLDashboard from './pages/MSSQLDashboard';
import MSSQLIngestion from './pages/MSSQLIngestion';
import MSSQLProjects from './pages/MSSQLProjects';
import MySQLDashboard from './pages/MySQLDashboard';
import MySQLIngestion from './pages/MySQLIngestion';
import MySQLProjects from './pages/MySQLProjects';
import MongoDashboard from './pages/MongoDashboard';
import MongoIngestion from './pages/MongoIngestion';
import MongoProjects from './pages/MongoProjects';
import MapPage from './pages/Map';
import GCPPlatform from './pages/GCPPlatform';
import AWSPlatform from './pages/AWSPlatform';
import GCVEPlatform from './pages/GCVEPlatform';
import SaaSPlatform from './pages/SaaSPlatform';
import GCPIssues from './pages/GCPIssues';
import Environments from './pages/Environments';
import DirectoryPreferences from './pages/DirectoryPreferences';
import { Typography, Paper, Box } from '@mui/material';
import { ColorModeProvider } from './context/ColorModeContext';
import { DirectoryPreferenceProvider } from './context/DirectoryPreferenceContext';

const FilesPage = () => (
  <Box>
    <Typography variant="h4" gutterBottom>Files</Typography>
    <Paper sx={{ p: 2 }}><Typography>File directory interface will go here.</Typography></Paper>
  </Box>
);

const SettingsPage = () => (
  <Box>
    <Typography variant="h4" gutterBottom>Settings</Typography>
    <Paper sx={{ p: 2 }}><Typography>System settings will go here.</Typography></Paper>
  </Box>
);

function App() {
  return (
    <ColorModeProvider>
      <DirectoryPreferenceProvider>
        <BrowserRouter basename="/home">
          <Routes>
            <Route path="/" element={<Layout />}>
              <Route index element={<Directory />} />
              <Route path="site" element={<Site />} />
              <Route path="schema">
                <Route index element={<Schema />} />
                <Route path="edit" element={<TableEditor />} />
                <Route path="map" element={<MapPage />} />
              </Route>
              <Route path="ingestion" element={<IngestionPage />} />
              <Route path="ingestion/bigquery">
                <Route index element={<BigQueryDashboard />} />
                <Route path="connections" element={<GCPConnections />} />
                <Route path="projects" element={<GCPProjects />} />
              </Route>
              <Route path="ingestion/gcs">
                <Route index element={<GCSDashboard />} />
                <Route path="connections" element={<GCPConnections />} />
                <Route path="projects" element={<GCPProjects />} />
              </Route>
              <Route path="ingestion/oracle">
                <Route index element={<OracleDashboard />} />
                <Route path="new" element={<OracleIngestion />} />
                <Route path="projects" element={<OracleProjects />} />
              </Route>
              <Route path="ingestion/postgres">
                <Route index element={<PostgresDashboard />} />
                <Route path="connections" element={<PostgresConnections />} />
                <Route path="schemas" element={<PostgresSchemas />} />
              </Route>
              <Route path="ingestion/mssql">
                <Route index element={<MSSQLDashboard />} />
                <Route path="new" element={<MSSQLIngestion />} />
                <Route path="projects" element={<MSSQLProjects />} />
              </Route>
              <Route path="ingestion/mysql">
                <Route index element={<MySQLDashboard />} />
                <Route path="new" element={<MySQLIngestion />} />
                <Route path="projects" element={<MySQLProjects />} />
              </Route>
              <Route path="ingestion/mongo">
                <Route index element={<MongoDashboard />} />
                <Route path="new" element={<MongoIngestion />} />
                <Route path="projects" element={<MongoProjects />} />
              </Route>
              <Route path="platforms">
                <Route path="gcp">
                  <Route index element={<GCPPlatform />} />
                  <Route path="environments" element={<Environments />} />
                  <Route path="connections" element={<GCPConnections />} />
                  <Route path="issues" element={<GCPIssues />} />
                </Route>
                <Route path="aws">
                  <Route index element={<AWSPlatform />} />
                  <Route path="environments" element={<Environments />} />
                  <Route path="connections" element={<GCPConnections />} />
                  <Route path="issues" element={<GCPIssues />} />
                </Route>
                <Route path="gcve">
                  <Route index element={<GCVEPlatform />} />
                  <Route path="environments" element={<Environments />} />
                  <Route path="connections" element={<GCPConnections />} />
                  <Route path="issues" element={<GCPIssues />} />
                </Route>
                <Route path="saas">
                  <Route index element={<SaaSPlatform />} />
                  <Route path="environments" element={<Environments />} />
                  <Route path="connections" element={<GCPConnections />} />
                  <Route path="issues" element={<GCPIssues />} />
                </Route>
              </Route>
              <Route path="environments" element={<Environments />} />
              <Route path="config" element={<Config />} />
              <Route path="settings/directory" element={<DirectoryPreferences />} />
              <Route path="mounts" element={<Mounts />} />
              <Route path="files" element={<FilesPage />} />
              <Route path="settings" element={<SettingsPage />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </DirectoryPreferenceProvider>
    </ColorModeProvider>
  );
}

export default App;