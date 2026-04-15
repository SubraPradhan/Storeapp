import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { Language } from '@/types';
import translations from '@/i18n/translations';

interface LangState {
  lang: Language;
  toggleLang: () => void;
  t: (key: keyof (typeof translations)['en']) => string;
}

const useLangStore = create<LangState>()(
  persist(
    (set, get) => ({
      lang: 'en',

      toggleLang: () => {
        set({ lang: get().lang === 'en' ? 'hi' : 'en' });
      },

      t: (key) => {
        const { lang } = get();
        return translations[lang][key] || key;
      },
    }),
    {
      name: 'mystore-lang',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ lang: state.lang }),
    }
  )
);

export default useLangStore;