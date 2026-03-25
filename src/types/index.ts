// ─── User & Auth ───────────────────────────────────────────────────

export type UserRole =
  | 'patient'
  | 'expert'
  | 'reviewer'
  | 'admin';

export type SubscriptionTier =
  | 'essential'
  | 'plus'
  | 'premium'
  | 'pro_bono'
  | 'corporate';

export interface User {
  id: string;
  email: string;
  role: UserRole;
  subscriptionTier: SubscriptionTier;
  createdAt: string;
}

export interface UserProfile {
  userId: string;
  name: string;
  age?: number;
  weight?: number;
  conditions: string[];
  allergies: string[];
  avatarUrl?: string;
}

// ─── Health Data ───────────────────────────────────────────────────

export type HealthMetricType =
  | 'blood_pressure_systolic'
  | 'blood_pressure_diastolic'
  | 'blood_sugar'
  | 'steps'
  | 'heart_rate'
  | 'weight'
  | 'sleep_hours';

export interface HealthMetric {
  id: string;
  userId: string;
  type: HealthMetricType;
  value: number;
  unit: string;
  recordedAt: string;
}

export type MoodScore = 1 | 2 | 3 | 4 | 5;

export interface MoodLog {
  id: string;
  userId: string;
  moodScore: MoodScore;
  note?: string;
  createdAt: string;
}

export const MOOD_EMOJI: Record<MoodScore, { emoji: string; label: string }> = {
  1: { emoji: '😔', label: 'Плохо' },
  2: { emoji: '😕', label: 'Неважно' },
  3: { emoji: '😊', label: 'Нормально' },
  4: { emoji: '😄', label: 'Хорошо' },
  5: { emoji: '🤩', label: 'Отлично' },
};

// ─── Experts & Doctors ─────────────────────────────────────────────

export type Specialty =
  | 'cardiology'
  | 'psychology'
  | 'nutrition'
  | 'rehabilitation'
  | 'pediatrics'
  | 'general'
  | 'dermatology'
  | 'neurology'
  | 'oncology'
  | 'gynecology';

export interface EthicsProfile {
  lgbtqFriendly: boolean;
  noInsuranceRequired: boolean;
  transparentPricing: boolean;
  ethicsRating: 1 | 2 | 3 | 4 | 5;
}

export interface Expert {
  id: string;
  userId: string;
  name: string;
  specialties: Specialty[];
  licenseNumber: string;
  bio: string;
  avatarUrl?: string;
  videoUrl?: string;
  rating: number;
  reviewCount: number;
  consultationPrice: number;
  languages: string[];
  ethicsProfile: EthicsProfile;
  nextAvailableSlot?: string;
  isVerified: boolean;
}

export interface DoctorAvailability {
  expertId: string;
  slotDatetime: string;
  isBooked: boolean;
}

// ─── Protocols ─────────────────────────────────────────────────────

export type ProtocolCategory =
  | 'cardiology'
  | 'psychology'
  | 'nutrition'
  | 'rehabilitation'
  | 'pediatrics'
  | 'general'
  | 'dermatology'
  | 'preventive';

export type ProtocolType = 'mini' | 'full' | 'ai_interactive';

export type ProtocolStatus =
  | 'draft'
  | 'pending_moderation'
  | 'pending_ethics_review'
  | 'approved'
  | 'rejected';

export interface ProtocolStep {
  id: string;
  protocolId: string;
  order: number;
  title: string;
  content: string;
  videoUrl?: string;
  checklist: string[];
}

export interface Protocol {
  id: string;
  expertId: string;
  expertName: string;
  expertAvatarUrl?: string;
  expertSpecialty: string;
  title: string;
  description: string;
  category: ProtocolCategory;
  type: ProtocolType;
  status: ProtocolStatus;
  price: number;
  rating: number;
  usageCount: number;
  steps: ProtocolStep[];
  isVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ProtocolReview {
  id: string;
  protocolId: string;
  reviewerId: string;
  status: 'approved' | 'rejected' | 'needs_changes';
  feedback: string;
  reviewedAt: string;
}

// ─── Appointments ──────────────────────────────────────────────────

export type AppointmentStatus =
  | 'scheduled'
  | 'confirmed'
  | 'completed'
  | 'cancelled'
  | 'no_show';

export interface Appointment {
  id: string;
  patientId: string;
  doctorId: string;
  doctorName: string;
  doctorAvatarUrl?: string;
  doctorSpecialty: string;
  scheduledAt: string;
  status: AppointmentStatus;
  notes?: string;
  price: number;
  videoCallUrl?: string;
}

// ─── AI / Triage ───────────────────────────────────────────────────

export type TriageLevel = 'green' | 'yellow' | 'red';

export interface TriageResult {
  level: TriageLevel;
  hypothesis: string;
  confidence: number;
  source: string;
  selfCareGuide?: string;
  urgency: string;
  transferToDoctor: boolean;
  suggestedProtocols: string[];
}

export interface AIMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  triageResult?: TriageResult;
  isLoading?: boolean;
}

export interface AISession {
  id: string;
  userId: string;
  triageLevel?: TriageLevel;
  messages: AIMessage[];
  summary?: string;
  createdAt: string;
}

// ─── Subscriptions & Payments ──────────────────────────────────────

export interface Subscription {
  id: string;
  userId: string;
  tier: SubscriptionTier;
  startDate: string;
  endDate?: string;
  stripeId?: string;
  isActive: boolean;
}

export interface SubscriptionPlan {
  tier: SubscriptionTier;
  name: string;
  price: number;
  yearlyPrice?: number;
  features: string[];
  priceId?: string;
}

export const SUBSCRIPTION_PLANS: SubscriptionPlan[] = [
  {
    tier: 'essential',
    name: 'Essential',
    price: 0,
    features: [
      'AI-ассистент (5 запросов/день)',
      'Мини-протоколы (бесплатные)',
      'Поиск врачей',
      'Базовый дашборд',
    ],
  },
  {
    tier: 'plus',
    name: 'Plus',
    price: 19,
    yearlyPrice: 199,
    priceId: 'price_plus_monthly',
    features: [
      'AI-ассистент без ограничений',
      'Полные протоколы',
      'Запись к врачу',
      'История здоровья',
      'Трекер настроения',
    ],
  },
  {
    tier: 'premium',
    name: 'Premium',
    price: 49,
    priceId: 'price_premium',
    features: [
      'Всё из Plus',
      'AI-персонализация протоколов',
      'Видеоконсультации',
      'Приоритетный доступ к врачам',
      'Экспорт данных здоровья',
    ],
  },
  {
    tier: 'pro_bono',
    name: 'Pro Bono',
    price: 0,
    features: [
      'Полный доступ Premium',
      'Без рекламы',
      'Без апгрейд-баннеров',
      'Идентичный UX Premium',
    ],
  },
];

export const COMMISSION_RATES = {
  protocol_one_time:    0.30,
  expert_subscription:  0.20,
  consultation:         0.15,
  partner_commission:   0.10,
};

// ─── Misc ──────────────────────────────────────────────────────────

export interface DataAccessLog {
  id: string;
  userId: string;
  accessorId: string;
  accessorType: 'doctor' | 'ai' | 'admin' | 'researcher';
  accessedAt: string;
  purpose: string;
}

export interface Notification {
  id: string;
  type: 'appointment' | 'protocol' | 'health_alert' | 'system';
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
}
