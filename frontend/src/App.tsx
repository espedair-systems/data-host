import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Directory from './pages/Directory';
import Mounts from './pages/Mounts';
import Site from './pages/Site';
import Schema from './pages/Schema';
import Config from './pages/Config';
import TableEditor from './pages/TableEditor';
import IngestionPage from './pages/Ingestion';
import LocalIngestion from './pages/LocalIngestion';
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
import GCVEPlatform from './pages/GCVEPlatform';
import SaaSPlatform from './pages/SaaSPlatform';
import GCPIssues from './pages/GCPIssues';
import Environments from './pages/Environments';
import DirectoryPreferences from './pages/DirectoryPreferences';
import Publish from './pages/Publish';
import PublishedSchema from './pages/PublishedSchema';
import PublishedSchemaEditor from './pages/PublishedSchemaEditor';
import TablesPages from './pages/TablesPages';
import Curate from './pages/Curate';
import KnowledgeDashboard from './pages/KnowledgeDashboard';
import Librarian from './pages/Librarian';
import DesignDashboard from './pages/DesignDashboard';
import JsonSchemaViewer from './pages/JsonSchemaViewer';
import Workflows from './pages/Workflows';
import AstroTemplates from './pages/AstroTemplates';
import PlaceholderPage from './pages/Placeholder';
import Home from './pages/Home';
import { ColorModeProvider } from './context/ColorModeContext';
import { DirectoryPreferenceProvider } from './context/DirectoryPreferenceContext';
import { SidebarProvider } from './context/SidebarContext';
const FilesPage = () => (
  <div className="flex flex-col gap-6">
    <h1 className="text-3xl font-bold tracking-tight">Files</h1>
    <div className="p-6 border rounded-xl bg-card text-card-foreground shadow-sm">
      <p className="text-muted-foreground">File directory interface will go here.</p>
    </div>
  </div>
);

const SettingsPage = () => (
  <div className="flex flex-col gap-6">
    <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
    <div className="p-6 border rounded-xl bg-card text-card-foreground shadow-sm">
      <p className="text-muted-foreground">System settings will go here.</p>
    </div>
  </div>
);

function App() {
  return (
    <ColorModeProvider>
      <DirectoryPreferenceProvider>
        <SidebarProvider>
          <BrowserRouter basename="/home">
            <Routes>
              <Route path="/" element={<Layout />}>
                <Route index element={<Home />} />
                <Route path="explore" element={<Directory />} />
                <Route path="publish">
                  <Route index element={<Publish />} />
                  <Route path="dashboard" element={<Publish />} />
                  <Route path="schema-data" element={<PublishedSchema />} />
                  <Route path="schema-data/edit/:asset/:file" element={<PublishedSchemaEditor />} />
                  <Route path="tables-pages" element={<TablesPages />} />
                </Route>
                <Route path="curate" element={<Curate />} />
                <Route path="knowledge">
                  <Route index element={<KnowledgeDashboard />} />
                  <Route path="librarian" element={<Librarian />} />
                </Route>
                <Route path="design">
                  <Route index element={<DesignDashboard />} />
                  <Route path="json-schema" element={<JsonSchemaViewer />} />
                  <Route path="workflows" element={<Workflows />} />
                  <Route path="astro-templates" element={<AstroTemplates />} />
                </Route>
                <Route path="site" element={<Site />} />
                <Route path="schema">
                  <Route index element={<Schema />} />
                  <Route path="edit" element={<TableEditor />} />
                  <Route path="map" element={<MapPage />} />
                </Route>
                <Route path="ingestion" element={<IngestionPage />} />
                <Route path="ingestion/local" element={<LocalIngestion />} />
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
                    <Route path="agents" element={<PlaceholderPage title="GCP Agents" />} />
                    <Route path="environments" element={<Environments />} />
                    <Route path="connections" element={<GCPConnections />} />
                    <Route path="issues" element={<GCPIssues />} />
                  </Route>
                  <Route path="aws">
                    <Route index element={<PlaceholderPage title="AWS Platform" description="AWS Integration is To Be Confirmed (TBC)." />} />
                  </Route>
                  <Route path="snowflake">
                    <Route index element={<PlaceholderPage title="Snowflake" description="Snowflake Integration is To Be Confirmed (TBC)." />} />
                  </Route>
                  <Route path="on-premises">
                    <Route path="databases">
                      <Route path="oracle" element={<OracleDashboard />} />
                      <Route path="mssql" element={<MSSQLDashboard />} />
                      <Route path="mysql" element={<MySQLDashboard />} />
                      <Route path="postgresql" element={<PostgresDashboard />} />
                    </Route>
                  </Route>
                  <Route path="servicenow">
                    <Route path="cmdb" element={<PlaceholderPage title="ServiceNow CMDB" />} />
                  </Route>
                  {/* Legacy routes for compatibility */}
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
        </SidebarProvider>
      </DirectoryPreferenceProvider>
    </ColorModeProvider>
  );
}

export default App;