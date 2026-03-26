import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Heart, Mail, ArrowLeft, CheckCircle } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { supabase } from '../../services/supabase';

const SUPABASE_CONFIGURED = !!(
  import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_ANON_KEY
);

export function ForgotPasswordScreen() {
  const [email,   setEmail]   = useState('');
  const [loading, setLoading] = useState(false);
  const [sent,    setSent]    = useState(false);
  const [error,   setError]   = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setError('');
    setLoading(true);

    if (SUPABASE_CONFIGURED) {
      const { error: err } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/reset-password`,
      });
      if (err) { setError(err.message); setLoading(false); return; }
    } else {
      // Demo: simulate a delay
      await new Promise((r) => setTimeout(r, 800));
    }

    setLoading(false);
    setSent(true);
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
        </div>

        <div className="bg-white rounded-3xl shadow-card p-8 animate-fade-up" style={{ animationDelay: '0.1s' }}>
          {sent ? (
            /* Success state */
            <div className="flex flex-col items-center text-center gap-4">
              <div className="w-14 h-14 rounded-full bg-emerald-50 flex items-center justify-center">
                <CheckCircle size={28} className="text-emerald-500" />
              </div>
              <div>
                <h2 className="font-display text-2xl text-calm-blue mb-2">Письмо отправлено</h2>
                <p className="text-text-muted font-body text-sm leading-relaxed">
                  Мы отправили инструкции по сбросу пароля на{' '}
                  <strong className="text-text-primary">{email}</strong>.
                  Проверьте папку «Входящие» и «Спам».
                </p>
              </div>
              <Link
                to="/auth/login"
                className="mt-2 inline-flex items-center gap-2 text-sm text-soft-blue hover:underline font-body font-semibold"
              >
                <ArrowLeft size={14} /> Вернуться ко входу
              </Link>
            </div>
          ) : (
            /* Form */
            <>
              <Link
                to="/auth/login"
                className="inline-flex items-center gap-1.5 text-sm text-text-muted hover:text-calm-blue font-body mb-5 transition-colors"
              >
                <ArrowLeft size={14} /> Назад
              </Link>

              <h2 className="font-display text-2xl text-calm-blue mb-2">Забыли пароль?</h2>
              <p className="text-sm text-text-muted font-body mb-6">
                Введите email — мы пришлём ссылку для сброса пароля
              </p>

              {error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-warm-coral font-body">
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
                <Button type="submit" variant="primary" size="lg" fullWidth loading={loading}>
                  Отправить инструкции
                </Button>
              </form>

              {!SUPABASE_CONFIGURED && (
                <p className="mt-4 text-xs text-center text-text-muted font-body">
                  Демо-режим: письмо не отправляется
                </p>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
