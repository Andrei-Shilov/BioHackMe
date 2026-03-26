import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Calendar, Clock, Video, ChevronRight,
  X, RotateCcw, MessageSquare, FileText,
} from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Avatar } from '../components/ui/Avatar';
import { PageLayout, PageHeader } from '../components/layout/PageLayout';
import { Modal, ConfirmDialog } from '../components/ui/Modal';
import { cn } from '../utils/cn';

// ─── Types ─────────────────────────────────────────────────────────
type AppointmentStatus = 'upcoming' | 'completed' | 'cancelled';

type Appointment = {
  id: string;
  doctorName: string;
  doctorSpecialty: string;
  doctorId: string;
  date: Date;
  time: string;
  status: AppointmentStatus;
  type: 'video' | 'in-person';
  price: number;
  notes?: string;
  summary?: string;
};

// ─── Demo data ─────────────────────────────────────────────────────
const DEMO_APPOINTMENTS: Appointment[] = [
  {
    id: 'a1',
    doctorName: 'Анна Сергеева',
    doctorSpecialty: 'Кардиолог',
    doctorId: '1',
    date: new Date(Date.now() + 3 * 3600000),
    time: new Date(Date.now() + 3 * 3600000).toLocaleTimeString('ru', { hour: '2-digit', minute: '2-digit' }),
    status: 'upcoming',
    type: 'video',
    price: 89,
  },
  {
    id: 'a2',
    doctorName: 'Иван Петров',
    doctorSpecialty: 'Психотерапевт',
    doctorId: '2',
    date: new Date(Date.now() + 2 * 86400000),
    time: '14:00',
    status: 'upcoming',
    type: 'video',
    price: 75,
    notes: 'Обсудить прогресс по работе с тревогой',
  },
  {
    id: 'a3',
    doctorName: 'Мария Козлова',
    doctorSpecialty: 'Нутрициолог',
    doctorId: '3',
    date: new Date(Date.now() - 5 * 86400000),
    time: '10:00',
    status: 'completed',
    type: 'video',
    price: 60,
    summary: 'Составлен план питания на 4 недели. Рекомендован приём витамина D3 и омега-3. Следующий приём через месяц.',
  },
  {
    id: 'a4',
    doctorName: 'Дмитрий Волков',
    doctorSpecialty: 'Невролог',
    doctorId: '4',
    date: new Date(Date.now() - 15 * 86400000),
    time: '11:00',
    status: 'completed',
    type: 'video',
    price: 95,
    summary: 'Диагностирована цервикогенная головная боль. Назначена физиотерапия и ЛФК.',
  },
  {
    id: 'a5',
    doctorName: 'Анна Сергеева',
    doctorSpecialty: 'Кардиолог',
    doctorId: '1',
    date: new Date(Date.now() - 30 * 86400000),
    time: '09:00',
    status: 'cancelled',
    type: 'video',
    price: 89,
  },
];

// ─── Screen ────────────────────────────────────────────────────────
export function AppointmentsScreen() {
  const navigate = useNavigate();
  const [tab, setTab] = useState<'upcoming' | 'past'>('upcoming');
  const [appointments, setAppointments] = useState(DEMO_APPOINTMENTS);
  const [cancelTarget, setCancelTarget] = useState<string | null>(null);
  const [detailTarget, setDetailTarget] = useState<Appointment | null>(null);

  const upcoming = appointments.filter((a) => a.status === 'upcoming');
  const past      = appointments.filter((a) => a.status !== 'upcoming');

  const handleCancel = (id: string) => {
    setAppointments((prev) =>
      prev.map((a) => (a.id === id ? { ...a, status: 'cancelled' as const } : a))
    );
    setCancelTarget(null);
  };

  return (
    <PageLayout>
      <PageHeader
        title="Мои записи"
        subtitle="Предстоящие и прошедшие консультации"
      />

      {/* Tabs */}
      <div className="flex gap-1 bg-calm-blue-50 p-1 rounded-xl mb-6">
        {(['upcoming', 'past'] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={cn(
              'flex-1 py-2 rounded-lg text-sm font-semibold font-body transition-all flex items-center justify-center gap-2',
              tab === t
                ? 'bg-white text-calm-blue shadow-soft'
                : 'text-text-muted hover:text-calm-blue'
            )}
          >
            {{ upcoming: 'Предстоящие', past: 'История' }[t]}
            {t === 'upcoming' && upcoming.length > 0 && (
              <span className="w-5 h-5 rounded-full bg-warm-coral text-white text-xs flex items-center justify-center">
                {upcoming.length}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Upcoming */}
      {tab === 'upcoming' && (
        <div className="flex flex-col gap-4 animate-fade-up">
          {upcoming.length === 0 ? (
            <EmptyAppointments onBook={() => navigate('/doctors')} />
          ) : (
            upcoming.map((appt) => (
              <AppointmentCard
                key={appt.id}
                appointment={appt}
                onDetail={() => setDetailTarget(appt)}
                onCancel={() => setCancelTarget(appt.id)}
                onJoin={() => {/* video call stub */}}
              />
            ))
          )}
        </div>
      )}

      {/* Past */}
      {tab === 'past' && (
        <div className="flex flex-col gap-4 animate-fade-up">
          {past.length === 0 ? (
            <div className="text-center py-16 text-text-muted font-body">
              История консультаций пуста
            </div>
          ) : (
            past.map((appt) => (
              <AppointmentCard
                key={appt.id}
                appointment={appt}
                onDetail={() => setDetailTarget(appt)}
                onRebook={() => navigate(`/doctors/${appt.doctorId}`)}
              />
            ))
          )}
        </div>
      )}

      {/* Cancel confirm */}
      <ConfirmDialog
        isOpen={!!cancelTarget}
        onClose={() => setCancelTarget(null)}
        onConfirm={() => cancelTarget && handleCancel(cancelTarget)}
        title="Отменить запись?"
        message="Вы уверены, что хотите отменить эту консультацию? Бесплатная отмена доступна за 24 часа до приёма."
        confirmText="Да, отменить"
        danger
      />

      {/* Detail modal */}
      <Modal
        isOpen={!!detailTarget}
        onClose={() => setDetailTarget(null)}
        title="Детали консультации"
      >
        {detailTarget && <AppointmentDetail appointment={detailTarget} />}
      </Modal>
    </PageLayout>
  );
}

// ─── Appointment Card ───────────────────────────────────────────────
function AppointmentCard({
  appointment: a, onDetail, onCancel, onJoin, onRebook,
}: {
  appointment: Appointment;
  onDetail: () => void;
  onCancel?: () => void;
  onJoin?: () => void;
  onRebook?: () => void;
}) {
  const isToday = a.date.toDateString() === new Date().toDateString();
  const isSoon  = a.status === 'upcoming' && (a.date.getTime() - Date.now()) < 3600000;

  const dateStr = isToday
    ? `Сегодня, ${a.time}`
    : a.date.toLocaleDateString('ru', { day: 'numeric', month: 'long', weekday: 'short' }) + ', ' + a.time;

  return (
    <Card breathe className="cursor-pointer" onClick={onDetail}>
      <div className="flex items-start gap-3">
        <Avatar name={a.doctorName} size="lg" />

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div>
              <h3 className="font-display text-base text-calm-blue">{a.doctorName}</h3>
              <p className="text-sm text-text-muted font-body">{a.doctorSpecialty}</p>
            </div>
            <StatusBadge status={a.status} />
          </div>

          <div className="flex items-center gap-3 mt-2 flex-wrap">
            <div className={cn(
              'flex items-center gap-1.5 text-sm font-body',
              isSoon ? 'text-warm-coral font-semibold' : 'text-text-muted'
            )}>
              <Calendar size={13} />
              {dateStr}
            </div>
            <div className="flex items-center gap-1.5 text-sm font-body text-text-muted">
              <Video size={13} />
              Видео
            </div>
            <div className="flex items-center gap-1.5 text-sm font-body text-text-muted">
              <Clock size={13} />
              30 мин
            </div>
          </div>

          {a.notes && (
            <p className="text-xs text-text-muted font-body mt-2 italic line-clamp-1">
              Заметки: {a.notes}
            </p>
          )}
        </div>
      </div>

      {/* Footer actions */}
      {(a.status === 'upcoming' || a.status === 'completed') && (
        <div className="flex gap-2 mt-4 pt-3 border-t border-calm-blue-50 flex-wrap" onClick={(e) => e.stopPropagation()}>
          {a.status === 'upcoming' && (
            <>
              {isSoon && onJoin && (
                <Button variant="primary" size="sm" onClick={onJoin} leftIcon={<Video size={14} />}>
                  Подключиться
                </Button>
              )}
              {onCancel && (
                <Button variant="ghost" size="sm" onClick={onCancel} leftIcon={<X size={14} />}>
                  Отменить
                </Button>
              )}
              <Button variant="outline" size="sm" onClick={onDetail} rightIcon={<ChevronRight size={14} />}>
                Подробнее
              </Button>
            </>
          )}
          {a.status === 'completed' && (
            <>
              {onRebook && (
                <Button variant="outline" size="sm" onClick={onRebook} leftIcon={<RotateCcw size={14} />}>
                  Записаться снова
                </Button>
              )}
              {a.summary && (
                <Button variant="ghost" size="sm" onClick={onDetail} leftIcon={<FileText size={14} />}>
                  Резюме
                </Button>
              )}
            </>
          )}
        </div>
      )}
    </Card>
  );
}

// ─── Detail content ─────────────────────────────────────────────────
function AppointmentDetail({ appointment: a }: { appointment: Appointment }) {
  return (
    <div className="flex flex-col gap-4">
      {/* Doctor */}
      <div className="flex items-center gap-3 p-3 bg-calm-blue-50 rounded-xl">
        <Avatar name={a.doctorName} size="md" />
        <div>
          <p className="font-semibold text-text-primary font-body">{a.doctorName}</p>
          <p className="text-sm text-text-muted font-body">{a.doctorSpecialty}</p>
        </div>
        <StatusBadge status={a.status} className="ml-auto" />
      </div>

      {/* Info */}
      <div className="grid grid-cols-2 gap-3 text-sm font-body">
        <InfoRow icon={<Calendar size={14} />} label="Дата" value={
          a.date.toLocaleDateString('ru', { day: 'numeric', month: 'long', year: 'numeric' })
        } />
        <InfoRow icon={<Clock size={14} />} label="Время" value={a.time} />
        <InfoRow icon={<Video size={14} />} label="Формат" value="Видеоконсультация" />
        <InfoRow icon={<MessageSquare size={14} />} label="Длительность" value="30 минут" />
      </div>

      <div className="flex items-center justify-between px-1">
        <span className="text-sm text-text-muted font-body">Стоимость</span>
        <span className="font-display text-xl text-calm-blue">${a.price}</span>
      </div>

      {/* Notes */}
      {a.notes && (
        <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl">
          <p className="text-xs font-semibold text-amber-700 font-body mb-1">Ваши заметки</p>
          <p className="text-sm text-amber-800 font-body">{a.notes}</p>
        </div>
      )}

      {/* Summary */}
      {a.summary && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl">
          <p className="text-xs font-semibold text-emerald-700 font-body mb-1">
            <FileText size={11} className="inline mr-1" />
            Резюме консультации
          </p>
          <p className="text-sm text-emerald-800 font-body leading-relaxed">{a.summary}</p>
        </div>
      )}
    </div>
  );
}

// ─── Helpers ────────────────────────────────────────────────────────
function StatusBadge({ status, className }: { status: AppointmentStatus; className?: string }) {
  const map: Record<AppointmentStatus, { variant: 'green' | 'default' | 'coral'; label: string }> = {
    upcoming:  { variant: 'green',   label: 'Предстоит' },
    completed: { variant: 'default', label: 'Завершено' },
    cancelled: { variant: 'coral',   label: 'Отменено'  },
  };
  const { variant, label } = map[status];
  return <Badge variant={variant} size="sm" className={className}>{label}</Badge>;
}

function InfoRow({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex flex-col gap-1 p-2 bg-calm-blue-50 rounded-xl">
      <div className="flex items-center gap-1.5 text-text-muted">
        {icon}
        <span className="text-xs font-body">{label}</span>
      </div>
      <span className="text-sm font-semibold text-text-primary font-body">{value}</span>
    </div>
  );
}

function EmptyAppointments({ onBook }: { onBook: () => void }) {
  return (
    <div className="flex flex-col items-center py-16 gap-4 text-center">
      <div className="w-14 h-14 bg-calm-blue-50 rounded-3xl flex items-center justify-center">
        <Calendar size={24} className="text-calm-blue-200" />
      </div>
      <div>
        <p className="font-display text-xl text-calm-blue mb-1">Нет предстоящих записей</p>
        <p className="text-text-muted font-body text-sm">
          Запишитесь к специалисту прямо сейчас
        </p>
      </div>
      <Button variant="coral" size="md" onClick={onBook}>
        Найти врача
      </Button>
    </div>
  );
}
