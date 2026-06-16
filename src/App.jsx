import { Toaster } from "@/components/ui/toaster"
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import PageNotFound from './lib/PageNotFound';
import { AuthProvider, useAuth } from '@/lib/AuthContext';
import LoginPage from '@/components/LoginPage';
import CategoryManagement from '@/pages/admin/CategoryManagement';
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
import Profile from '@/pages/Profile';
import VisitorsManagement from '@/pages/admin/VisitorsManagement';
import Assignments from '@/pages/Assignments';

const AuthenticatedApp = () => {
  const { isAuthenticated, isLoadingAuth } = useAuth();

  if (isLoadingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <Routes>
      {/* Public Routes */}
      <Route element={<PublicLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/projetos" element={<Projects />} />
        <Route path="/projetos/:id" element={<ProjectDetail />} />
        <Route path="/fotos" element={<PublicPhotos />} />
        <Route path="/login" element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <LoginPage />} />
      </Route>

      {/* Authenticated Routes */}
      <Route element={isAuthenticated ? <DashboardLayout /> : <Navigate to="/login" replace />}>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/dashboard/projetos" element={<MyProjects />} />
        <Route path="/dashboard/categorias" element={<CategoryManagement />} />
        <Route path="/dashboard/avaliacoes" element={<Evaluations />} />
        <Route path="/dashboard/atribuicoes" element={<Assignments />} />
        <Route path="/dashboard/criterios" element={<MyCriteria />} />
        <Route path="/dashboard/fotos" element={<ManagePhotos />} />
        <Route path="/dashboard/grupos" element={<Groups />} />
        <Route path="/dashboard/usuarios" element={<UserManagement />} />
        <Route path="/dashboard/oral" element={<OralSchedule />} />
        <Route path="/dashboard/perfil" element={<Profile />} />
        <Route path="/dashboard/visitantes" element={<VisitorsManagement />} />
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