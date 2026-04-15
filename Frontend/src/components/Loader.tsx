import React from 'react';

const Loader: React.FC = () => {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="flex flex-col items-center gap-4">
        <div className="relative w-12 h-12">
          <div className="absolute inset-0 border-4 border-surface-lighter rounded-full" />
          <div className="absolute inset-0 border-4 border-transparent border-t-primary rounded-full animate-spin" />
        </div>
        <p className="text-text-secondary text-sm animate-pulse">Loading...</p>
      </div>
    </div>
  );
};

export default Loader;