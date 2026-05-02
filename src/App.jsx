import { Toaster } from "@/components/ui/toaster"
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import PageNotFound from './lib/PageNotFound';
import { AuthProvider, useAuth } from '@/lib/mockAuthContext';
import MockLoginPage from '@/components/MockLoginPage';
import PublicLayout from '@/components/public/PublicLayout';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import Home from '@/pages/Home';
import Projects from '@/pages/Projects';
import ProjectDetail from '@/pages/ProjectDetail';
import PublicPhotos from '@/pages/PublicPhotos';
import Dashboard from '@/pages/Dashboard';
import MyProjects from '@/pages/MyProjects';
import Evaluations from '@/pages/Evaluations';
import MyCriteria from '@/pages/MyCriteria';
import ManagePhotos from '@/pages/ManagePhotos';
import Groups from '@/pages/Groups';
import UserManagement from '@/pages/admin/UserManagement';
import OralSchedule from '@/pages/admin/OralSchedule';

const AuthenticatedApp = () => {
  const { isAuthenticated } = useAuth();

  // Mostra tela de login fake se não autenticado
  if (!isAuthenticated) {
    return <MockLoginPage />;
  }

  return (
    <Routes>
      {/* Public Routes */}
      <Route element={<PublicLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/projetos" element={<Projects />} />
        <Route path="/projetos/:id" element={<ProjectDetail />} />
        <Route path="/fotos" element={<PublicPhotos />} />
      </Route>

      {/* Authenticated Routes */}
      <Route element={<DashboardLayout />}>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/dashboard/projetos" element={<MyProjects />} />
        <Route path="/dashboard/avaliacoes" element={<Evaluations />} />
        <Route path="/dashboard/criterios" element={<MyCriteria />} />
        <Route path="/dashboard/fotos" element={<ManagePhotos />} />
        <Route path="/dashboard/grupos" element={<Groups />} />
        <Route path="/dashboard/usuarios" element={<UserManagement />} />
        <Route path="/dashboard/oral" element={<OralSchedule />} />
      </Route>

      <Route path="*" element={<PageNotFound />} />
    </Routes>
  );
};


function App() {

  return (
    <AuthProvider>
      <QueryClientProvider client={queryClientInstance}>
        <Router>
          <AuthenticatedApp />
        </Router>
        <Toaster />
      </QueryClientProvider>
    </AuthProvider>
  )
}

export default App