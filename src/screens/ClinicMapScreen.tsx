import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  MapPin, Star, Clock, Phone, Navigation,
  Search, X, ChevronRight, Filter,
} from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { PageLayout, PageHeader } from '../components/layout/PageLayout';
import { cn } from '../utils/cn';

// ─── Demo data ─────────────────────────────────────────────────────
type Clinic = {
  id: string;
  name: string;
  address: string;
  distance: number;
  rating: number;
  reviewCount: number;
  phone: string;
  openHours: string;
  isOpen: boolean;
  specialties: string[];
  acceptsNoInsurance: boolean;
  lgbtqFriendly: boolean;
  lat: number;
  lng: number;
};

const DEMO_CLINICS: Clinic[] = [
  {
    id: 'c1', name: 'Медицинский центр «Здоровье»',
    address: 'ул. Ленина, 45', distance: 0.3,
    rating: 4.8, reviewCount: 234, phone: '+7 (495) 123-45-67',
    openHours: '08:00–21:00', isOpen: true,
    specialties: ['Кардиология', 'Неврология', 'Терапия'],
    acceptsNoInsurance: true, lgbtqFriendly: true,
    lat: 55.751244, lng: 37.618423,
  },
  {
    id: 'c2', name: 'Поликлиника №12',
    address: 'пр-т Мира, 78', distance: 0.7,
    rating: 4.2, reviewCount: 89, phone: '+7 (495) 987-65-43',
    openHours: '09:00–18:00', isOpen: true,
    specialties: ['Терапия', 'Педиатрия', 'Гинекология'],
    acceptsNoInsurance: false, lgbtqFriendly: false,
    lat: 55.753244, lng: 37.622423,
  },
  {
    id: 'c3', name: 'Клиника «Лотос»',
    address: 'ул. Садовая, 12', distance: 1.2,
    rating: 4.9, reviewCount: 412, phone: '+7 (495) 555-00-11',
    openHours: '07:00–22:00', isOpen: true,
    specialties: ['Психотерапия', 'Нутрициология', 'Дерматология'],
    acceptsNoInsurance: true, lgbtqFriendly: true,
    lat: 55.748244, lng: 37.615423,
  },
  {
    id: 'c4', name: 'ГКБ №5',
    address: 'ул. Профсоюзная, 90', distance: 2.1,
    rating: 3.9, reviewCount: 67, phone: '+7 (495) 222-33-44',
    openHours: 'Круглосуточно', isOpen: true,
    specialties: ['Скорая помощь', 'Хирургия', 'Кардиология'],
    acceptsNoInsurance: true, lgbtqFriendly: false,
    lat: 55.745244, lng: 37.610423,
  },
  {
    id: 'c5', name: 'Женская консультация №3',
    address: 'бул. Тверской, 5', distance: 0.9,
    rating: 4.5, reviewCount: 156, phone: '+7 (495) 444-55-66',
    openHours: '08:00–20:00', isOpen: false,
    specialties: ['Гинекология', 'Акушерство'],
    acceptsNoInsurance: false, lgbtqFriendly: true,
    lat: 55.756244, lng: 37.620423,
  },
];

// ─── Screen ────────────────────────────────────────────────────────
export function ClinicMapScreen() {
  const navigate    = useNavigate();
  const [query,     setQuery]     = useState('');
  const [selected,  setSelected]  = useState<Clinic | null>(null);
  const [filterOpen,setFilterOpen]= useState(false);
  const [filterNoIns, setFilterNoIns]   = useState(false);
  const [filterLgbtq, setFilterLgbtq]   = useState(false);
  const [filterIsOpen, setFilterIsOpen] = useState(false);

  const filtered = DEMO_CLINICS.filter((c) => {
    if (query && !c.name.toLowerCase().includes(query.toLowerCase()) &&
        !c.address.toLowerCase().includes(query.toLowerCase()) &&
        !c.specialties.some((s) => s.toLowerCase().includes(query.toLowerCase()))) return false;
    if (filterNoIns  && !c.acceptsNoInsurance) return false;
    if (filterLgbtq  && !c.lgbtqFriendly)      return false;
    if (filterIsOpen && !c.isOpen)             return false;
    return true;
  }).sort((a, b) => a.distance - b.distance);

  const activeFilters = [filterNoIns, filterLgbtq, filterIsOpen].filter(Boolean).length;

  return (
    <PageLayout>
      <PageHeader title="Карта клиник" subtitle="Медицинские учреждения рядом с вами" />

      {/* Map placeholder */}
      <div className="w-full h-48 bg-gradient-to-br from-calm-blue-50 to-soft-blue/20 rounded-2xl mb-4 flex items-center justify-center border border-calm-blue-100 relative overflow-hidden">
        {/* Decorative map dots */}
        {DEMO_CLINICS.map((c) => (
          <button
            key={c.id}
            onClick={() => setSelected(c)}
            className={cn(
              'absolute w-6 h-6 rounded-full border-2 flex items-center justify-center transition-transform hover:scale-125',
              selected?.id === c.id
                ? 'bg-warm-coral border-white shadow-lg scale-125'
                : 'bg-calm-blue border-white shadow-soft'
            )}
            style={{
              left: `${20 + (c.lng - 37.610) * 800}%`,
              top:  `${30 + (55.760 - c.lat) * 1200}%`,
            }}
            aria-label={c.name}
          >
            <MapPin size={12} className="text-white" />
          </button>
        ))}

        <div className="text-center pointer-events-none">
          <p className="text-text-muted font-body text-sm opacity-0">Карта</p>
        </div>

        <div className="absolute bottom-3 right-3 bg-white/90 backdrop-blur-sm rounded-xl px-3 py-1.5 text-xs text-text-muted font-body shadow-soft">
          📍 Москва, Россия
        </div>
        <button className="absolute bottom-3 left-3 w-8 h-8 bg-white rounded-xl shadow-soft flex items-center justify-center text-calm-blue hover:bg-calm-blue-50 transition-colors">
          <Navigation size={14} />
        </button>
      </div>

      {/* Search + filter */}
      <div className="flex gap-2 mb-4">
        <div className="relative flex-1">
          <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Поиск по клинике или специальности…"
            className="w-full pl-10 pr-9 py-3 rounded-xl border border-calm-blue-100 bg-white text-base font-body placeholder:text-text-muted focus:outline-none focus:border-soft-blue focus:ring-2 focus:ring-soft-blue/20 transition-all"
          />
          {query && (
            <button onClick={() => setQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-calm-blue">
              <X size={16} />
            </button>
          )}
        </div>
        <button
          onClick={() => setFilterOpen(!filterOpen)}
          className={cn(
            'flex items-center gap-2 px-3 py-3 rounded-xl border-2 text-sm font-semibold font-body transition-all',
            filterOpen || activeFilters > 0
              ? 'border-soft-blue bg-soft-blue-50 text-soft-blue'
              : 'border-calm-blue-100 text-text-muted hover:border-soft-blue'
          )}
        >
          <Filter size={16} />
          {activeFilters > 0 && (
            <span className="w-5 h-5 rounded-full bg-soft-blue text-white text-xs flex items-center justify-center">
              {activeFilters}
            </span>
          )}
        </button>
      </div>

      {/* Filter panel */}
      {filterOpen && (
        <Card className="mb-4 animate-fade-up">
          <div className="flex flex-wrap gap-3">
            {[
              { label: 'Открыто сейчас',   value: filterIsOpen, set: setFilterIsOpen },
              { label: 'Без страховки',     value: filterNoIns,  set: setFilterNoIns  },
              { label: 'ЛГБТQ+-friendly',   value: filterLgbtq,  set: setFilterLgbtq  },
            ].map(({ label, value, set }) => (
              <label key={label} className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={value} onChange={(e) => set(e.target.checked)} className="accent-soft-blue w-4 h-4" />
                <span className="text-sm font-body text-text-muted">{label}</span>
              </label>
            ))}
          </div>
        </Card>
      )}

      {/* Count */}
      <p className="text-sm text-text-muted font-body mb-4">
        Найдено: <strong className="text-calm-blue">{filtered.length}</strong> клиник
      </p>

      {/* List */}
      <div className="flex flex-col gap-3 stagger-children">
        {filtered.map((clinic) => (
          <ClinicCard
            key={clinic.id}
            clinic={clinic}
            isSelected={selected?.id === clinic.id}
            onClick={() => setSelected(selected?.id === clinic.id ? null : clinic)}
            onBook={() => navigate('/doctors')}
          />
        ))}
      </div>
    </PageLayout>
  );
}

// ─── Clinic card ────────────────────────────────────────────────────
function ClinicCard({
  clinic: c, isSelected, onClick, onBook,
}: {
  clinic: Clinic; isSelected: boolean;
  onClick: () => void; onBook: () => void;
}) {
  return (
    <Card
      breathe
      className={cn('cursor-pointer transition-all', isSelected && 'ring-2 ring-soft-blue')}
      onClick={onClick}
    >
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="flex-1">
          <h3 className="font-display text-base text-calm-blue">{c.name}</h3>
          <div className="flex items-center gap-1.5 text-sm text-text-muted font-body mt-0.5">
            <MapPin size={13} className="shrink-0" />
            {c.address} · {c.distance} км
          </div>
        </div>
        <div className="flex flex-col items-end gap-1 shrink-0">
          <div className="flex items-center gap-1 text-sm font-body">
            <Star size={13} className="text-warm-coral" fill="currentColor" />
            <span className="font-semibold text-text-primary">{c.rating}</span>
            <span className="text-text-muted">({c.reviewCount})</span>
          </div>
          <Badge variant={c.isOpen ? 'green' : 'coral'} size="sm">
            {c.isOpen ? 'Открыто' : 'Закрыто'}
          </Badge>
        </div>
      </div>

      {/* Specialties */}
      <div className="flex flex-wrap gap-1 mb-2">
        {c.specialties.slice(0, 3).map((s) => (
          <span key={s} className="px-2 py-0.5 bg-calm-blue-50 rounded-full text-xs text-text-muted font-body">{s}</span>
        ))}
        {c.specialties.length > 3 && (
          <span className="px-2 py-0.5 bg-calm-blue-50 rounded-full text-xs text-text-muted font-body">+{c.specialties.length - 3}</span>
        )}
      </div>

      {/* Ethics */}
      <div className="flex gap-2 mb-2">
        {c.acceptsNoInsurance && <Badge variant="soft-blue" size="sm">Без страховки</Badge>}
        {c.lgbtqFriendly       && <Badge variant="green"    size="sm">ЛГБТQ+-friendly</Badge>}
      </div>

      {/* Expanded info */}
      {isSelected && (
        <div className="mt-3 pt-3 border-t border-calm-blue-50 animate-fade-up">
          <div className="flex items-center gap-4 text-sm font-body text-text-muted mb-3">
            <span className="flex items-center gap-1.5"><Clock size={13} /> {c.openHours}</span>
            <span className="flex items-center gap-1.5"><Phone size={13} /> {c.phone}</span>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" leftIcon={<Phone size={14} />} onClick={(e) => e.stopPropagation()}>
              Позвонить
            </Button>
            <Button variant="coral" size="sm" rightIcon={<ChevronRight size={14} />} onClick={(e) => { e.stopPropagation(); onBook(); }}>
              Записаться
            </Button>
          </div>
        </div>
      )}
    </Card>
  );
}
