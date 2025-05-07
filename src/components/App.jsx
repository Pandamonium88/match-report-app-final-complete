import { lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { TournamentProvider } from './context/TournamentContext';
import AppShell from './components/AppShell';
import ProtectedRoute from './components/ProtectedRoute';
import LoadingSpinner from './components/LoadingSpinner';

const Dashboard = lazy(() => import('./pages/Dashboard'));
const Login = lazy(() => import('./pages/Login'));
const SignUp = lazy(() => import('./pages/SignUp'));
const Unauthorized = lazy(() => import('./pages/Unauthorized'));
const MatchReportForm = lazy(() => import('./pages/MatchReportForm'));
const UmpireReportForm = lazy(() => import('./pages/UmpireReportForm'));
const AdminUsers = lazy(() => import('./pages/AdminUsers'));
const Agenda = lazy(() => import('./pages/Agenda'));
const UmpireAppointments = lazy(() => import('./pages/UmpireAppointments'));
const MyDetails = lazy(() => import('./pages/MyDetails'));
const TournamentSettings = lazy(() => import('./pages/TournamentSettings'));
const UploadDraw = lazy(() => import('./pages/UploadDraw'));

function ShellWrapper({ children, role }) {
  return (
    <AppShell role={role}>
      <div className="text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-900 min-h-screen">
        {children}
      </div>
    </AppShell>
  );
}

function App() {
  return (
    <AuthProvider>
      <TournamentProvider>
        <Router>
          <Suspense fallback={<LoadingSpinner fullScreen />}>
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<SignUp />} />
              <Route path="/unauthorized" element={<Unauthorized />} />

              <Route path="/dashboard" element={
                <ProtectedRoute>
                  <ShellWrapper>
                    <Dashboard />
                  </ShellWrapper>
                </ProtectedRoute>
              }/>

              <Route path="/match-report" element={
                <ProtectedRoute>
                  <ShellWrapper>
                    <MatchReportForm />
                  </ShellWrapper>
                </ProtectedRoute>
              }/>

              <Route path="/umpire-report" element={
                <ProtectedRoute>
                  <ShellWrapper>
                    <UmpireReportForm />
                  </ShellWrapper>
                </ProtectedRoute>
              }/>

              <Route path="/admin/users" element={
                <ProtectedRoute requireAdmin>
                  <ShellWrapper>
                    <AdminUsers />
                  </ShellWrapper>
                </ProtectedRoute>
              }/>

              <Route path="/admin/appointments" element={
                <ProtectedRoute requireAdmin>
                  <ShellWrapper>
                    <UmpireAppointments />
                  </ShellWrapper>
                </ProtectedRoute>
              }/>

              <Route path="/agenda" element={
                <ProtectedRoute>
                  <ShellWrapper>
                    <Agenda />
                  </ShellWrapper>
                </ProtectedRoute>
              }/>

              <Route path="/settings/tournamentadmin" element={
                <ProtectedRoute requireAdmin>
                  <ShellWrapper>
                    <TournamentSettings />
                  </ShellWrapper>
                </ProtectedRoute>
              }/>

              <Route path="/settings/details" element={
                <ProtectedRoute>
                  <ShellWrapper>
                    <MyDetails />
                  </ShellWrapper>
                </ProtectedRoute>
              }/>

              <Route path="/admin/upload" element={
                <ProtectedRoute requireAdmin>
                  <ShellWrapper>
                    <UploadDraw />
                  </ShellWrapper>
                </ProtectedRoute>
              }/>

              <Route path="*" element={<Login />} />
            </Routes>
          </Suspense>
        </Router>
      </TournamentProvider>
    </AuthProvider>
  );
}

export default App;