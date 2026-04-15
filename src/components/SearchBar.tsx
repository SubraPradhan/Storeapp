import React from 'react';
import useLangStore from '@/store/langStore';

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
}

const SearchBar: React.FC<SearchBarProps> = ({ value, onChange }) => {
  const { t } = useLangStore();

  return (
    <div className="relative">
      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted text-lg">
        🔍
      </span>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={t('searchPlaceholder')}
        className="input-field pl-10 pr-4"
      />
      {value && (
        <button
          onClick={() => onChange('')}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted
                     hover:text-text-primary transition-colors"
        >
          ✕
        </button>
      )}
    </div>
  );
};

export default SearchBar;