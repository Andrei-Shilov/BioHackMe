import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft, ShieldCheck, Clock, Users, Star,
  BookOpen, ChevronDown, ChevronUp, CheckCircle,
  TrendingUp, Heart, Share2,
} from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Avatar } from '../components/ui/Avatar';
import { StarRating } from '../components/ui/StarRating';
import { ConfidenceIndicator } from '../components/ui/ProgressBar';
import { cn } from '../utils/cn';

// ─── Demo data ─────────────────────────────────────────────────────
type Step = {
  id: string; order: number; title: string;
  description: string; duration?: string; evidenceNote?: string;
};

type ProtocolFull = {
  id: string; title: string; specialtyLabel: string;
  author: string; authorSpecialty: string; authorAvatar?: string;
  rating: number; reviewCount: number; purchases: number;
  price: number | 'free'; updatedAt: string; readTime: number;
  evidence: 'high' | 'moderate' | 'low';
  summary: string; fullDescription: string;
  objectives: string[];
  steps: Step[];
  contraindications: string[];
  sources: string[];
  tags: string[];
};

const PROTOCOL_DATA: Record<string, ProtocolFull> = {
  p1: {
    id: 'p1',
    title: 'Протокол ведения гипертонии I–II степени',
    specialtyLabel: 'Кардиология',
    author: 'Анна Сергеева',
    authorSpecialty: 'Кардиолог',
    rating: 4.9,
    reviewCount: 87,
    purchases: 1240,
    price: 29,
    updatedAt: '2024-11-10',
    readTime: 15,
    evidence: 'high',
    tags: ['гипертония', 'АД', 'профилактика'],
    summary: 'Доказательный алгоритм диагностики и лечения гипертонической болезни с учётом сопутствующих заболеваний.',
    fullDescription: 'Протокол разработан на основе актуальных рекомендаций ESC/ESH 2023 и адаптирован для амбулаторного ведения пациентов. Охватывает первичную диагностику, немедикаментозные меры, выбор антигипертензивной терапии и мониторинг.',
    objectives: [
      'Правильно измерить и интерпретировать АД',
      'Стратифицировать риск сердечно-сосудистых осложнений',
      'Назначить оптимальную немедикаментозную и медикаментозную терапию',
      'Организовать долгосрочный мониторинг',
    ],
    steps: [
      {
        id: 's1', order: 1,
        title: 'Правильное измерение АД',
        description: 'Измерение в спокойном состоянии после 5-минутного отдыха, 3 раза с интервалом 1–2 минуты. Использовать валидированный тонометр. Оба плеча при первом визите.',
        duration: '10 мин',
        evidenceNote: 'Класс рекомендаций I, уровень доказательности A',
      },
      {
        id: 's2', order: 2,
        title: 'Сбор анамнеза и факторов риска',
        description: 'Курение, дислипидемия, сахарный диабет, ожирение (ИМТ, ОТ), семейный анамнез ССЗ, хронические заболевания почек, приём НПВП/КОК.',
        duration: '15 мин',
      },
      {
        id: 's3', order: 3,
        title: 'Физикальный осмотр',
        description: 'Оценка ИМТ, окружности талии, аускультация сердца и сосудов, пальпация пульса, осмотр глазного дна (при тяжёлой АГ).',
        duration: '10 мин',
        evidenceNote: 'Класс рекомендаций I, уровень доказательности C',
      },
      {
        id: 's4', order: 4,
        title: 'Базовые лабораторные и инструментальные исследования',
        description: 'ОАК, глюкоза натощак, липидный спектр, креатинин + СКФ, калий, натрий, ОАМ с микроальбуминурией, ЭКГ. По показаниям: ЭхоКГ, СМАД.',
        duration: '—',
      },
      {
        id: 's5', order: 5,
        title: 'Немедикаментозная терапия',
        description: 'Снижение потребления соли (<5 г/сут), DASH-диета, умеренные аэробные нагрузки ≥30 мин/день 5 дней/нед, снижение веса (цель ИМТ <25), отказ от курения, ограничение алкоголя.',
        duration: 'Постоянно',
        evidenceNote: 'Класс рекомендаций I, уровень доказательности A',
      },
      {
        id: 's6', order: 6,
        title: 'Выбор антигипертензивной терапии',
        description: 'АГ I ст. низкого риска: начало с монотерапии (ИАПФ/сартан или АК или тиазид). АГ II ст. или высокий риск: комбинация 2 препаратов. Целевое АД <130/80 при переносимости.',
        duration: '—',
        evidenceNote: 'Класс рекомендаций I, уровень доказательности A',
      },
      {
        id: 's7', order: 7,
        title: 'Контрольные визиты и мониторинг',
        description: 'Повторный визит через 1 мес после начала терапии, затем каждые 3–6 мес при достижении цели. Ежегодные лабораторные анализы. Самоконтроль АД дома.',
        duration: 'Постоянно',
      },
    ],
    contraindications: [
      'АГ III степени — требует стационарного ведения',
      'Гипертонический криз — неотложная помощь',
      'Вторичная АГ (феохромоцитома, стеноз почечной артерии) — специализированное обследование',
    ],
    sources: [
      'ESC/ESH Guidelines for the Management of Arterial Hypertension 2023',
      'JNC 8 Evidence-Based Guideline for the Management of High Blood Pressure in Adults',
      'WHO Global Report on Hypertension 2023',
    ],
  },
};

const EVIDENCE_CONFIG = {
  high:     { label: 'Высокая доказательность', color: 'text-emerald-600 bg-emerald-50 border-emerald-200' },
  moderate: { label: 'Умеренная доказательность', color: 'text-amber-600 bg-amber-50 border-amber-200' },
  low:      { label: 'Начальный уровень', color: 'text-text-muted bg-calm-blue-50 border-calm-blue-100' },
};

// ─── Screen ────────────────────────────────────────────────────────
export function ProtocolDetailScreen() {
  const { id }   = useParams<{ id: string }>();
  const navigate = useNavigate();
  const protocol = id ? PROTOCOL_DATA[id] : null;

  const [expandedStep, setExpandedStep] = useState<string | null>(null);
  const [purchased,    setPurchased]    = useState(false);
  const [saved,        setSaved]        = useState(false);

  if (!protocol) {
    const p = { title: 'Протокол не найден' };
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <p className="font-display text-2xl text-calm-blue">{p.title}</p>
        <Button variant="outline" onClick={() => navigate('/protocols')}>
          <ArrowLeft size={16} /> К библиотеке
        </Button>
      </div>
    );
  }

  const evidenceCfg = EVIDENCE_CONFIG[protocol.evidence];

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 pb-16">

      {/* Back */}
      <button
        onClick={() => navigate('/protocols')}
        className="flex items-center gap-1.5 text-sm text-text-muted font-body hover:text-calm-blue transition-colors mt-4 mb-6"
      >
        <ArrowLeft size={16} /> Библиотека протоколов
      </button>

      {/* Hero */}
      <Card className="mb-6">
        <div className="flex items-start justify-between gap-2 mb-3">
          <div>
            <Badge variant="default" size="sm" className="mb-2">{protocol.specialtyLabel}</Badge>
            <h1 className="font-display text-2xl text-calm-blue leading-tight">{protocol.title}</h1>
          </div>
          <button
            onClick={() => setSaved(!saved)}
            className={cn('p-2 rounded-xl transition-colors shrink-0', saved ? 'text-warm-coral bg-coral-50' : 'text-text-muted hover:bg-calm-blue-50')}
            aria-label="Сохранить"
          >
            <Heart size={20} fill={saved ? 'currentColor' : 'none'} />
          </button>
        </div>

        <p className="text-sm text-text-muted font-body leading-relaxed mb-4">{protocol.summary}</p>

        {/* Evidence */}
        <div className={cn('inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-sm font-body font-semibold mb-4', evidenceCfg.color)}>
          <ShieldCheck size={14} />
          {evidenceCfg.label}
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-3 gap-3 mb-4">
          <StatBox icon={<Users size={14} />} label="Изучили" value={protocol.purchases.toLocaleString()} />
          <StatBox icon={<Clock size={14} />} label="Чтение" value={`${protocol.readTime} мин`} />
          <StatBox icon={<Star size={14} fill="currentColor" className="text-warm-coral" />} label="Рейтинг" value={`${protocol.rating} (${protocol.reviewCount})`} />
        </div>

        <StarRating value={protocol.rating} count={protocol.reviewCount} size="sm" className="mb-4" />

        {/* Author */}
        <div className="flex items-center gap-3 p-3 bg-calm-blue-50 rounded-xl mb-4">
          <Avatar name={protocol.author} size="md" />
          <div>
            <p className="font-semibold text-sm text-text-primary font-body">{protocol.author}</p>
            <p className="text-xs text-text-muted font-body">{protocol.authorSpecialty}</p>
          </div>
          <Button variant="outline" size="sm" className="ml-auto" onClick={() => navigate('/doctors')}>
            Записаться
          </Button>
        </div>

        {/* Price / CTA */}
        {!purchased ? (
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-text-muted font-body">Стоимость</p>
              <p className="font-display text-2xl text-calm-blue">
                {protocol.price === 'free' ? 'Бесплатно' : `$${protocol.price}`}
              </p>
            </div>
            <Button variant="coral" size="md" onClick={() => setPurchased(true)}>
              <BookOpen size={16} /> Получить доступ
            </Button>
          </div>
        ) : (
          <div className="flex items-center gap-3 p-3 bg-emerald-50 border border-emerald-200 rounded-xl">
            <CheckCircle size={20} className="text-emerald-600" />
            <div>
              <p className="font-semibold text-emerald-700 font-body text-sm">Доступ открыт</p>
              <p className="text-xs text-emerald-600 font-body">Добавлено в вашу библиотеку</p>
            </div>
            <button className="ml-auto text-text-muted hover:text-calm-blue" aria-label="Поделиться">
              <Share2 size={16} />
            </button>
          </div>
        )}
      </Card>

      {/* Full description */}
      <Card className="mb-4">
        <h2 className="font-display text-lg text-calm-blue mb-2">Описание</h2>
        <p className="text-sm text-text-primary font-body leading-relaxed">{protocol.fullDescription}</p>
      </Card>

      {/* Objectives */}
      <Card className="mb-4">
        <h2 className="font-display text-lg text-calm-blue mb-3">Чему вы научитесь</h2>
        <ul className="flex flex-col gap-2">
          {protocol.objectives.map((obj, i) => (
            <li key={i} className="flex items-start gap-2 text-sm font-body text-text-primary">
              <CheckCircle size={16} className="text-emerald-500 shrink-0 mt-0.5" />
              {obj}
            </li>
          ))}
        </ul>
      </Card>

      {/* Steps */}
      <Card className="mb-4">
        <h2 className="font-display text-lg text-calm-blue mb-3">
          Шаги протокола ({protocol.steps.length})
        </h2>
        <div className="flex flex-col gap-2">
          {protocol.steps.map((step) => (
            <StepAccordion
              key={step.id}
              step={step}
              isOpen={expandedStep === step.id}
              onToggle={() => setExpandedStep(expandedStep === step.id ? null : step.id)}
              locked={!purchased && step.order > 2}
            />
          ))}
        </div>
        {!purchased && (
          <p className="text-xs text-text-muted font-body text-center mt-3">
            Получите доступ, чтобы просмотреть все шаги
          </p>
        )}
      </Card>

      {/* Contraindications */}
      <Card className="mb-4">
        <h2 className="font-display text-lg text-calm-blue mb-3">Противопоказания и ограничения</h2>
        <ul className="flex flex-col gap-2">
          {protocol.contraindications.map((c, i) => (
            <li key={i} className="flex items-start gap-2 text-sm font-body text-warm-coral">
              <span className="w-1.5 h-1.5 rounded-full bg-warm-coral mt-1.5 shrink-0" />
              {c}
            </li>
          ))}
        </ul>
      </Card>

      {/* AI confidence */}
      <Card className="mb-4">
        <h2 className="font-display text-lg text-calm-blue mb-1">Оценка качества протокола</h2>
        <p className="text-xs text-text-muted font-body mb-3">AI-анализ методологии и доказательной базы</p>
        <ConfidenceIndicator value={protocol.evidence === 'high' ? 94 : protocol.evidence === 'moderate' ? 72 : 51} />
      </Card>

      {/* Sources */}
      <Card>
        <h2 className="font-display text-lg text-calm-blue mb-3">Источники</h2>
        <ul className="flex flex-col gap-2">
          {protocol.sources.map((s, i) => (
            <li key={i} className="flex items-start gap-2 text-sm font-body text-text-muted">
              <TrendingUp size={13} className="text-soft-blue shrink-0 mt-0.5" />
              {s}
            </li>
          ))}
        </ul>
      </Card>
    </div>
  );
}

// ─── Step accordion ─────────────────────────────────────────────────
function StepAccordion({
  step, isOpen, onToggle, locked,
}: {
  step: Step; isOpen: boolean; onToggle: () => void; locked: boolean;
}) {
  return (
    <div className={cn(
      'rounded-xl border transition-all',
      locked ? 'border-calm-blue-50 opacity-50' : 'border-calm-blue-100',
      isOpen && !locked ? 'border-soft-blue' : ''
    )}>
      <button
        className="w-full flex items-center gap-3 p-3 text-left"
        onClick={locked ? undefined : onToggle}
        disabled={locked}
      >
        <span className={cn(
          'w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold font-body shrink-0',
          isOpen ? 'bg-soft-blue text-white' : 'bg-calm-blue-50 text-calm-blue'
        )}>
          {step.order}
        </span>
        <span className="flex-1 font-semibold text-sm font-body text-text-primary">{step.title}</span>
        {step.duration && (
          <span className="text-xs text-text-muted font-body flex items-center gap-1 shrink-0">
            <Clock size={11} /> {step.duration}
          </span>
        )}
        {!locked && (
          isOpen ? <ChevronUp size={16} className="text-text-muted shrink-0" /> : <ChevronDown size={16} className="text-text-muted shrink-0" />
        )}
        {locked && <span className="text-lg shrink-0">🔒</span>}
      </button>

      {isOpen && !locked && (
        <div className="px-4 pb-4 animate-fade-up">
          <p className="text-sm text-text-primary font-body leading-relaxed mb-2">{step.description}</p>
          {step.evidenceNote && (
            <div className="flex items-center gap-1.5 text-xs text-emerald-600 font-body bg-emerald-50 px-2 py-1 rounded-lg mt-2">
              <ShieldCheck size={11} />
              {step.evidenceNote}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Stat box ───────────────────────────────────────────────────────
function StatBox({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex flex-col items-center gap-1 p-2 bg-calm-blue-50 rounded-xl text-center">
      <div className="flex items-center gap-1 text-text-muted">
        {icon}
        <span className="text-xs font-body">{label}</span>
      </div>
      <span className="text-sm font-semibold text-text-primary font-body">{value}</span>
    </div>
  );
}
