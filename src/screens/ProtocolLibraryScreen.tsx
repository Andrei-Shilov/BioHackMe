import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search, BookOpen, Star, ShieldCheck,
  TrendingUp, Clock, Users, ChevronRight, X,
} from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Avatar } from '../components/ui/Avatar';
import { StarRating } from '../components/ui/StarRating';
import { PageLayout, PageHeader } from '../components/layout/PageLayout';
import { cn } from '../utils/cn';
import type { Specialty } from '../types';

// ─── Demo data ─────────────────────────────────────────────────────
type Protocol = {
  id: string;
  title: string;
  specialty: Specialty;
  specialtyLabel: string;
  author: string;
  authorAvatar?: string;
  rating: number;
  reviewCount: number;
  purchases: number;
  price: number | 'free';
  updatedAt: string;
  readTime: number;
  evidence: 'high' | 'moderate' | 'low';
  tags: string[];
  summary: string;
  isFeatured?: boolean;
};

const DEMO_PROTOCOLS: Protocol[] = [
  {
    id: 'p1',
    title: 'Протокол ведения гипертонии I–II степени',
    specialty: 'cardiology',
    specialtyLabel: 'Кардиология',
    author: 'Анна Сергеева',
    rating: 4.9,
    reviewCount: 87,
    purchases: 1240,
    price: 29,
    updatedAt: '2024-11-10',
    readTime: 15,
    evidence: 'high',
    tags: ['гипертония', 'АД', 'профилактика', 'антигипертензивная терапия'],
    summary: 'Доказательный алгоритм диагностики и лечения гипертонической болезни с учётом сопутствующих заболеваний.',
    isFeatured: true,
  },
  {
    id: 'p2',
    title: 'КПТ при тревожных расстройствах: пошаговый протокол',
    specialty: 'psychology',
    specialtyLabel: 'Психотерапия',
    author: 'Иван Петров',
    rating: 4.8,
    reviewCount: 63,
    purchases: 890,
    price: 19,
    updatedAt: '2024-10-28',
    readTime: 20,
    evidence: 'high',
    tags: ['тревога', 'КПТ', 'панические атаки', 'ОКР'],
    summary: 'Структурированная программа на 12 сессий с упражнениями и домашними заданиями.',
  },
  {
    id: 'p3',
    title: 'Противовоспалительное питание: от теории к практике',
    specialty: 'nutrition',
    specialtyLabel: 'Нутрициология',
    author: 'Мария Козлова',
    rating: 4.7,
    reviewCount: 42,
    purchases: 650,
    price: 'free',
    updatedAt: '2024-09-15',
    readTime: 12,
    evidence: 'moderate',
    tags: ['питание', 'воспаление', 'омега-3', 'диета'],
    summary: 'Практическое руководство по переходу на противовоспалительный тип питания с примерами меню.',
  },
  {
    id: 'p4',
    title: 'Дифференциальная диагностика головной боли',
    specialty: 'neurology',
    specialtyLabel: 'Неврология',
    author: 'Дмитрий Волков',
    rating: 4.6,
    reviewCount: 31,
    purchases: 430,
    price: 35,
    updatedAt: '2024-08-20',
    readTime: 25,
    evidence: 'high',
    tags: ['головная боль', 'мигрень', 'цервикогенная', 'диагностика'],
    summary: 'Алгоритм различения типов головной боли: от первичных до вторичных с тревожными признаками.',
  },
  {
    id: 'p5',
    title: 'Здоровый сон: гигиена и когнитивные стратегии',
    specialty: 'psychology',
    specialtyLabel: 'Психотерапия',
    author: 'Иван Петров',
    rating: 4.5,
    reviewCount: 28,
    purchases: 380,
    price: 15,
    updatedAt: '2024-07-05',
    readTime: 10,
    evidence: 'moderate',
    tags: ['сон', 'бессонница', 'КПТ-И', 'релаксация'],
    summary: 'Протокол когнитивно-поведенческой терапии бессонницы (КПТ-И) из 6 шагов.',
  },
];

const SPECIALTIES = [
  { key: 'all',        label: 'Все' },
  { key: 'cardiology', label: 'Кардиология' },
  { key: 'psychology', label: 'Психотерапия' },
  { key: 'nutrition',  label: 'Нутрициология' },
  { key: 'neurology',  label: 'Неврология' },
];

const EVIDENCE_LABEL: Record<Protocol['evidence'], string> = {
  high:     'Высокая доказательность',
  moderate: 'Умеренная доказательность',
  low:      'Начальный уровень',
};
const EVIDENCE_COLOR: Record<Protocol['evidence'], string> = {
  high:     'text-emerald-600 bg-emerald-50 border-emerald-200',
  moderate: 'text-amber-600 bg-amber-50 border-amber-200',
  low:      'text-text-muted bg-calm-blue-50 border-calm-blue-100',
};

// ─── Screen ────────────────────────────────────────────────────────
export function ProtocolLibraryScreen() {
  const navigate = useNavigate();
  const [query,       setQuery]       = useState('');
  const [specialty,   setSpecialty]   = useState('all');
  const [sortBy,      setSortBy]      = useState<'popular' | 'rating' | 'newest'>('popular');

  const filtered = useMemo(() => {
    return DEMO_PROTOCOLS
      .filter((p) => {
        if (specialty !== 'all' && p.specialty !== specialty) return false;
        if (query && !p.title.toLowerCase().includes(query.toLowerCase()) &&
            !p.tags.some((t) => t.toLowerCase().includes(query.toLowerCase()))) return false;
        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'popular') return b.purchases - a.purchases;
        if (sortBy === 'rating')  return b.rating   - a.rating;
        return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
      });
  }, [query, specialty, sortBy]);

  const featured = DEMO_PROTOCOLS.find((p) => p.isFeatured);

  return (
    <PageLayout>
      <PageHeader
        title="Библиотека протоколов"
        subtitle="Доказательные алгоритмы от верифицированных экспертов"
        action={
          <Button variant="coral" size="sm" onClick={() => navigate('/protocols/create')}>
            + Создать протокол
          </Button>
        }
      />

      {/* Featured */}
      {featured && (
        <Card
          breathe
          className="mb-6 bg-gradient-to-br from-calm-blue to-soft-blue text-white cursor-pointer"
          onClick={() => navigate(`/protocols/${featured.id}`)}
        >
          <div className="flex items-start justify-between gap-2">
            <div>
              <Badge variant="default" size="sm" className="mb-2 bg-white/20 text-white border-white/30">
                ⭐ Рекомендуем
              </Badge>
              <h2 className="font-display text-xl mb-1">{featured.title}</h2>
              <p className="text-sm opacity-80 font-body mb-3 line-clamp-2">{featured.summary}</p>
              <div className="flex items-center gap-3 text-sm opacity-80 font-body">
                <span className="flex items-center gap-1"><Users size={13} /> {featured.purchases.toLocaleString()}</span>
                <span className="flex items-center gap-1"><Star size={13} fill="currentColor" /> {featured.rating}</span>
                <span className="flex items-center gap-1"><Clock size={13} /> {featured.readTime} мин</span>
              </div>
            </div>
            <ChevronRight size={20} className="shrink-0 opacity-60 mt-1" />
          </div>
        </Card>
      )}

      {/* Search */}
      <div className="relative mb-4">
        <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Поиск по теме или тегу…"
          className="w-full pl-10 pr-10 py-3 rounded-xl border border-calm-blue-100 bg-white text-base font-body placeholder:text-text-muted focus:outline-none focus:border-soft-blue focus:ring-2 focus:ring-soft-blue/20 transition-all"
        />
        {query && (
          <button
            onClick={() => setQuery('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-calm-blue"
          >
            <X size={16} />
          </button>
        )}
      </div>

      {/* Specialty tabs */}
      <div className="scroll-x flex gap-2 pb-1 mb-4">
        {SPECIALTIES.map((s) => (
          <button
            key={s.key}
            onClick={() => setSpecialty(s.key)}
            className={cn(
              'shrink-0 px-4 py-2 rounded-full text-sm font-medium font-body transition-all',
              specialty === s.key
                ? 'bg-calm-blue text-white'
                : 'bg-white border border-calm-blue-100 text-text-muted hover:border-calm-blue hover:text-calm-blue'
            )}
          >
            {s.label}
          </button>
        ))}
      </div>

      {/* Sort */}
      <div className="flex items-center gap-2 mb-4">
        <span className="text-sm text-text-muted font-body shrink-0">Сортировка:</span>
        {(['popular', 'rating', 'newest'] as const).map((s) => (
          <button
            key={s}
            onClick={() => setSortBy(s)}
            className={cn(
              'px-3 py-1 rounded-full text-xs font-medium font-body transition-all',
              sortBy === s
                ? 'bg-soft-blue text-white'
                : 'bg-white border border-calm-blue-100 text-text-muted hover:border-soft-blue'
            )}
          >
            {{ popular: 'Популярные', rating: 'По рейтингу', newest: 'Новые' }[s]}
          </button>
        ))}
      </div>

      {/* Count */}
      <p className="text-sm text-text-muted font-body mb-4">
        Найдено: <strong className="text-calm-blue">{filtered.length}</strong> протоколов
      </p>

      {/* List */}
      {filtered.length === 0 ? (
        <div className="text-center py-16 text-text-muted font-body">
          <BookOpen size={32} className="mx-auto mb-3 opacity-30" />
          Протоколы не найдены
        </div>
      ) : (
        <div className="flex flex-col gap-4 stagger-children">
          {filtered.map((p) => (
            <ProtocolCard
              key={p.id}
              protocol={p}
              onClick={() => navigate(`/protocols/${p.id}`)}
            />
          ))}
        </div>
      )}
    </PageLayout>
  );
}

// ─── Protocol card ──────────────────────────────────────────────────
export function ProtocolCard({ protocol: p, onClick }: { protocol: Protocol; onClick: () => void }) {
  return (
    <Card breathe className="cursor-pointer" onClick={onClick}>
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="flex-1 min-w-0">
          <h3 className="font-display text-base text-calm-blue line-clamp-2">{p.title}</h3>
          <p className="text-sm text-text-muted font-body mt-0.5">{p.specialtyLabel}</p>
        </div>
        <div className="text-right shrink-0">
          {p.price === 'free' ? (
            <Badge variant="green" size="sm">Бесплатно</Badge>
          ) : (
            <span className="font-display text-lg text-calm-blue">${p.price}</span>
          )}
        </div>
      </div>

      <p className="text-sm text-text-muted font-body line-clamp-2 mb-3">{p.summary}</p>

      {/* Evidence */}
      <div className={cn('inline-flex items-center gap-1.5 px-2 py-1 rounded-lg border text-xs font-body font-semibold mb-3', EVIDENCE_COLOR[p.evidence])}>
        <ShieldCheck size={11} />
        {EVIDENCE_LABEL[p.evidence]}
      </div>

      {/* Tags */}
      <div className="flex flex-wrap gap-1 mb-3">
        {p.tags.slice(0, 4).map((t) => (
          <span key={t} className="px-2 py-0.5 bg-calm-blue-50 rounded-full text-xs text-text-muted font-body">
            #{t}
          </span>
        ))}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between pt-3 border-t border-calm-blue-50">
        <div className="flex items-center gap-2">
          <Avatar name={p.author} src={p.authorAvatar} size="sm" />
          <span className="text-xs text-text-muted font-body">{p.author}</span>
        </div>
        <div className="flex items-center gap-3 text-xs text-text-muted font-body">
          <span className="flex items-center gap-1"><TrendingUp size={11} /> {p.purchases.toLocaleString()}</span>
          <StarRating value={p.rating} size="sm" />
          <span className="flex items-center gap-1"><Clock size={11} /> {p.readTime} мин</span>
        </div>
      </div>
    </Card>
  );
}
