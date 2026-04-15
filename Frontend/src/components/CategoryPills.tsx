import React from 'react';
import clsx from 'clsx';
import useLangStore from '../store/langStore';

interface CategoryPillsProps {
  categories: string[];
  selected: string;
  onSelect: (category: string) => void;
}

const CategoryPills: React.FC<CategoryPillsProps> = ({
  categories,
  selected,
  onSelect,
}) => {
  const { t } = useLangStore();

  return (
    <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide -mx-4 px-4">
      <button
        onClick={() => onSelect('')}
        className={clsx(
          'flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-all duration-200',
          selected === ''
            ? 'bg-primary text-white shadow-lg shadow-primary/30'
            : 'bg-surface-light text-text-secondary border border-glass-border hover:border-primary/40 hover:text-primary'
        )}
      >
        {t('allCategories')}
      </button>
      {categories.map((cat) => (
        <button
          key={cat}
          onClick={() => onSelect(cat)}
          className={clsx(
            'flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 whitespace-nowrap',
            selected === cat
              ? 'bg-primary text-white shadow-lg shadow-primary/30'
              : 'bg-surface-light text-text-secondary border border-glass-border hover:border-primary/40 hover:text-primary'
          )}
        >
          {cat}
        </button>
      ))}
    </div>
  );
};

export default CategoryPills;