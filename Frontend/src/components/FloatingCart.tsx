import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import useCartStore from '../store/cartStore';
import useLangStore from '../store/langStore';

const FloatingCart: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { getTotalItems, getSubtotal } = useCartStore();
  const { t } = useLangStore();

  const totalItems = getTotalItems();
  const subtotal = getSubtotal();

  if (
    totalItems === 0 ||
    location.pathname.startsWith('/checkout') ||
    location.pathname.startsWith('/verify') ||
    location.pathname.startsWith('/track')
  ) {
    return null;
  }

  return (
    <button
      onClick={() => navigate('/checkout')}
      className="fixed bottom-6 left-4 right-4 max-w-lg mx-auto z-50
                 bg-primary hover:bg-primary-light text-white rounded-2xl
                 px-5 py-3.5 flex items-center justify-between
                 shadow-2xl shadow-primary/30 transition-all duration-300
                 active:scale-[0.98] animate-slide-up"
    >
      <div className="flex items-center gap-3">
        <div className="relative">
          <span className="text-xl">🛒</span>
          <span className="badge bg-white text-primary text-[10px]">
            {totalItems}
          </span>
        </div>
        <span className="text-sm font-medium">
          {totalItems} {t('items')}
        </span>
      </div>
      <div className="flex items-center gap-2">
        <span className="font-bold text-lg">₹{subtotal}</span>
        <span className="text-lg">→</span>
      </div>
    </button>
  );
};

export default FloatingCart;