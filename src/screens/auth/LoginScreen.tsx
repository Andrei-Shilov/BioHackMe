import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Heart, Mail, Lock, Eye, EyeOff } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { useAuthStore } from '../../store';
import { signIn, signInWithProvider, isAuthError } from '../../services/auth';
import type { User, UserProfile } from '../../types';

const SUPABASE_CONFIGURED = !!(
  import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_ANON_KEY
);

export function LoginScreen() {
  const navigate = useNavigate();
  const { setUser, setProfile } = useAuthStore();
  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');
  const [showPw,   setShowPw]   = useState(false);
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (SUPABASE_CONFIGURED) {
      const result = await signIn(email, password);
      if (isAuthError(result)) {
        setError(result.message);
        setLoading(false);
        return;
      }
      setUser(result.user);
      setProfile(result.profile);
    } else {
      // Demo fallback (no Supabase env vars)
      await new Promise((r) => setTimeout(r, 800));
      const demoUser: User = {
        id: 'demo-user-1', email,
        role: 'patient', subscriptionTier: 'plus',
        createdAt: new Date().toISOString(),
      };
      const demoProfile: UserProfile = {
        userId: 'demo-user-1',
        name: email.split('@')[0] || 'Пользователь',
        conditions: [], allergies: [],
      };
      setUser(demoUser);
      setProfile(demoProfile);
    }

    setLoading(false);
    navigate('/');
  };

  const handleOAuth = async (provider: 'google' | 'apple') => {
    if (!SUPABASE_CONFIGURED) return;
    const err = await signInWithProvider(provider);
    if (err) setError(err.message);
  };

  return (
    <div className="min-h-screen bg-bg-light flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8 animate-fade-up">
          <div className="w-14 h-14 bg-gradient-to-br from-soft-blue to-calm-blue rounded-2xl flex items-center justify-center shadow-glow-blue mx-auto mb-4">
            <Heart size={28} className="text-white fill-white" />
          </div>
          <h1 className="font-display text-3xl text-calm-blue">Lumina Health</h1>
          <p className="text-text-muted font-body mt-1">Premium care for every body</p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-3xl shadow-card p-8 animate-fade-up" style={{ animationDelay: '0.1s' }}>
          <h2 className="font-display text-2xl text-calm-blue mb-6">Добро пожаловать</h2>

          {error && (
            <div className="mb-4 p-3 bg-coral-50 border border-coral-100 rounded-xl text-sm text-coral-600 font-body">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <Input
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              leftIcon={<Mail size={16} />}
              required
              autoComplete="email"
            />
            <Input
              label="Пароль"
              type={showPw ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              leftIcon={<Lock size={16} />}
              rightIcon={
                <button
                  type="button"
                  onClick={() => setShowPw(!showPw)}
                  aria-label={showPw ? 'Скрыть пароль' : 'Показать пароль'}
                >
                  {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              }
              required
              autoComplete="current-password"
            />

            <div className="flex justify-end">
              <Link to="/auth/forgot" className="text-sm text-soft-blue hover:underline font-body">
                Забыли пароль?
              </Link>
            </div>

            <Button type="submit" variant="primary" size="lg" fullWidth loading={loading}>
              Войти
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-text-muted font-body">
              Нет аккаунта?{' '}
              <Link to="/auth/register" className="text-soft-blue font-semibold hover:underline">
                Зарегистрироваться
              </Link>
            </p>
          </div>

          {/* Divider */}
          <div className="flex items-center gap-3 my-6">
            <div className="flex-1 h-px bg-calm-blue-50" />
            <span className="text-xs text-text-muted font-body">или продолжить с</span>
            <div className="flex-1 h-px bg-calm-blue-50" />
          </div>

          {/* SSO Buttons */}
          <div className="flex gap-3">
            <button
              onClick={() => handleOAuth('google')}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 px-4 border border-calm-blue-100 rounded-xl text-sm font-medium text-text-primary hover:bg-calm-blue-50 transition-colors font-body"
            >
              <GoogleIcon /> Google
            </button>
            <button
              onClick={() => handleOAuth('apple')}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 px-4 border border-calm-blue-100 rounded-xl text-sm font-medium text-text-primary hover:bg-calm-blue-50 transition-colors font-body"
            >
              <AppleIcon /> Apple
            </button>
          </div>

          {!SUPABASE_CONFIGURED && (
            <p className="mt-4 text-xs text-center text-text-muted font-body">
              Демо-режим: любые данные для входа
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true">
      <path fill="#4285F4" d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.875 2.684-6.615z"/>
      <path fill="#34A853" d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z"/>
      <path fill="#FBBC05" d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332z"/>
      <path fill="#EA4335" d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z"/>
    </svg>
  );
}

function AppleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 814 1000" aria-hidden="true" fill="currentColor">
      <path d="M788.1 340.9c-5.8 4.5-108.2 62.2-108.2 190.5 0 148.4 130.3 200.9 134.2 202.2-.6 3.2-20.7 71.9-68.7 141.9-42.8 61.6-87.5 123.1-155.5 123.1s-85.5-39.5-164-39.5c-76 0-103.7 40.8-165.9 40.8s-105-57.8-155.5-127.4C46 376.5 0 288.3 0 203.9 0 96.5 56.7 41.1 110.3 16.3 168.3-11.7 233.9-12 288.6-12c37.8 0 129.9 0 185.2 47.5 56 48.2 81.8 117.5 81.8 195.5 0 64.7-20.4 133.3-68.7 194.5z"/>
    </svg>
  );
}
