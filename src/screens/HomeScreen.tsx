import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Bot, UserSearch, BookOpen, Calendar, Activity,
  Heart, Droplets, Footprints, TrendingUp, ChevronRight,
  Clock, CheckCircle, AlertCircle, Smartphone, ArrowRight,
} from 'lucide-react';

import { Card, CardHeader } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge, SubscriptionBadge } from '../components/ui/Badge';
import { Avatar } from '../components/ui/Avatar';
import { PageLayout } from '../components/layout/PageLayout';
import { useAuthStore, useHealthStore } from '../store';
import { cn } from '../utils/cn';
import type { MoodScore, AppointmentStatus } from '../types';
import { MOOD_EMOJI } from '../types';

// ─── Demo data ─────────────────────────────────────────────────────
const DEMO_APPOINTMENTS = [
  {
    id: '1',
    doctorName: 'Анна Сергеева',
    specialty: 'Кардиолог',
    scheduledAt: new Date(Date.now() + 2 * 86400000).toISOString(),
    status: 'confirmed' as AppointmentStatus,
    avatarUrl: undefined,
  },
  {
    id: '2',
    doctorName: 'Иван Петров',
    specialty: 'Психотерапевт',
    scheduledAt: new Date(Date.now() + 7 * 86400000).toISOString(),
    status: 'scheduled' as AppointmentStatus,
    avatarUrl: undefined,
  },
];

const DEMO_PROTOCOLS = [
  { id: '1', title: 'Управление стрессом', category: 'Психология',    emoji: '🧘', color: 'from-purple-400 to-purple-600' },
  { id: '2', title: 'Здоровое сердце',     category: 'Кардиология',   emoji: '❤️', color: 'from-red-400 to-rose-600'     },
  { id: '3', title: 'Питание при диабете', category: 'Нутрициология', emoji: '🥗', color: 'from-green-400 to-emerald-600' },
  { id: '4', title: 'Утренняя зарядка',    category: 'Реабилитация',  emoji: '🏃', color: 'from-amber-400 to-orange-600'  },
];

// ─── Main Screen ───────────────────────────────────────────────────
export function HomeScreen() {
  const { user, profile } = useAuthStore();
  const isProBono         = user?.subscriptionTier === 'pro_bono';

  return (
    <PageLayout>
      <div className="flex flex-col gap-6 stagger-children">
        <WellnessGreeting name={profile?.name} tier={user?.subscriptionTier ?? 'essential'} />
        <MoodWidget />
        <QuickActionsRow />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 flex flex-col gap-6">
            <HealthSummaryCard />
            <RecommendedProtocols />
          </div>
          <div className="flex flex-col gap-6">
            <UpcomingAppointments />
            {!isProBono && <ProactiveCheckupBanner />}
          </div>
        </div>
      </div>
    </PageLayout>
  );
}

// ─── Wellness Greeting ────────────────────────────────────────────
function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return { text: 'Доброе утро',  emoji: '🌅' };
  if (h < 18) return { text: 'Добрый день',  emoji: '☀️' };
  return              { text: 'Добрый вечер', emoji: '🌙' };
}

function WellnessGreeting({ name, tier }: { name?: string; tier: string }) {
  const { text, emoji } = getGreeting();
  const displayName     = name || 'друг';

  return (
    <div className="flex items-start justify-between">
      <div>
        <h1 className="font-display text-3xl sm:text-4xl text-calm-blue">
          {emoji} {text}, <span className="text-soft-blue">{displayName}</span>
        </h1>
        <p className="text-text-muted font-body mt-1 text-base">
          Как вы себя чувствуете сегодня?
        </p>
      </div>
      <SubscriptionBadge tier={tier as any} />
    </div>
  );
}

// ─── Mood Widget ──────────────────────────────────────────────────
function MoodWidget() {
  const { todayMood, setTodayMood, addMoodLog } = useHealthStore();
  const [selected, setSelected] = useState<MoodScore | null>(todayMood as MoodScore | null);

  const handleSelect = (score: MoodScore) => {
    setSelected(score);
    setTodayMood(score);
    addMoodLog({
      id:        crypto.randomUUID(),
      userId:    'demo',
      moodScore: score,
      createdAt: new Date().toISOString(),
    });
  };

  return (
    <Card className="bg-gradient-to-r from-calm-blue-50 to-soft-blue-50 border border-calm-blue-100">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <p className="font-semibold text-calm-blue font-body">Ваше настроение сегодня:</p>
        <div className="flex items-center gap-2 flex-wrap">
          {(Object.entries(MOOD_EMOJI) as [string, { emoji: string; label: string }][]).map(([score, { emoji, label }]) => {
            const s = parseInt(score) as MoodScore;
            const isActive = selected === s;
            return (
              <button
                key={score}
                onClick={() => handleSelect(s)}
                title={label}
                aria-label={label}
                aria-pressed={isActive}
                className={cn(
                  'flex flex-col items-center gap-0.5 px-3 py-2 rounded-2xl transition-all duration-200 text-2xl',
                  isActive
                    ? 'bg-white shadow-card scale-110'
                    : 'hover:bg-white/70 hover:scale-105 opacity-70 hover:opacity-100'
                )}
              >
                {emoji}
                <span className="text-xs font-body text-text-muted hidden sm:block">{label}</span>
              </button>
            );
          })}
        </div>
        {selected && (
          <p className="text-sm text-text-muted font-body animate-fade-up w-full sm:w-auto">
            Сохранено ✓
          </p>
        )}
      </div>
    </Card>
  );
}

// ─── Quick Actions Row ────────────────────────────────────────────
const QUICK_ACTIONS = [
  {
    label:    'AI-ассистент',
    to:       '/ai-assistant',
    icon:     Bot,
    color:    'bg-soft-blue text-white',
    glow:     'shadow-glow-blue',
    desc:     'Спросить о симптомах',
  },
  {
    label:    'Найти врача',
    to:       '/doctors',
    icon:     UserSearch,
    color:    'bg-calm-blue text-white',
    glow:     '',
    desc:     'Специалисты рядом',
  },
  {
    label:    'Протоколы',
    to:       '/protocols',
    icon:     BookOpen,
    color:    'bg-emerald-500 text-white',
    glow:     '',
    desc:     'Доказательные гайды',
  },
  {
    label:    'Записаться',
    to:       '/appointments',
    icon:     Calendar,
    color:    'bg-warm-coral text-white',
    glow:     'shadow-glow-coral',
    desc:     'Следующий визит',
  },
];

function QuickActionsRow() {
  const navigate = useNavigate();

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
      {QUICK_ACTIONS.map(({ label, to, icon: Icon, color, glow, desc }) => (
        <button
          key={to}
          onClick={() => navigate(to)}
          className={cn(
            'flex flex-col items-center gap-3 p-4 rounded-2xl transition-all duration-200',
            'hover:scale-105 hover:-translate-y-1 active:scale-95',
            'bg-white shadow-card hover:shadow-card-hover',
            'border border-calm-blue-50'
          )}
          aria-label={label}
        >
          <div className={cn('w-12 h-12 rounded-2xl flex items-center justify-center', color, glow)}>
            <Icon size={22} />
          </div>
          <div className="text-center">
            <p className="text-sm font-semibold text-calm-blue font-body">{label}</p>
            <p className="text-xs text-text-muted font-body mt-0.5">{desc}</p>
          </div>
        </button>
      ))}
    </div>
  );
}

// ─── Health Summary Card ──────────────────────────────────────────
const HEALTH_METRICS = [
  {
    id:      'bp',
    label:   'Давление',
    value:   '118/76',
    unit:    'мм рт.ст.',
    icon:    Heart,
    color:   'text-warm-coral',
    bgColor: 'bg-coral-50',
    status:  'norm' as const,
  },
  {
    id:      'sugar',
    label:   'Сахар',
    value:   '5.2',
    unit:    'ммоль/л',
    icon:    Droplets,
    color:   'text-soft-blue',
    bgColor: 'bg-soft-blue-50',
    status:  'norm' as const,
  },
  {
    id:      'steps',
    label:   'Шаги',
    value:   '7 432',
    unit:    'из 10 000',
    icon:    Footprints,
    color:   'text-emerald-500',
    bgColor: 'bg-emerald-50',
    status:  'progress' as const,
  },
  {
    id:      'hr',
    label:   'Пульс',
    value:   '68',
    unit:    'уд/мин',
    icon:    Activity,
    color:   'text-purple-500',
    bgColor: 'bg-purple-50',
    status:  'norm' as const,
  },
];

function HealthSummaryCard() {
  const navigate  = useNavigate();
  const [hasData] = useState(true); // Would come from HealthKit/Google Fit

  if (!hasData) {
    return (
      <Card>
        <CardHeader title="Показатели здоровья" />
        <div className="text-center py-6">
          <Smartphone size={40} className="text-calm-blue-100 mx-auto mb-3" />
          <p className="text-text-muted font-body mb-4">
            Подключите Apple Health или Google Fit, чтобы видеть свои показатели
          </p>
          <Button variant="outline" size="sm">Подключить приложение здоровья</Button>
        </div>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader
        title="Показатели здоровья"
        subtitle="Обновлено сегодня"
        action={
          <Badge variant="green" dot size="sm">В норме</Badge>
        }
      />
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {HEALTH_METRICS.map(({ id, label, value, unit, icon: Icon, color, bgColor }) => (
          <div
            key={id}
            className="flex flex-col gap-2 p-3 rounded-2xl bg-bg-light hover:shadow-soft transition-shadow"
          >
            <div className={cn('w-9 h-9 rounded-xl flex items-center justify-center', bgColor)}>
              <Icon size={18} className={color} />
            </div>
            <div>
              <p className="text-xl font-bold text-text-primary font-body leading-tight">{value}</p>
              <p className="text-xs text-text-muted font-body">{unit}</p>
            </div>
            <p className="text-xs font-semibold text-text-muted font-body">{label}</p>
          </div>
        ))}
      </div>
      <div className="mt-4 flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm text-text-muted font-body">
          <TrendingUp size={14} className="text-green-health" />
          Все показатели в норме. Отличная работа!
        </div>
        <button
          onClick={() => navigate('/health')}
          className="text-xs text-soft-blue font-semibold font-body hover:underline flex items-center gap-1"
        >
          Подробнее <ChevronRight size={13} />
        </button>
      </div>
    </Card>
  );
}

// ─── Recommended Protocols ────────────────────────────────────────
function RecommendedProtocols() {
  const navigate = useNavigate();

  return (
    <Card>
      <CardHeader
        title="Рекомендуем для вас"
        subtitle="На основе вашего профиля здоровья"
        action={
          <button
            onClick={() => navigate('/protocols')}
            className="text-sm text-soft-blue hover:underline font-body flex items-center gap-1"
          >
            Все <ChevronRight size={14} />
          </button>
        }
      />
      <div className="scroll-x flex gap-3 pb-2">
        {DEMO_PROTOCOLS.map((p) => (
          <button
            key={p.id}
            onClick={() => navigate(`/protocols/${p.id}`)}
            className="shrink-0 w-44 group"
            aria-label={`Открыть протокол: ${p.title}`}
          >
            <div
              className={cn(
                'h-28 rounded-2xl flex items-end p-3 mb-2 relative overflow-hidden',
                `bg-gradient-to-br ${p.color}`,
                'group-hover:scale-105 transition-transform duration-200'
              )}
            >
              <span className="absolute top-3 right-3 text-2xl">{p.emoji}</span>
              <span className="text-sm font-semibold text-white font-body leading-tight">
                {p.title}
              </span>
            </div>
            <div className="text-left">
              <p className="text-xs text-text-muted font-body">{p.category}</p>
            </div>
          </button>
        ))}
      </div>
    </Card>
  );
}

// ─── Upcoming Appointments ────────────────────────────────────────
function UpcomingAppointments() {
  const navigate = useNavigate();

  return (
    <Card>
      <CardHeader
        title="Ближайшие записи"
        action={
          <button
            onClick={() => navigate('/appointments')}
            className="text-sm text-soft-blue hover:underline font-body"
          >
            Все
          </button>
        }
      />
      {DEMO_APPOINTMENTS.length === 0 ? (
        <div className="text-center py-4">
          <Calendar size={32} className="text-calm-blue-100 mx-auto mb-2" />
          <p className="text-sm text-text-muted font-body mb-3">Нет предстоящих записей</p>
          <Button variant="outline" size="sm" onClick={() => navigate('/doctors')}>
            Найти врача
          </Button>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {DEMO_APPOINTMENTS.map((appt) => {
            const date = new Date(appt.scheduledAt);
            const dateStr = date.toLocaleDateString('ru', { day: 'numeric', month: 'short' });
            const timeStr = date.toLocaleTimeString('ru', { hour: '2-digit', minute: '2-digit' });

            return (
              <div
                key={appt.id}
                className="flex items-center gap-3 p-3 rounded-xl bg-bg-light hover:bg-calm-blue-50 transition-colors cursor-pointer group"
                onClick={() => navigate('/appointments')}
              >
                <Avatar name={appt.doctorName} size="md" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-text-primary font-body truncate">
                    {appt.doctorName}
                  </p>
                  <p className="text-xs text-text-muted font-body">{appt.specialty}</p>
                  <div className="flex items-center gap-1 mt-0.5">
                    <Clock size={11} className="text-text-muted" />
                    <span className="text-xs text-text-muted font-body">{dateStr}, {timeStr}</span>
                  </div>
                </div>
                <StatusIcon status={appt.status} />
              </div>
            );
          })}
          <Button
            variant="outline"
            size="sm"
            fullWidth
            onClick={() => navigate('/doctors')}
            rightIcon={<ArrowRight size={14} />}
          >
            Записаться ещё
          </Button>
        </div>
      )}
    </Card>
  );
}

function StatusIcon({ status: s }: { status: AppointmentStatus }) {
  if (s === 'confirmed') {
    return <CheckCircle size={16} className="text-green-health shrink-0" />;
  }
  return <AlertCircle size={16} className="text-yellow-health shrink-0" />;
}

// ─── Proactive Checkup Banner ─────────────────────────────────────
function ProactiveCheckupBanner() {
  const navigate  = useNavigate();
  const [visible, setVisible] = useState(true);

  if (!visible) return null;

  return (
    <Card className="bg-gradient-to-br from-soft-blue-50 to-calm-blue-50 border border-soft-blue-100 relative overflow-hidden">
      {/* Decorative circle */}
      <div className="absolute -right-6 -top-6 w-24 h-24 bg-soft-blue/10 rounded-full" />
      <div className="absolute -right-2 -bottom-8 w-32 h-32 bg-calm-blue/5 rounded-full" />

      <button
        onClick={() => setVisible(false)}
        className="absolute top-3 right-3 text-text-muted hover:text-calm-blue text-lg leading-none"
        aria-label="Закрыть"
      >
        ×
      </button>

      <div className="relative">
        <div className="w-10 h-10 bg-white rounded-2xl flex items-center justify-center shadow-soft mb-3">
          <Heart size={20} className="text-warm-coral heartbeat-loader" />
        </div>
        <h3 className="font-display text-base text-calm-blue mb-1">
          Время для чекапа
        </h3>
        <p className="text-sm text-text-muted font-body mb-4">
          Прошло больше 6 месяцев с вашего последнего визита. Небольшая профилактика — залог здоровья.
        </p>
        <Button
          variant="primary"
          size="sm"
          fullWidth
          onClick={() => navigate('/doctors')}
          rightIcon={<ArrowRight size={14} />}
        >
          Найти врача
        </Button>
      </div>
    </Card>
  );
}
