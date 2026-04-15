import React from 'react';
import useLangStore from '@/store/langStore';

const LangToggle: React.FC = () => {
  const { toggleLang, t } = useLangStore();

  return (
    <button
      onClick={toggleLang}
      className="px-3 py-1.5 rounded-lg bg-surface-light border border-glass-border
                 text-sm font-medium text-text-secondary hover:text-primary
                 hover:border-primary/40 transition-all duration-200 active:scale-95"
      aria-label="Toggle language"
    >
      {t('language')}
    </button>
  );
};

export default LangToggle;