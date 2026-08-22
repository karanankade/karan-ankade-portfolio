import React, { useState, useEffect, useRef } from 'react';
import { Shield, Mail, Lock, AlertTriangle, ArrowRight, RefreshCw, CheckCircle2, KeyRound, Clock, ShieldCheck, UserCheck } from 'lucide-react';
import { playAccessGrantedSound, playErrorSound, playClickSound } from '../../utils/audioFX';
import { portfolioStore } from '../../data/portfolioStore';
import { apiUrl } from '../../config/api';

const AUTHORIZED_ADMIN_EMAIL = 'karanankade12@gmail.com';

export default function AdminAuth({ onAuthenticated, onClose }) {
  const [step, setStep] = useState(1); // 1: Email Request, 2: OTP Verification
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [loading, setLoading] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);

  const inputRefs = useRef([]);

  // Resend cooldown timer ticker
  useEffect(() => {
    let timer;
    if (resendCooldown > 0) {
      timer = setInterval(() => {
        setResendCooldown((prev) => (prev > 0 ? prev - 1 : 0));
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [resendCooldown]);

  // Step 1: Request 6-Digit OTP exclusively for karanankade12@gmail.com
  const handleSendOtp = async (e) => {
    if (e) e.preventDefault();
    if (resendCooldown > 0) return;

    setError('');
    setSuccessMsg('');
    setLoading(true);

    try {
      const res = await fetch(apiUrl('/api/auth/send-otp'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: AUTHORIZED_ADMIN_EMAIL })
      });

      const data = await res.json();
      setLoading(false);

      if (data.success) {
        setSuccessMsg(data.message || `OTP verification code sent to ${AUTHORIZED_ADMIN_EMAIL}!`);
        setResendCooldown(data.cooldown || 45);
        setOtp(['', '', '', '', '', '']);
        setStep(2);
        setTimeout(() => {
          if (inputRefs.current[0]) inputRefs.current[0].focus();
        }, 100);
      } else {
        playErrorSound();
        setError(data.error || 'Failed to send OTP code.');
      }
    } catch (err) {
      setLoading(false);
      playErrorSound();
      setError('Unable to reach authentication server. Please verify backend is running.');
    }
  };

  // Handle single digit OTP inputs
  const handleOtpChange = (index, value) => {
    const cleanValue = value.replace(/\D/g, '');
    if (!cleanValue && value !== '') return;

    const newOtp = [...otp];

    if (cleanValue.length > 1) {
      // User pasted full OTP
      const pastedDigits = cleanValue.slice(0, 6).split('');
      pastedDigits.forEach((digit, i) => {
        if (i < 6) newOtp[i] = digit;
      });
      setOtp(newOtp);
      const nextFocus = Math.min(pastedDigits.length, 5);
      if (inputRefs.current[nextFocus]) inputRefs.current[nextFocus].focus();
      return;
    }

    newOtp[index] = cleanValue;
    setOtp(newOtp);

    // Auto-advance to next input
    if (cleanValue && index < 5 && inputRefs.current[index + 1]) {
      inputRefs.current[index + 1].focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0 && inputRefs.current[index - 1]) {
      inputRefs.current[index - 1].focus();
    }
  };

  // Step 2: Verify 6-Digit OTP & Transmit Security Device Telemetry
  const handleVerifyOtp = async (e) => {
    if (e) e.preventDefault();
    const fullOtp = otp.join('');
    if (fullOtp.length !== 6) {
      setError('Please enter all 6 digits of the OTP code.');
      return;
    }

    setError('');
    setSuccessMsg('');
    setLoading(true);

    // Collect device metadata for security audit
    const clientMeta = {
      platform: navigator.platform || '',
      screen: `${window.screen?.width || 0}x${window.screen?.height || 0}`,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || '',
      language: navigator.language || '',
      userAgent: navigator.userAgent || ''
    };

    // Attempt browser geolocation if available
    let clientCoords = null;
    if ('geolocation' in navigator) {
      try {
        clientCoords = await new Promise((resolve) => {
          navigator.geolocation.getCurrentPosition(
            (pos) => resolve({ lat: pos.coords.latitude, lon: pos.coords.longitude }),
            () => resolve(null),
            { timeout: 1200 }
          );
        });
      } catch (geoErr) {
        clientCoords = null;
      }
    }

    try {
      const res = await fetch(apiUrl('/api/auth/verify-otp'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: AUTHORIZED_ADMIN_EMAIL,
          otp: fullOtp,
          clientMeta: { ...clientMeta, clientCoords }
        })
      });

      const data = await res.json();
      setLoading(false);

      if (data.success && data.token) {
        playAccessGrantedSound();
        portfolioStore.setAuthToken(data.token);
        onAuthenticated(data.token);
      } else {
        playErrorSound();
        setError(data.error || 'Invalid OTP code.');
        setOtp(['', '', '', '', '', '']);
        if (data.locked) {
          // If locked out, disable inputs
          setResendCooldown(300);
        } else if (inputRefs.current[0]) {
          inputRefs.current[0].focus();
        }
      }
    } catch (err) {
      setLoading(false);
      playErrorSound();
      setError('Server authentication error during OTP verification.');
    }
  };

  const fullOtpString = otp.join('');

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 1000,
        background: 'rgba(5, 8, 20, 0.94)',
        backdropFilter: 'blur(20px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px'
      }}
    >
      <div
        className="glass-panel"
        style={{
          width: '100%',
          maxWidth: '460px',
          padding: 'clamp(24px, 5vw, 38px) clamp(16px, 4vw, 32px)',
          borderRadius: '22px',
          border: '1px solid rgba(0, 243, 255, 0.35)',
          boxShadow: '0 25px 60px rgba(0, 243, 255, 0.18), inset 0 0 20px rgba(0, 243, 255, 0.05)',
          position: 'relative',
          maxHeight: '92vh',
          overflowY: 'auto'
        }}
      >
        {/* Close Button */}
        {onClose && (
          <button
            onClick={onClose}
            aria-label="Close"
            style={{
              position: 'absolute',
              top: '18px',
              right: '18px',
              background: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '50%',
              width: '32px',
              height: '32px',
              color: 'var(--text-muted)',
              fontSize: '1rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
          >
            ✕
          </button>
        )}

        {/* Security Shield Header Badge */}
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <div
            style={{
              width: '68px',
              height: '68px',
              margin: '0 auto 16px',
              borderRadius: '22px',
              background: 'linear-gradient(135deg, rgba(0,243,255,0.2) 0%, rgba(157,78,221,0.2) 100%)',
              border: '1px solid var(--cyan)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 0 30px rgba(0,243,255,0.35)'
            }}
          >
            <ShieldCheck color="var(--cyan)" size={36} />
          </div>
          <h2
            style={{
              fontSize: '1.55rem',
              fontWeight: 700,
              color: '#ffffff',
              marginBottom: '8px',
              fontFamily: 'var(--font-heading)',
              letterSpacing: '0.5px'
            }}
          >
            Protected Admin Login
          </h2>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '4px 12px',
              borderRadius: '12px',
              background: 'rgba(0, 243, 255, 0.08)',
              border: '1px solid rgba(0, 243, 255, 0.25)',
              fontSize: '0.76rem',
              color: 'var(--cyan)',
              fontWeight: 600,
              letterSpacing: '0.5px',
              marginBottom: '10px'
            }}
          >
            <Shield size={12} />
            <span>EXCLUSIVE EMAIL OTP PROTECTION</span>
          </div>
          <p style={{ fontSize: '0.84rem', color: 'var(--text-muted)', lineHeight: '1.5', margin: 0 }}>
            {step === 1
              ? 'This portal is restricted exclusively to the primary portfolio administrator.'
              : `A 6-digit verification passkey was sent to ${AUTHORIZED_ADMIN_EMAIL}.`}
          </p>
        </div>

        {/* Success Alert Banner */}
        {successMsg && (
          <div
            style={{
              padding: '12px 14px',
              borderRadius: '12px',
              background: 'rgba(0, 255, 136, 0.1)',
              border: '1px solid rgba(0, 255, 136, 0.3)',
              color: 'var(--emerald)',
              fontSize: '0.82rem',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              marginBottom: '20px'
            }}
          >
            <CheckCircle2 size={18} style={{ flexShrink: 0 }} />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Error Alert Banner */}
        {error && (
          <div
            style={{
              padding: '12px 14px',
              borderRadius: '12px',
              background: 'rgba(255, 77, 77, 0.12)',
              border: '1px solid rgba(255, 77, 77, 0.35)',
              color: '#ff6b6b',
              fontSize: '0.82rem',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              marginBottom: '20px'
            }}
          >
            <AlertTriangle size={18} style={{ flexShrink: 0 }} />
            <span>{error}</span>
          </div>
        )}

        {/* Step 1: Exclusive Admin Email Card & OTP Dispatch */}
        {step === 1 && (
          <form onSubmit={handleSendOtp} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {/* Locked Authorized Administrator Card */}
            <div
              style={{
                padding: '16px',
                borderRadius: '14px',
                background: 'rgba(5, 8, 20, 0.85)',
                border: '1px solid rgba(0, 243, 255, 0.3)',
                boxShadow: 'inset 0 0 15px rgba(0, 243, 255, 0.05)'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 600 }}>
                  Authorized Admin Account
                </span>
                <span
                  style={{
                    fontSize: '0.68rem',
                    padding: '2px 8px',
                    borderRadius: '10px',
                    background: 'rgba(0, 255, 136, 0.15)',
                    border: '1px solid var(--emerald)',
                    color: 'var(--emerald)',
                    fontWeight: 600
                  }}
                >
                  VERIFIED
                </span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Mail size={18} color="var(--cyan)" />
                <span style={{ fontSize: '1rem', color: '#ffffff', fontWeight: 600, fontFamily: 'monospace' }}>
                  {AUTHORIZED_ADMIN_EMAIL}
                </span>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || resendCooldown > 0}
              className="cyber-btn"
              style={{
                width: '100%',
                justifyContent: 'center',
                padding: '15px',
                fontSize: '0.95rem',
                opacity: loading || resendCooldown > 0 ? 0.7 : 1
              }}
            >
              {loading ? (
                'Dispatching Security Passkey...'
              ) : resendCooldown > 0 ? (
                `Cooldown (${resendCooldown}s)`
              ) : (
                <>
                  Send OTP Code to {AUTHORIZED_ADMIN_EMAIL} <ArrowRight size={16} />
                </>
              )}
            </button>

            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
                fontSize: '0.76rem',
                color: 'var(--text-muted)',
                textAlign: 'center',
                lineHeight: '1.4'
              }}
            >
              <Lock size={12} color="var(--cyan)" />
              <span>Only <strong>{AUTHORIZED_ADMIN_EMAIL}</strong> has administrator clearance.</span>
            </div>
          </form>
        )}

        {/* Step 2: 6-Digit OTP Verification Form */}
        {step === 2 && (
          <form onSubmit={handleVerifyOtp} style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                <label style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                  Enter 6-Digit Verification Code
                </label>
                <span style={{ fontSize: '0.75rem', color: 'var(--cyan)' }}>
                  Expires in 5 minutes
                </span>
              </div>

              {/* 6-Digit Input Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 'clamp(4px, 1.5vw, 8px)' }}>
                {otp.map((digit, index) => (
                  <input
                    key={index}
                    ref={(el) => (inputRefs.current[index] = el)}
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleOtpChange(index, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(index, e)}
                    style={{
                      width: '100%',
                      height: 'clamp(44px, 11vw, 52px)',
                      textAlign: 'center',
                      fontSize: 'clamp(1.1rem, 3.5vw, 1.4rem)',
                      fontWeight: '700',
                      color: 'var(--cyan)',
                      background: 'rgba(5, 8, 20, 0.95)',
                      border: digit ? '1.5px solid var(--cyan)' : '1px solid rgba(0, 243, 255, 0.25)',
                      borderRadius: '10px',
                      outline: 'none',
                      boxShadow: digit ? '0 0 10px rgba(0, 243, 255, 0.2)' : 'none',
                      fontFamily: 'monospace'
                    }}
                  />
                ))}
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || fullOtpString.length < 6}
              className="cyber-btn"
              style={{
                width: '100%',
                justifyContent: 'center',
                padding: '15px',
                fontSize: '0.95rem',
                opacity: loading || fullOtpString.length < 6 ? 0.6 : 1
              }}
            >
              {loading ? (
                'Verifying Passkey...'
              ) : (
                <>
                  Verify OTP & Unlock Dashboard <ArrowRight size={16} />
                </>
              )}
            </button>

            {/* Resend Action */}
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', marginTop: '4px' }}>
              <button
                type="button"
                disabled={resendCooldown > 0 || loading}
                onClick={handleSendOtp}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: resendCooldown > 0 ? 'var(--text-muted)' : 'var(--cyan)',
                  fontSize: '0.82rem',
                  cursor: resendCooldown > 0 ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: 0
                }}
              >
                <RefreshCw size={13} className={loading ? 'spin' : ''} />
                {resendCooldown > 0 ? `Resend Code to ${AUTHORIZED_ADMIN_EMAIL} (${resendCooldown}s)` : `Resend Code to ${AUTHORIZED_ADMIN_EMAIL}`}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
