import { Link } from 'react-router-dom';
import { Heart, Shield, FileText, Mail } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-white border-t border-calm-blue-50 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">

          {/* Brand */}
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-gradient-to-br from-soft-blue to-calm-blue rounded-lg flex items-center justify-center">
              <Heart size={14} className="text-white fill-white" />
            </div>
            <span className="font-display text-sm text-calm-blue">
              Lumina<span className="text-soft-blue"> Health</span>
            </span>
          </div>

          {/* Links */}
          <nav className="flex items-center gap-4 text-sm text-text-muted font-body" aria-label="Нижняя навигация">
            <Link to="/about"   className="hover:text-calm-blue transition-colors">О сервисе</Link>
            <Link to="/privacy" className="hover:text-calm-blue transition-colors flex items-center gap-1">
              <Shield size={14} /> Конфиденциальность
            </Link>
            <Link to="/terms"   className="hover:text-calm-blue transition-colors flex items-center gap-1">
              <FileText size={14} /> Условия
            </Link>
            <a href="mailto:hello@luminahealth.app" className="hover:text-calm-blue transition-colors flex items-center gap-1">
              <Mail size={14} /> Контакты
            </a>
          </nav>

          {/* Disclaimer */}
          <p className="text-xs text-text-muted font-body text-center sm:text-right max-w-xs">
            Сервис не заменяет очную медицинскую консультацию.
            <br/>© {new Date().getFullYear()} Lumina Health
          </p>
        </div>
      </div>
    </footer>
  );
}
