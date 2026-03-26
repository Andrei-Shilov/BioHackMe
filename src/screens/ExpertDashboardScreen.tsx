import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Users, DollarSign, Star,
  Calendar, ChevronRight, Plus,
  Clock, CheckCircle, AlertCircle, Eye,
} from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { PageLayout, PageHeader } from '../components/layout/PageLayout';
import { ProgressBar } from '../components/ui/ProgressBar';
import { cn } from '../utils/cn';

// ─── Demo data ─────────────────────────────────────────────────────
const STATS = [
  { id: 's1', label: 'Доход (месяц)',    value: '$2,340',  delta: '+18%',  positive: true,  icon: DollarSign },
  { id: 's2', label: 'Консультации',     value: '42',       delta: '+5',    positive: true,  icon: Calendar   },
  { id: 's3', label: 'Активных пациентов', value: '128',   delta: '+12',   positive: true,  icon: Users      },
  { id: 's4', label: 'Средний рейтинг',  value: '4.9',     delta: '+0.1',  positive: true,  icon: Star       },
];

type ProtocolStatus = 'published' | 'under_review' | 'draft' | 'rejected';

type MyProtocol = {
  id: string; title: string; status: ProtocolStatus;
  purchases: number; revenue: number; rating?: number; updatedAt: string;
};

const MY_PROTOCOLS: MyProtocol[] = [
  { id: 'p1', title: 'Протокол ведения гипертонии I–II степени', status: 'published',     purchases: 1240, revenue: 35960, rating: 4.9, updatedAt: '2024-11-10' },
  { id: 'p3', title: 'Здоровый сон: когнитивные стратегии',      status: 'under_review',  purchases: 0,    revenue: 0,               updatedAt: '2024-11-18' },
  { id: 'p5', title: 'Реабилитация после инфаркта',               status: 'draft',         purchases: 0,    revenue: 0,               updatedAt: '2024-11-20' },
  { id: 'p6', title: 'Диагностика болей в груди (черновик)',      status: 'rejected',      purchases: 0,    revenue: 0,               updatedAt: '2024-10-15' },
];

type Appointment = {
  id: string; patientName: string; time: string; topic: string; isToday: boolean;
};

const UPCOMING: Appointment[] = [
  { id: 'u1', patientName: 'Мария К.',  time: 'Сегодня, 14:00', topic: 'Контроль АД и корректировка терапии', isToday: true  },
  { id: 'u2', patientName: 'Андрей В.', time: 'Сегодня, 16:30', topic: 'Первичная консультация по гипертонии',  isToday: true  },
  { id: 'u3', patientName: 'Светлана Р.', time: 'Завтра, 10:00', topic: 'Результаты Холтер-мониторирования',    isToday: false },
];

const STATUS_CONFIG: Record<ProtocolStatus, { label: string; variant: 'green' | 'default' | 'soft-blue' | 'coral'; icon: typeof CheckCircle }> = {
  published:    { label: 'Опубликован',     variant: 'green',     icon: CheckCircle   },
  under_review: { label: 'На рецензии',     variant: 'soft-blue', icon: Clock         },
  draft:        { label: 'Черновик',        variant: 'default',   icon: Eye           },
  rejected:     { label: 'Отклонён',        variant: 'coral',     icon: AlertCircle   },
};

// ─── Screen ────────────────────────────────────────────────────────
export function ExpertDashboardScreen() {
  const navigate = useNavigate();
  const [tab, setTab] = useState<'overview' | 'protocols' | 'schedule'>('overview');

  const totalRevenue = MY_PROTOCOLS.reduce((s, p) => s + p.revenue, 0);
  const publishedCount = MY_PROTOCOLS.filter((p) => p.status === 'published').length;

  return (
    <PageLayout>
      <PageHeader
        title="Кабинет эксперта"
        subtitle="Аналитика, протоколы и расписание"
        action={
          <Button variant="coral" size="sm" onClick={() => navigate('/protocols/create')}>
            <Plus size={14} /> Новый протокол
          </Button>
        }
      />

      {/* Tabs */}
      <div className="flex gap-1 bg-calm-blue-50 p-1 rounded-xl mb-6">
        {(['overview', 'protocols', 'schedule'] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={cn(
              'flex-1 py-2 rounded-lg text-sm font-semibold font-body transition-all',
              tab === t
                ? 'bg-white text-calm-blue shadow-soft'
                : 'text-text-muted hover:text-calm-blue'
            )}
          >
            {{ overview: 'Обзор', protocols: 'Протоколы', schedule: 'Расписание' }[t]}
          </button>
        ))}
      </div>

      {/* Overview */}
      {tab === 'overview' && (
        <div className="flex flex-col gap-4 animate-fade-up">

          {/* Stats grid */}
          <div className="grid grid-cols-2 gap-3">
            {STATS.map((stat) => (
              <Card key={stat.id} className="text-center">
                <div className="flex items-center justify-center w-9 h-9 rounded-2xl bg-calm-blue-50 mx-auto mb-2">
                  <stat.icon size={18} className="text-calm-blue" />
                </div>
                <p className="font-display text-2xl text-calm-blue">{stat.value}</p>
                <p className="text-xs text-text-muted font-body mt-0.5">{stat.label}</p>
                <span className={cn(
                  'text-xs font-semibold font-body mt-1 inline-block',
                  stat.positive ? 'text-green-health' : 'text-warm-coral'
                )}>
                  {stat.delta}
                </span>
              </Card>
            ))}
          </div>

          {/* Revenue breakdown */}
          <Card>
            <h2 className="font-display text-lg text-calm-blue mb-3">Доходы</h2>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-text-muted font-body">Протоколы</span>
              <span className="font-semibold text-text-primary font-body">
                ${totalRevenue.toLocaleString()}
              </span>
            </div>
            <ProgressBar value={72} label="72% от целевого показателя" className="mb-3" />

            <div className="grid grid-cols-2 gap-2 text-sm font-body">
              <div className="p-2 bg-calm-blue-50 rounded-xl">
                <p className="text-xs text-text-muted">Опубликованных протоколов</p>
                <p className="font-semibold text-calm-blue text-lg">{publishedCount}</p>
              </div>
              <div className="p-2 bg-calm-blue-50 rounded-xl">
                <p className="text-xs text-text-muted">Комиссия платформы</p>
                <p className="font-semibold text-calm-blue text-lg">15%</p>
              </div>
            </div>
          </Card>

          {/* Pro bono */}
          <Card>
            <div className="flex items-center justify-between mb-2">
              <h2 className="font-display text-lg text-calm-blue">Pro bono вклад</h2>
              <Badge variant="green" size="sm">Активен</Badge>
            </div>
            <p className="text-sm text-text-muted font-body mb-3">
              Вы выделяете 2 слота в месяц для пациентов Pro Bono. Текущий месяц: 1/2 использовано.
            </p>
            <ProgressBar value={50} label="1 из 2 слотов" />
          </Card>

          {/* Today's appointments */}
          <Card>
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-display text-lg text-calm-blue">Сегодня</h2>
              <button
                className="text-sm text-soft-blue font-body hover:underline"
                onClick={() => setTab('schedule')}
              >
                Все →
              </button>
            </div>
            {UPCOMING.filter((a) => a.isToday).length === 0 ? (
              <p className="text-sm text-text-muted font-body text-center py-4">Нет приёмов сегодня</p>
            ) : (
              <div className="flex flex-col gap-2">
                {UPCOMING.filter((a) => a.isToday).map((a) => (
                  <AppointmentRow key={a.id} appointment={a} />
                ))}
              </div>
            )}
          </Card>
        </div>
      )}

      {/* Protocols tab */}
      {tab === 'protocols' && (
        <div className="flex flex-col gap-4 animate-fade-up">
          <div className="flex gap-3 justify-end">
            <Button
              variant="coral"
              size="sm"
              onClick={() => navigate('/protocols/create')}
              leftIcon={<Plus size={14} />}
            >
              Создать протокол
            </Button>
          </div>

          {MY_PROTOCOLS.map((p) => (
            <ProtocolRow key={p.id} protocol={p} onView={() => navigate(`/protocols/${p.id}`)} />
          ))}
        </div>
      )}

      {/* Schedule tab */}
      {tab === 'schedule' && (
        <div className="flex flex-col gap-4 animate-fade-up">
          <Card>
            <h2 className="font-display text-lg text-calm-blue mb-3">Предстоящие консультации</h2>
            {UPCOMING.length === 0 ? (
              <p className="text-sm text-text-muted font-body text-center py-6">Нет предстоящих приёмов</p>
            ) : (
              <div className="flex flex-col gap-3">
                {UPCOMING.map((a) => (
                  <AppointmentRow key={a.id} appointment={a} showFull />
                ))}
              </div>
            )}
          </Card>

          <Card>
            <h2 className="font-display text-lg text-calm-blue mb-3">Настройка расписания</h2>
            <p className="text-sm text-text-muted font-body mb-3">
              Установите свои рабочие часы и доступные слоты
            </p>
            <Button variant="outline" size="sm" fullWidth>
              <Calendar size={14} /> Управление слотами
            </Button>
          </Card>
        </div>
      )}
    </PageLayout>
  );
}

// ─── Protocol row ────────────────────────────────────────────────────
function ProtocolRow({ protocol: p, onView }: { protocol: MyProtocol; onView: () => void }) {
  const cfg = STATUS_CONFIG[p.status];
  return (
    <Card breathe className="cursor-pointer" onClick={onView}>
      <div className="flex items-start justify-between gap-2 mb-2">
        <h3 className="font-display text-base text-calm-blue line-clamp-2 flex-1">{p.title}</h3>
        <Badge variant={cfg.variant} size="sm" className="shrink-0">
          <cfg.icon size={10} /> {cfg.label}
        </Badge>
      </div>

      {p.status === 'published' && (
        <div className="flex items-center gap-4 text-sm font-body text-text-muted">
          <span className="flex items-center gap-1"><Users size={13} /> {p.purchases.toLocaleString()} покупок</span>
          <span className="flex items-center gap-1"><DollarSign size={13} /> ${p.revenue.toLocaleString()}</span>
          {p.rating && <span className="flex items-center gap-1"><Star size={13} fill="currentColor" className="text-warm-coral" /> {p.rating}</span>}
        </div>
      )}

      {p.status === 'rejected' && (
        <p className="text-sm text-warm-coral font-body">
          Протокол не прошёл рецензию. Внесите правки и отправьте снова.
        </p>
      )}

      {p.status === 'under_review' && (
        <p className="text-sm text-soft-blue font-body">
          На рассмотрении этического комитета. Обычно 3–5 рабочих дней.
        </p>
      )}

      <div className="flex items-center justify-between mt-3 pt-2 border-t border-calm-blue-50">
        <span className="text-xs text-text-muted font-body">
          Обновлён: {new Date(p.updatedAt).toLocaleDateString('ru', { day: 'numeric', month: 'short' })}
        </span>
        <ChevronRight size={14} className="text-text-muted" />
      </div>
    </Card>
  );
}

// ─── Appointment row ────────────────────────────────────────────────
function AppointmentRow({ appointment: a, showFull }: { appointment: Appointment; showFull?: boolean }) {
  return (
    <div className={cn('flex items-start gap-3 p-3 rounded-xl', a.isToday ? 'bg-emerald-50 border border-emerald-200' : 'bg-calm-blue-50')}>
      <div className="w-8 h-8 rounded-full bg-calm-blue text-white flex items-center justify-center shrink-0 text-xs font-bold font-body">
        {a.patientName.charAt(0)}
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-sm text-text-primary font-body">{a.patientName}</p>
        <p className="text-xs text-text-muted font-body">{a.time}</p>
        {showFull && <p className="text-xs text-text-muted font-body mt-0.5 line-clamp-1">{a.topic}</p>}
      </div>
      {a.isToday && (
        <Button variant="primary" size="sm" className="shrink-0">
          Начать
        </Button>
      )}
    </div>
  );
}
