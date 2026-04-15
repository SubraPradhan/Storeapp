import React from 'react';
import { useNavigate } from 'react-router-dom';
import useLangStore from '@/store/langStore';

interface EmptyStateProps {
  emoji: string;
  title: string;
  description: string;
  showHomeButton?: boolean;
}

const EmptyState: React.FC<EmptyStateProps> = ({
  emoji,
  title,
  description,
  showHomeButton = true,
}) => {
  const navigate = useNavigate();
  const { t } = useLangStore();

  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] px-4 text-center">
      <span className="text-6xl mb-4">{emoji}</span>
      <h2 className="text-xl font-bold text-text-primary mb-2">{title}</h2>
      <p className="text-text-secondary mb-6">{description}</p>
      {showHomeButton && (
        <button onClick={() => navigate('/')} className="btn-primary">
          {t('goHome')}
        </button>
      )}
    </div>
  );
};

export default EmptyState;