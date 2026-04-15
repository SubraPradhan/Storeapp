import React from 'react';
import { useNavigate } from 'react-router-dom';
import useLangStore from '../store/langStore';
import LangToggle from './LangToggle';

const Navbar: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useLangStore();

  return (
    <nav className="sticky top-0 z-40 glass border-b border-glass-border">
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-2 group"
        >
          <span className="text-2xl">🛒</span>
          <div>
            <h1 className="text-lg font-bold text-primary group-hover:text-primary-light transition-colors">
              {t('storeName')}
            </h1>
            <p className="text-[10px] text-text-muted -mt-0.5 leading-tight">
              {t('tagline')}
            </p>
          </div>
        </button>
        <LangToggle />
      </div>
    </nav>
  );
};

export default Navbar;