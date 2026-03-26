import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search, SlidersHorizontal, Video,
  Calendar, Bot, Heart, X,
} from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge, EthicsBadge } from '../components/ui/Badge';
import { Avatar } from '../components/ui/Avatar';
import { StarRating } from '../components/ui/StarRating';
import { PageLayout, PageHeader } from '../components/layout/PageLayout';
import { cn } from '../utils/cn';
import type { Specialty } from '../types';

// ─── Demo data ─────────────────────────────────────────────────────
const DEMO_DOCTORS = [
  {
    id: '1',
    name: 'Анна Сергеева',
    specialty: 'Кардиолог' as const,
    specialtyKey: 'cardiology' as Specialty,
    bio: 'Кардиолог с 12-летним опытом. Специализируюсь на профилактике и лечении сердечно-сосудистых заболеваний.',
    rating: 4.9,
    reviewCount: 312,
    price: 89,
    languages: ['Русский', 'English'],
    nextSlot: new Date(Date.now() + 3 * 3600000).toISOString(),
    isAvailableToday: true,
    ethicsProfile: { lgbtqFriendly: true,  noInsurance: false, transparentPricing: true },
    aiRecommended: true,
    avatarUrl: undefined,
    videoUrl: undefined,
  },
  {
    id: '2',
    name: 'Иван Петров',
    specialty: 'Психотерапевт' as const,
    specialtyKey: 'psychology' as Specialty,
    bio: 'Психотерапевт, работаю с тревогой, депрессией и выгоранием. Подход: КПТ + ACT.',
    rating: 4.8,
    reviewCount: 198,
    price: 75,
    languages: ['Русский'],
    nextSlot: new Date(Date.now() + 26 * 3600000).toISOString(),
    isAvailableToday: false,
    ethicsProfile: { lgbtqFriendly: true,  noInsurance: true,  transparentPricing: true },
    aiRecommended: false,
    avatarUrl: undefined,
    videoUrl: undefined,
  },
  {
    id: '3',
    name: 'Мария Козлова',
    specialty: 'Нутрициолог' as const,
    specialtyKey: 'nutrition' as Specialty,
    bio: 'Нутрициолог и диетолог. Помогаю выстроить здоровые отношения с едой без запретов.',
    rating: 4.7,
    reviewCount: 144,
    price: 60,
    languages: ['Русский', 'English', 'Español'],
    nextSlot: new Date(Date.now() + 5 * 3600000).toISOString(),
    isAvailableToday: true,
    ethicsProfile: { lgbtqFriendly: true,  noInsurance: true,  transparentPricing: true },
    aiRecommended: false,
    avatarUrl: undefined,
    videoUrl: undefined,
  },
  {
    id: '4',
    name: 'Дмитрий Волков',
    specialty: 'Невролог' as const,
    specialtyKey: 'neurology' as Specialty,
    bio: 'Невролог, специализируюсь на головных болях, головокружении и нарушениях сна.',
    rating: 4.6,
    reviewCount: 87,
    price: 95,
    languages: ['Русский'],
    nextSlot: new Date(Date.now() + 50 * 3600000).toISOString(),
    isAvailableToday: false,
    ethicsProfile: { lgbtqFriendly: false, noInsurance: false, transparentPricing: true },
    aiRecommended: false,
    avatarUrl: undefined,
    videoUrl: undefined,
  },
];

const SPECIALTIES = [
  'Все', 'Кардиолог', 'Психотерапевт', 'Нутрициолог', 'Невролог',
  'Дерматолог', 'Педиатр', 'Гинеколог',
];

// ─── Screen ────────────────────────────────────────────────────────
export function DoctorListScreen() {
  const navigate = useNavigate();
  const [query,            setQuery]            = useState('');
  const [selectedSpec,     setSelectedSpec]     = useState('Все');
  const [showFilters,      setShowFilters]       = useState(false);
  const [filterToday,      setFilterToday]      = useState(false);
  const [filterLgbtq,      setFilterLgbtq]      = useState(false);
  const [filterNoInsurance,setFilterNoInsurance] = useState(false);
  const [filterTransparent,setFilterTransparent] = useState(false);
  const [maxPrice,         setMaxPrice]          = useState(200);

  const filtered = useMemo(() => {
    return DEMO_DOCTORS.filter((d) => {
      if (query && !d.name.toLowerCase().includes(query.toLowerCase()) &&
          !d.specialty.toLowerCase().includes(query.toLowerCase())) return false;
      if (selectedSpec !== 'Все' && d.specialty !== selectedSpec) return false;
      if (filterToday && !d.isAvailableToday) return false;
      if (filterLgbtq && !d.ethicsProfile.lgbtqFriendly) return false;
      if (filterNoInsurance && !d.ethicsProfile.noInsurance) return false;
      if (filterTransparent && !d.ethicsProfile.transparentPricing) return false;
      if (d.price > maxPrice) return false;
      return true;
    });
  }, [query, selectedSpec, filterToday, filterLgbtq, filterNoInsurance, filterTransparent, maxPrice]);

  const activeFilterCount = [
    filterToday, filterLgbtq, filterNoInsurance, filterTransparent,
    maxPrice < 200,
  ].filter(Boolean).length;

  return (
    <PageLayout>
      <PageHeader
        title="Найти врача"
        subtitle="Специалисты с этическим профилем и прозрачными ценами"
      />

      {/* Search */}
      <div className="flex gap-2 mb-4">
        <div className="relative flex-1">
          <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Поиск по имени или специальности…"
            className="w-full pl-10 pr-4 py-3 rounded-xl border border-calm-blue-100 bg-white text-base font-body placeholder:text-text-muted focus:outline-none focus:border-soft-blue focus:ring-2 focus:ring-soft-blue/20 transition-all"
            aria-label="Поиск врача"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-calm-blue"
              aria-label="Очистить поиск"
            >
              <X size={16} />
            </button>
          )}
        </div>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={cn(
            'flex items-center gap-2 px-4 py-3 rounded-xl border-2 text-sm font-semibold font-body transition-all',
            showFilters || activeFilterCount > 0
              ? 'border-soft-blue bg-soft-blue-50 text-soft-blue'
              : 'border-calm-blue-100 text-text-muted hover:border-soft-blue'
          )}
          aria-expanded={showFilters}
        >
          <SlidersHorizontal size={16} />
          Фильтры
          {activeFilterCount > 0 && (
            <span className="w-5 h-5 rounded-full bg-soft-blue text-white text-xs flex items-center justify-center">
              {activeFilterCount}
            </span>
          )}
        </button>
      </div>

      {/* Specialty tabs */}
      <div className="scroll-x flex gap-2 pb-1 mb-4">
        {SPECIALTIES.map((s) => (
          <button
            key={s}
            onClick={() => setSelectedSpec(s)}
            className={cn(
              'shrink-0 px-4 py-2 rounded-full text-sm font-medium font-body transition-all',
              selectedSpec === s
                ? 'bg-calm-blue text-white'
                : 'bg-white border border-calm-blue-100 text-text-muted hover:border-calm-blue hover:text-calm-blue'
            )}
          >
            {s}
          </button>
        ))}
      </div>

      {/* Filter panel */}
      {showFilters && (
        <Card className="mb-4 animate-fade-up">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-semibold text-text-primary font-body mb-2">Доступность</p>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={filterToday} onChange={(e) => setFilterToday(e.target.checked)} className="accent-soft-blue w-4 h-4" />
                <span className="text-sm font-body text-text-muted">Доступен сегодня</span>
              </label>
            </div>

            <div>
              <p className="text-sm font-semibold text-text-primary font-body mb-2">Цена до ${maxPrice}</p>
              <input
                type="range" min={30} max={200} step={5}
                value={maxPrice} onChange={(e) => setMaxPrice(Number(e.target.value))}
                className="w-full accent-soft-blue"
                aria-label="Максимальная цена"
              />
              <div className="flex justify-between text-xs text-text-muted font-body mt-1">
                <span>$30</span><span>$200</span>
              </div>
            </div>

            <div className="sm:col-span-2">
              <p className="text-sm font-semibold text-text-primary font-body mb-2">Этические стандарты</p>
              <div className="flex flex-wrap gap-3">
                {[
                  { label: 'ЛГБТQ+-friendly', value: filterLgbtq,       set: setFilterLgbtq       },
                  { label: 'Без страховки',   value: filterNoInsurance,  set: setFilterNoInsurance  },
                  { label: 'Прозрачные цены', value: filterTransparent,  set: setFilterTransparent  },
                ].map(({ label, value, set }) => (
                  <label key={label} className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={value} onChange={(e) => set(e.target.checked)} className="accent-soft-blue w-4 h-4" />
                    <span className="text-sm font-body text-text-muted">{label}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Results count */}
      <p className="text-sm text-text-muted font-body mb-4">
        Найдено: <strong className="text-calm-blue">{filtered.length}</strong> врачей
      </p>

      {/* Doctor cards */}
      {filtered.length === 0 ? (
        <EmptyState onResetFilters={() => {
          setQuery(''); setSelectedSpec('Все');
          setFilterToday(false); setFilterLgbtq(false);
          setFilterNoInsurance(false); setFilterTransparent(false);
          setMaxPrice(200);
        }} />
      ) : (
        <div className="flex flex-col gap-4 stagger-children">
          {filtered.map((doc) => (
            <DoctorCard key={doc.id} doctor={doc} onBook={() => navigate(`/doctors/${doc.id}`)} />
          ))}
        </div>
      )}
    </PageLayout>
  );
}

// ─── Doctor Card ───────────────────────────────────────────────────
function DoctorCard({ doctor, onBook }: { doctor: typeof DEMO_DOCTORS[0]; onBook: () => void }) {
  const slotDate = new Date(doctor.nextSlot);
  const isToday  = doctor.isAvailableToday;
  const slotStr  = isToday
    ? `Сегодня в ${slotDate.toLocaleTimeString('ru', { hour: '2-digit', minute: '2-digit' })}`
    : slotDate.toLocaleDateString('ru', { weekday: 'short', day: 'numeric', month: 'short' });

  return (
    <Card breathe className="cursor-pointer" onClick={onBook}>
      <div className="flex flex-col sm:flex-row gap-4">
        {/* Avatar + video */}
        <div className="relative shrink-0">
          <Avatar name={doctor.name} src={doctor.avatarUrl} size="xl" />
          {doctor.videoUrl && (
            <button
              className="absolute -bottom-1 -right-1 w-7 h-7 bg-soft-blue text-white rounded-full flex items-center justify-center shadow-soft hover:bg-soft-blue-600 transition-colors"
              aria-label="Видео-знакомство"
              onClick={(e) => { e.stopPropagation(); }}
            >
              <Video size={12} />
            </button>
          )}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 flex-wrap">
            <div>
              <h3 className="font-display text-lg text-calm-blue">{doctor.name}</h3>
              <p className="text-sm text-text-muted font-body">{doctor.specialty}</p>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              {doctor.aiRecommended && (
                <Badge variant="soft-blue" size="sm">
                  <Bot size={10} /> AI рекомендует
                </Badge>
              )}
            </div>
          </div>

          <StarRating value={doctor.rating} count={doctor.reviewCount} size="sm" className="mt-1.5 mb-2" />

          <p className="text-sm text-text-muted font-body line-clamp-2 mb-3">{doctor.bio}</p>

          {/* Ethics badges */}
          <div className="flex flex-wrap gap-1.5 mb-3">
            {doctor.ethicsProfile.lgbtqFriendly      && <EthicsBadge label="ЛГБТQ+-friendly" />}
            {doctor.ethicsProfile.noInsurance        && <EthicsBadge label="Без страховки"   />}
            {doctor.ethicsProfile.transparentPricing && <EthicsBadge label="Прозрачные цены" />}
          </div>

          {/* Languages */}
          <div className="flex flex-wrap gap-1 mb-3">
            {doctor.languages.map((l) => (
              <Badge key={l} variant="default" size="sm">{l}</Badge>
            ))}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between mt-3 pt-3 border-t border-calm-blue-50 gap-3 flex-wrap">
        <div>
          <div className="flex items-center gap-1.5">
            <Calendar size={14} className={isToday ? 'text-green-health' : 'text-text-muted'} />
            <span className={cn('text-sm font-body', isToday ? 'text-green-health font-semibold' : 'text-text-muted')}>
              {slotStr}
            </span>
          </div>
          <p className="text-xs text-text-muted font-body mt-0.5">
            от <strong className="text-calm-blue">${doctor.price}</strong> / консультация
          </p>
        </div>
        <Button variant="coral" size="sm" onClick={(e) => { e.stopPropagation(); onBook(); }}>
          Записаться
        </Button>
      </div>
    </Card>
  );
}

// ─── Empty state ───────────────────────────────────────────────────
function EmptyState({ onResetFilters }: { onResetFilters: () => void }) {
  const navigate = useNavigate();
  return (
    <div className="flex flex-col items-center py-16 gap-4 text-center">
      <div className="w-14 h-14 bg-calm-blue-50 rounded-3xl flex items-center justify-center">
        <Heart size={24} className="text-calm-blue-200" />
      </div>
      <div>
        <p className="font-display text-xl text-calm-blue mb-1">Врачи не найдены</p>
        <p className="text-text-muted font-body text-sm">
          Попробуйте изменить фильтры или задайте вопрос AI-ассистенту
        </p>
      </div>
      <div className="flex gap-3 flex-wrap justify-center">
        <Button variant="outline" size="sm" onClick={onResetFilters}>Сбросить фильтры</Button>
        <Button variant="primary" size="sm" onClick={() => navigate('/ai-assistant')}>
          <Bot size={14} /> Спросить AI
        </Button>
      </div>
    </div>
  );
}
