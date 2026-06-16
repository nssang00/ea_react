import { useAuth } from './hooks/useAuth.js';
import LoginPage from './pages/LoginPage.jsx';
import ProjectListPage from './pages/ProjectListPage.jsx';
import WorkbenchPage from './pages/WorkbenchPage.jsx';
import UserManagementPage from './pages/UserManagementPage.jsx';

export default function App() {
  const { user, currentPage } = useAuth();

  if (!user) {
    return <LoginPage />;
  }

  if (currentPage === 'users') {
    return <UserManagementPage />;
  }

  if (currentPage === 'designer') {
    return <WorkbenchPage />;
  }

  return <ProjectListPage />;
}
