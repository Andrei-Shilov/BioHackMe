import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft, Plus, Trash2, GripVertical,
  ChevronDown, ChevronUp, Eye, Send,
  CheckCircle, AlertCircle, Info,
} from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Input, Textarea } from '../components/ui/Input';
import { Modal } from '../components/ui/Modal';
import { cn } from '../utils/cn';
import type { Specialty } from '../types';

// ─── Types ─────────────────────────────────────────────────────────
type EvidenceLevel = 'high' | 'moderate' | 'low';

type ProtocolStep = {
  id: string;
  title: string;
  description: string;
  duration: string;
  evidenceNote: string;
};

type DraftProtocol = {
  title: string;
  specialty: Specialty | '';
  summary: string;
  fullDescription: string;
  objectives: string[];
  steps: ProtocolStep[];
  contraindications: string[];
  sources: string[];
  tags: string;
  price: string;
  evidence: EvidenceLevel;
};

const SPECIALTIES: { value: Specialty; label: string }[] = [
  { value: 'cardiology',    label: 'Кардиология'     },
  { value: 'psychology',   label: 'Психотерапия'    },
  { value: 'nutrition',    label: 'Нутрициология'   },
  { value: 'neurology',    label: 'Неврология'      },
  { value: 'oncology',     label: 'Онкология'       },
  { value: 'pediatrics',   label: 'Педиатрия'       },
  { value: 'dermatology',  label: 'Дерматология'    },
  { value: 'oncology',     label: 'Онкология'       },
  { value: 'gynecology',   label: 'Гинекология'     },
  { value: 'rehabilitation',label: 'Реабилитация'   },
  { value: 'general',      label: 'Общая практика'  },
];

function makeStep(): ProtocolStep {
  return { id: crypto.randomUUID(), title: '', description: '', duration: '', evidenceNote: '' };
}

const EMPTY: DraftProtocol = {
  title: '', specialty: '', summary: '', fullDescription: '',
  objectives: [''], steps: [makeStep()],
  contraindications: [''], sources: [''],
  tags: '', price: '29', evidence: 'moderate',
};

// ─── Validation ─────────────────────────────────────────────────────
type ValidationResult = { ok: boolean; errors: string[] };

function validate(draft: DraftProtocol): ValidationResult {
  const errors: string[] = [];
  if (!draft.title.trim())         errors.push('Укажите название протокола');
  if (!draft.specialty)            errors.push('Выберите специальность');
  if (!draft.summary.trim())       errors.push('Добавьте краткое описание');
  if (draft.steps.length === 0)    errors.push('Добавьте хотя бы один шаг');
  draft.steps.forEach((s, i) => {
    if (!s.title.trim())       errors.push(`Шаг ${i + 1}: укажите заголовок`);
    if (!s.description.trim()) errors.push(`Шаг ${i + 1}: добавьте описание`);
  });
  if (draft.objectives.every((o) => !o.trim())) errors.push('Добавьте хотя бы одну цель обучения');
  if (draft.sources.every((s) => !s.trim()))    errors.push('Укажите хотя бы один источник');
  return { ok: errors.length === 0, errors };
}

// ─── Screen ────────────────────────────────────────────────────────
export function ProtocolEditorScreen() {
  const navigate    = useNavigate();
  const [draft,     setDraft]     = useState<DraftProtocol>(EMPTY);
  const [tab,       setTab]       = useState<'meta' | 'steps' | 'sources' | 'preview'>('meta');
  const [submitted, setSubmitted] = useState(false);
  const [showValidation, setShowValidation] = useState(false);
  const [expandedStep,   setExpandedStep]   = useState<string | null>(null);

  const validation = validate(draft);

  const update = useCallback(<K extends keyof DraftProtocol>(key: K, val: DraftProtocol[K]) => {
    setDraft((d) => ({ ...d, [key]: val }));
  }, []);

  // Steps CRUD
  const addStep = () => {
    const step = makeStep();
    setDraft((d) => ({ ...d, steps: [...d.steps, step] }));
    setExpandedStep(step.id);
  };

  const removeStep = (id: string) => {
    setDraft((d) => ({ ...d, steps: d.steps.filter((s) => s.id !== id) }));
    if (expandedStep === id) setExpandedStep(null);
  };

  const updateStep = (id: string, key: keyof ProtocolStep, val: string) => {
    setDraft((d) => ({
      ...d,
      steps: d.steps.map((s) => s.id === id ? { ...s, [key]: val } : s),
    }));
  };

  const moveStep = (id: string, dir: -1 | 1) => {
    setDraft((d) => {
      const idx = d.steps.findIndex((s) => s.id === id);
      const newSteps = [...d.steps];
      const target = idx + dir;
      if (target < 0 || target >= newSteps.length) return d;
      [newSteps[idx], newSteps[target]] = [newSteps[target], newSteps[idx]];
      return { ...d, steps: newSteps };
    });
  };

  // List fields (objectives / contraindications / sources)
  const updateList = (key: 'objectives' | 'contraindications' | 'sources', idx: number, val: string) => {
    setDraft((d) => {
      const arr = [...d[key]];
      arr[idx] = val;
      return { ...d, [key]: arr };
    });
  };

  const addListItem = (key: 'objectives' | 'contraindications' | 'sources') => {
    setDraft((d) => ({ ...d, [key]: [...d[key], ''] }));
  };

  const removeListItem = (key: 'objectives' | 'contraindications' | 'sources', idx: number) => {
    setDraft((d) => ({ ...d, [key]: d[key].filter((_, i) => i !== idx) }));
  };

  const handleSubmit = () => {
    if (!validation.ok) { setShowValidation(true); return; }
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="max-w-xl mx-auto px-4 pt-16 pb-16 text-center flex flex-col items-center gap-5 animate-fade-up">
        <div className="w-16 h-16 rounded-full bg-emerald-50 flex items-center justify-center">
          <CheckCircle size={32} className="text-emerald-500" />
        </div>
        <div>
          <h1 className="font-display text-2xl text-calm-blue mb-2">Протокол отправлен!</h1>
          <p className="text-text-muted font-body">
            Ваш протокол передан на рецензию этическому комитету. Обычно это занимает 3–5 рабочих дней.
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" onClick={() => navigate('/protocols')}>К библиотеке</Button>
          <Button variant="coral" onClick={() => navigate('/expert/dashboard')}>Мой кабинет</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 pb-16">

      {/* Back */}
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-1.5 text-sm text-text-muted font-body hover:text-calm-blue transition-colors mt-4 mb-4"
      >
        <ArrowLeft size={16} /> Назад
      </button>

      {/* Header */}
      <div className="flex items-start justify-between gap-3 mb-6">
        <div>
          <h1 className="font-display text-2xl text-calm-blue">Создание протокола</h1>
          <p className="text-sm text-text-muted font-body">Доказательный медицинский алгоритм</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setTab('preview')}
            leftIcon={<Eye size={14} />}
          >
            Превью
          </Button>
          <Button
            variant="coral"
            size="sm"
            onClick={handleSubmit}
            leftIcon={<Send size={14} />}
          >
            Отправить
          </Button>
        </div>
      </div>

      {/* Progress */}
      <div className="flex gap-1 bg-calm-blue-50 p-1 rounded-xl mb-6">
        {(['meta', 'steps', 'sources', 'preview'] as const).map((t) => (
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
            {{ meta: 'Основное', steps: `Шаги (${draft.steps.length})`, sources: 'Источники', preview: 'Превью' }[t]}
          </button>
        ))}
      </div>

      {/* Validation banner */}
      {showValidation && !validation.ok && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-2xl animate-fade-up">
          <div className="flex items-center gap-2 mb-2">
            <AlertCircle size={16} className="text-warm-coral" />
            <p className="font-semibold text-warm-coral font-body text-sm">Исправьте ошибки перед отправкой</p>
          </div>
          <ul className="flex flex-col gap-1">
            {validation.errors.map((e, i) => (
              <li key={i} className="text-xs text-warm-coral font-body flex items-start gap-1.5">
                <span className="mt-0.5 shrink-0">•</span> {e}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* ── Tab: Meta ── */}
      {tab === 'meta' && (
        <div className="flex flex-col gap-4 animate-fade-up">
          <Card>
            <h2 className="font-display text-lg text-calm-blue mb-4">Основная информация</h2>
            <div className="flex flex-col gap-3">
              <Input
                label="Название протокола *"
                placeholder="Например: Протокол ведения гипертонии I–II степени"
                value={draft.title}
                onChange={(e) => update('title', e.target.value)}
              />

              <div>
                <label className="block text-sm font-semibold text-text-primary font-body mb-1.5">
                  Специальность *
                </label>
                <select
                  value={draft.specialty}
                  onChange={(e) => update('specialty', e.target.value as Specialty)}
                  className="w-full px-3 py-3 rounded-xl border border-calm-blue-100 bg-white text-base font-body focus:outline-none focus:border-soft-blue focus:ring-2 focus:ring-soft-blue/20 transition-all"
                >
                  <option value="">— выберите специальность —</option>
                  {SPECIALTIES.map((s) => (
                    <option key={s.value} value={s.value}>{s.label}</option>
                  ))}
                </select>
              </div>

              <Textarea
                label="Краткое описание *"
                placeholder="1–2 предложения о том, что охватывает протокол"
                value={draft.summary}
                onChange={(e) => update('summary', e.target.value)}
                rows={3}
              />

              <Textarea
                label="Подробное описание"
                placeholder="Методологическая база, область применения, целевая аудитория"
                value={draft.fullDescription}
                onChange={(e) => update('fullDescription', e.target.value)}
                rows={5}
              />
            </div>
          </Card>

          <Card>
            <h2 className="font-display text-lg text-calm-blue mb-4">Доказательность и цена</h2>
            <div className="flex flex-col gap-3">
              <div>
                <label className="block text-sm font-semibold text-text-primary font-body mb-2">
                  Уровень доказательности
                </label>
                <div className="flex gap-2">
                  {([
                    { val: 'high',     label: 'Высокий',   color: 'emerald' },
                    { val: 'moderate', label: 'Умеренный', color: 'amber'   },
                    { val: 'low',      label: 'Начальный', color: 'default' },
                  ] as const).map(({ val, label }) => (
                    <button
                      key={val}
                      onClick={() => update('evidence', val)}
                      className={cn(
                        'flex-1 py-2 rounded-xl border-2 text-sm font-semibold font-body transition-all',
                        draft.evidence === val
                          ? 'border-soft-blue bg-soft-blue-50 text-soft-blue'
                          : 'border-calm-blue-100 text-text-muted hover:border-soft-blue'
                      )}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              <Input
                label="Цена ($)"
                type="number"
                value={draft.price}
                onChange={(e) => update('price', e.target.value)}
                hint="Введите 0 для бесплатного протокола"
              />

              <Input
                label="Теги (через запятую)"
                placeholder="гипертония, АД, профилактика"
                value={draft.tags}
                onChange={(e) => update('tags', e.target.value)}
              />
            </div>
          </Card>

          {/* Objectives */}
          <Card>
            <h2 className="font-display text-lg text-calm-blue mb-1">Цели обучения *</h2>
            <p className="text-xs text-text-muted font-body mb-3">Что читатель научится делать</p>
            <div className="flex flex-col gap-2">
              {draft.objectives.map((obj, i) => (
                <div key={i} className="flex gap-2">
                  <Input
                    placeholder={`Цель ${i + 1}`}
                    value={obj}
                    onChange={(e) => updateList('objectives', i, e.target.value)}
                    className="flex-1"
                  />
                  {draft.objectives.length > 1 && (
                    <button
                      onClick={() => removeListItem('objectives', i)}
                      className="p-2 text-text-muted hover:text-warm-coral transition-colors"
                    >
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>
              ))}
              <Button variant="ghost" size="sm" onClick={() => addListItem('objectives')} leftIcon={<Plus size={14} />}>
                Добавить цель
              </Button>
            </div>
          </Card>

          {/* Contraindications */}
          <Card>
            <h2 className="font-display text-lg text-calm-blue mb-1">Противопоказания</h2>
            <p className="text-xs text-text-muted font-body mb-3">Случаи, когда протокол не применим</p>
            <div className="flex flex-col gap-2">
              {draft.contraindications.map((c, i) => (
                <div key={i} className="flex gap-2">
                  <Input
                    placeholder={`Противопоказание ${i + 1}`}
                    value={c}
                    onChange={(e) => updateList('contraindications', i, e.target.value)}
                    className="flex-1"
                  />
                  {draft.contraindications.length > 1 && (
                    <button onClick={() => removeListItem('contraindications', i)} className="p-2 text-text-muted hover:text-warm-coral">
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>
              ))}
              <Button variant="ghost" size="sm" onClick={() => addListItem('contraindications')} leftIcon={<Plus size={14} />}>
                Добавить
              </Button>
            </div>
          </Card>

          <div className="flex justify-end">
            <Button variant="primary" size="md" onClick={() => setTab('steps')}>
              Далее: Шаги →
            </Button>
          </div>
        </div>
      )}

      {/* ── Tab: Steps ── */}
      {tab === 'steps' && (
        <div className="flex flex-col gap-4 animate-fade-up">
          <div className="p-3 bg-calm-blue-50 border border-calm-blue-100 rounded-xl flex items-start gap-2">
            <Info size={14} className="text-soft-blue shrink-0 mt-0.5" />
            <p className="text-xs text-text-muted font-body">
              Опишите каждый шаг подробно. Читатель будет следовать им последовательно. Первые 2 шага видны бесплатно.
            </p>
          </div>

          {draft.steps.map((step, idx) => (
            <StepEditor
              key={step.id}
              step={step}
              index={idx}
              isExpanded={expandedStep === step.id}
              onToggle={() => setExpandedStep(expandedStep === step.id ? null : step.id)}
              onChange={(key, val) => updateStep(step.id, key, val)}
              onRemove={() => removeStep(step.id)}
              onMoveUp={() => moveStep(step.id, -1)}
              onMoveDown={() => moveStep(step.id, 1)}
              canMoveUp={idx > 0}
              canMoveDown={idx < draft.steps.length - 1}
              canRemove={draft.steps.length > 1}
            />
          ))}

          <Button variant="outline" size="md" onClick={addStep} leftIcon={<Plus size={16} />} fullWidth>
            Добавить шаг
          </Button>

          <div className="flex justify-between">
            <Button variant="ghost" size="md" onClick={() => setTab('meta')}>← Назад</Button>
            <Button variant="primary" size="md" onClick={() => setTab('sources')}>Далее: Источники →</Button>
          </div>
        </div>
      )}

      {/* ── Tab: Sources ── */}
      {tab === 'sources' && (
        <div className="flex flex-col gap-4 animate-fade-up">
          <Card>
            <h2 className="font-display text-lg text-calm-blue mb-1">Источники *</h2>
            <p className="text-xs text-text-muted font-body mb-3">
              Клинические рекомендации, исследования, руководства
            </p>
            <div className="flex flex-col gap-2">
              {draft.sources.map((s, i) => (
                <div key={i} className="flex gap-2">
                  <Input
                    placeholder="Название и год источника"
                    value={s}
                    onChange={(e) => updateList('sources', i, e.target.value)}
                    className="flex-1"
                  />
                  {draft.sources.length > 1 && (
                    <button onClick={() => removeListItem('sources', i)} className="p-2 text-text-muted hover:text-warm-coral">
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>
              ))}
              <Button variant="ghost" size="sm" onClick={() => addListItem('sources')} leftIcon={<Plus size={14} />}>
                Добавить источник
              </Button>
            </div>
          </Card>

          {/* Conflict of interest */}
          <Card>
            <h2 className="font-display text-lg text-calm-blue mb-1">Конфликт интересов</h2>
            <p className="text-xs text-text-muted font-body mb-3">
              Укажите, если есть связи с производителями препаратов или оборудования
            </p>
            <Textarea
              placeholder="Нет конфликта интересов / Укажите детали…"
              rows={3}
            />
          </Card>

          {/* Ethics statement */}
          <Card>
            <div className="flex items-start gap-3">
              <input type="checkbox" id="ethics" className="accent-soft-blue w-4 h-4 mt-0.5" />
              <label htmlFor="ethics" className="text-sm font-body text-text-primary cursor-pointer">
                Я подтверждаю, что протокол основан на доказательной медицине, не содержит ненаучных методов и не направлен на продвижение коммерческих продуктов
              </label>
            </div>
          </Card>

          <div className="flex justify-between">
            <Button variant="ghost" size="md" onClick={() => setTab('steps')}>← Назад</Button>
            <Button variant="coral" size="md" onClick={handleSubmit} leftIcon={<Send size={16} />}>
              Отправить на рецензию
            </Button>
          </div>
        </div>
      )}

      {/* ── Tab: Preview ── */}
      {tab === 'preview' && (
        <div className="flex flex-col gap-4 animate-fade-up">
          <Card className="bg-gradient-to-br from-calm-blue-50 to-soft-blue/10">
            <Badge variant="default" size="sm" className="mb-2">
              {SPECIALTIES.find((s) => s.value === draft.specialty)?.label ?? 'Специальность'}
            </Badge>
            <h1 className="font-display text-xl text-calm-blue mb-2">
              {draft.title || 'Название протокола'}
            </h1>
            <p className="text-sm text-text-muted font-body leading-relaxed">
              {draft.summary || 'Краткое описание появится здесь'}
            </p>
          </Card>

          {draft.steps.length > 0 && (
            <Card>
              <h2 className="font-display text-lg text-calm-blue mb-3">Шаги ({draft.steps.length})</h2>
              {draft.steps.map((step, i) => (
                <div key={step.id} className="flex items-start gap-3 py-2 border-b border-calm-blue-50 last:border-0">
                  <span className="w-6 h-6 rounded-full bg-soft-blue text-white text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                    {i + 1}
                  </span>
                  <div>
                    <p className="font-semibold text-sm font-body text-text-primary">
                      {step.title || `Шаг ${i + 1}`}
                    </p>
                    {step.description && (
                      <p className="text-xs text-text-muted font-body mt-0.5">{step.description}</p>
                    )}
                  </div>
                </div>
              ))}
            </Card>
          )}

          <div className="flex gap-3">
            <Button variant="outline" size="md" onClick={() => setTab('sources')}>← Редактировать</Button>
            <Button variant="coral" size="md" onClick={handleSubmit} leftIcon={<Send size={16} />} fullWidth>
              Отправить на рецензию
            </Button>
          </div>
        </div>
      )}

      {/* Validation modal */}
      <Modal isOpen={showValidation && !validation.ok} onClose={() => setShowValidation(false)} title="Заполните обязательные поля" size="sm">
        <ul className="flex flex-col gap-2 mb-4">
          {validation.errors.map((e, i) => (
            <li key={i} className="flex items-start gap-2 text-sm font-body text-warm-coral">
              <AlertCircle size={14} className="shrink-0 mt-0.5" /> {e}
            </li>
          ))}
        </ul>
        <Button variant="primary" size="md" fullWidth onClick={() => setShowValidation(false)}>
          Понятно
        </Button>
      </Modal>
    </div>
  );
}

// ─── Step editor ─────────────────────────────────────────────────────
function StepEditor({
  step, index, isExpanded, onToggle, onChange, onRemove,
  onMoveUp, onMoveDown, canMoveUp, canMoveDown, canRemove,
}: {
  step: ProtocolStep; index: number; isExpanded: boolean;
  onToggle: () => void;
  onChange: (key: keyof ProtocolStep, val: string) => void;
  onRemove: () => void;
  onMoveUp: () => void; onMoveDown: () => void;
  canMoveUp: boolean; canMoveDown: boolean; canRemove: boolean;
}) {
  return (
    <Card className={cn('transition-all', isExpanded && 'ring-2 ring-soft-blue')}>
      {/* Header */}
      <div className="flex items-center gap-2">
        <span className="w-7 h-7 rounded-full bg-soft-blue text-white text-xs font-bold flex items-center justify-center shrink-0">
          {index + 1}
        </span>
        <div className="flex-1 min-w-0 cursor-pointer" onClick={onToggle}>
          <p className={cn('text-sm font-semibold font-body', step.title ? 'text-text-primary' : 'text-text-muted italic')}>
            {step.title || 'Без названия'}
          </p>
          {index < 2 && <span className="text-xs text-emerald-600 font-body">Виден бесплатно</span>}
        </div>
        <div className="flex items-center gap-1 shrink-0">
          <button
            onClick={onMoveUp}
            disabled={!canMoveUp}
            className="p-1.5 text-text-muted hover:text-calm-blue disabled:opacity-30 transition-colors"
            aria-label="Выше"
          >
            <ChevronUp size={15} />
          </button>
          <button
            onClick={onMoveDown}
            disabled={!canMoveDown}
            className="p-1.5 text-text-muted hover:text-calm-blue disabled:opacity-30 transition-colors"
            aria-label="Ниже"
          >
            <ChevronDown size={15} />
          </button>
          <GripVertical size={15} className="text-calm-blue-100" />
          {canRemove && (
            <button onClick={onRemove} className="p-1.5 text-text-muted hover:text-warm-coral transition-colors" aria-label="Удалить">
              <Trash2 size={15} />
            </button>
          )}
          <button onClick={onToggle} className="p-1.5 text-text-muted hover:text-calm-blue transition-colors">
            {isExpanded ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
          </button>
        </div>
      </div>

      {/* Expanded */}
      {isExpanded && (
        <div className="mt-4 flex flex-col gap-3">
          <Input
            label="Заголовок шага *"
            placeholder="Например: Измерение АД"
            value={step.title}
            onChange={(e) => onChange('title', e.target.value)}
          />
          <Textarea
            label="Описание *"
            placeholder="Подробные инструкции для этого шага"
            value={step.description}
            onChange={(e) => onChange('description', e.target.value)}
            rows={4}
          />
          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Длительность"
              placeholder="10 мин"
              value={step.duration}
              onChange={(e) => onChange('duration', e.target.value)}
            />
            <Input
              label="Ссылка на доказательство"
              placeholder="Класс I, уровень A"
              value={step.evidenceNote}
              onChange={(e) => onChange('evidenceNote', e.target.value)}
            />
          </div>
        </div>
      )}
    </Card>
  );
}
