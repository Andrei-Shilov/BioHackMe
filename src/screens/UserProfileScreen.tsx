import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  User, Shield, Download, Trash2, Bell,
  Lock, ChevronRight, LogOut, Eye, EyeOff,
  FileText, Activity, Heart,
} from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge, SubscriptionBadge } from '../components/ui/Badge';
import { Avatar } from '../components/ui/Avatar';
import { Input } from '../components/ui/Input';
import { Modal, ConfirmDialog } from '../components/ui/Modal';
import { PageLayout, PageHeader } from '../components/layout/PageLayout';
import { useAuthStore } from '../store';
import { cn } from '../utils/cn';

// ─── Section types ──────────────────────────────────────────────────
type Section = 'profile' | 'privacy' | 'notifications' | 'security';

type Consent = {
  id: string; label: string; description: string; enabled: boolean;
};

// ─── Screen ────────────────────────────────────────────────────────
export function UserProfileScreen() {
  const navigate    = useNavigate();
  const { user, logout } = useAuthStore();
  const [section,   setSection]   = useState<Section>('profile');
  const [showLogout, setShowLogout] = useState(false);

  const displayName = user?.email?.split('@')[0] ?? 'Пользователь';

  return (
    <PageLayout>
      <PageHeader title="Мой профиль" subtitle="Настройки аккаунта и конфиденциальность" />

      {/* Profile summary */}
      <Card className="mb-6">
        <div className="flex items-center gap-4">
          <Avatar name={displayName} size="xl" />
          <div className="flex-1 min-w-0">
            <h2 className="font-display text-xl text-calm-blue">{displayName}</h2>
            <p className="text-sm text-text-muted font-body">{user?.email}</p>
            <div className="mt-1.5">
              <SubscriptionBadge tier="premium" />
            </div>
          </div>
          <ChevronRight size={18} className="text-text-muted shrink-0" />
        </div>
      </Card>

      {/* Nav */}
      <div className="grid grid-cols-2 gap-2 mb-6">
        {([
          { id: 'profile',       label: 'Профиль',         icon: User    },
          { id: 'privacy',       label: 'Конфиденциальность', icon: Shield },
          { id: 'notifications', label: 'Уведомления',     icon: Bell    },
          { id: 'security',      label: 'Безопасность',    icon: Lock    },
        ] as const).map((item) => (
          <button
            key={item.id}
            onClick={() => setSection(item.id)}
            className={cn(
              'flex items-center gap-2 p-3 rounded-xl border-2 text-sm font-semibold font-body transition-all',
              section === item.id
                ? 'border-soft-blue bg-soft-blue-50 text-soft-blue'
                : 'border-calm-blue-100 text-text-muted hover:border-soft-blue hover:text-soft-blue'
            )}
          >
            <item.icon size={16} /> {item.label}
          </button>
        ))}
      </div>

      {/* Sections */}
      {section === 'profile'       && <ProfileSection       />}
      {section === 'privacy'       && <PrivacySection       />}
      {section === 'notifications' && <NotificationsSection />}
      {section === 'security'      && <SecuritySection      />}

      {/* Logout */}
      <Card className="mt-6">
        <Button
          variant="danger"
          size="md"
          fullWidth
          onClick={() => setShowLogout(true)}
          leftIcon={<LogOut size={16} />}
        >
          Выйти из аккаунта
        </Button>
      </Card>

      <ConfirmDialog
        isOpen={showLogout}
        onClose={() => setShowLogout(false)}
        onConfirm={() => { logout(); navigate('/auth/login'); }}
        title="Выйти?"
        message="Вы уверены, что хотите выйти из аккаунта?"
        confirmText="Выйти"
        danger
      />
    </PageLayout>
  );
}

// ─── Profile section ────────────────────────────────────────────────
function ProfileSection() {
  const { user } = useAuthStore();
  const [name,   setName]   = useState(user?.email?.split('@')[0] ?? '');
  const [phone,  setPhone]  = useState('');
  const [saved,  setSaved]  = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <Card>
      <h3 className="font-display text-lg text-calm-blue mb-4">Личные данные</h3>
      <div className="flex flex-col gap-3">
        <Input label="Имя" value={name} onChange={(e) => setName(e.target.value)} />
        <Input label="Email" value={user?.email ?? ''} disabled hint="Изменить email пока недоступно" />
        <Input label="Телефон" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+7 (___) ___-__-__" />
      </div>

      {/* Health passport summary */}
      <div className="mt-5 pt-4 border-t border-calm-blue-50">
        <h4 className="font-semibold text-sm text-text-primary font-body mb-3">Паспорт здоровья</h4>
        <div className="grid grid-cols-3 gap-2">
          {[
            { icon: <Activity size={14} />, label: 'Метрики',    value: '8 записей' },
            { icon: <Heart size={14} />,    label: 'Настроение', value: '23 дня'    },
            { icon: <FileText size={14} />, label: 'Протоколы',  value: '3 куплено' },
          ].map((item) => (
            <div key={item.label} className="flex flex-col items-center gap-1 p-2 bg-calm-blue-50 rounded-xl text-center">
              <div className="text-calm-blue">{item.icon}</div>
              <p className="text-xs text-text-muted font-body">{item.label}</p>
              <p className="text-xs font-semibold text-text-primary font-body">{item.value}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-4 flex gap-3">
        <Button variant="primary" size="sm" onClick={handleSave}>
          {saved ? '✓ Сохранено' : 'Сохранить'}
        </Button>
      </div>
    </Card>
  );
}

// ─── Data export helper ─────────────────────────────────────────────
function exportUserData(userId: string) {
  const data = {
    exportedAt: new Date().toISOString(),
    userId,
    profile: { name: 'Пользователь', email: 'user@example.com' },
    healthMetrics: [
      { type: 'blood_pressure', value: '120/80', unit: 'mmHg', recordedAt: new Date(Date.now() - 86400000).toISOString() },
      { type: 'weight',        value: '72',      unit: 'kg',   recordedAt: new Date(Date.now() - 86400000).toISOString() },
    ],
    moodLogs: [
      { score: 4, recordedAt: new Date(Date.now() - 3600000).toISOString() },
    ],
    appointments: [],
    consents: { analytics: true, personalisation: true, marketing: false, thirdParty: false },
    dataAccessLog: [
      { actor: 'AI-ассистент', action: 'read health history', timestamp: new Date().toISOString() },
    ],
  };

  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
  a.href     = url;
  a.download = `lumina-health-export-${new Date().toISOString().slice(0, 10)}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

// ─── Privacy section (GDPR/HIPAA) ──────────────────────────────────
function PrivacySection() {
  const [consents, setConsents] = useState<Consent[]>([
    { id: 'c1', label: 'Аналитика использования', description: 'Помогает нам улучшать сервис', enabled: true  },
    { id: 'c2', label: 'Персонализация',           description: 'AI-рекомендации на основе ваших данных', enabled: true  },
    { id: 'c3', label: 'Маркетинговые письма',     description: 'Новости и акции на email', enabled: false },
    { id: 'c4', label: 'Передача данных партнёрам',description: 'Только анонимизированные данные', enabled: false },
  ]);

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showDataLog,     setShowDataLog]     = useState(false);
  const [showAccessLog,   setShowAccessLog]   = useState(false);

  const toggleConsent = (id: string) => {
    setConsents((prev) =>
      prev.map((c) => c.id === id ? { ...c, enabled: !c.enabled } : c)
    );
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Consents */}
      <Card>
        <h3 className="font-display text-lg text-calm-blue mb-4">Согласия и данные</h3>
        <div className="flex flex-col gap-3">
          {consents.map((c) => (
            <div key={c.id} className="flex items-start justify-between gap-3">
              <div className="flex-1">
                <p className="text-sm font-semibold font-body text-text-primary">{c.label}</p>
                <p className="text-xs text-text-muted font-body">{c.description}</p>
              </div>
              <button
                role="switch"
                aria-checked={c.enabled}
                onClick={() => toggleConsent(c.id)}
                className={cn(
                  'relative w-11 h-6 rounded-full transition-colors shrink-0 mt-0.5',
                  c.enabled ? 'bg-soft-blue' : 'bg-calm-blue-100'
                )}
              >
                <span className={cn(
                  'absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform',
                  c.enabled ? 'translate-x-5' : 'translate-x-0'
                )} />
              </button>
            </div>
          ))}
        </div>
      </Card>

      {/* GDPR actions */}
      <Card>
        <h3 className="font-display text-lg text-calm-blue mb-3">Ваши права (GDPR)</h3>
        <div className="flex flex-col gap-2">
          <ActionRow
            icon={<Download size={16} />}
            label="Экспорт данных"
            desc="Скачать все ваши данные в формате JSON"
            onClick={() => exportUserData('demo-user-1')}
          />
          <ActionRow
            icon={<Eye size={16} />}
            label="Журнал доступа к данным"
            desc="Кто и когда обращался к вашим медданным"
            onClick={() => setShowAccessLog(true)}
          />
          <ActionRow
            icon={<FileText size={16} />}
            label="История изменений данных"
            desc="Лог всех операций с вашим аккаунтом"
            onClick={() => setShowDataLog(true)}
          />
          <button
            className="flex items-start gap-3 p-3 rounded-xl hover:bg-red-50 transition-colors text-left w-full"
            onClick={() => setShowDeleteModal(true)}
          >
            <div className="w-8 h-8 rounded-xl bg-red-50 text-warm-coral flex items-center justify-center shrink-0">
              <Trash2 size={16} />
            </div>
            <div>
              <p className="text-sm font-semibold font-body text-warm-coral">Удалить аккаунт</p>
              <p className="text-xs text-text-muted font-body">Удаление всех данных без возможности восстановления</p>
            </div>
          </button>
        </div>
      </Card>

      {/* Access log modal */}
      <Modal isOpen={showAccessLog} onClose={() => setShowAccessLog(false)} title="Журнал доступа к данным">
        <div className="flex flex-col gap-2">
          {[
            { who: 'AI-ассистент', action: 'Чтение истории симптомов', date: '2024-11-20 14:32' },
            { who: 'Анна Сергеева (кардиолог)', action: 'Просмотр профиля здоровья', date: '2024-11-18 10:15' },
            { who: 'Система', action: 'Автоматическое резервное копирование', date: '2024-11-17 03:00' },
          ].map((entry, i) => (
            <div key={i} className="p-3 bg-calm-blue-50 rounded-xl text-sm font-body">
              <p className="font-semibold text-text-primary">{entry.who}</p>
              <p className="text-text-muted text-xs">{entry.action}</p>
              <p className="text-text-muted text-xs">{entry.date}</p>
            </div>
          ))}
        </div>
      </Modal>

      {/* Data log modal */}
      <Modal isOpen={showDataLog} onClose={() => setShowDataLog(false)} title="История изменений">
        <div className="flex flex-col gap-2">
          {[
            { action: 'Обновление настроек уведомлений', date: '2024-11-19 16:45' },
            { action: 'Изменение согласия: аналитика', date: '2024-11-15 11:20' },
            { action: 'Регистрация аккаунта', date: '2024-09-01 09:00' },
          ].map((entry, i) => (
            <div key={i} className="p-3 bg-calm-blue-50 rounded-xl text-sm font-body">
              <p className="font-semibold text-text-primary">{entry.action}</p>
              <p className="text-text-muted text-xs">{entry.date}</p>
            </div>
          ))}
        </div>
      </Modal>

      {/* Delete confirm */}
      <ConfirmDialog
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={() => setShowDeleteModal(false)}
        title="Удалить аккаунт?"
        message="Все ваши данные будут удалены навсегда. Это действие невозможно отменить. Вы уверены?"
        confirmText="Удалить навсегда"
        danger
      />
    </div>
  );
}

// ─── Notifications section ───────────────────────────────────────────
function NotificationsSection() {
  const [settings, setSettings] = useState([
    { id: 'n1', label: 'Напоминания о записях',    desc: 'За 1 час и за 24 часа',   enabled: true  },
    { id: 'n2', label: 'Новые протоколы',           desc: 'По вашим специальностям',  enabled: true  },
    { id: 'n3', label: 'Ответы на вопросы AI',     desc: 'Push-уведомления',          enabled: false },
    { id: 'n4', label: 'Ежемесячный отчёт',        desc: 'Сводка вашего здоровья',   enabled: true  },
  ]);

  const toggle = (id: string) => setSettings((prev) => prev.map((s) => s.id === id ? { ...s, enabled: !s.enabled } : s));

  return (
    <Card>
      <h3 className="font-display text-lg text-calm-blue mb-4">Уведомления</h3>
      <div className="flex flex-col gap-3">
        {settings.map((s) => (
          <div key={s.id} className="flex items-start justify-between gap-3">
            <div>
              <p className="text-sm font-semibold font-body text-text-primary">{s.label}</p>
              <p className="text-xs text-text-muted font-body">{s.desc}</p>
            </div>
            <button
              role="switch"
              aria-checked={s.enabled}
              onClick={() => toggle(s.id)}
              className={cn(
                'relative w-11 h-6 rounded-full transition-colors shrink-0',
                s.enabled ? 'bg-soft-blue' : 'bg-calm-blue-100'
              )}
            >
              <span className={cn(
                'absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform',
                s.enabled ? 'translate-x-5' : 'translate-x-0'
              )} />
            </button>
          </div>
        ))}
      </div>
    </Card>
  );
}

// ─── Security section ────────────────────────────────────────────────
function SecuritySection() {
  const [showPass,    setShowPass]    = useState(false);
  const [currentPass, setCurrentPass] = useState('');
  const [newPass,     setNewPass]     = useState('');
  const [saved,       setSaved]       = useState(false);

  return (
    <Card>
      <h3 className="font-display text-lg text-calm-blue mb-4">Безопасность</h3>
      <div className="flex flex-col gap-3">
        <div className="relative">
          <Input
            label="Текущий пароль"
            type={showPass ? 'text' : 'password'}
            value={currentPass}
            onChange={(e) => setCurrentPass(e.target.value)}
            rightIcon={
              <button onClick={() => setShowPass(!showPass)} className="text-text-muted hover:text-calm-blue">
                {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            }
          />
        </div>
        <Input
          label="Новый пароль"
          type="password"
          value={newPass}
          onChange={(e) => setNewPass(e.target.value)}
          hint="Минимум 8 символов, буквы и цифры"
        />
      </div>

      <div className="mt-4 p-3 bg-calm-blue-50 rounded-xl">
        <p className="text-xs font-semibold text-text-primary font-body mb-1">Двухфакторная аутентификация</p>
        <p className="text-xs text-text-muted font-body mb-2">Дополнительный уровень защиты аккаунта</p>
        <Badge variant="default" size="sm">Недоступно в демо</Badge>
      </div>

      <Button
        variant="primary"
        size="sm"
        className="mt-4"
        onClick={() => { setSaved(true); setTimeout(() => setSaved(false), 2000); }}
      >
        {saved ? '✓ Обновлено' : 'Обновить пароль'}
      </Button>
    </Card>
  );
}

// ─── Action row ──────────────────────────────────────────────────────
function ActionRow({
  icon, label, desc, onClick,
}: {
  icon: React.ReactNode; label: string; desc: string; onClick: () => void;
}) {
  return (
    <button
      className="flex items-start gap-3 p-3 rounded-xl hover:bg-calm-blue-50 transition-colors text-left w-full"
      onClick={onClick}
    >
      <div className="w-8 h-8 rounded-xl bg-calm-blue-50 text-calm-blue flex items-center justify-center shrink-0">
        {icon}
      </div>
      <div className="flex-1">
        <p className="text-sm font-semibold font-body text-text-primary">{label}</p>
        <p className="text-xs text-text-muted font-body">{desc}</p>
      </div>
      <ChevronRight size={16} className="text-text-muted shrink-0 mt-1" />
    </button>
  );
}
