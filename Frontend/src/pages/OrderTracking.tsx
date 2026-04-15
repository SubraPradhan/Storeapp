import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTrack } from '../hooks/useTrack';
import useLangStore from '../store/langStore';
import GlassCard from '../components/GlassCard';
import StatusTimeline from '../components/StatusTimeline';
import Confetti from '../components/Confetti';
import Loader from '../components/Loader';
import EmptyState from '../components/EmptyState';

const OrderTracking: React.FC = () => {
  const { orderRef } = useParams<{ orderRef: string }>();
  const navigate = useNavigate();
  const { tracking, loading, error, refetch } = useTrack(orderRef);
  const { t } = useLangStore();

  const [showConfetti, setShowConfetti] = useState(false);
  const [paymentTriggered, setPaymentTriggered] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('payment') === 'success' && !paymentTriggered) {
      setPaymentTriggered(true);
      setShowConfetti(true);
      window.history.replaceState({}, '', window.location.pathname);
      setTimeout(refetch, 1000);
    }
  }, [paymentTriggered, refetch]);

  useEffect(() => {
    if (tracking?.status === 'delivered') {
      setShowConfetti(true);
    }
  }, [tracking?.status]);

  if (!orderRef) {
    navigate('/');
    return null;
  }

  if (loading && !tracking) return <Loader />;

  if (error && !tracking) {
    return (
      <EmptyState emoji="😞" title={t('error')} description={error} />
    );
  }

  if (!tracking) return null;

  const showPayButton =
    tracking.status === 'accepted' && tracking.payment_url;
  const showShippingInfo =
    tracking.shipping_info &&
    (tracking.status === 'shipped' || tracking.status === 'delivered');

  return (
    <div className="space-y-6 page-enter max-w-2xl mx-auto">
      <Confetti fire={showConfetti} />

      <button
        onClick={() => navigate('/')}
        className="flex items-center gap-2 text-text-secondary hover:text-primary transition-colors"
      >
        <span>←</span>
        <span className="text-sm">{t('backToStore')}</span>
      </button>

      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">{t('orderTracking')}</h1>
        <button
          onClick={refetch}
          className="text-text-muted hover:text-primary text-xl transition-colors"
          title="Refresh"
        >
          🔄
        </button>
      </div>

      <GlassCard className="p-4 flex items-center justify-between">
        <div>
          <p className="text-xs text-text-muted">{t('orderRef')}</p>
          <p className="text-lg font-bold font-mono text-primary">
            {tracking.order_ref}
          </p>
        </div>
        <div className="text-right">
          <p className="text-xs text-text-muted">{t('total')}</p>
          <p className="text-lg font-bold text-text-primary">
            ₹{tracking.total}
          </p>
        </div>
      </GlassCard>

      <GlassCard className="p-5">
        <StatusTimeline steps={tracking.steps} />
      </GlassCard>

      {showPayButton && (
        <a
          href={tracking.payment_url}
          className="btn-success w-full text-center block text-base py-4"
        >
          💳 {t('payNow')} — ₹{tracking.total}
        </a>
      )}

      {showShippingInfo && tracking.shipping_info && (
        <GlassCard className="p-5">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            🚚 {t('shippingInfo')}
          </h2>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-sm text-text-secondary">
                {t('carrier')}
              </span>
              <span className="text-sm font-medium text-text-primary">
                {tracking.shipping_info.carrier}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-text-secondary">
                {t('trackingId')}
              </span>
              <span className="text-sm font-mono font-medium text-primary">
                {tracking.shipping_info.tracking_id}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-text-secondary">
                {t('estimatedDelivery')}
              </span>
              <span className="text-sm font-medium text-success">
                {new Date(
                  tracking.shipping_info.estimated_delivery
                ).toLocaleDateString('en-IN', { dateStyle: 'medium' })}
              </span>
            </div>
          </div>
        </GlassCard>
      )}

      <GlassCard className="p-5">
        <h2 className="text-lg font-semibold mb-4">{t('orderItems')}</h2>
        <div className="space-y-3">
          {tracking.items.map((item) => (
            <div
              key={item.product_id}
              className="flex items-center gap-3 py-2 border-b border-glass-border last:border-0"
            >
              <span className="text-2xl">{item.emoji}</span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-text-primary truncate">
                  {item.name}
                </p>
                <p className="text-xs text-text-muted">
                  ₹{item.price} × {item.quantity}
                </p>
              </div>
              <p className="text-sm font-semibold text-text-primary">
                ₹{item.price * item.quantity}
              </p>
            </div>
          ))}
        </div>
        <div className="border-t border-glass-border mt-4 pt-4 flex justify-between">
          <span className="font-bold">{t('grandTotal')}</span>
          <span className="font-bold text-primary text-lg">
            ₹{tracking.total}
          </span>
        </div>
      </GlassCard>
    </div>
  );
};

export default OrderTracking;