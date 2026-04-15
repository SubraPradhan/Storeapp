import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useCartStore from '@/store/cartStore';
import useLangStore from '@/store/langStore';
import { useOrder } from '@/hooks/useOrder';
import GlassCard from '@/components/GlassCard';
import QuantityStepper from '@/components/QuantityStepper';
import EmptyState from '@/components/EmptyState';
import type { CustomerInfo } from '@/types';

const DELIVERY_CHARGE = 40;

const Checkout: React.FC = () => {
  const navigate = useNavigate();
  const { items, updateQuantity, removeItem, getSubtotal, clearCart } =
    useCartStore();
  const { t } = useLangStore();
  const { placeOrder, loading, error } = useOrder();

  const [deliveryType, setDeliveryType] = useState<'delivery' | 'pickup'>(
    'delivery'
  );
  const [customer, setCustomer] = useState<CustomerInfo>({
    name: '',
    email: '',
    phone: '',
    address: '',
    notes: '',
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const subtotal = getSubtotal();
  const deliveryCharge = deliveryType === 'delivery' ? DELIVERY_CHARGE : 0;
  const grandTotal = subtotal + deliveryCharge;

  const updateField = (field: keyof CustomerInfo, value: string) => {
    setCustomer((prev) => ({ ...prev, [field]: value }));
    if (formErrors[field]) {
      setFormErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  };

  const validate = (): boolean => {
    const errors: Record<string, string> = {};
    if (!customer.name.trim()) errors.name = 'Required';
    if (!customer.email.trim() || !/\S+@\S+\.\S+/.test(customer.email))
      errors.email = 'Valid email required';
    if (!customer.phone.trim() || !/^\d{10}$/.test(customer.phone))
      errors.phone = 'Valid 10-digit number required';
    if (deliveryType === 'delivery' && !customer.address?.trim())
      errors.address = t('addressRequired');

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    const result = await placeOrder({
      items: items.map((i) => ({
        product_id: i.product.id,
        quantity: i.quantity,
      })),
      customer,
      delivery_type: deliveryType,
    });

    if (result) {
      clearCart();
      navigate(`/verify/${result.order_ref}`);
    }
  };

  if (items.length === 0) {
    return (
      <EmptyState
        emoji="🛒"
        title={t('cartEmpty')}
        description={t('cartEmptyDesc')}
      />
    );
  }

  return (
    <div className="space-y-6 page-enter max-w-2xl mx-auto">
      {/* Back */}
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-text-secondary hover:text-primary transition-colors"
      >
        <span>←</span>
        <span className="text-sm">{t('backToStore')}</span>
      </button>

      <h1 className="text-2xl font-bold">{t('checkout')}</h1>

      {/* Order Summary */}
      <GlassCard className="p-5">
        <h2 className="text-lg font-semibold mb-4">{t('orderSummary')}</h2>
        <div className="space-y-3">
          {items.map((item) => (
            <div
              key={item.product.id}
              className="flex items-center gap-3 py-2 border-b border-glass-border last:border-0"
            >
              <span className="text-2xl">{item.product.emoji}</span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-text-primary truncate">
                  {item.product.name}
                </p>
                <p className="text-xs text-text-muted">
                  ₹{item.product.price} each
                </p>
              </div>
              <QuantityStepper
                quantity={item.quantity}
                onIncrement={() =>
                  updateQuantity(item.product.id, item.quantity + 1)
                }
                onDecrement={() =>
                  updateQuantity(item.product.id, item.quantity - 1)
                }
              />
              <p className="text-sm font-semibold text-text-primary w-16 text-right">
                ₹{item.product.price * item.quantity}
              </p>
              <button
                onClick={() => removeItem(item.product.id)}
                className="text-text-muted hover:text-red-400 transition-colors text-lg ml-1"
                title={t('remove')}
              >
                ×
              </button>
            </div>
          ))}
        </div>
      </GlassCard>

      {/* Delivery Method */}
      <GlassCard className="p-5">
        <h2 className="text-lg font-semibold mb-4">{t('deliveryMethod')}</h2>
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => setDeliveryType('delivery')}
            className={`p-4 rounded-xl border-2 text-left transition-all duration-200 ${
              deliveryType === 'delivery'
                ? 'border-primary bg-primary/10'
                : 'border-glass-border bg-surface-light hover:border-primary/40'
            }`}
          >
            <span className="text-2xl block mb-1">🚚</span>
            <p className="text-sm font-semibold text-text-primary">
              {t('delivery')}
            </p>
            <p className="text-xs text-text-muted">₹{DELIVERY_CHARGE}</p>
          </button>
          <button
            onClick={() => setDeliveryType('pickup')}
            className={`p-4 rounded-xl border-2 text-left transition-all duration-200 ${
              deliveryType === 'pickup'
                ? 'border-primary bg-primary/10'
                : 'border-glass-border bg-surface-light hover:border-primary/40'
            }`}
          >
            <span className="text-2xl block mb-1">🏪</span>
            <p className="text-sm font-semibold text-text-primary">
              {t('selfPickup')}
            </p>
            <p className="text-xs text-success font-medium">{t('free')}</p>
          </button>
        </div>
      </GlassCard>

      {/* Customer Details */}
      <GlassCard className="p-5">
        <h2 className="text-lg font-semibold mb-4">{t('customerDetails')}</h2>
        <div className="space-y-4">
          {/* Name */}
          <div>
            <label className="block text-sm text-text-secondary mb-1.5">
              {t('name')} <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              value={customer.name}
              onChange={(e) => updateField('name', e.target.value)}
              placeholder={t('namePlaceholder')}
              className={`input-field ${formErrors.name ? 'border-red-400' : ''}`}
            />
            {formErrors.name && (
              <p className="text-red-400 text-xs mt-1">{formErrors.name}</p>
            )}
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm text-text-secondary mb-1.5">
              {t('email')} <span className="text-red-400">*</span>
            </label>
            <input
              type="email"
              value={customer.email}
              onChange={(e) => updateField('email', e.target.value)}
              placeholder={t('emailPlaceholder')}
              className={`input-field ${formErrors.email ? 'border-red-400' : ''}`}
            />
            {formErrors.email && (
              <p className="text-red-400 text-xs mt-1">{formErrors.email}</p>
            )}
          </div>

          {/* Phone */}
          <div>
            <label className="block text-sm text-text-secondary mb-1.5">
              {t('phone')} <span className="text-red-400">*</span>
            </label>
            <input
              type="tel"
              inputMode="numeric"
              value={customer.phone}
              onChange={(e) =>
                updateField('phone', e.target.value.replace(/\D/g, '').slice(0, 10))
              }
              placeholder={t('phonePlaceholder')}
              className={`input-field ${formErrors.phone ? 'border-red-400' : ''}`}
            />
            {formErrors.phone && (
              <p className="text-red-400 text-xs mt-1">{formErrors.phone}</p>
            )}
          </div>

          {/* Address */}
          {deliveryType === 'delivery' && (
            <div>
              <label className="block text-sm text-text-secondary mb-1.5">
                {t('address')} <span className="text-red-400">*</span>
              </label>
              <textarea
                value={customer.address}
                onChange={(e) => updateField('address', e.target.value)}
                placeholder={t('addressPlaceholder')}
                rows={3}
                className={`input-field resize-none ${formErrors.address ? 'border-red-400' : ''}`}
              />
              {formErrors.address && (
                <p className="text-red-400 text-xs mt-1">
                  {formErrors.address}
                </p>
              )}
            </div>
          )}

          {/* Notes */}
          <div>
            <label className="block text-sm text-text-secondary mb-1.5">
              {t('orderNotes')}
            </label>
            <textarea
              value={customer.notes}
              onChange={(e) => updateField('notes', e.target.value)}
              placeholder={t('notesPlaceholder')}
              rows={2}
              className="input-field resize-none"
            />
          </div>
        </div>
      </GlassCard>

      {/* Price Summary */}
      <GlassCard className="p-5">
        <div className="space-y-3">
          <div className="flex justify-between text-sm">
            <span className="text-text-secondary">{t('subtotal')}</span>
            <span className="text-text-primary font-medium">₹{subtotal}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-text-secondary">{t('deliveryCharge')}</span>
            <span
              className={
                deliveryCharge === 0
                  ? 'text-success font-medium'
                  : 'text-text-primary font-medium'
              }
            >
              {deliveryCharge === 0 ? t('free') : `₹${deliveryCharge}`}
            </span>
          </div>
          <div className="border-t border-glass-border pt-3 flex justify-between">
            <span className="text-base font-bold text-text-primary">
              {t('grandTotal')}
            </span>
            <span className="text-xl font-bold text-primary">
              ₹{grandTotal}
            </span>
          </div>
        </div>
      </GlassCard>

      {/* Error */}
      {error && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 text-red-400 text-sm">
          {error}
        </div>
      )}

      {/* Place Order Button */}
      <button
        onClick={handleSubmit}
        disabled={loading}
        className="btn-success w-full text-base py-4"
      >
        {loading ? t('placingOrder') : `${t('placeOrder')} — ₹${grandTotal}`}
      </button>
    </div>
  );
};

export default Checkout;