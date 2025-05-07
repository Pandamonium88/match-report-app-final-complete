import { lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { TournamentProvider } from './context/TournamentContext';
import AppShell from './components/AppShell';
import { useAuth } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import ErrorBoundary from './components/ErrorBoundary';
import LoadingSpinner from './components/LoadingSpinner';
import RouteFallback from './components/RouteFallback';

// Lazy-loaded pages
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Login = lazy(() => import('./pages/Login'));
const SignUp = lazy(() => import('./pages/SignUp'));
const Unauthorized = lazy(() => import('./pages/Unauthorized'));
const ProfileSetup = lazy(() => import('./pages/ProfileSetup'));
const MatchReportForm = lazy(() => import('./pages/MatchReportForm'));
const UmpireReportForm = lazy(() => import('./pages/UmpireReportForm'));
const AdminUsers = lazy(() => import('./pages/AdminUsers'));
const Agenda = lazy(() => import('./pages/Agenda'));
const UmpireAppointments = lazy(() => import('./pages/UmpireAppointments'));
const MyDetails = lazy(() => import('./pages/MyDetails'));
const TournamentSettings = lazy(() => import('./pages/TournamentSettings'));
const UploadDraw = lazy(() => import('./pages/UploadDraw'));
const NotFound = lazy(() => import('./pages/NotFound'));

// Shell wrapper with error boundary
function ShellWrapper({ children }) {
  const { role } = useAuth();
  return (
    <ErrorBoundary>
      <AppShell role={role}>
        <div className="text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-900 min-h-screen">
          {children}
        </div>
      </AppShell>
    </ErrorBoundary>
  );
}

function App() {
  return (
    <AuthProvider>
      <TournamentProvider>
        <Router>
          <Suspense fallback={<LoadingSpinner fullScreen />}>
            <Routes>
              {/* Public Routes */}
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<SignUp />} />
              <Route path="/unauthorized" element={<Unauthorized />} />
              
              {/* Protected Routes */}
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <ShellWrapper>
                      <Dashboard />
                    </ShellWrapper>
                  </ProtectedRoute>
                }
              />
              
              <Route
                path="/match-report"
                element={
                  <ProtectedRoute>
                    <ShellWrapper>
                      <MatchReportForm />
                    </ShellWrapper>
                  </ProtectedRoute>
                }
              />
              
              <Route
                path="/umpire-report"
                element={
                  <ProtectedRoute>
                    <ShellWrapper>
                      <UmpireReportForm />
                    </ShellWrapper>
                  </ProtectedRoute>
                }
              />
              
              <Route
                path="/agenda"
                element={
                  <ProtectedRoute>
                    <ShellWrapper>
                      <Agenda />
                    </ShellWrapper>
                  </ProtectedRoute>
                }
              />
              
              <Route
                path="/settings/details"
                element={
                  <ProtectedRoute>
                    <ShellWrapper>
                      <MyDetails />
                    </ShellWrapper>
                  </ProtectedRoute>
                }
              />
              
              {/* Admin-only Routes */}
              <Route
                path="/admin/users"
                element={
                  <ProtectedRoute requireAdmin>
                    <ShellWrapper>
                      <AdminUsers />
                    </ShellWrapper>
                  </ProtectedRoute>
                }
              />
              
              <Route
                path="/admin/appointments"
                element={
                  <ProtectedRoute requireAdmin>
                    <ShellWrapper>
                      <UmpireAppointments />
                    </ShellWrapper>
                  </ProtectedRoute>
                }
              />
              
              <Route
                path="/settings/tournamentadmin"
                element={
                  <ProtectedRoute requireAdmin>
                    <ShellWrapper>
                      <TournamentSettings />
                    </ShellWrapper>
                  </ProtectedRoute>
                }
              />
              
              <Route
                path="/admin/upload"
                element={
                  <ProtectedRoute requireAdmin>
                    <ShellWrapper>
                      <UploadDraw />
                    </ShellWrapper>
                  </ProtectedRoute>
                }
              />
              
              {/* Special Cases */}
              <Route
                path="/profile-setup"
                element={
                  <ProtectedRoute>
                    <ShellWrapper>
                      <ProfileSetup />
                    </ShellWrapper>
                  </ProtectedRoute>
                }
              />
              
              {/* Fallback Routes */}
              <Route path="/" element={<Login />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
        </Router>
      </TournamentProvider>
    </AuthProvider>
  );
}

export default App;