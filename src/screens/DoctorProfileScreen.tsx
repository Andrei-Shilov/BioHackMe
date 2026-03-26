import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft, Star, Video, Calendar, Globe,
  Shield, Heart, Bot, Clock, ChevronRight,
} from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge, EthicsBadge, VerificationBadge } from '../components/ui/Badge';
import { Avatar } from '../components/ui/Avatar';
import { StarRating } from '../components/ui/StarRating';
import { ConfidenceIndicator } from '../components/ui/ProgressBar';
import { Modal } from '../components/ui/Modal';
import { cn } from '../utils/cn';
import type { Specialty } from '../types';

// ─── Demo data ─────────────────────────────────────────────────────
const DEMO_DOCTORS: Record<string, DoctorDetail> = {
  '1': {
    id: '1',
    name: 'Анна Сергеева',
    specialty: 'Кардиолог' as const,
    specialtyKey: 'cardiology' as Specialty,
    bio: 'Кардиолог с 12-летним опытом. Специализируюсь на профилактике и лечении сердечно-сосудистых заболеваний. Работаю с гипертонией, аритмией, сердечной недостаточностью.',
    longBio: 'Окончила Первый московский государственный медицинский университет имени И.М. Сеченова. Прошла ординатуру по кардиологии, стажировалась в клиниках Германии и Израиля. Член Российского кардиологического общества. Веду научную деятельность в области профилактической кардиологии.',
    rating: 4.9,
    reviewCount: 312,
    price: 89,
    languages: ['Русский', 'English'],
    education: ['МГМУ им. Сеченова, 2008', 'Ординатура: кардиология, 2010', 'Стажировка: Charite Berlin, 2014'],
    certifications: ['Кардиолог высшей категории', 'Эхокардиография', 'Холтер ЭКГ'],
    nextSlot: new Date(Date.now() + 3 * 3600000).toISOString(),
    isAvailableToday: true,
    ethicsProfile: { lgbtqFriendly: true, noInsurance: false, transparentPricing: true },
    aiRecommended: true,
    avatarUrl: undefined,
    videoUrl: undefined,
    slots: generateSlots(),
    reviews: [
      { id: 'r1', author: 'Мария К.', rating: 5, text: 'Очень внимательный врач, объяснила всё подробно и доступно. Назначила эффективное лечение.', date: '2024-11-15' },
      { id: 'r2', author: 'Андрей В.', rating: 5, text: 'Профессионал высшего класса. Быстро поставила диагноз, которого я ждал три месяца.', date: '2024-11-02' },
      { id: 'r3', author: 'Светлана П.', rating: 4, text: 'Хорошая консультация, только немного опоздала.', date: '2024-10-28' },
    ],
    conflictOfInterest: null,
  },
  '2': {
    id: '2',
    name: 'Иван Петров',
    specialty: 'Психотерапевт' as const,
    specialtyKey: 'psychology' as Specialty,
    bio: 'Психотерапевт, работаю с тревогой, депрессией и выгоранием. Подход: КПТ + ACT.',
    longBio: 'Специализируюсь на когнитивно-поведенческой терапии и терапии принятия и ответственности. Работаю с паническими атаками, ОКР, ПТСР. Создал авторскую программу по работе с профессиональным выгоранием.',
    rating: 4.8,
    reviewCount: 198,
    price: 75,
    languages: ['Русский'],
    education: ['МГУ, факультет психологии, 2011', 'Ординатура: психотерапия, 2013'],
    certifications: ['КПТ-терапевт', 'ACT-терапевт', 'EMDR practitioner'],
    nextSlot: new Date(Date.now() + 26 * 3600000).toISOString(),
    isAvailableToday: false,
    ethicsProfile: { lgbtqFriendly: true, noInsurance: true, transparentPricing: true },
    aiRecommended: false,
    avatarUrl: undefined,
    videoUrl: undefined,
    slots: generateSlots(1),
    reviews: [
      { id: 'r1', author: 'Тимур Л.', rating: 5, text: 'Иван помог мне справиться с паническими атаками. Очень рекомендую.', date: '2024-11-20' },
    ],
    conflictOfInterest: null,
  },
};

type DoctorDetail = {
  id: string; name: string; specialty: string; specialtyKey: Specialty;
  bio: string; longBio: string; rating: number; reviewCount: number; price: number;
  languages: string[];
  education: string[]; certifications: string[];
  nextSlot: string; isAvailableToday: boolean;
  ethicsProfile: { lgbtqFriendly: boolean; noInsurance: boolean; transparentPricing: boolean };
  aiRecommended: boolean; avatarUrl?: string; videoUrl?: string;
  slots: SlotDay[]; reviews: Review[]; conflictOfInterest: string | null;
};
type SlotDay  = { date: Date; times: string[] };
type Review   = { id: string; author: string; rating: number; text: string; date: string };

function generateSlots(startDays = 0): SlotDay[] {
  const days: SlotDay[] = [];
  for (let d = startDays; d < startDays + 5; d++) {
    const date = new Date(Date.now() + d * 86400000);
    days.push({
      date,
      times: ['09:00', '11:00', '13:00', '15:00', '17:00'].filter((_, i) => Math.random() > (i === 0 ? 0.5 : 0.3)),
    });
  }
  return days;
}

// ─── Screen ────────────────────────────────────────────────────────
export function DoctorProfileScreen() {
  const { id }          = useParams<{ id: string }>();
  const navigate        = useNavigate();
  const doctor          = id ? DEMO_DOCTORS[id] : null;
  const [tab,           setTab]           = useState<'overview' | 'schedule' | 'reviews'>('overview');
  const [selectedSlot,  setSelectedSlot]  = useState<{ day: SlotDay; time: string } | null>(null);
  const [showBookModal, setShowBookModal] = useState(false);
  const [bookingDone,   setBookingDone]   = useState(false);

  if (!doctor) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <p className="font-display text-2xl text-calm-blue">Врач не найден</p>
        <Button variant="outline" onClick={() => navigate('/doctors')}>
          <ArrowLeft size={16} /> Назад к списку
        </Button>
      </div>
    );
  }

  const handleBook = (day: SlotDay, time: string) => {
    setSelectedSlot({ day, time });
    setShowBookModal(true);
  };

  const confirmBooking = () => {
    setBookingDone(true);
    setShowBookModal(false);
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 pb-16">

      {/* Back */}
      <button
        onClick={() => navigate('/doctors')}
        className="flex items-center gap-1.5 text-sm text-text-muted font-body hover:text-calm-blue transition-colors mt-4 mb-6"
      >
        <ArrowLeft size={16} /> Назад к списку
      </button>

      {/* Hero card */}
      <Card className="mb-6">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Avatar */}
          <div className="relative shrink-0 self-start">
            <Avatar name={doctor.name} src={doctor.avatarUrl} size="xl" />
            {doctor.videoUrl && (
              <button
                className="absolute -bottom-1 -right-1 w-8 h-8 bg-soft-blue text-white rounded-full flex items-center justify-center shadow-soft hover:bg-soft-blue-600 transition-colors"
                aria-label="Видео-знакомство"
              >
                <Video size={14} />
              </button>
            )}
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2 flex-wrap">
              <div>
                <h1 className="font-display text-2xl text-calm-blue">{doctor.name}</h1>
                <p className="text-base text-text-muted font-body">{doctor.specialty}</p>
              </div>
              <div className="flex flex-col items-end gap-1">
                <VerificationBadge />
                {doctor.aiRecommended && (
                  <Badge variant="soft-blue" size="sm">
                    <Bot size={10} /> AI рекомендует
                  </Badge>
                )}
              </div>
            </div>

            <StarRating value={doctor.rating} count={doctor.reviewCount} size="md" className="mt-2 mb-3" />

            {/* Ethics */}
            <div className="flex flex-wrap gap-1.5 mb-3">
              {doctor.ethicsProfile.lgbtqFriendly      && <EthicsBadge label="ЛГБТQ+-friendly" />}
              {doctor.ethicsProfile.noInsurance        && <EthicsBadge label="Без страховки"   />}
              {doctor.ethicsProfile.transparentPricing && <EthicsBadge label="Прозрачные цены" />}
            </div>

            {/* Languages */}
            <div className="flex flex-wrap gap-1 mb-4">
              <Globe size={14} className="text-text-muted mt-0.5" />
              {doctor.languages.map((l) => (
                <Badge key={l} variant="default" size="sm">{l}</Badge>
              ))}
            </div>

            {/* Price + CTA */}
            <div className="flex items-center justify-between flex-wrap gap-3">
              <div>
                <p className="text-xs text-text-muted font-body">Стоимость консультации</p>
                <p className="text-2xl font-display text-calm-blue">${doctor.price}</p>
              </div>
              <Button
                variant="coral"
                size="md"
                onClick={() => setTab('schedule')}
                rightIcon={<Calendar size={16} />}
              >
                Записаться
              </Button>
            </div>
          </div>
        </div>

        {/* Next slot pill */}
        <div className={cn(
          'mt-4 flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-body',
          doctor.isAvailableToday
            ? 'bg-emerald-50 text-green-health border border-emerald-200'
            : 'bg-calm-blue-50 text-text-muted border border-calm-blue-100'
        )}>
          <Clock size={14} />
          <span>
            {doctor.isAvailableToday
              ? `Ближайший слот сегодня в ${new Date(doctor.nextSlot).toLocaleTimeString('ru', { hour: '2-digit', minute: '2-digit' })}`
              : `Ближайший слот: ${new Date(doctor.nextSlot).toLocaleDateString('ru', { weekday: 'short', day: 'numeric', month: 'short' })}`}
          </span>
          {doctor.isAvailableToday && (
            <span className="ml-auto w-2 h-2 rounded-full bg-green-health animate-pulse-soft" />
          )}
        </div>
      </Card>

      {/* Tabs */}
      <div className="flex gap-1 bg-calm-blue-50 p-1 rounded-xl mb-6">
        {(['overview', 'schedule', 'reviews'] as const).map((t) => (
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
            {{ overview: 'О враче', schedule: 'Расписание', reviews: 'Отзывы' }[t]}
          </button>
        ))}
      </div>

      {/* Tab: Overview */}
      {tab === 'overview' && (
        <div className="flex flex-col gap-4 animate-fade-up">
          <Card>
            <h2 className="font-display text-lg text-calm-blue mb-3">О специалисте</h2>
            <p className="text-sm text-text-primary font-body leading-relaxed mb-3">{doctor.bio}</p>
            <p className="text-sm text-text-muted font-body leading-relaxed">{doctor.longBio}</p>
          </Card>

          <Card>
            <h2 className="font-display text-lg text-calm-blue mb-3">Образование</h2>
            <ul className="flex flex-col gap-2">
              {doctor.education.map((e) => (
                <li key={e} className="flex items-start gap-2 text-sm font-body text-text-primary">
                  <span className="w-1.5 h-1.5 rounded-full bg-soft-blue mt-1.5 shrink-0" />
                  {e}
                </li>
              ))}
            </ul>
          </Card>

          <Card>
            <h2 className="font-display text-lg text-calm-blue mb-3">Сертификаты и специализации</h2>
            <div className="flex flex-wrap gap-2">
              {doctor.certifications.map((c) => (
                <Badge key={c} variant="green" size="md">
                  <Shield size={11} /> {c}
                </Badge>
              ))}
            </div>
          </Card>

          {/* Ethics detail */}
          <Card>
            <h2 className="font-display text-lg text-calm-blue mb-3">Этический профиль</h2>
            <div className="flex flex-col gap-2">
              <EthicsRow
                label="ЛГБТQ+-friendly среда"
                desc="Безопасное пространство для ЛГБТQ+ пациентов"
                active={doctor.ethicsProfile.lgbtqFriendly}
              />
              <EthicsRow
                label="Без требования страховки"
                desc="Принимает пациентов без медицинской страховки"
                active={doctor.ethicsProfile.noInsurance}
              />
              <EthicsRow
                label="Прозрачное ценообразование"
                desc="Все расценки указаны заранее, без скрытых платежей"
                active={doctor.ethicsProfile.transparentPricing}
              />
            </div>
            {doctor.conflictOfInterest && (
              <div className="mt-3 p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800 font-body">
                <strong>Раскрытие конфликта интересов:</strong> {doctor.conflictOfInterest}
              </div>
            )}
          </Card>

          {/* AI confidence */}
          <Card>
            <h2 className="font-display text-lg text-calm-blue mb-1">AI-оценка соответствия</h2>
            <p className="text-xs text-text-muted font-body mb-3">
              На основе вашего запроса и профиля врача
            </p>
            <ConfidenceIndicator value={doctor.aiRecommended ? 91 : 74} />
          </Card>
        </div>
      )}

      {/* Tab: Schedule */}
      {tab === 'schedule' && (
        <div className="flex flex-col gap-4 animate-fade-up">
          {bookingDone && (
            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center gap-3">
              <span className="text-2xl">✅</span>
              <div>
                <p className="font-semibold text-emerald-700 font-body">Запись подтверждена!</p>
                <p className="text-sm text-emerald-600 font-body">
                  Детали отправлены на email. Проверьте раздел «Записи».
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                className="ml-auto"
                onClick={() => navigate('/appointments')}
              >
                Мои записи <ChevronRight size={14} />
              </Button>
            </div>
          )}

          {doctor.slots.map((day, di) => (
            <Card key={di}>
              <p className="font-semibold text-text-primary font-body mb-3">
                {day.date.toLocaleDateString('ru', { weekday: 'long', day: 'numeric', month: 'long' })}
                {di === 0 && (
                  <Badge variant="green" size="sm" className="ml-2">Сегодня</Badge>
                )}
              </p>
              {day.times.length === 0 ? (
                <p className="text-sm text-text-muted font-body">Нет свободных слотов</p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {day.times.map((time) => (
                    <button
                      key={time}
                      onClick={() => handleBook(day, time)}
                      className="px-4 py-2 rounded-xl border-2 border-soft-blue text-soft-blue text-sm font-semibold font-body hover:bg-soft-blue hover:text-white transition-all"
                    >
                      {time}
                    </button>
                  ))}
                </div>
              )}
            </Card>
          ))}
        </div>
      )}

      {/* Tab: Reviews */}
      {tab === 'reviews' && (
        <div className="flex flex-col gap-4 animate-fade-up">
          <Card>
            <div className="flex items-center gap-4">
              <div className="text-center">
                <p className="font-display text-4xl text-calm-blue">{doctor.rating}</p>
                <StarRating value={doctor.rating} size="sm" className="justify-center" />
                <p className="text-xs text-text-muted font-body mt-1">{doctor.reviewCount} отзывов</p>
              </div>
              <div className="flex-1">
                {[5, 4, 3].map((stars) => {
                  const pct = stars === 5 ? 78 : stars === 4 ? 17 : 5;
                  return (
                    <div key={stars} className="flex items-center gap-2 mb-1">
                      <span className="text-xs text-text-muted font-body w-4">{stars}</span>
                      <Star size={11} className="text-warm-coral shrink-0" fill="currentColor" />
                      <div className="flex-1 h-2 bg-calm-blue-50 rounded-full overflow-hidden">
                        <div className="h-full bg-warm-coral rounded-full" style={{ width: `${pct}%` }} />
                      </div>
                      <span className="text-xs text-text-muted font-body w-8 text-right">{pct}%</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </Card>

          {doctor.reviews.map((review) => (
            <Card key={review.id}>
              <div className="flex items-start justify-between gap-2 mb-2">
                <div className="flex items-center gap-2">
                  <Avatar name={review.author} size="sm" />
                  <span className="font-semibold text-sm text-text-primary font-body">{review.author}</span>
                </div>
                <span className="text-xs text-text-muted font-body">
                  {new Date(review.date).toLocaleDateString('ru', { day: 'numeric', month: 'short', year: 'numeric' })}
                </span>
              </div>
              <StarRating value={review.rating} size="sm" className="mb-2" />
              <p className="text-sm text-text-primary font-body leading-relaxed">{review.text}</p>
            </Card>
          ))}
        </div>
      )}

      {/* Booking modal */}
      <Modal
        isOpen={showBookModal}
        onClose={() => setShowBookModal(false)}
        title="Подтверждение записи"
      >
        {selectedSlot && (
          <div className="flex flex-col gap-4">
            <div className="p-4 bg-calm-blue-50 rounded-2xl">
              <div className="flex items-center gap-3 mb-3">
                <Avatar name={doctor.name} src={doctor.avatarUrl} size="md" />
                <div>
                  <p className="font-semibold text-text-primary font-body">{doctor.name}</p>
                  <p className="text-sm text-text-muted font-body">{doctor.specialty}</p>
                </div>
              </div>
              <div className="flex flex-col gap-1.5 text-sm font-body text-text-primary">
                <div className="flex items-center gap-2">
                  <Calendar size={14} className="text-soft-blue" />
                  {selectedSlot.day.date.toLocaleDateString('ru', { weekday: 'long', day: 'numeric', month: 'long' })}
                </div>
                <div className="flex items-center gap-2">
                  <Clock size={14} className="text-soft-blue" />
                  {selectedSlot.time}
                </div>
                <div className="flex items-center gap-2">
                  <Video size={14} className="text-soft-blue" />
                  Видеоконсультация
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between px-1">
              <span className="text-sm text-text-muted font-body">Стоимость</span>
              <span className="font-display text-xl text-calm-blue">${doctor.price}</span>
            </div>

            <div className="flex gap-3">
              <Button variant="outline" size="md" fullWidth onClick={() => setShowBookModal(false)}>
                Отмена
              </Button>
              <Button variant="coral" size="md" fullWidth onClick={confirmBooking}>
                <Heart size={16} /> Записаться
              </Button>
            </div>

            <p className="text-xs text-text-muted font-body text-center">
              Бесплатная отмена за 24 часа до приёма
            </p>
          </div>
        )}
      </Modal>
    </div>
  );
}

// ─── Ethics row ────────────────────────────────────────────────────
function EthicsRow({ label, desc, active }: { label: string; desc: string; active: boolean }) {
  return (
    <div className="flex items-start gap-3">
      <div className={cn(
        'w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5',
        active ? 'bg-emerald-100 text-emerald-600' : 'bg-calm-blue-50 text-text-muted'
      )}>
        {active ? <Shield size={11} /> : <span className="text-xs">—</span>}
      </div>
      <div>
        <p className={cn('text-sm font-semibold font-body', active ? 'text-emerald-700' : 'text-text-muted')}>
          {label}
        </p>
        <p className="text-xs text-text-muted font-body">{desc}</p>
      </div>
    </div>
  );
}
