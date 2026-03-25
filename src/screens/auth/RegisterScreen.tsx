import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Heart, Mail, Lock, User, Stethoscope } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { useAuthStore } from '../../store';
import type { User as UserType, UserProfile, UserRole } from '../../types';

export function RegisterScreen() {
  const navigate = useNavigate();
  const { setUser, setProfile } = useAuthStore();

  const [name,     setName]     = useState('');
  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');
  const [role,     setRole]     = useState<UserRole>('patient');
  const [loading,  setLoading]  = useState(false);
  const [agreed,   setAgreed]   = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!agreed) return;
    setLoading(true);
    await new Promise((r) => setTimeout(r, 800));

    const newUser: UserType = {
      id:               `user-${Date.now()}`,
      email,
      role,
      subscriptionTier: 'essential',
      createdAt:        new Date().toISOString(),
    };
    const newProfile: UserProfile = {
      userId:     newUser.id,
      name,
      conditions: [],
      allergies:  [],
    };

    setUser(newUser);
    setProfile(newProfile);
    setLoading(false);
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-bg-light flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8 animate-fade-up">
          <div className="w-14 h-14 bg-gradient-to-br from-soft-blue to-calm-blue rounded-2xl flex items-center justify-center shadow-glow-blue mx-auto mb-4">
            <Heart size={28} className="text-white fill-white" />
          </div>
          <h1 className="font-display text-3xl text-calm-blue">Lumina Health</h1>
          <p className="text-text-muted font-body mt-1">Присоединяйтесь к сообществу заботы</p>
        </div>

        <div className="bg-white rounded-3xl shadow-card p-8 animate-fade-up" style={{ animationDelay: '0.1s' }}>
          <h2 className="font-display text-2xl text-calm-blue mb-6">Создать аккаунт</h2>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <Input
              label="Имя"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ваше имя"
              leftIcon={<User size={16} />}
              required
            />
            <Input
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              leftIcon={<Mail size={16} />}
              required
            />
            <Input
              label="Пароль"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Минимум 8 символов"
              leftIcon={<Lock size={16} />}
              required
              minLength={8}
            />

            {/* Role selector */}
            <div>
              <p className="text-sm font-semibold text-text-primary font-body mb-2">Вы:</p>
              <div className="flex gap-3">
                {([
                  { value: 'patient', label: 'Пациент', icon: User },
                  { value: 'expert',  label: 'Эксперт', icon: Stethoscope },
                ] as const).map(({ value, label, icon: Icon }) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setRole(value)}
                    className={`flex-1 flex items-center gap-2 py-2.5 px-4 rounded-xl border-2 text-sm font-medium transition-all font-body ${
                      role === value
                        ? 'border-soft-blue bg-soft-blue-50 text-soft-blue'
                        : 'border-calm-blue-100 text-text-muted hover:border-soft-blue'
                    }`}
                  >
                    <Icon size={16} /> {label}
                  </button>
                ))}
              </div>
            </div>

            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={agreed}
                onChange={(e) => setAgreed(e.target.checked)}
                className="mt-0.5 w-4 h-4 accent-soft-blue rounded"
                required
              />
              <span className="text-sm text-text-muted font-body">
                Принимаю{' '}
                <Link to="/terms" className="text-soft-blue hover:underline">условия использования</Link>
                {' '}и{' '}
                <Link to="/privacy" className="text-soft-blue hover:underline">политику конфиденциальности</Link>
              </span>
            </label>

            <Button
              type="submit"
              variant="coral"
              size="lg"
              fullWidth
              loading={loading}
              disabled={!agreed}
            >
              Создать аккаунт
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-text-muted font-body">
            Уже есть аккаунт?{' '}
            <Link to="/auth/login" className="text-soft-blue font-semibold hover:underline">
              Войти
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
