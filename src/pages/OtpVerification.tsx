import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useOrder } from '@/hooks/useOrder';
import useLangStore from '@/store/langStore';
import GlassCard from '@/components/GlassCard';
import OtpInput from '@/components/OtpInput';
import Confetti from '@/components/Confetti';

const RESEND_COOLDOWN = 60;

const OtpVerification: React.FC = () => {
  const { orderRef } = useParams<{ orderRef: string }>();
  const navigate = useNavigate();
  const { verifyOtp, resendOtp, loading, error, setError } = useOrder();
  const { t } = useLangStore();

  const [otp, setOtp] = useState('');
  const [cooldown, setCooldown] = useState(RESEND_COOLDOWN);
  const [showConfetti, setShowConfetti] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  // Cooldown timer
  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setInterval(() => {
      setCooldown((prev) => Math.max(0, prev - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, [cooldown]);

  const handleVerify = useCallback(async () => {
    if (!orderRef || otp.length < 6) return;

    const result = await verifyOtp({ order_ref: orderRef, otp });
    if (result?.success) {
      setShowConfetti(true);
      setSuccessMessage(result.message);
      setTimeout(() => {
        navigate(`/track/${orderRef}`);
      }, 2500);
    }
  }, [orderRef, otp, verifyOtp, navigate]);

  // Auto-submit when 6 digits entered
  useEffect(() => {
    if (otp.length === 6) {
      handleVerify();
    }
  }, [otp.length]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleResend = async () => {
    if (!orderRef || cooldown > 0) return;
    setError(null);
    const result = await resendOtp(orderRef);
    if (result) {
      setCooldown(result.cooldown_seconds || RESEND_COOLDOWN);
      setOtp('');
    }
  };

  if (!orderRef) {
    navigate('/');
    return null;
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] page-enter">
      <Confetti fire={showConfetti} />

      <GlassCard className="p-8 w-full max-w-md text-center">
        {successMessage ? (
          <div className="animate-bounce-in">
            <span className="text-6xl block mb-4">🎉</span>
            <h2 className="text-xl font-bold text-success mb-2">
              {successMessage}
            </h2>
            <p className="text-sm text-text-secondary">
              Redirecting to order tracking...
            </p>
          </div>
        ) : (
          <>
            <span className="text-5xl block mb-4">🔐</span>
            <h1 className="text-xl font-bold text-text-primary mb-2">
              {t('otpVerification')}
            </h1>
            <p className="text-sm text-text-secondary mb-6">
              {t('otpSentTo')}
            </p>

            <div className="mb-2 text-xs text-text-muted">
              {t('orderRef')}:{' '}
              <span className="text-primary font-mono font-semibold">
                {orderRef}
              </span>
            </div>

            <div className="mb-6">
              <OtpInput
                value={otp}
                onChange={setOtp}
                disabled={loading}
              />
            </div>

            {error && (
              <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-3 text-red-400 text-sm mb-4">
                {error}
              </div>
            )}

            <button
              onClick={handleVerify}
              disabled={loading || otp.length < 6}
              className="btn-primary w-full mb-4"
            >
              {loading ? t('verifying') : t('verify')}
            </button>

            <button
              onClick={handleResend}
              disabled={cooldown > 0}
              className="text-sm text-text-secondary hover:text-primary transition-colors disabled:opacity-50"
            >
              {cooldown > 0
                ? `${t('resendIn')} ${cooldown}s`
                : t('resendOtp')}
            </button>
          </>
        )}
      </GlassCard>
    </div>
  );
};

export default OtpVerification;