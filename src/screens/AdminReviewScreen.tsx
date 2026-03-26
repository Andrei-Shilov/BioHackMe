import { useState } from 'react';
import {
  ShieldCheck, AlertCircle, Clock, CheckCircle, X,
  ChevronRight, User, FileText, MessageSquare,
} from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Avatar } from '../components/ui/Avatar';
import { Textarea } from '../components/ui/Input';
import { Modal } from '../components/ui/Modal';
import { PageLayout, PageHeader } from '../components/layout/PageLayout';
import { cn } from '../utils/cn';

// ─── Types ─────────────────────────────────────────────────────────
type ReviewStatus = 'pending' | 'approved' | 'rejected' | 'revision';

type ReviewItem = {
  id: string;
  protocolTitle: string;
  authorName: string;
  authorSpecialty: string;
  submittedAt: string;
  status: ReviewStatus;
  specialty: string;
  evidence: 'high' | 'moderate' | 'low';
  stepCount: number;
  sourceCount: number;
  conflictOfInterest: string | null;
  summary: string;
  reviewNote?: string;
};

// ─── Demo data ─────────────────────────────────────────────────────
const DEMO_REVIEWS: ReviewItem[] = [
  {
    id: 'r1',
    protocolTitle: 'Здоровый сон: когнитивные стратегии',
    authorName: 'Иван Петров',
    authorSpecialty: 'Психотерапевт',
    submittedAt: '2024-11-18',
    status: 'pending',
    specialty: 'Психотерапия',
    evidence: 'moderate',
    stepCount: 6,
    sourceCount: 4,
    conflictOfInterest: null,
    summary: 'Протокол когнитивно-поведенческой терапии бессонницы (КПТ-И) из 6 шагов с упражнениями для улучшения гигиены сна.',
  },
  {
    id: 'r2',
    protocolTitle: 'Диета при инсулинорезистентности',
    authorName: 'Мария Козлова',
    authorSpecialty: 'Нутрициолог',
    submittedAt: '2024-11-16',
    status: 'pending',
    specialty: 'Нутрициология',
    evidence: 'high',
    stepCount: 8,
    sourceCount: 6,
    conflictOfInterest: 'Автор является консультантом компании NutriCorp. Конфликт интересов раскрыт.',
    summary: 'Протокол питания для пациентов с инсулинорезистентностью на основе средиземноморской диеты.',
  },
  {
    id: 'r3',
    protocolTitle: 'Диагностика болей в груди',
    authorName: 'Дмитрий Волков',
    authorSpecialty: 'Невролог',
    submittedAt: '2024-10-15',
    status: 'rejected',
    specialty: 'Неврология',
    evidence: 'low',
    stepCount: 4,
    sourceCount: 2,
    conflictOfInterest: null,
    summary: 'Алгоритм первичной оценки болей в груди.',
    reviewNote: 'Недостаточная доказательная база. Источники устарели (>10 лет). Рекомендуем переработать с использованием рекомендаций ESC 2023.',
  },
  {
    id: 'r4',
    protocolTitle: 'Реабилитация после ОРВИ',
    authorName: 'Анна Сергеева',
    authorSpecialty: 'Кардиолог',
    submittedAt: '2024-11-10',
    status: 'approved',
    specialty: 'Кардиология',
    evidence: 'moderate',
    stepCount: 5,
    sourceCount: 5,
    conflictOfInterest: null,
    summary: 'Протокол восстановления кардиореспираторной функции после перенесённой ОРВИ.',
    reviewNote: 'Одобрено. Хорошая доказательная база, чёткие шаги.',
  },
];

const STATUS_CFG: Record<ReviewStatus, { label: string; variant: 'green' | 'default' | 'coral' | 'soft-blue'; icon: typeof Clock }> = {
  pending:  { label: 'На рассмотрении', variant: 'soft-blue', icon: Clock        },
  approved: { label: 'Одобрен',         variant: 'green',     icon: CheckCircle  },
  rejected: { label: 'Отклонён',        variant: 'coral',     icon: X            },
  revision: { label: 'На доработке',    variant: 'default',   icon: MessageSquare },
};

const EVIDENCE_LABEL: Record<string, string> = {
  high: 'Высокая', moderate: 'Умеренная', low: 'Низкая',
};

// ─── Screen ────────────────────────────────────────────────────────
export function AdminReviewScreen() {
  const [reviews,    setReviews]    = useState(DEMO_REVIEWS);
  const [filter,     setFilter]     = useState<ReviewStatus | 'all'>('all');
  const [selected,   setSelected]   = useState<ReviewItem | null>(null);
  const [reviewNote, setReviewNote] = useState('');
  const [action,     setAction]     = useState<'approve' | 'reject' | 'revision' | null>(null);

  const filtered = filter === 'all' ? reviews : reviews.filter((r) => r.status === filter);

  const counts = {
    pending:  reviews.filter((r) => r.status === 'pending').length,
    approved: reviews.filter((r) => r.status === 'approved').length,
    rejected: reviews.filter((r) => r.status === 'rejected').length,
  };

  const handleDecision = () => {
    if (!selected || !action) return;
    const newStatus: ReviewStatus = action === 'approve' ? 'approved' : action === 'reject' ? 'rejected' : 'revision';
    setReviews((prev) =>
      prev.map((r) => r.id === selected.id
        ? { ...r, status: newStatus, reviewNote: reviewNote || r.reviewNote }
        : r
      )
    );
    setSelected(null);
    setAction(null);
    setReviewNote('');
  };

  return (
    <PageLayout>
      <PageHeader
        title="Этический комитет"
        subtitle="Рецензирование медицинских протоколов"
      />

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        <StatCard label="На рассмотрении" value={counts.pending} color="soft-blue" />
        <StatCard label="Одобрено"        value={counts.approved} color="green"    />
        <StatCard label="Отклонено"       value={counts.rejected} color="coral"    />
      </div>

      {/* Filter */}
      <div className="flex gap-1 bg-calm-blue-50 p-1 rounded-xl mb-6">
        {([
          { val: 'all',      label: 'Все'             },
          { val: 'pending',  label: 'На рассмотрении' },
          { val: 'approved', label: 'Одобрены'        },
          { val: 'rejected', label: 'Отклонены'       },
        ] as const).map(({ val, label }) => (
          <button
            key={val}
            onClick={() => setFilter(val)}
            className={cn(
              'flex-1 py-2 rounded-lg text-sm font-semibold font-body transition-all',
              filter === val
                ? 'bg-white text-calm-blue shadow-soft'
                : 'text-text-muted hover:text-calm-blue'
            )}
          >
            {label}
          </button>
        ))}
      </div>

      {/* List */}
      <div className="flex flex-col gap-3 stagger-children">
        {filtered.map((item) => (
          <ReviewCard
            key={item.id}
            item={item}
            onClick={() => { setSelected(item); setAction(null); setReviewNote(''); }}
          />
        ))}
        {filtered.length === 0 && (
          <div className="text-center py-12 text-text-muted font-body">
            <FileText size={28} className="mx-auto mb-2 opacity-30" />
            Нет протоколов в этой категории
          </div>
        )}
      </div>

      {/* Detail modal */}
      <Modal
        isOpen={!!selected}
        onClose={() => { setSelected(null); setAction(null); setReviewNote(''); }}
        title="Рецензирование протокола"
        size="lg"
      >
        {selected && (
          <div className="flex flex-col gap-4">
            {/* Header */}
            <div className="p-4 bg-calm-blue-50 rounded-2xl">
              <h3 className="font-display text-lg text-calm-blue mb-1">{selected.protocolTitle}</h3>
              <p className="text-sm text-text-muted font-body mb-3">{selected.summary}</p>

              <div className="flex items-center gap-3">
                <Avatar name={selected.authorName} size="sm" />
                <div>
                  <p className="text-sm font-semibold text-text-primary font-body">{selected.authorName}</p>
                  <p className="text-xs text-text-muted font-body">{selected.authorSpecialty}</p>
                </div>
                <Badge variant={STATUS_CFG[selected.status].variant} size="sm" className="ml-auto">
                  {STATUS_CFG[selected.status].label}
                </Badge>
              </div>
            </div>

            {/* Checklist */}
            <div className="grid grid-cols-2 gap-2 text-sm font-body">
              <CheckRow label="Специальность" value={selected.specialty} ok />
              <CheckRow label="Доказательность" value={EVIDENCE_LABEL[selected.evidence]} ok={selected.evidence !== 'low'} />
              <CheckRow label="Шагов" value={String(selected.stepCount)} ok={selected.stepCount >= 3} />
              <CheckRow label="Источников" value={String(selected.sourceCount)} ok={selected.sourceCount >= 3} />
              <CheckRow label="Дата подачи" value={new Date(selected.submittedAt).toLocaleDateString('ru')} ok />
            </div>

            {/* Conflict of interest */}
            {selected.conflictOfInterest ? (
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-sm font-body text-amber-800">
                <p className="font-semibold mb-1">⚠️ Конфликт интересов</p>
                {selected.conflictOfInterest}
              </div>
            ) : (
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-sm font-body text-emerald-700">
                <CheckCircle size={14} className="inline mr-1.5" />
                Конфликт интересов не заявлен
              </div>
            )}

            {/* Previous note */}
            {selected.reviewNote && (
              <div className="p-3 bg-calm-blue-50 rounded-xl text-sm font-body text-text-primary">
                <p className="text-xs text-text-muted mb-1">Предыдущее решение</p>
                {selected.reviewNote}
              </div>
            )}

            {/* Decision */}
            {selected.status === 'pending' && (
              <div className="flex flex-col gap-3">
                <Textarea
                  label="Комментарий рецензента"
                  placeholder="Обоснование решения, рекомендации по доработке…"
                  value={reviewNote}
                  onChange={(e) => setReviewNote(e.target.value)}
                  rows={3}
                />
                <div className="flex gap-2">
                  <Button
                    variant="danger"
                    size="md"
                    fullWidth
                    onClick={() => setAction('reject')}
                    leftIcon={<X size={14} />}
                    className={cn(action === 'reject' && 'ring-2 ring-warm-coral')}
                  >
                    Отклонить
                  </Button>
                  <Button
                    variant="outline"
                    size="md"
                    fullWidth
                    onClick={() => setAction('revision')}
                    leftIcon={<MessageSquare size={14} />}
                    className={cn(action === 'revision' && 'ring-2 ring-soft-blue')}
                  >
                    На доработку
                  </Button>
                  <Button
                    variant="primary"
                    size="md"
                    fullWidth
                    onClick={() => setAction('approve')}
                    leftIcon={<CheckCircle size={14} />}
                    className={cn(action === 'approve' && 'ring-2 ring-emerald-400')}
                  >
                    Одобрить
                  </Button>
                </div>
                {action && (
                  <Button variant="coral" size="md" fullWidth onClick={handleDecision}>
                    Подтвердить решение
                  </Button>
                )}
              </div>
            )}

            {selected.status !== 'pending' && (
              <div className={cn(
                'p-3 rounded-xl text-sm font-body flex items-center gap-2',
                selected.status === 'approved'
                  ? 'bg-emerald-50 text-emerald-700'
                  : 'bg-red-50 text-warm-coral'
              )}>
                {selected.status === 'approved'
                  ? <CheckCircle size={16} />
                  : <AlertCircle size={16} />}
                Решение уже принято. Изменить можно только через пересмотр.
              </div>
            )}
          </div>
        )}
      </Modal>
    </PageLayout>
  );
}

// ─── Review card ────────────────────────────────────────────────────
function ReviewCard({ item, onClick }: { item: ReviewItem; onClick: () => void }) {
  const cfg = STATUS_CFG[item.status];
  return (
    <Card breathe className="cursor-pointer" onClick={onClick}>
      <div className="flex items-start justify-between gap-2 mb-2">
        <h3 className="font-display text-base text-calm-blue flex-1 line-clamp-2">{item.protocolTitle}</h3>
        <Badge variant={cfg.variant} size="sm" className="shrink-0">
          <cfg.icon size={10} /> {cfg.label}
        </Badge>
      </div>

      <div className="flex items-center gap-2 mb-2">
        <Avatar name={item.authorName} size="sm" />
        <span className="text-sm text-text-muted font-body">{item.authorName} · {item.authorSpecialty}</span>
      </div>

      <p className="text-xs text-text-muted font-body line-clamp-2 mb-3">{item.summary}</p>

      <div className="flex items-center justify-between">
        <div className="flex gap-2 flex-wrap">
          <Badge variant="default" size="sm">{item.specialty}</Badge>
          <Badge
            variant={item.evidence === 'high' ? 'green' : item.evidence === 'moderate' ? 'default' : 'coral'}
            size="sm"
          >
            <ShieldCheck size={10} /> {EVIDENCE_LABEL[item.evidence]}
          </Badge>
          {item.conflictOfInterest && (
            <Badge variant="coral" size="sm"><AlertCircle size={10} /> КИ заявлен</Badge>
          )}
        </div>
        <div className="flex items-center gap-1.5 text-xs text-text-muted font-body">
          <User size={11} /> {new Date(item.submittedAt).toLocaleDateString('ru')}
          <ChevronRight size={14} className="ml-1" />
        </div>
      </div>
    </Card>
  );
}

// ─── Helpers ────────────────────────────────────────────────────────
function StatCard({ label, value, color }: { label: string; value: number; color: 'soft-blue' | 'green' | 'coral' }) {
  const cls = { 'soft-blue': 'bg-soft-blue/10 text-soft-blue', green: 'bg-emerald-50 text-green-health', coral: 'bg-coral-50 text-warm-coral' }[color];
  return (
    <div className={cn('flex flex-col items-center py-3 px-2 rounded-2xl', cls)}>
      <p className="font-display text-2xl">{value}</p>
      <p className="text-xs font-body text-center mt-0.5">{label}</p>
    </div>
  );
}

function CheckRow({ label, value, ok }: { label: string; value: string; ok: boolean }) {
  return (
    <div className="flex items-center justify-between p-2 bg-calm-blue-50 rounded-xl">
      <div>
        <p className="text-xs text-text-muted">{label}</p>
        <p className="text-sm font-semibold text-text-primary font-body">{value}</p>
      </div>
      {ok
        ? <CheckCircle size={16} className="text-emerald-500 shrink-0" />
        : <AlertCircle size={16} className="text-warm-coral shrink-0" />
      }
    </div>
  );
}
