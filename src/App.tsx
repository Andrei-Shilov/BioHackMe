import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { Navbar } from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';
import { HomeScreen } from './screens/HomeScreen';
import { LoginScreen } from './screens/auth/LoginScreen';
import { RegisterScreen } from './screens/auth/RegisterScreen';
import { PlaceholderScreen } from './screens/PlaceholderScreen';
import { AIAssistantScreen } from './screens/AIAssistantScreen';
import { DoctorListScreen } from './screens/DoctorListScreen';
import { DoctorProfileScreen } from './screens/DoctorProfileScreen';
import { AppointmentsScreen } from './screens/AppointmentsScreen';
import { ProtocolLibraryScreen } from './screens/ProtocolLibraryScreen';
import { ProtocolDetailScreen } from './screens/ProtocolDetailScreen';
import { ExpertDashboardScreen } from './screens/ExpertDashboardScreen';
import { UserProfileScreen } from './screens/UserProfileScreen';
import { ClinicMapScreen } from './screens/ClinicMapScreen';
import { useAuthStore } from './store';

// ─── Auth Guard ────────────────────────────────────────────────────
function RequireAuth() {
  const { isAuthenticated } = useAuthStore();
  if (!isAuthenticated) return <Navigate to="/auth/login" replace />;
  return <Outlet />;
}

// ─── App Shell (Navbar + main content + Footer) ────────────────────
function AppShell() {
  return (
    <div className="min-h-screen flex flex-col bg-bg-light">
      <Navbar />
      <Outlet />
      <Footer />
    </div>
  );
}

// ─── Root App ──────────────────────────────────────────────────────
export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public auth routes */}
        <Route path="/auth/login"    element={<LoginScreen />}    />
        <Route path="/auth/register" element={<RegisterScreen />} />

        {/* Protected routes wrapped in shell */}
        <Route element={<RequireAuth />}>
          <Route element={<AppShell />}>
            <Route index element={<HomeScreen />} />

            <Route path="/ai-assistant" element={<AIAssistantScreen />} />
            <Route path="/doctors"     element={<DoctorListScreen />}    />
            <Route path="/doctors/:id" element={<DoctorProfileScreen />} />

            <Route path="/protocols"        element={<ProtocolLibraryScreen />} />
            <Route path="/protocols/create" element={<PlaceholderScreen title="Редактор протокола" subtitle="Создайте структурированный медицинский алгоритм" />} />
            <Route path="/protocols/:id"    element={<ProtocolDetailScreen />}  />

            <Route path="/appointments" element={<AppointmentsScreen />} />
            <Route path="/map"     element={<ClinicMapScreen />}    />
            <Route path="/profile" element={<UserProfileScreen />} />
            <Route path="/expert/dashboard" element={<ExpertDashboardScreen />} />
            <Route
              path="/admin/review"
              element={
                <PlaceholderScreen
                  title="Этический комитет"
                  subtitle="Рецензирование протоколов"
                />
              }
            />
          </Route>
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
