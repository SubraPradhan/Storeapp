import React from 'react';
import { useNavigate } from 'react-router-dom';
import type { Product } from '@/types';
import useCartStore from '@/store/cartStore';
import useLangStore from '@/store/langStore';
import GlassCard from './GlassCard';
import QuantityStepper from './QuantityStepper';

interface ProductCardProps {
  product: Product;
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const navigate = useNavigate();
  const { addItem, updateQuantity, getItemQuantity } = useCartStore();
  const { t } = useLangStore();
  const quantity = getItemQuantity(product.id);

  const handleCardClick = () => {
    navigate(`/product/${product.id}`);
  };

  const handleAddClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    addItem(product);
  };

  return (
    <GlassCard hover className="p-3 flex flex-col animate-fade-in" onClick={handleCardClick}>
      {/* Emoji / Image area */}
      <div className="relative bg-surface-light rounded-xl h-28 sm:h-32 flex items-center justify-center mb-3">
        <span className="text-5xl sm:text-6xl">{product.emoji}</span>

        {product.discount_percent && product.discount_percent > 0 && (
          <span className="absolute top-2 left-2 bg-success text-bg-dark text-[10px] font-bold px-1.5 py-0.5 rounded-md">
            {product.discount_percent}% {t('off')}
          </span>
        )}

        {!product.in_stock && (
          <div className="absolute inset-0 bg-bg-dark/70 rounded-xl flex items-center justify-center">
            <span className="text-text-muted text-xs font-medium">
              {t('outOfStock')}
            </span>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="flex-1 flex flex-col">
        <p className="text-[10px] text-primary font-medium uppercase tracking-wider mb-0.5">
          {product.category}
        </p>
        <h3 className="text-sm font-semibold text-text-primary line-clamp-1 mb-0.5">
          {product.name}
        </h3>
        <p className="text-xs text-text-muted line-clamp-1 mb-2">
          {product.description}
        </p>

        {/* Price + Action */}
        <div className="mt-auto flex items-center justify-between gap-2">
          <div className="flex flex-col">
            <span className="text-base font-bold text-text-primary">
              ₹{product.price}
            </span>
            {product.original_price && product.original_price > product.price && (
              <span className="text-[10px] text-text-muted line-through">
                ₹{product.original_price}
              </span>
            )}
          </div>

          {product.in_stock && (
            <div onClick={(e) => e.stopPropagation()}>
              {quantity === 0 ? (
                <button
                  onClick={handleAddClick}
                  className="bg-primary hover:bg-primary-light text-white text-xs font-semibold
                             px-4 py-2 rounded-xl transition-all duration-200 active:scale-95"
                >
                  {t('addToCart')}
                </button>
              ) : (
                <QuantityStepper
                  quantity={quantity}
                  onIncrement={() => updateQuantity(product.id, quantity + 1)}
                  onDecrement={() => updateQuantity(product.id, quantity - 1)}
                />
              )}
            </div>
          )}
        </div>
      </div>
    </GlassCard>
  );
};

export default ProductCard;