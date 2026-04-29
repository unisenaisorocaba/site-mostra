import { Toaster } from "@/components/ui/toaster"
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import PageNotFound from './lib/PageNotFound';
import { AuthProvider, useAuth } from '@/lib/AuthContext';
import UserNotRegisteredError from '@/components/UserNotRegisteredError';

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
  const { isLoadingAuth, isLoadingPublicSettings, authError, navigateToLogin } = useAuth();

  // Show loading spinner while checking app public settings or auth
  if (isLoadingPublicSettings || isLoadingAuth) {
    return (
      <div className="fixed inset-0 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin"></div>
      </div>
    );
  }

  // Handle authentication errors
  if (authError) {
    if (authError.type === 'user_not_registered') {
      return <UserNotRegisteredError />;
    } else if (authError.type === 'auth_required') {
      // Redirect to login automatically
      navigateToLogin();
      return null;
    }
  }

  // Render the main app
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