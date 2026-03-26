import { lazy, Suspense, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { Navbar } from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';
import { useAuthStore } from './store';
import { restoreSession } from './services/auth';

// ─── Eager (always needed) ──────────────────────────────────────────
import { HomeScreen }    from './screens/HomeScreen';
import { LoginScreen }   from './screens/auth/LoginScreen';
import { RegisterScreen} from './screens/auth/RegisterScreen';

// ─── Lazy (code-split) ─────────────────────────────────────────────
const AIAssistantScreen      = lazy(() => import('./screens/AIAssistantScreen').then((m) => ({ default: m.AIAssistantScreen })));
const DoctorListScreen       = lazy(() => import('./screens/DoctorListScreen').then((m) => ({ default: m.DoctorListScreen })));
const DoctorProfileScreen    = lazy(() => import('./screens/DoctorProfileScreen').then((m) => ({ default: m.DoctorProfileScreen })));
const AppointmentsScreen     = lazy(() => import('./screens/AppointmentsScreen').then((m) => ({ default: m.AppointmentsScreen })));
const ProtocolLibraryScreen  = lazy(() => import('./screens/ProtocolLibraryScreen').then((m) => ({ default: m.ProtocolLibraryScreen })));
const ProtocolDetailScreen   = lazy(() => import('./screens/ProtocolDetailScreen').then((m) => ({ default: m.ProtocolDetailScreen })));
const ProtocolEditorScreen   = lazy(() => import('./screens/ProtocolEditorScreen').then((m) => ({ default: m.ProtocolEditorScreen })));
const ExpertDashboardScreen  = lazy(() => import('./screens/ExpertDashboardScreen').then((m) => ({ default: m.ExpertDashboardScreen })));
const UserProfileScreen      = lazy(() => import('./screens/UserProfileScreen').then((m) => ({ default: m.UserProfileScreen })));
const ClinicMapScreen        = lazy(() => import('./screens/ClinicMapScreen').then((m) => ({ default: m.ClinicMapScreen })));
const AdminReviewScreen      = lazy(() => import('./screens/AdminReviewScreen').then((m) => ({ default: m.AdminReviewScreen })));

// ─── Loading fallback ───────────────────────────────────────────────
function PageLoader() {
  return (
    <div className="flex-1 flex items-center justify-center py-20">
      <div className="flex gap-1.5">
        {[0, 1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="w-1 bg-soft-blue rounded-full animate-pulse-soft"
            style={{ height: `${16 + i * 4}px`, animationDelay: `${i * 0.1}s` }}
          />
        ))}
      </div>
    </div>
  );
}

// ─── Auth Guard ────────────────────────────────────────────────────
function RequireAuth() {
  const { isAuthenticated } = useAuthStore();
  if (!isAuthenticated) return <Navigate to="/auth/login" replace />;
  return <Outlet />;
}

// ─── App Shell ─────────────────────────────────────────────────────
function AppShell() {
  return (
    <div className="min-h-screen flex flex-col bg-bg-light">
      <Navbar />
      <Suspense fallback={<PageLoader />}>
        <Outlet />
      </Suspense>
      <Footer />
    </div>
  );
}

// ─── Root App ──────────────────────────────────────────────────────
export default function App() {
  const { setUser, setProfile } = useAuthStore();

  useEffect(() => {
    if (import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_ANON_KEY) {
      restoreSession().then((data) => {
        if (data) { setUser(data.user); setProfile(data.profile); }
      });
    }
  }, [setUser, setProfile]);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/auth/login"    element={<LoginScreen />}    />
        <Route path="/auth/register" element={<RegisterScreen />} />

        <Route element={<RequireAuth />}>
          <Route element={<AppShell />}>
            <Route index element={<HomeScreen />} />

            <Route path="/ai-assistant" element={<AIAssistantScreen />} />
            <Route path="/doctors"      element={<DoctorListScreen />}   />
            <Route path="/doctors/:id"  element={<DoctorProfileScreen />} />

            <Route path="/protocols"        element={<ProtocolLibraryScreen />} />
            <Route path="/protocols/create" element={<ProtocolEditorScreen />}  />
            <Route path="/protocols/:id"    element={<ProtocolDetailScreen />}  />

            <Route path="/appointments"      element={<AppointmentsScreen />}    />
            <Route path="/map"               element={<ClinicMapScreen />}       />
            <Route path="/profile"           element={<UserProfileScreen />}     />
            <Route path="/expert/dashboard"  element={<ExpertDashboardScreen />} />
            <Route path="/admin/review"      element={<AdminReviewScreen />}     />
          </Route>
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
