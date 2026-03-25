import { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import {
  Bell, Menu, X, Heart, ChevronDown, User, LogOut,
  Settings, Activity, Calendar, BookOpen, Map, Bot,
} from 'lucide-react';
import { useAuthStore, useUIStore } from '../../store';
import { Avatar } from '../ui/Avatar';
import { SubscriptionBadge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { cn } from '../../utils/cn';

const NAV_LINKS = [
  { to: '/',             label: 'Дашборд',    icon: Activity  },
  { to: '/ai-assistant', label: 'AI-ассистент', icon: Bot     },
  { to: '/doctors',      label: 'Врачи',       icon: User     },
  { to: '/protocols',    label: 'Протоколы',   icon: BookOpen },
  { to: '/appointments', label: 'Записи',      icon: Calendar },
  { to: '/map',          label: 'Карта',        icon: Map     },
];

export function Navbar() {
  const { user, profile, isAuthenticated, logout } = useAuthStore();
  const { notifications, unreadCount, markAllRead, sidebarOpen, toggleSidebar } = useUIStore();
  const navigate = useNavigate();
  const [profileOpen, setProfileOpen] = useState(false);
  const [notifOpen,   setNotifOpen]   = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/auth/login');
    setProfileOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 w-full bg-white/95 backdrop-blur-md border-b border-calm-blue-50 shadow-soft">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">

          {/* Logo */}
          <Link
            to="/"
            className="flex items-center gap-2.5 group shrink-0"
            aria-label="Lumina Health — главная"
          >
            <div className="w-8 h-8 bg-gradient-to-br from-soft-blue to-calm-blue rounded-xl flex items-center justify-center shadow-glow-blue group-hover:scale-105 transition-transform">
              <Heart size={18} className="text-white fill-white" />
            </div>
            <span className="font-display text-xl text-calm-blue hidden sm:block">
              Lumina<span className="text-soft-blue"> Health</span>
            </span>
          </Link>

          {/* Desktop nav */}
          {isAuthenticated && (
            <nav className="hidden lg:flex items-center gap-1" aria-label="Основная навигация">
              {NAV_LINKS.map(({ to, label, icon: Icon }) => (
                <NavLink
                  key={to}
                  to={to}
                  end={to === '/'}
                  className={({ isActive }) =>
                    cn(
                      'flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium font-body transition-all duration-200',
                      isActive
                        ? 'bg-soft-blue-50 text-soft-blue'
                        : 'text-text-muted hover:bg-calm-blue-50 hover:text-calm-blue'
                    )
                  }
                >
                  <Icon size={16} />
                  {label}
                </NavLink>
              ))}
            </nav>
          )}

          {/* Right side */}
          <div className="flex items-center gap-2">
            {isAuthenticated ? (
              <>
                {/* Notifications */}
                <div className="relative">
                  <button
                    onClick={() => { setNotifOpen(!notifOpen); setProfileOpen(false); markAllRead(); }}
                    className="relative p-2 rounded-xl text-text-muted hover:bg-calm-blue-50 hover:text-calm-blue transition-colors"
                    aria-label={`Уведомления${unreadCount > 0 ? ` (${unreadCount})` : ''}`}
                  >
                    <Bell size={20} />
                    {unreadCount > 0 && (
                      <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-warm-coral rounded-full animate-pulse-soft" />
                    )}
                  </button>

                  {notifOpen && (
                    <NotificationsDropdown
                      notifications={notifications}
                      onClose={() => setNotifOpen(false)}
                    />
                  )}
                </div>

                {/* Profile dropdown */}
                <div className="relative">
                  <button
                    onClick={() => { setProfileOpen(!profileOpen); setNotifOpen(false); }}
                    className="flex items-center gap-2 p-1.5 pr-2 rounded-xl hover:bg-calm-blue-50 transition-colors"
                    aria-expanded={profileOpen}
                    aria-haspopup="true"
                  >
                    <Avatar name={profile?.name || user?.email || 'U'} src={profile?.avatarUrl} size="sm" />
                    <ChevronDown
                      size={14}
                      className={cn('text-text-muted transition-transform', profileOpen && 'rotate-180')}
                    />
                  </button>

                  {profileOpen && (
                    <ProfileDropdown
                      name={profile?.name || user?.email || 'Пользователь'}
                      tier={user?.subscriptionTier || 'essential'}
                      role={user?.role || 'patient'}
                      onLogout={handleLogout}
                      onClose={() => setProfileOpen(false)}
                    />
                  )}
                </div>

                {/* Mobile menu toggle */}
                <button
                  className="lg:hidden p-2 rounded-xl text-text-muted hover:bg-calm-blue-50 transition-colors"
                  onClick={toggleSidebar}
                  aria-label="Меню"
                  aria-expanded={sidebarOpen}
                >
                  {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
                </button>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm" onClick={() => navigate('/auth/login')}>
                  Войти
                </Button>
                <Button variant="primary" size="sm" onClick={() => navigate('/auth/register')}>
                  Начать
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile nav drawer */}
      {isAuthenticated && sidebarOpen && (
        <MobileNav links={NAV_LINKS} onClose={() => useUIStore.getState().setSidebarOpen(false)} />
      )}
    </header>
  );
}

// ─── Profile Dropdown ─────────────────────────────────────────────
import type { UserRole, SubscriptionTier as ST } from '../../types';

function ProfileDropdown({
  name, tier, role, onLogout, onClose,
}: {
  name: string; tier: ST; role: UserRole;
  onLogout: () => void; onClose: () => void;
}) {
  const navigate = useNavigate();
  const go = (path: string) => { navigate(path); onClose(); };

  return (
    <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-2xl shadow-card-hover border border-calm-blue-50 py-2 z-50 animate-fade-up">
      <div className="px-4 py-3 border-b border-calm-blue-50">
        <p className="font-semibold text-calm-blue text-sm font-body truncate">{name}</p>
        <div className="mt-1">
          <SubscriptionBadge tier={tier} />
        </div>
      </div>

      <button
        onClick={() => go('/profile')}
        className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-text-primary hover:bg-calm-blue-50 transition-colors font-body"
      >
        <User size={16} className="text-text-muted" /> Мой профиль
      </button>

      {(role === 'expert') && (
        <button
          onClick={() => go('/expert/dashboard')}
          className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-text-primary hover:bg-calm-blue-50 transition-colors font-body"
        >
          <Activity size={16} className="text-text-muted" /> Кабинет эксперта
        </button>
      )}

      {(role === 'reviewer' || role === 'admin') && (
        <button
          onClick={() => go('/admin/review')}
          className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-text-primary hover:bg-calm-blue-50 transition-colors font-body"
        >
          <Settings size={16} className="text-text-muted" /> Этический комитет
        </button>
      )}

      <div className="border-t border-calm-blue-50 mt-1 pt-1">
        <button
          onClick={onLogout}
          className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-warm-coral hover:bg-coral-50 transition-colors font-body"
        >
          <LogOut size={16} /> Выйти
        </button>
      </div>
    </div>
  );
}

// ─── Notifications Dropdown ───────────────────────────────────────
import type { Notification as N } from '../../types';

function NotificationsDropdown({ notifications }: { notifications: N[]; onClose: () => void }) {
  return (
    <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-2xl shadow-card-hover border border-calm-blue-50 py-2 z-50 animate-fade-up">
      <div className="px-4 py-3 border-b border-calm-blue-50">
        <p className="font-semibold text-calm-blue text-sm font-body">Уведомления</p>
      </div>
      {notifications.length === 0 ? (
        <div className="px-4 py-8 text-center">
          <Bell size={24} className="text-calm-blue-100 mx-auto mb-2" />
          <p className="text-sm text-text-muted font-body">Нет новых уведомлений</p>
        </div>
      ) : (
        <div className="max-h-72 overflow-y-auto">
          {notifications.slice(0, 5).map((n) => (
            <div key={n.id} className="px-4 py-3 hover:bg-calm-blue-50 transition-colors">
              <p className="text-sm font-medium text-text-primary font-body">{n.title}</p>
              <p className="text-xs text-text-muted font-body mt-0.5">{n.message}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Mobile Nav ───────────────────────────────────────────────────
function MobileNav({
  links,
  onClose,
}: {
  links: typeof NAV_LINKS;
  onClose: () => void;
}) {
  return (
    <nav className="lg:hidden bg-white border-t border-calm-blue-50 px-4 py-3 flex flex-col gap-1 animate-slide-in">
      {links.map(({ to, label, icon: Icon }) => (
        <NavLink
          key={to}
          to={to}
          end={to === '/'}
          onClick={onClose}
          className={({ isActive }) =>
            cn(
              'flex items-center gap-3 px-4 py-3 rounded-xl text-base font-medium font-body transition-colors',
              isActive
                ? 'bg-soft-blue-50 text-soft-blue'
                : 'text-text-muted hover:bg-calm-blue-50 hover:text-calm-blue'
            )
          }
        >
          <Icon size={20} />
          {label}
        </NavLink>
      ))}
    </nav>
  );
}
