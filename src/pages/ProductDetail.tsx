import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useProduct } from '@/hooks/useProduct';
import useCartStore from '@/store/cartStore';
import useLangStore from '@/store/langStore';
import GlassCard from '@/components/GlassCard';
import QuantityStepper from '@/components/QuantityStepper';
import ProductCard from '@/components/ProductCard';
import Loader from '@/components/Loader';
import EmptyState from '@/components/EmptyState';

const ProductDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { product, related, loading, error, refetch } = useProduct(id);
  const { addItem, updateQuantity, getItemQuantity } = useCartStore();
  const { t } = useLangStore();

  if (loading) return <Loader />;

  if (error || !product) {
    return (
      <EmptyState
        emoji="😞"
        title={t('error')}
        description={error || 'Product not found'}
      />
    );
  }

  const quantity = getItemQuantity(product.id);

  return (
    <div className="space-y-6 page-enter">
      {/* Back button */}
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-text-secondary hover:text-primary transition-colors"
      >
        <span>←</span>
        <span className="text-sm">{t('backToStore')}</span>
      </button>

      {/* Product Info */}
      <GlassCard className="p-6">
        <div className="flex flex-col md:flex-row gap-6">
          {/* Image area */}
          <div className="relative bg-surface-light rounded-2xl h-48 md:h-64 md:w-64 flex-shrink-0 flex items-center justify-center">
            <span className="text-7xl md:text-8xl">{product.emoji}</span>
            {product.discount_percent && product.discount_percent > 0 && (
              <span className="absolute top-3 left-3 bg-success text-bg-dark text-xs font-bold px-2 py-1 rounded-lg">
                {product.discount_percent}% {t('off')}
              </span>
            )}
          </div>

          {/* Info */}
          <div className="flex-1 flex flex-col">
            <p className="text-xs text-primary font-semibold uppercase tracking-wider mb-1">
              {product.category}
            </p>
            <h1 className="text-2xl font-bold text-text-primary mb-2">
              {product.name}
            </h1>
            <p className="text-text-secondary text-sm mb-4 leading-relaxed">
              {product.description}
            </p>

            {product.unit && (
              <p className="text-xs text-text-muted mb-3">
                Unit: {product.unit}
              </p>
            )}

            <div className="flex items-center gap-3 mb-4">
              <span className="text-3xl font-bold text-text-primary">
                ₹{product.price}
              </span>
              {product.original_price &&
                product.original_price > product.price && (
                  <span className="text-lg text-text-muted line-through">
                    ₹{product.original_price}
                  </span>
                )}
            </div>

            {product.in_stock ? (
              <div className="flex items-center gap-3">
                <span className="flex items-center gap-1 text-success text-sm font-medium">
                  <span>●</span> {t('inStock')}
                </span>
              </div>
            ) : (
              <span className="text-text-muted text-sm font-medium">
                {t('outOfStock')}
              </span>
            )}

            {/* Action */}
            {product.in_stock && (
              <div className="mt-6">
                {quantity === 0 ? (
                  <button
                    onClick={() => addItem(product)}
                    className="btn-primary w-full sm:w-auto"
                  >
                    🛒 {t('addToCart')}
                  </button>
                ) : (
                  <div className="flex items-center gap-4">
                    <QuantityStepper
                      quantity={quantity}
                      size="md"
                      onIncrement={() =>
                        updateQuantity(product.id, quantity + 1)
                      }
                      onDecrement={() =>
                        updateQuantity(product.id, quantity - 1)
                      }
                    />
                    <span className="text-sm text-text-secondary">
                      {t('cart')}: {quantity} {t('items')}
                    </span>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </GlassCard>

      {/* Related Products */}
      {related.length > 0 && (
        <div>
          <h2 className="text-lg font-bold text-text-primary mb-4">
            {t('relatedProducts')}
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
            {related.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductDetail;