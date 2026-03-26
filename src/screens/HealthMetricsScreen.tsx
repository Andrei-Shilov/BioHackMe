import { useState } from 'react';
import {
  Activity, Heart, Droplets, Scale,
  Plus, TrendingUp, TrendingDown, Minus,
  Calendar, X, Info,
} from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Input } from '../components/ui/Input';
import { Modal } from '../components/ui/Modal';
import { PageLayout, PageHeader } from '../components/layout/PageLayout';
import { useHealthStore } from '../store';
import { cn } from '../utils/cn';

// ─── Metric types ───────────────────────────────────────────────────
type MetricType = 'blood_pressure' | 'heart_rate' | 'weight' | 'blood_glucose' | 'spo2' | 'temperature';

type MetricEntry = {
  id: string;
  type: MetricType;
  value: string;
  value2?: string; // diastolic for blood pressure
  unit: string;
  recordedAt: Date;
  note?: string;
};

const METRIC_CONFIG: Record<MetricType, {
  label: string; unit: string; icon: typeof Activity;
  normalRange: string; color: string; hasTwo?: boolean;
  placeholder: string; placeholder2?: string;
}> = {
  blood_pressure: {
    label: 'Артериальное давление', unit: 'мм рт. ст.', icon: Heart,
    normalRange: '90–120 / 60–80', color: 'text-warm-coral',
    hasTwo: true, placeholder: 'Систолическое (120)', placeholder2: 'Диастолическое (80)',
  },
  heart_rate: {
    label: 'Пульс', unit: 'уд/мин', icon: Activity,
    normalRange: '60–100', color: 'text-soft-blue',
    placeholder: 'Например: 72',
  },
  weight: {
    label: 'Вес', unit: 'кг', icon: Scale,
    normalRange: 'ИМТ 18.5–24.9', color: 'text-calm-blue',
    placeholder: 'Например: 72.5',
  },
  blood_glucose: {
    label: 'Глюкоза крови', unit: 'ммоль/л', icon: Droplets,
    normalRange: '3.9–5.5 (натощак)', color: 'text-amber-500',
    placeholder: 'Например: 5.1',
  },
  spo2: {
    label: 'Сатурация (SpO₂)', unit: '%', icon: Activity,
    normalRange: '95–100%', color: 'text-emerald-500',
    placeholder: 'Например: 98',
  },
  temperature: {
    label: 'Температура', unit: '°C', icon: Activity,
    normalRange: '36.0–37.0', color: 'text-purple-500',
    placeholder: 'Например: 36.6',
  },
};

// ─── Demo seed data ─────────────────────────────────────────────────
const SEED: MetricEntry[] = [
  { id: 'm1', type: 'blood_pressure', value: '120', value2: '80', unit: 'мм рт. ст.', recordedAt: new Date(Date.now() - 1 * 86400000) },
  { id: 'm2', type: 'blood_pressure', value: '125', value2: '83', unit: 'мм рт. ст.', recordedAt: new Date(Date.now() - 2 * 86400000) },
  { id: 'm3', type: 'blood_pressure', value: '118', value2: '78', unit: 'мм рт. ст.', recordedAt: new Date(Date.now() - 4 * 86400000) },
  { id: 'm4', type: 'heart_rate', value: '72', unit: 'уд/мин', recordedAt: new Date(Date.now() - 1 * 86400000) },
  { id: 'm5', type: 'heart_rate', value: '78', unit: 'уд/мин', recordedAt: new Date(Date.now() - 3 * 86400000) },
  { id: 'm6', type: 'weight',     value: '72.5', unit: 'кг', recordedAt: new Date(Date.now() - 1 * 86400000) },
  { id: 'm7', type: 'weight',     value: '73.0', unit: 'кг', recordedAt: new Date(Date.now() - 7 * 86400000) },
  { id: 'm8', type: 'blood_glucose', value: '5.1', unit: 'ммоль/л', recordedAt: new Date(Date.now() - 2 * 86400000) },
  { id: 'm9', type: 'spo2', value: '98', unit: '%', recordedAt: new Date(Date.now() - 1 * 86400000) },
];

function makeTrend(entries: MetricEntry[]): 'up' | 'down' | 'flat' {
  if (entries.length < 2) return 'flat';
  const [latest, prev] = entries;
  const a = parseFloat(latest.value), b = parseFloat(prev.value);
  if (a > b + 0.5) return 'up';
  if (a < b - 0.5) return 'down';
  return 'flat';
}

// ─── Screen ────────────────────────────────────────────────────────
export function HealthMetricsScreen() {
  const [entries,     setEntries]     = useState<MetricEntry[]>(SEED);
  const [activeType,  setActiveType]  = useState<MetricType>('blood_pressure');
  const [showAdd,     setShowAdd]     = useState(false);
  const [addType,     setAddType]     = useState<MetricType>('blood_pressure');
  const [val1,        setVal1]        = useState('');
  const [val2,        setVal2]        = useState('');
  const [note,        setNote]        = useState('');
  useHealthStore(); // access store for future Supabase sync

  const typeEntries = entries
    .filter((e) => e.type === activeType)
    .sort((a, b) => b.recordedAt.getTime() - a.recordedAt.getTime());

  const latest = typeEntries[0];
  const cfg    = METRIC_CONFIG[activeType];
  const trend  = makeTrend(typeEntries);

  const handleAdd = () => {
    if (!val1.trim()) return;
    const entry: MetricEntry = {
      id:          crypto.randomUUID(),
      type:        addType,
      value:       val1,
      value2:      METRIC_CONFIG[addType].hasTwo ? val2 : undefined,
      unit:        METRIC_CONFIG[addType].unit,
      recordedAt:  new Date(),
      note:        note || undefined,
    };
    setEntries((prev) => [entry, ...prev]);
    setVal1(''); setVal2(''); setNote('');
    setShowAdd(false);
    setActiveType(addType);
  };

  const handleDelete = (id: string) => {
    setEntries((prev) => prev.filter((e) => e.id !== id));
  };

  return (
    <PageLayout>
      <PageHeader
        title="Мои метрики"
        subtitle="Отслеживайте показатели здоровья"
        action={
          <Button variant="coral" size="sm" onClick={() => { setAddType(activeType); setShowAdd(true); }}>
            <Plus size={14} /> Добавить
          </Button>
        }
      />

      {/* Metric type tabs — horizontal scroll */}
      <div className="scroll-x flex gap-2 pb-1 mb-5">
        {(Object.keys(METRIC_CONFIG) as MetricType[]).map((type) => {
          const c = METRIC_CONFIG[type];
          const count = entries.filter((e) => e.type === type).length;
          return (
            <button
              key={type}
              onClick={() => setActiveType(type)}
              className={cn(
                'shrink-0 flex items-center gap-2 px-4 py-2.5 rounded-xl border-2 text-sm font-semibold font-body transition-all',
                activeType === type
                  ? 'border-calm-blue bg-calm-blue text-white'
                  : 'border-calm-blue-100 text-text-muted hover:border-calm-blue hover:text-calm-blue bg-white'
              )}
            >
              <c.icon size={14} />
              <span>{c.label.split(' ')[0]}</span>
              {count > 0 && (
                <span className={cn(
                  'text-xs px-1.5 py-0.5 rounded-full',
                  activeType === type ? 'bg-white/20 text-white' : 'bg-calm-blue-50 text-calm-blue'
                )}>
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Summary card */}
      <Card breathe className="mb-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xs text-text-muted font-body mb-1">{cfg.label}</p>
            {latest ? (
              <div className="flex items-end gap-2">
                <p className={cn('font-display text-3xl', cfg.color)}>
                  {latest.value2 ? `${latest.value}/${latest.value2}` : latest.value}
                </p>
                <p className="text-text-muted font-body text-sm pb-1">{cfg.unit}</p>
              </div>
            ) : (
              <p className="font-display text-2xl text-text-muted">—</p>
            )}
            {latest && (
              <p className="text-xs text-text-muted font-body mt-1">
                {latest.recordedAt.toLocaleDateString('ru', { day: 'numeric', month: 'long' })}
                {' · '}
                {latest.recordedAt.toLocaleTimeString('ru', { hour: '2-digit', minute: '2-digit' })}
              </p>
            )}
          </div>
          <div className="flex flex-col items-end gap-2">
            {latest && (
              <div className={cn(
                'flex items-center gap-1 text-sm font-semibold font-body px-2 py-1 rounded-lg',
                trend === 'up'   ? 'bg-red-50 text-warm-coral'    :
                trend === 'down' ? 'bg-emerald-50 text-green-health' :
                'bg-calm-blue-50 text-text-muted'
              )}>
                {trend === 'up'   ? <TrendingUp  size={14} /> :
                 trend === 'down' ? <TrendingDown size={14} /> :
                 <Minus size={14} />}
                {{ up: 'Выше', down: 'Ниже', flat: 'Стабильно' }[trend]}
              </div>
            )}
            <div className="flex items-center gap-1 text-xs text-text-muted font-body">
              <Info size={11} />
              Норма: {cfg.normalRange}
            </div>
          </div>
        </div>

        {/* Sparkline bars */}
        {typeEntries.length > 1 && (
          <div className="mt-4 flex items-end gap-1 h-10">
            {typeEntries.slice(0, 10).reverse().map((e, i) => {
              const v = parseFloat(e.value);
              const max = Math.max(...typeEntries.map((x) => parseFloat(x.value)));
              const min = Math.min(...typeEntries.map((x) => parseFloat(x.value)));
              const pct = max === min ? 50 : ((v - min) / (max - min)) * 80 + 20;
              return (
                <div
                  key={e.id}
                  className={cn('flex-1 rounded-t-sm transition-all', cfg.color.replace('text-', 'bg-').replace('-500', '-300').replace('-400', '-200'))}
                  style={{ height: `${pct}%`, opacity: i === typeEntries.slice(0, 10).length - 1 ? 1 : 0.5 + i * 0.05 }}
                />
              );
            })}
          </div>
        )}
      </Card>

      {/* History list */}
      <div className="flex flex-col gap-3">
        {typeEntries.length === 0 ? (
          <Card className="py-12 text-center">
            <cfg.icon size={28} className="mx-auto mb-3 text-calm-blue-200" />
            <p className="font-display text-lg text-calm-blue mb-1">Нет записей</p>
            <p className="text-sm text-text-muted font-body mb-4">
              Добавьте первый замер {cfg.label.toLowerCase()}
            </p>
            <Button variant="coral" size="sm" onClick={() => { setAddType(activeType); setShowAdd(true); }}>
              <Plus size={14} /> Добавить замер
            </Button>
          </Card>
        ) : (
          typeEntries.map((entry, idx) => (
            <HistoryRow
              key={entry.id}
              entry={entry}
              isLatest={idx === 0}
              onDelete={() => handleDelete(entry.id)}
            />
          ))
        )}
      </div>

      {/* Add metric modal */}
      <Modal isOpen={showAdd} onClose={() => setShowAdd(false)} title="Добавить замер">
        <div className="flex flex-col gap-4">
          {/* Type picker */}
          <div>
            <p className="text-sm font-semibold text-text-primary font-body mb-2">Тип показателя</p>
            <div className="grid grid-cols-2 gap-2">
              {(Object.keys(METRIC_CONFIG) as MetricType[]).map((t) => (
                <button
                  key={t}
                  onClick={() => setAddType(t)}
                  className={cn(
                    'flex items-center gap-2 px-3 py-2 rounded-xl border-2 text-sm font-body transition-all text-left',
                    addType === t
                      ? 'border-soft-blue bg-soft-blue-50 text-soft-blue'
                      : 'border-calm-blue-100 text-text-muted hover:border-soft-blue'
                  )}
                >
                  {(() => { const Icon = METRIC_CONFIG[t].icon; return <Icon size={13} />; })()}
                  {METRIC_CONFIG[t].label.split(' ')[0]}
                </button>
              ))}
            </div>
          </div>

          {/* Value inputs */}
          <div className={cn('grid gap-3', METRIC_CONFIG[addType].hasTwo ? 'grid-cols-2' : 'grid-cols-1')}>
            <Input
              label={METRIC_CONFIG[addType].hasTwo ? 'Систолическое' : `Значение (${METRIC_CONFIG[addType].unit})`}
              type="number"
              value={val1}
              onChange={(e) => setVal1(e.target.value)}
              placeholder={METRIC_CONFIG[addType].placeholder}
            />
            {METRIC_CONFIG[addType].hasTwo && (
              <Input
                label="Диастолическое"
                type="number"
                value={val2}
                onChange={(e) => setVal2(e.target.value)}
                placeholder={METRIC_CONFIG[addType].placeholder2}
              />
            )}
          </div>

          <Input
            label="Заметка (необязательно)"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Например: после физической нагрузки"
          />

          <div className="flex items-center gap-2 p-3 bg-calm-blue-50 rounded-xl text-xs font-body text-text-muted">
            <Calendar size={13} />
            Дата замера: {new Date().toLocaleDateString('ru', { day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' })}
          </div>

          <div className="flex gap-3">
            <Button variant="outline" size="md" fullWidth onClick={() => setShowAdd(false)}>Отмена</Button>
            <Button variant="primary" size="md" fullWidth onClick={handleAdd} disabled={!val1.trim()}>
              Сохранить
            </Button>
          </div>
        </div>
      </Modal>
    </PageLayout>
  );
}

// ─── History row ─────────────────────────────────────────────────────
function HistoryRow({
  entry, isLatest, onDelete,
}: {
  entry: MetricEntry; isLatest: boolean; onDelete: () => void;
}) {
  const cfg = METRIC_CONFIG[entry.type];
  return (
    <Card className={cn('transition-all', isLatest && 'ring-1 ring-soft-blue/30')}>
      <div className="flex items-center gap-3">
        <div className={cn('w-10 h-10 rounded-2xl flex items-center justify-center shrink-0', 'bg-calm-blue-50')}>
          <cfg.icon size={18} className={cfg.color} />
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <p className={cn('font-display text-lg', cfg.color)}>
              {entry.value2 ? `${entry.value}/${entry.value2}` : entry.value}
              <span className="font-body text-sm text-text-muted ml-1">{entry.unit}</span>
            </p>
            {isLatest && <Badge variant="green" size="sm">Последнее</Badge>}
          </div>
          <p className="text-xs text-text-muted font-body">
            {entry.recordedAt.toLocaleDateString('ru', { day: 'numeric', month: 'short' })}
            {' · '}
            {entry.recordedAt.toLocaleTimeString('ru', { hour: '2-digit', minute: '2-digit' })}
          </p>
          {entry.note && <p className="text-xs text-text-muted font-body italic mt-0.5">{entry.note}</p>}
        </div>
        <button
          onClick={onDelete}
          className="p-2 text-text-muted hover:text-warm-coral transition-colors"
          aria-label="Удалить запись"
        >
          <X size={15} />
        </button>
      </div>
    </Card>
  );
}
